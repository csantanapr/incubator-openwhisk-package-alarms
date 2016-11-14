// jshint esversion: 6
require('dotenv').config();

var WSKAUTH = process.env.WSKAUTH;
var WSKNAMESPACE = process.env.WSKNAMESPACE;

var action = require('../action/alarm.js');
var lifecycleEvent = process.argv[2] ? process.argv[2] : 'CREATE';
var triggerName = process.argv[3] ? process.argv[3] : 'trigger';
if(lifecycleEvent == 'CREATE'){
  var cron = process.argv[4] ? process.argv[4] : '* * * * *';
}
var fullTrigerName = `/${WSKNAMESPACE}/${triggerName}`;

var package_endpoint = 'localhost:8080';

var params = {
    lifecycleEvent: lifecycleEvent,
    triggerName: fullTrigerName,
    authKey: WSKAUTH,
    package_endpoint: package_endpoint,
    cron: cron
}
console.log(params);
action(params)
.then(function () {
  console.log("test poc done");
})
.catch(function () {
  console.error("Something bad happened");
});