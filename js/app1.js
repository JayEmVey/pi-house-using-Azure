// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var Protocol = require('azure-iot-device-amqp').Amqp;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp-ws').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionString = 'HostName=JayEmVeyHomeHub.azure-devices.net;DeviceId=SmartHomeV1;SharedAccessKey=0sxwQdttQCTREcLJMXHY2X+R5tQxGh7UZZyzZ3JkjeY=';

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);

var connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');
    client.on('message', function (msg) {
      console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
      client.complete(msg, receiveCallback());
      // reject and abandon follow the same pattern.
      // /!\ reject and abandon are not available with MQTT
    });



    /**
     * test
     * TODO: REMOVE
     */
    // Create a message and send it to the IoT Hub every second
    var sendInterval = setInterval(function () {
      var temperature = 17 + (Math.random()*10);
      var humidity = 10 + (Math.random()*80);
      var lightLiving = 10 + (Math.random() * 4); // range: [10, 14]
      var lightPorch = 5 + (Math.random()*2);
      var fireplace = 2 + (Math.random()*10);
      var door = Math.random();

      var data = [
        { id: 1, temperature: temperature },
        { id: 2, humidity: humidity },
        { id: 3, lightLiving: lightLiving},
        { id: 4, lightPorch: lightPorch},
        { id: 5, fireplace:fireplace},
        { id: 6, door: door}
      ];

      // var data1 = JSON.stringify({ deviceId: 'SmartHomeV1', temperature: temperature });
      // var data2 = JSON.stringify({ deviceId: 'SmartHomeV1', humidity: humidity });
      // var data3 = JSON.stringify({ deviceId: 'SmartHomeV1', fireplace: fireplace });
      // var data4 = JSON.stringify({ deviceId: 'SmartHomeV1', door: door });
      // var data5 = JSON.stringify({ deviceId: 'SmartHomeV1', lightLiving: lightLiving });
      // var data6 = JSON.stringify({ deviceId: 'SmartHomeV1', lightPorch: lightPorch });


      var messages = new Message(JSON.stringify(data));
      console.log('Sending messages: ' + messages.getData());
      client.sendEventBatch(messages, sendCallback());
    }, 5000); // Ten second per message





    client.on('error', function (err) {
      console.error(err.message);
    });

    client.on('disconnect', function () {
      clearInterval(sendInterval);
      client.removeAllListeners();
      client.open(connectCallback);
    });
  }
};

var receiveCallback = function() {
  printResultFor('completed');
};

var sendCallback = function() {
  printResultFor('send');
};

client.open(connectCallback);

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Update GUI
var door = document.getElementById('door');
var lightLiving = document.getElementById('lightLiving');
var lightPorch = document.getElementById('lightPorch');
var fireplace = document.getElementById('fireplace');


// TODO