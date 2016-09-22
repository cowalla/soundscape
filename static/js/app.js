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
    var tmp = require('./ractiveSoundcloudWidget.html');

    $.get( 'http://localhost:4000/static/js/ractiveSoundcloudWidget.html' ).then( function ( SCWidget ) {
        var ractive = new Ractive({
            el: '#iframe-container',
            template: require('ractive!./ractiveSoundcloudWidget.html'),
            data: {pageState: streamData.client}
            //lazy: true // only update when inputs blur
        });
        ractive.set('pageState', streamData);
    });
};

getStreamInfo(loadTemplate);
