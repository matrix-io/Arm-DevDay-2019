# Workshop Guide
This section will cover everything in our Arm DevDay workshop. Before moving on, make sure that you have everything ready from the [Pre-Workshop Setup](PreWorkshop.md).

## 1. Test MATRIX Core
**In your Raspberry Pi's terminal**, Enter the commands below to verify that Node.js and MATRIX Core are properly working.

**Install Node.js modules for MATRIX Core**
```bash
cd ~/js-matrix-core-app
npm install
```
**Run Hello World**
```bash
node helloWorld.js
```
Your MATRIX Creator should match the image below.

> For your sanity, the brightness has been lowered.

![](images/matrix-hello-world.gif)

## 2. Connect Sam To Your Raspberry Pi
By this step, you should have a [snips.ai account](https://console.snips.ai/login) and the [Sam CLI Tool](https://snips.gitbook.io/getting-started/installation) installed.

**From your computer's terminal, sign in through the Sam CLI Tool.**
```bash
sam login
```
**Connect to your Raspberry Pi.**
```bash
sam connect YOUR.PI.IP.HERE
```
**Begin viewing the Snips event stream.** This will let us verify if our intents are being heard.
```bash
sam watch
```

## 3. Creating assistant.js
This step will go show you how to setup a MATRIX Core project with Snips. `assistant.js` will be used to listen and respond to events from your Snips assistant

**Create a new JavaScript file.**
```bash
cd ~/js-matrix-core-app
touch assistant.js
```
**MQTT will be installed and used to listen in on events from Snips.**
```bash
npm install mqtt --save
```
With all the required dependencies installed, you can now open `assistant.js ` with your preferred editor (we will be using [VSCode](https://code.visualstudio.com/) through [CyberDuck.io](https://cyberduck.io/)).

The code below will show you how to set your MATRIX LEDs and how to listen to Snips MQTT events.
<details close>
<summary>
assistant.js
</summary>

```js
// MATRIX Core Dependencies
var zmq = require('zeromq');
var core = require('matrix-protos').matrix_io.malos.v1;
var matrix_ip = '127.0.0.1';
var matrix_everloop_base_port = 20021;
var matrix_device_leds = 35;// Hard coded LED count
// Snips.ai Dependencies
var snipsUserName = "YOUR_SNIPS_USERNAME_HERE";
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://' + matrix_ip, { port: 1883 });

// - Easy MATRIX LED function
function led(colors){
  // Create & connect Pusher socket to Base Port
  var configSocket = zmq.socket('push');
  configSocket.connect('tcp://' + matrix_ip + ':' + matrix_everloop_base_port);

  // Create an empty Everloop image
  var image = core.io.EverloopImage.create();
  // Set each LED color in Everloop image
  image.led = new Array(matrix_device_leds).fill(colors);

  // Create MATRIX configuration and add Everloop image
  var config = core.driver.DriverConfig.create({'image': image});
  // Send configuration
  configSocket.send(core.driver.DriverConfig.encode(config).finish());
}

// On connection to Snips' MQTT server
client.on('connect', function() {
  console.log("Connected to " + matrix_ip);
  // Events to listen for
	client.subscribe('hermes/hotword/default/detected');// Wakeword
	client.subscribe('hermes/dialogueManager/sessionEnded');// Conversation end
});
// On data from Snips' MQTT server
client.on('message', function(topic, message) {
  switch(topic) {
    // On Wakeword
    case 'hermes/hotword/default/detected':
      console.log('Wakeword Detected')
      led({blue: 100});
      break;
    // On Conversation End
    case 'hermes/dialogueManager/sessionEnded':
      console.log('Session Ended');
      led({green: 100});
      break;
  }
});
```
</details>

## 4. Creating A Snips Assistant
Sign into your [Snips.ai](https://console.snips.ai/login) and create an assistant. Once created, add a new application named `lights`.

<img src="images/create_assistant_and_app.gif" />

