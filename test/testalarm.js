// jshint esversion: 6
require('dotenv').config();
const uuid = require('uuid');

var DB_URL = process.env.DB_URL;
var WSKAUTH = process.env.WSKAUTH;
var WSKHOST = process.env.WSKHOST;
var WSKNAMESPACE = process.env.WSKNAMESPACE;

var action = require('../action/alarm.js');
var lifecycleEvent = process.argv[2] ? process.argv[2] : 'CREATE';

var triggerName = process.argv[3] ? process.argv[3] : 'mytrigger'+uuid();
if(lifecycleEvent == 'CREATE'){
  var cron = process.argv[4] ? process.argv[4] : '* * * * *';
}
var fullTrigerName = `/${WSKNAMESPACE}/${triggerName}`;

var params = {
    mgmtdbUrl: DB_URL,
    lifecycleEvent: lifecycleEvent,
    triggerName: fullTrigerName,
    cron: cron,
    authKey: WSKAUTH,
    endpoint: WSKHOST
}
console.log(params);
action(params)
.then(function (res) {
  console.log("test alarm.js done", res);
})
.catch(function (err) {
  console.error("Something bad happened", err);
});

