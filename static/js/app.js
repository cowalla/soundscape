require(['jquery', 'soundcloud_widget'], function($){
    // SC is the SoundCloud widget toolbox.
    const positionTag = 'getPosition',
        iFrameElement = document.querySelector('iframe'),
        widget = SC.Widget(iFrameElement);

    var ms = function(){
        return Math.floor(performance.now())
    };
    var timeSince = function(perf){
        return ms() - perf;
    };

    var getStreamInfo = function (callback) {
        return $.get(
            'get_stream_info',
            callback
        )
    };

    var applyStreamInfo = function(position, time){
        return function(response) {
            var data = JSON.parse(response),
                masterTime = parseInt(data.client.time),
                masterPosition = parseInt(data.client.position);

            console.log(data);

            if (!iFrameElement.src === data.client.src) {
                iFrameElement.src = data.client.src
            }

            widget.seekTo(masterPosition + timeSince(masterTime))
        }
    };

    $(document).ready(function() {
        var playLoop = function (callback) {
            return function () {widget.getPosition(callback)}
        };
        var pauseLoop = function() {clearInterval(window.playLoopID)};
        widget.bind(SC.Widget.Events.PLAY, function() {
            window.playLoopID = setInterval(playLoop(), 3000)
        });
        widget.bind(SC.Widget.Events.PAUSE, pauseLoop);


        window.addEventListener('message', function(msg){
            var stream = JSON.parse(msg.data);

            if(stream.method === positionTag){
                var position = Math.floor(stream.value);
                var time = new Date().getTime();
                getStreamInfo(applyStreamInfo(position, time));
            }
        });
    })
});