
//loading environment variables into global environment
global.environment = require("./server/environment/environment.json");
//Import dependencies
const LoggerFactory = require("./logger.js");
const logger = new LoggerFactory().createLogger("System");

const express = require("express");
// const path = require("path");
// const http = require("http");
const bodyParser = require("body-parser");
// const requestF = require("request");
const mongoose = require("mongoose");
const randtoken = require("rand-token");
const cors = require("cors");
// const cron = require("node-cron");

//const MDB = require("./server/config/configmdb.js").mdb;
//const Config = require("./server/config/config.js");

logger.info({
  message: `Starting application on ${global.environment.environment_name} environment`,
  className: "Server",
});

//Connect to mongoDB server
mongoose.connect(global.environment.database.connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: global.environment.database.dbname,
  user: global.environment.database.userdb,
  pass: global.environment.database.passdb,
  authSource: global.environment.database.authdb,
});

// mongoose.connect('mongodb://' + MDB.userdb + ':' + MDB.passdb + '@localhost:27017/histodataweb?authSource=' + MDB.authdb, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("debug", true);

logger.info({
  message: "Starting hod web site backend version 1.2.0...",
  className: "Server",
});

//Init express
const app = express();

//Enable CORS
app.use(cors());

//Passport
const passport = require("passport");
require("./server/config/passport")(passport); // pass passport for configuration

//Cookie and session
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret:
      "#Les défits valent d'être relevé%si§et seulement si ils¤ont quelques_choses à apporter à l'humanité !",
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//Enable bodyParser
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

//Require the models
require("./server/models/config");
require("./server/models/asset");
require("./server/models/exchange");
require("./server/models/user");
require("./server/models/role");
require("./server/models/order");
require("./server/models/pool");
require("./server/models/payment");
require("./server/models/currency");
require("./server/models/countrie");
require("./server/models/companytype");
require("./server/models/sale");
require("./server/models/OrderProductLog");
require("./server/models/invoice");
// Middleware
app.use(function (req, res, next) {
  if (!req.headers.internal) {
    let token = randtoken.generate(16);
    req.headers.loggerToken = token;
  } else {
    req.headers.loggerToken = req.headers["internal"];
  }
  var headers = new Array();
  for (let index = 0; index < req.rawHeaders.length; index = index + 2) {
    headers.push(
      '"' + req.rawHeaders[index] + '" : "' + req.rawHeaders[index + 1] + '"'
    );
  }

  req.logger = new LoggerFactory().createLogger(req.headers.loggerToken);
  req.logger.info({
    message: "HttpRequest: { ip: " + req.ip + ", hostname: " +req.hostname + ", Http method: " + 
      req.method + ", url: " + req.path + ", " + headers.join(", ") +" }", className: "Middleware",});
  req.logger.info({
    message: "Body: " + JSON.stringify(req.body),
    className: "Middleware",
  });
  next();
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ errors: { message: err.message, error: {} } });
});

//Get our API routes
const api = require("./server/api/");

//Set API routes
app.use("/api", api);

//Static path to dist
app.use(express.static(path.join(__dirname, "../../FrontEnd/site/dist")));
app.use("/files", express.static(path.join(__dirname, "files")));
app.use("/cmd", express.static(path.join(__dirname, "files/command")));
app.use("/iv", express.static(path.join(__dirname, "files/invoice")));
app.use('/loadfile', express.static('/mapr/client_exports/'));
app.use("/help/dataguide", express.static(path.join(__dirname, "dataguide/")));

//Catch all other routes and return to the index file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../FrontEnd/site/dist/index.html"));
});

//Get environment port or use 3000
const port = process.env.PORT || "3000";
app.set("port", port);

var server = app.listen(port, function () {
  logger.info({
    message: `API running on localhost:${server.address().port}`,
    className: "Server",
  });
  logger.info({
    message:
      "HoD web site backend available in " + global.environment.environment,
    className: "Server",
  });
  logger.close();
});
