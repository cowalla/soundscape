import Ractive from 'ractive'
import './soundcloud-widget-api.js'
import $ from 'jquery'

var ractive;
var ms = function(){
    return Math.floor(performance.now())
};
var timeSince = function(perf){
    return ms() - perf;
};
var getStreamInfo = function(callback){
    return $.get(
        'get_stream_info',
        callback
    )
};

var loadTemplate = function(response){
    var streamData = JSON.parse(response);

    $.get('http://localhost:4000/static/js/ractiveSoundcloudWidget.html', function(template){
        ractive = new Ractive({
            el: '#iframe-container',
            template: template,
            oncomplete: function(){
                var widget = SC.Widget(document.querySelector('iframe'));
                var playLoop = function (callback) {
                    return function () {
                        widget.getPosition(callback)
                    }
                };
                var pauseLoop = function () {
                    clearInterval(window.playLoopID)
                };
                widget.bind(SC.Widget.Events.PLAY, function () {
                    window.playLoopID = setInterval(playLoop(), 3000)
                });
                widget.bind(SC.Widget.Events.PAUSE, pauseLoop);


                window.addEventListener('message', function (msg) {
                    var stream = JSON.parse(msg.data);

                    if (stream.method === 'getPosition') {
                        var position = Math.floor(stream.value);
                        var time = new Date().getTime();
                        getStreamInfo(

                        );
                    }
                });
            }
        });
        ractive.set('pageState', streamData)

    });
};

var applyStreamInfo = function(position, time){
    return function(response) {

        var data = JSON.parse(response),
            masterTime = parseInt(data.client.time),
            masterPosition = parseInt(data.client.position);

        ractive.set('response', data);

        if (!ractive.src == data.client.src) {
            ractive.set('src', data.client.src)
        }

        ractive.widget.seekTo(masterPosition + timeSince(masterTime))
    }
};

getStreamInfo(loadTemplate);
