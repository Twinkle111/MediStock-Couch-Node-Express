const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchdb = require('node-couchdb');

const couch = new NodeCouchdb({
auth:{
user: 'Twinkle',
password: 'couch'
}
});

const dbName = "medistock";
const viewUrl = "_design/view2/_view/data";


couch.listDatabases().then(function(dbs){
console.log(dbs);
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use (bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req,res){
  couch.get(dbName, viewUrl).then(
   function(data, headers, status){
     console.log(data.data.rows);
     res.render('index', {
       data : data.data.rows
     });
   },
   function(err){
     res.send(err);

  });
});

app.post('/data/add', function(req, res){
  const mediName = req.body.mediName;
  const rate = req.body.price;

  couch.uniqid().then(function(ids){
      const id = ids[0];
      couch.insert(dbName, {
        _id: id,
        medicinename: mediName,
        price: rate
      }).then(function(data, headers, status){
          res.redirect('/');
      },function(err){
          res.send(err);
      });
  });
});

app.post('/data/delete/:id', function(req, res){
  const id = req.params.id;
  const rev = req.body.rev;
  couch.del(dbName, id, rev).then(
    function(data, headers, status){
      res.redirect('/');
  },function(err){
      res.send(err);
  });
});

app.post('/data/update/:id', function(req, res){
  const id = req.params.id;
  const rev = req.body.rev;
  const mediName = req.body.mediName;
  const price = req.body.price;

  couch.insert(dbName, {
    _id: id,
    _rev: rev,
    medicinename: mediName,
    price: price
  }).then(function(data, headers, status){
      res.redirect('/');
  },function(err){
      res.send(err);
  });
});

app.listen(3000, function(){
 console.log('Server is started on Port 3000');
})
