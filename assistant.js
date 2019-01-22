// * This file was created during the workshop (live) * //

// MATRIX functions
var matrix = require(__dirname+'/matrix.js');
// Snips.ai Dependencies
var mqtt = require('mqtt');
var snipsUserName = 'matrixLabs';
var client = mqtt.connect('mqtt://' + '127.0.0.1', { port: 1883 });

// - Request Snips session end & utter text given
client.snipsRespond = function(payload){
    client.publish('hermes/dialogueManager/endSession', JSON.stringify({
      sessionId: payload.sessionId,
      text: payload.text
    }));
};

// MQTT Topics
var wakeword = 'hermes/hotword/default/detected';
var sessionEnd = 'hermes/dialogueManager/sessionEnded';
var lightState = 'hermes/intent/'+snipsUserName+':lightState';
var getTemperature = 'hermes/intent/'+snipsUserName+':getTemperature';


// On connection to Snips' MQTT server
client.on('connect', function() {
    console.log('Connected to Snips MQTT server\n');
    // Subscribe to each event (MQTT Topic)
    client.subscribe(wakeword);// when a conversation starts
    client.subscribe(sessionEnd);// when a conversation ends
    client.subscribe(lightState);// when we want to change the lights
    client.subscribe(getTemperature);// when we want the current temperature
});

// On data from Snips' MQTT server
var lightsOn = false;
client.on('message', function(topic, message) {
    // Extract message (convert string to JSON)
    var message = JSON.parse(message);

    switch(topic){
        // * On Wakeword
        case wakeword:
            console.log("I HEARD YOU!!!!!");
            matrix.led({blue: 100});
            break;

        // * On Temperature Request
        case getTemperature:
            console.log("YOU WANTED THE CURRENT TEMPERATURE? HERE:");
            console.log(matrix.temperature);

            // Say the lights were edited
            client.snipsRespond({
                sessionId: message.sessionId,
                text: "The current temperature is "+matrix.temperature
            });

            break;

        // * On Light State
        case lightState:
            console.log("YOU WANTED TO CHANGE THE LIGHTS!!!!!");
            // Turn lights On/Off
            try{
                if (message.slots[0].rawValue === 'on'){
                    matrix.led({red: 255, green: 69});
                    lightsOn = true;
                    console.log('Lights On'); 
                }
                else{
                    matrix.led({});
                    lightsOn = false;
                    console.log('Lights Off');
                }
                // Say the lights were edited
                client.snipsRespond({
                    sessionId: message.sessionId,
                    text: "I EDITED THE LIGHTS!"
                });

            }catch(error){
                console.log("I COULDN'T HEAR YOU SAY ON OR OFF")
            }

            break;
        // * On Conversation End
        case sessionEnd:
            if(lightsOn)
                matrix.led({red: 255, green: 69});
            else
                matrix.led({});
            console.log("WHY DID YOU LEAVE!!!!!");
            break;
    }
});