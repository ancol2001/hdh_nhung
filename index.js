const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Gpio = require('onoff').Gpio;
var sensor = require('node-dht-sensor');
const BH1750 = require('bh1750-sensor');
const LED_PIN = 17;
const BUTTON_PIN = 27;

const led = new Gpio(LED_PIN, 'out');
const button = new Gpio(BUTTON_PIN, 'in', 'rising');


app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// sensor.read(22, 4, function(err, temperature, humidity) {
//     if (!err) {
//       console.log('Temperature: ' + temperature.toFixed(1) + '  C');
//       console.log('Humidity: ' + humidity.toFixed(1) + '%');
//     }
//   });



const options = {
  readMode: BH1750.ONETIME_H_RESOLUTION_MODE
};

const bh1750 = new BH1750(options);


io.on('connection', (socket) => {
  setInterval(() => {
    sensor.read(22, 4, function (err, temperature, humidity) {
      if (!err) {
        // console.log('Temperature: ' + temperature.toFixed(1) + '*C');
        // console.log('Humidity: ' + humidity.toFixed(1) + '%');
        const nhietdo = temperature.toFixed(1);
        const doam = humidity.toFixed(1);
        const anhsang = (bh1750.readData()).toFixed(1);

        // console.log(anhsang);
        socket.emit('sensor-data', { nhietdo, doam, anhsang});
      }
    });
  }, 1000);

  socket.on('toggle-led', () => {
    const state = led.readSync() ^ 1;
    led.writeSync(state);
    socket.emit('led-state', state);
    console.log(state);
  });
});

process.on('SIGINT', () => {
  led.unexport();
  button.unexport();
  process.exit();
});

server.listen(3456, () => {
  console.log('Server is running on port 3456');
});
