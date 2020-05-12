//Import dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
var randtoken = require('rand-token');

const cron = require('node-cron');

const MDB = require('./server/config/configmdb.js').mdb;

//Connect to mongoDB server
//mongoose.connect('mongodb://localhost:27017/histodataweb', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://'+MDB.userdb+':'+MDB.passdb+'@localhost:27017/histodataweb?authSource='+MDB.authdb, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);

console.log("Starting hod web site backend version 1.1.2...")

//Init express
const app = express();
const randtoken = require('rand-token');

//Enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  let token = randtoken.generate(16);  
  req.headers.loggerToken = token;
  var headers = new Array;
  for (let index = 0; index < req.rawHeaders.length; index = index+2) {
    headers.push("\"" + req.rawHeaders[index] + "\" : \"" + req.rawHeaders[index+1] + "\""); 
  }
  var params = new Array();
  console.log(Date.now() + ' | ['+token+'] | HttpRequest: { '+headers.join(', ') + ', host: ' + req.host + ', hostname: '+ req.hostname + ' }');
  next();
  console.log(Date.now() + ' | ['+token+'] | HttpResponse: '+res.statusCode+', ' + res.statusMessage+ ', '+req.headers.authorization);

});

app.use(function(err, req, res, next) {
  console.error(Date.now() + ' | [' + req.headers.loggerToken + '] | Error: ' + err.stack);
  res.status(500).send('Something broke!');


});

//Passport
const passport = require('passport');
require('./server/config/passport')(passport); // pass passport for configuration

//Cookie and session
const cookieParser = require('cookie-parser');
const session = require('express-session');
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: '#Les défits valent d\'être relevé%si§et seulement si ils¤ont quelques_choses à apporter à l\'humanité !'
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//Enable bodyParser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

//Require the models
require('./server/models/config');
require('./server/models/asset');
require('./server/models/exchange');
require('./server/models/user');
require('./server/models/role');
require('./server/models/order');
require('./server/models/pool');
require('./server/models/payment');
require('./server/models/currency');
require('./server/models/countrie');
require('./server/models/companytype');
require('./server/models/sale');
require('./server/models/OrderProductLog');


//Get our API routes
const api = require('./server/api/');

//Set API routes
app.use('/api', api);



// BEGIN CRON
// A exporter de ce fichier pour plus de souplesse

const cronCurrency = cron.schedule('30 15 * * *', function () {
  request.post({
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    url: 'http://localhost:3000/api/currency'
  }, (err, r, body) => {
  });
});
cronCurrency.start();
// test.destroy();

// CRON envoi mail après délai paramètrer
// const cronFailed = cron.schedule('59 23 * * *', function(){
//   request.post({
//       headers: {'content-type' : 'application/x-www-form-urlencoded'},
//       url: 'http://localhost:3000/api/cmd/verifFailed'
//     }, (err, r, body) => {
//   });
// });
// cronFailed.start();

// CRON Passer Item et commande à l'état Inactive
// const cronInactive = cron.schedule('1 * * * *', function(){
//   request.post({
//       headers: {'content-type' : 'application/x-www-form-urlencoded'},
//       url: 'http://localhost:3000/api/cmd/verifInactive'
//     }, (err, r, body) => {
//   });
// });
// cronInactive.start();

// const cronAutovalidationPVF = cron.schedule('30 15 * * *', function(){
//   request.post({
//       headers: {'content-type' : 'application/x-www-form-urlencoded'},
//       url: 'http://localhost:3000/api/order/autovalidation'
//     }, (err, r, body) => {
//   });
// });
// cronAutovalidationPVF.start();
// cronAutovalidationPVF.destroy();

// END CRON

//Static path to dist
app.use(express.static(path.join(__dirname, 'site/dist')));
app.use('/files', express.static(path.join(__dirname, 'files')));
app.use('/cmd', express.static(path.join(__dirname, 'files/command')));
app.use('/iv', express.static(path.join(__dirname, 'files/invoice')));
// app.use('/loadfile', express.static('/mapr/client_exports/'));
app.use('/help/dataguide', express.static(path.join(__dirname, 'dataguide/')));

//Catch all other routes and return to the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'site/dist/index.html'));
})

//Get environment port or use 3000
const port = process.env.PORT || '3000';
app.set('port', port);

//Create HTTP server.
const server = http.createServer(app);

//Listen on port
server.listen(port, () => {
  console.log(`API running on localhost:${port}`);
  console.log("HoD web site backend available");
});
module.exports = app;
