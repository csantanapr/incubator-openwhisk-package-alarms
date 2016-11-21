// jshint esversion: 6, node: true
'use strict';
var request = require('request');
var nano = require('nano');

function main({
  mgmtdbUrl: mgmtdbUrl = 'http://localhost:5498',
  mgmtdbName: mgmtdbName = 'triggers',
  lifecycleEvent: lifecycleEvent = 'CREATE',
  triggerName: triggerName,
  cron: cron,
  trigger_payload : trigger_payload = {},
  maxTriggers: maxTriggers = 1000000,
  authKey: authKey
  
}) {
  console.log("alarm: ", arguments);

  var db = nano(mgmtdbUrl).db.use(mgmtdbName);

  // whisk trigger in payload
  var trigger = parseQName(triggerName);

  // for creation -> CREATE (default)
  // for deletion -> DELETE
  // for pause -> PAUSE
  // for resume -> RESUME

  var triggerId = getTriggerIdentifier(authKey, trigger.namespace, trigger.name );

  if (lifecycleEvent === 'CREATE') {
    // Insert the new Trigger into the DB
    return new Promise(function (resolve, reject) {
      if (typeof trigger_payload === 'string') {
        trigger_payload = { payload: trigger_payload };
      }

      var newTrigger = {
        name: trigger.name,
        namespace: trigger.namespace,
        cron: cron,
        payload: trigger_payload,
        maxTriggers: maxTriggers,
        authKey: authKey
      };
      

      getWorkerId(db).then((worker) => {
        newTrigger.worker = worker;
        return createTrigger(db, newTrigger, triggerId);
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  if (lifecycleEvent === 'DELETE') {
    // DELETE Trigger from the DB
    return new Promise(function (resolve, reject) {
      request({
        method: "DELETE",
        uri: 'http://' + msg.package_endpoint + '/triggers/' + trigger.namespace + '/' + trigger.name,
        json: true,
        auth: {
          user: msg.authKey.split(':')[0],
          pass: msg.authKey.split(':')[1]
        }
      }, function (err, res, body) {
        console.log('alarm: done http request');
        if (!err && (res.statusCode === 200 || res.statusCode === 404)) {
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

  function parseQName(qname) {
    var parsed = {};
    var delimiter = '/';
    var defaultNamespace = '_';
    if (qname && qname.charAt(0) === delimiter) {
      var parts = qname.split(delimiter);
      parsed.namespace = parts[1];
      parsed.name = parts.length > 2 ? parts.slice(2).join(delimiter) : '';
    } else {
      parsed.namespace = defaultNamespace;
      parsed.name = qname;
    }
    return parsed;
  }

  function getWorkerId(db) {
    var ddname = 'triggers';
    var viewname = 'by_worker';

    return new Promise((resolve, reject) => {
      db.view(ddname, viewname, { reduce: true, group: true }, function (err, body) {
        if (!err) {
          resolve('worker2');
          
          if (body.rows.length > 0) {
            //sort by worker ascending 
            body.rows.sort((a, b) => {
              return a.value > b.value;
            });
            //pick the worker handling less triggers
            resolve(body.rows[0].key);
          } else {
            resolve('worker2');
          }
        } else {
          reject(err);
        }
      });
    });
  }

  function createTrigger(db, trigger, id) {
    return new Promise((resolve, reject) => {
      db.insert(trigger, id, (err, body) => {
        if (!err) {
          console.log('success ', body);
          resolve({ response: body });
        } else {
          console.error('error ', err);
          reject(err);
        }
      });
    });
  }


  function getTriggerIdentifier(apikey, namespace, name) {
        return apikey + '/' + namespace + '/' + name;
  }

}

if (require.main !== module) {
  module.exports = main;
}

