// jshint esversion: 6
require('dotenv').config();

var DB_URL = process.env.DB_URL;
var nano = require('nano')(DB_URL);
var dbname = 'triggers';
var ddname = '_design/triggers';

nano.db.destroy(dbname, function () {
  // create a new database
  nano.db.create(dbname, function (e, b) {
    create_views(dbname);
  });
});

function create_views(dbname) {
  var db = nano.use(dbname);
  var by_worker = {
    map: function(doc){
      if(doc.worker){
        emit(doc.worker,doc);
      } 
    }.toString(),
    reduce: '_count'
  };
  var by_worker_filter = function(doc, req){
    return doc._deleted || doc.worker === req.query.worker;
  }.toString();

  db.get(ddname, function (e, b) {
    if (e) {
      //new design doc
      db.insert({
        views: {
          by_worker: by_worker
        },
        filters: {
          by_worker: by_worker_filter
        }
      }, ddname, function (e, b) {
        console.log(e, b);
      });
    } else {
      //update design doc
      b.views.by_worker = by_worker;
      db.insert(b, ddname, function (e, b) {
        console.log(e, b);
      });
    }

  });

}

