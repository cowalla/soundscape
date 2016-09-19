require(['jquery', 'soundcloud_widget'], function($){
    // SC is the SoundCloud widget toolbox.
    const positionTag = 'getPosition';
    var getStreamInfo = function (cb) {
        return $.get('streams/users/coala/get_stream_info', cb)
    };
    var applyStreamInfo = function(position, time){
        return function(streamInfoResponse) {

        }
    };

    $(document).ready(function() {
        var iFrameElement = document.querySelector('iframe');
        var widget = SC.Widget(iFrameElement);

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
                console.log(Math.floor(stream.value))
            }
        });
    })
});