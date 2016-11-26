//jshint esversion: 6, node: true
'use strict';

var rp = require('request-promise-native');

var masterUrl = process.env.MASTER || 'http://localhost:3002';
var slaveUrl = process.env.SLAVE || 'http://localhost:3003';

var masterActive = true;
var slaveActive = false;

function main() {

  rp(masterUrl + '/ping')
    .then((res) => {
      if (slaveActive) {
        deactivateSlave()
          .then(() => {
            return activateMaster();
          })
          .then(()=>{
            masterActive = true;
            slaveActive = false;
          })
          .catch(errorHandler);
      }
    })
    .catch((err) => {
      masterActive = false;
      if (!slaveActive) {
        activateSlave();
      }
    });
}
setInterval(main, 5000);


function activateSlave() {
  console.log('activateSlave');
  rp(slaveUrl + '/active?state=true')
    .then(() => {
      slaveActive = true;
    })
    .catch(errorHandler);
}

function deactivateSlave() {
  console.log('deactivateSlave');
  return rp(slaveUrl + '/active?state=false');
}
function activateMaster() {
  console.log('activateMaster');
  return rp(masterUrl + '/active?state=true');
}

function errorHandler(err) {
  console.error('Error ' + err);
}
