require('dotenv').config();

var DB_URL = process.env.DB_URL;
var nano = require('nano')(DB_URL);
var db = nano.use('triggers');
var ddname = 'triggers';
var viewname = 'by_worker';

db.view(ddname, viewname, { reduce: true, group: true }, function (err, body) {
  if (!err) {
    if (body.rows.length > 0) {
      //sort by worker ascending 
      body.rows.sort((a, b) => {
        return a.value > b.value;
      });
      console.log(body.rows);

    } else {
      console.log("no results");
    }
  } else {
    console.error(err);
  }
});