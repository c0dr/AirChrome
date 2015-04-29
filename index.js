var chromecasts = require('chromecasts')();

console.log('Searching for Chromecast devices on network...');


chromecasts.on('update', function (player) {
  console.log('Found devices');

  chromecasts.players.forEach(function (device) {

    console.log('Setting up AirChrome for' + device.name);

    var airplayServer = new NodeTunes({
          serverName: device.name + ' (AirChrome)',
        });

        var clientName = 'AirChrome';
        airplayServer.on('clientNameChange', function(name) {
          clientName = 'AirChrome @ ' + device.name;
        });

        airplayServer.on('error', function(err) {
          if (err.code === 415) {
            console.error('Warning!', err.message);
            console.error('AirChrome currently does not support codecs used by applications such as iTunes or AirFoil.');
          } else {
            console.error('Unknown error:');
            console.error(err);
          }
        })

        airplayServer.on('clientConnected', function(audioStream) {

          portastic.find({
            min : 8000,
            max : 8050,
            retrieve: 1
          }, function(err, port) {
            if (err) throw err;

            var icecastServer = new Nicercast(audioStream, {
              name: 'AirChrome @ ' + device.name
            });

            airplayServer.on('metadataChange', function(metadata) {
              if (metadata.minm)
                icecastServer.setMetadata(metadata.minm + (metadata.asar ? ' - ' + metadata.asar : '') + (metadata.asal ? ' (' + metadata.asal +  ')' : ''));
            });

            airplayServer.on('clientDisconnected', function() {
              icecastServer.stop();
            });

            icecastServer.start(port);

            device.play({
              type: 'audio/mp3',
              url: ip.address() + ':' + port + '/listen.m3u',
              title: 'AirChrome'
            });

          });
        });

        airplayServer.on('clientDisconnected', function() {
          device.stop();
        });


        airplayServer.start();

  })

})
