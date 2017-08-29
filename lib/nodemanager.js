'use strict';

var ProgressBar = require('progress');
var wget = require('wget-improved');
var jsonfile = require('jsonfile');
var exec = require('child_process').exec;
var request = require('request');

var downloadInProgress = false;

function getBinInfo(cb) {
  request.get('https://raw.githubusercontent.com/ubiq/pyrusproxy/master/clientBinaries.json', {
    json: true,
  }, function (err, res, remoteVersion) {
    if (remoteVersion.version) {
      return cb(remoteVersion);
    } else {
      console.log('Unable to fetch latest version info. Using local clientBinaries.json instead.')
      jsonfile.readFile('./clientBinaries.json', function(err, localVersion) {
        if (err)
          console.log(err)
        return cb(localVersion);
      });
    }
  });
}

module.exports = {
  startGubiq: function(cb) {
    var cmd = 'screen -dmS gubiq ./bin/gubiq --rpc --rpcaddr "127.0.0.1" --rpcport "8588" --rpcapi "eth,net,web3" --maxpeers 500';
    exec(cmd, function(error, stdout, stderr) {
      console.log('Starting Gubiq..');
      return cb();
    });
  },
  downloadGubiq: function(cb) {
    if (!downloadInProgress) {
      getBinInfo(function(binInfo) {
        downloadClient(binInfo, function(){
          return cb();
        });
      });
    } else {
      return cb();
    }
  }
};

function downloadClient(binInfo, cb) {
  var count = 0;
  var bar = new ProgressBar(':bar', { total: 100 , width:80});

  var download = wget.download(binInfo.url, './bin/gubiq-' + binInfo.version, {});
  download.on('error', function(err) {
    console.log(err);
    return cb();
  });

  download.on('start', function(fileSize) {
    console.log('Downloading Gubiq ' + binInfo.version + ' (' + ((fileSize/1024)/1024).toFixed(2) + ' MB)');
    downloadInProgress = true;
  });

  download.on('end', function(output) {
    downloadInProgress = false;
    console.log('Download complete. Performing sanity check..');
    exec('md5sum ./bin/gubiq-' + binInfo.version, function(err, stdout, stderr) {
      var md5sum = stdout.split(' ')[0];
      if (md5sum != binInfo.md5) {
        console.log('checksum: fail');
        console.log('aborting..');
        return cb();
      } else {
        console.log('checksum: pass');
        exec('chmod +x ./bin/gubiq-' + binInfo.version, function(error, stdout, stderr) {
          exec('./bin/gubiq-' + binInfo.version + ' version', function(err, stdout, stderr) {
            var version = stdout.split('\n');
            if (version[0] === binInfo.sanity[0] && version[1] === binInfo.sanity[1]) {
              console.log('version : pass');
              // copy binary to default.
              exec('cd ./bin && ln -s ./gubiq-' + binInfo.version +' ./gubiq', function(error, stdout, stderr) {
                return cb();
              });
            } else {
              console.log('version : fail');
              console.log('aborting..');
              return cb(1);
            }
          });
        });
      }
    });
  });

  download.on('progress', function(progress) {
    if (progress * 100 > count && progress * 100 < 100) {
      count++;
      bar.tick();
    }
  });
}
