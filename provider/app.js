//jshint esversion: 6, node: true
'use strict';
/**
 * Service which can be configured to listen for triggers from a provider.
 * The Provider will store, invoke, and POST whisk events appropriately.
 */

//DEVMODE
require('dotenv').config();

var http = require('http');
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var nano = require('nano');
var logger = require('./Logger');

var ProviderUtils = require('./lib/utils.js');
var ProviderHealth = require('./lib/health.js');
var ProviderRAS = require('./lib/ras.js');
var constants = require('./lib/constants.js');

// Initialize the Express Application
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('port', process.env.PORT || 8080);

// TODO: Setup a proper Transaction ID
var tid = "??";

// Whisk API Router Host
var routerHost = process.env.ROUTER_HOST || 'localhost';

// Maximum number of times to retry the invocation of an action
// before deleting the associated trigger
var retriesBeforeDelete = constants.RETRIES_BEFORE_DELETE;

// Allow invoking servers with self-signed certificates.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// If it does not already exist, create the triggers database.  This is the database that will
// store the managed triggers.
//
var dbUsername = process.env.DB_USERNAME;
var dbPassword = process.env.DB_PASSWORD;
var dbHost = process.env.DB_HOST;
var dbPort = process.env.DB_PORT;
var dbProtocol = process.env.DB_PROTOCOL;
var dbPrefix = process.env.DB_PREFIX;
var databaseName = dbPrefix + constants.TRIGGER_DB_SUFFIX;
var role = process.env.ROLE || "master";

// Create the Provider Server
var server = http.createServer(app);
server.listen(app.get('port'), function () {
  logger.info(tid, 'server.listen', 'Express server listening on port ' + app.get('port'));
});


// Initialize the Provider Server
function init(server) {
  var bootActive=false;

  if (server !== null) {
    var address = server.address();
    if (address === null) {
      logger.error(tid, 'init', 'Error initializing server. Perhaps port is already in use.');
      process.exit(-1);
    }
  }

  var nanoDb = nano(dbProtocol + '://' + dbUsername + ':' + dbPassword + '@' + dbHost).use(databaseName);


  logger.info(tid, 'init', 'trigger storage database details: ', nanoDb);

  if(role === "master"){
    //single provider mode
    logger.info(tid, 'init','Booting as master no slave involed');
    bootActive = true;
  } else if (role === "master_slave"){
    //dual provider this is master
    logger.info(tid, 'init','Booting as master there is a slave involed');
    bootActive = false;
  } else {
    //dual provider this is slave
    logger.info(tid, 'init','Booting as slave there is a master involved');
    bootActive = false;
  }
  var providerUtils = new ProviderUtils(tid, logger, app, retriesBeforeDelete, nanoDb, routerHost, bootActive);

  var providerRAS = new ProviderRAS(tid, logger, providerUtils);
  var providerHealth = new ProviderHealth(tid, logger, providerUtils);

  // RAS Endpoint
  app.get(providerRAS.endPoint, providerRAS.ras);

  // Health Endpoint
  app.get(providerHealth.endPoint, providerHealth.health);

  app.get("/active",(req,res)=>{
    var state = JSON.parse(req.query.state);
    var response = 'pass boolean query parameter state';
    if(typeof state === 'boolean' && state === true){
      providerUtils.active = true;
      response='Provider is active';
    } else if (typeof state === 'boolean' && state === false) {
      providerUtils.active = false;
      response='Provider is NOT active';
    } 
    logger.info(tid,'active',response);
    res.send(response);
  });

  providerUtils.initAllTriggers();

}

init(server);
