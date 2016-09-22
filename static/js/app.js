import Ractive from 'ractive'
import './soundcloud-widget-api.js'
import $ from 'jquery'

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

var loadTemplate = function(response) {
    var streamData = JSON.parse(response);

    $.get('http://localhost:4000/static/js/ractiveSoundcloudWidget.html', function(template){
        var ractive = new Ractive({
            el: '#iframe-container',
            template: template
            //lazy: true // only update when inputs blur
        });
        ractive.set('pageState', streamData)
    })

    //ractive.set('pageState', streamData);
};

getStreamInfo(loadTemplate);
