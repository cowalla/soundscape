requirejs(['helper/widget_api', 'helper/jquery', 'helper/methods'], function(
    widget_api, jquery, methods
){
    console.log('Client JS initialized.');
    var _logTimeAndPosition = function(pos){
        // helpful to calculate whether pos is a reliable value
        var _date = new Date();
        console.log('Time ' + _date.getTime());
        console.log('Position ' + pos/60000);
    };
    
    window.HEARTBEAT_INTERVAL = 5000; // ms
    var THRESHOLD = 100; // amount of time we can ignore between streams

    // hacky as fuck
    window.streamUser = window.location.pathname.split('/')[3];
    // sorry future ppl
    window.changedSrc = false;

    var constants = function(username){
        return {
            'time': username.concat('_time'),
            'position': username.concat('_position'),
            'src': username.concat('_src'),
            'title': username.concat('_title')
        }
    };

    var parsePosition = function(position){
        var pType = typeof(position);

        var intType = typeof(32);
        var floatType = typeof(32.3);
        var objectType = typeof(Object);

        if(pType == intType){
            return position
        } else if(pType == floatType){
            return Math.floor(position);
        } else if(pType == objectType) {
            return pType.currentPosition;
        } else {
            console.log('received other type');
            return 0
        }
    };

    window._redisConstants = constants(window.streamUser);
    window._timeLabel = window._redisConstants.time;
    window._positionLabel = window._redisConstants.position;
    window._srcLabel = window._redisConstants.src;
    window._titleLabel = window._redisConstants.title;

    var ms = function(){
        return Math.floor(performance.now())
    };

    window.seekEventStarted = ms();
    window.seekEventFinished = ms();

    var timeSince = function(perf){
        return ms() - perf;
    };

    var dateTimeSince = function(dat){
        return Math.floor(Date.now()) - dat;
    };

    var getSession = function(callback){
        return $.get(
            '/streams/users/' + window.streamUser + '/get_stream_info/',
            callback
        );
    };

    $(document).ready(function(){
        var iFrameElement = document.querySelector('iframe');
        var widget = SC.Widget(iFrameElement);
        window.widget = widget;

        var applySession = function(position, time){
             _logTimeAndPosition(position);

            // This 'time' is evaluated before request is made, needs to be passed in after response
            return function(response){
                var pos = parsePosition(position);
                var data = JSON.parse(response);
                var clientData = data.client;

                if(!(iFrameElement.src == clientData.src)){
                    iFrameElement.src = clientData.src;
                }

                var masterTime = parseInt(clientData.time);
                var masterPosition = parseInt(clientData.position);

                var seekTime = window.seekEventFinished - window.seekEventStarted;
                console.log(seekTime);
                var currentEstimatedMasterPosition = masterPosition + dateTimeSince(masterTime);
                var currentClientPosition = pos + timeSince(time);
                var diff = Math.abs(currentEstimatedMasterPosition - currentClientPosition);
                console.log('diff ' + diff);

                var largeDisparity = diff > THRESHOLD;
                var isOwner = data.is_owner;

                if(largeDisparity && !isOwner){
                    window.seekEventStarted = ms();
                    widget.seekTo(currentEstimatedMasterPosition + seekTime);
                } else {
                    _now = ms();
                    window.seekEventStarted = _now + window.HEARTBEAT_INTERVAL
                    window.seekEventFinished = _now;
                }
            };
        };

        // The listener that looks for widget messages.
        window.addEventListener('message', function(msg){
            var stream = JSON.parse(msg.data);
            if(stream.method == 'getPosition'){
                getSession(applySession(stream.value, ms()))
            }
        });

        // When the widget is loaded, start broadcasting position.
        widget.bind(SC.Widget.Events.PLAY, function(){
            var loop = function(cb){
                return function(){widget.getPosition(cb)}
            };
            var setSeekEventStarted = function(){
                window.seekEventStarted = ms();
            };
            window.HEARTBEAT = setInterval(
                loop(setSeekEventStarted), window.HEARTBEAT_INTERVAL
            );
        });

        widget.bind(SC.Widget.Events.PAUSE, function(){
            widget.unbind(SC.Widget.Events.SEEK);
            clearInterval(window.HEARTBEAT);
        });

        widget.bind(SC.Widget.Events.SEEK, function(){
            window.seekEventFinished = (
                ms()
                + window.HEARTBEAT_INTERVAL // This event is from last time round
            );
        })
    })
});