// * This file was created during the workshop (live) * //

// MATRIX Core Dependencies
var zmq = require('zeromq');
var core = require('matrix-protos').matrix_io.malos.v1;
var matrix_ip = '127.0.0.1';
var everloop_base_port = 20021;
var matrix_humidity_base_port = 20017;
var led_count = 35;// # of LEDs on MATRIX device

////////////////////////
// Everloop (LEDs)
///////////////////////
function led(colors){
    // Create & connect Pusher socket to Base Port
    var configSocket = zmq.socket('push');
    configSocket.connect('tcp://' + matrix_ip + ':' + everloop_base_port);

    // Create an empty Everloop image
    var image = core.io.EverloopImage.create();
    // Set each LED color in Everloop image
    image.led = new Array(led_count).fill(colors);

    // Create MATRIX configuration and add Everloop image
    var config = core.driver.DriverConfig.create({'image': image});
    // Send configuration
    configSocket.send(core.driver.DriverConfig.encode(config).finish());
}

////////////////////////
// TEMPERATURE
///////////////////////
// BASE PORT \\
// Create & connect Pusher socket to Base Port
var configSocket = zmq.socket('push');
configSocket.connect('tcp://' + matrix_ip + ':' + matrix_humidity_base_port);

// Create driver configuration
var config = core.driver.DriverConfig.create({
    delayBetweenUpdates: 1.0,// 1 seconds between updates
    timeoutAfterLastPing: 6.0,// Stop sending updates 6 seconds after pings.
    humidity: core.sense.HumidityParams.create({
        currentTemperature: 22// Real current temperature [Celsius] for calibration 
    })
});

// Send driver configuration
configSocket.send(core.driver.DriverConfig.encode(config).finish());

// KEEP-ALIVE PORT \\
var pingSocket = zmq.socket('push');
pingSocket.connect('tcp://' + matrix_ip + ':' + (matrix_humidity_base_port + 1));
// Send ping every 5 seconds
pingSocket.send('');
setInterval(function(){
    pingSocket.send('');
}, 5000);

// DATA UPDATE PORT \\
var updateSocket = zmq.socket('sub');
updateSocket.connect('tcp://' + matrix_ip + ':' + (matrix_humidity_base_port + 3));
// Subscribe to messages
updateSocket.subscribe('');
// On Message
updateSocket.on('message', function(buffer){
    var data = core.sense.Humidity.decode(buffer);// Extract message
      module.exports.temperature = data.temperature;
});

////////////////////////
// EXPORTED FUNCTIONS
///////////////////////
module.exports = {
    'led': function(colors){
      led(colors);
    },
    'temperature': 0
}