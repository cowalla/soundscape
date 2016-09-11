define(function(){
    var HEARTBEAT_URL = 'https://evening-mountain-7853.herokuapp.com/concert/post_stream_position';
    var HEARTBEAT_INTERVAL = 10 * 1000; //ms

    return {
        'HEARTBEAT_URL': HEARTBEAT_URL,
        'HEARTBEAT_INTERVAL': HEARTBEAT_INTERVAL
    };
});

