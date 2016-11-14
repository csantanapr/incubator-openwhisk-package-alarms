// jshint esversion: 6

//emulating DB data
var groups = [
  {
    id: 'group1',
    count: 2,
    workers: ['http://localhost:3001', 'http://localhost:3002']
  },
  {
    id: 'group2',
    count: 4,
    workers: ['http://localhost:3003', 'http://localhost:3004']
  }
];

var request = require('request');

function main({
  lifecycleEvent: lifecycleEvent,
  trigger: trigger,
  auth: auth
}) {

  groups.sort((a, b) => a.count > b.count);
  var workers = groups[0].workers;

  return new Promise(function(resolve, reject){

    Promise.all(workers.map(function(worker){
      return createTrigger({
        endpoint:worker,
        auth:auth,
        trigger:trigger
      });
    })).then(function(results){

      resolve();
    });

  });
}

function createTrigger({
  endpoint:endpoint,
  auth: auth,
  trigger: trigger
}) {

  return new Promise(function (resolve, reject) {
    console.log('sending post to ', endpoint);
    console.log(trigger);
    console.log(auth);
    request({
      method: "POST",
      uri: endpoint + '/triggers',
      json: trigger,
      auth: auth,
      sendImmediately: true
    }, function (err, res, body) {
      console.log('alarm: done http request',endpoint);
      if (!err && res.statusCode === 200) {
        console.log(body);
        resolve();
      }
      else {
        if (res) {
          console.log('alarm: Error invoking whisk action:', res.statusCode, body);
          reject(body.error);
        }
        else {
          console.log('alarm: Error invoking whisk action:', err);
          reject();
        }
      }
    });
  });

}

if (require.main !== module) {
  module.exports = main;
}
