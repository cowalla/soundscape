import SoundCloud from 'react-soundcloud-widget'
import Ractive from 'ractive'
import React from 'react'
import ReactDOM from 'react-dom'
import './soundcloud-widget-api.js'
import $ from 'jquery'

var ms = function(){
    return Math.floor(performance.now())
};
var timeSince = function(perf){
    return ms() - perf;
};


var SCWidget = React.createClass({
    getInitialState: function(){
        var that = this;
        this.getStreamInfo(
            function(response){that.setState({'src': JSON.parse(response).client.src})}
        );

        return {
            'src': 'https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F263325804&show_artwork=true&client_id=1c4c7991fd8a8470bf2d70aa7af0aae9',
            'response': 'None'
        }
    },
    getStreamInfo: function(callback){
        return $.get(
            'get_stream_info',
            callback
        )
    },
    applyStreamInfo: function(position, time){
        var that = this;
        console.log(this.state);

        return function(response) {

            var data = JSON.parse(response),
                masterTime = parseInt(data.client.time),
                masterPosition = parseInt(data.client.position);

            that.state.response = data;

            if (!that.state.src == data.client.src) {
                that.setState({'src': data.client.src})
            }

            that.state.widget.seekTo(masterPosition + timeSince(masterTime))
        }
    },
    componentDidMount: function() {
        this.state.widget = SC.Widget(document.querySelector('iframe'));
        var that = this;

        var playLoop = function (callback) {
            return function () {that.state.widget.getPosition(callback)}
        };
        var pauseLoop = function() {clearInterval(that.state.playLoopID)};
        this.state.widget.bind(SC.Widget.Events.PLAY, function() {
            that.state.playLoopID = setInterval(playLoop(), 3000)
        });
        this.state.widget.bind(SC.Widget.Events.PAUSE, pauseLoop);


        window.addEventListener('message', function(msg){
            var stream = JSON.parse(msg.data);

            if(stream.method === 'getPosition'){
                var position = Math.floor(stream.value);
                var time = new Date().getTime();
                that.getStreamInfo(that.applyStreamInfo(position, time));
            }
        });
    },
    render: function(){
        return (
            <div>
                <iframe
                    src={this.state.src}
                    width="80%"
                    height="450"
                    scrolling="no"
                    frameBorder="no"
                ></iframe>
                <h1>{this.state.response}</h1>
            </div>
        )
    }
});

ReactDOM.render(
    <SCWidget/>,
    document.getElementById('iframe-container')
);


//// SC is the SoundCloud widget toolbox.
//const positionTag = 'getPosition',
//    iFrameElement = document.querySelector('iframe'),
//    widget = SC.Widget(iFrameElement);
//
//var ms = function(){
//    return Math.floor(performance.now())
//};
//var timeSince = function(perf){
//    return ms() - perf;
//};
//
//var getStreamInfo = function (callback) {
//    return $.get(
//        'get_stream_info',
//        callback
//    )
//};
//
//var applyStreamInfo = function(position, time){
//    return function(response) {
//        var data = JSON.parse(response),
//            masterTime = parseInt(data.client.time),
//            masterPosition = parseInt(data.client.position);
//
//        console.log(data);
//
//        if (!iFrameElement.src === data.client.src) {
//            iFrameElement.src = data.client.src
//        }
//
//        widget.seekTo(masterPosition + timeSince(masterTime))
//    }
//};
//
//$(document).ready(function() {
//    var playLoop = function (callback) {
//        return function () {widget.getPosition(callback)}
//    };
//    var pauseLoop = function() {clearInterval(window.playLoopID)};
//    widget.bind(SC.Widget.Events.PLAY, function() {
//        window.playLoopID = setInterval(playLoop(), 3000)
//    });
//    widget.bind(SC.Widget.Events.PAUSE, pauseLoop);
//
//
//    window.addEventListener('message', function(msg){
//        var stream = JSON.parse(msg.data);
//
//        if(stream.method === positionTag){
//            var position = Math.floor(stream.value);
//            var time = new Date().getTime();
//            getStreamInfo(applyStreamInfo(position, time));
//        }
//    });
//})