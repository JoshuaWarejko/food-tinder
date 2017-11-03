// Used Modules
const express = require('express'),
      path = require('path'),
      favicon = require('serve-favicon'),
      logger = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      MongoClient = require('mongodb').MongoClient,
      dotenv = require('dotenv').config({ path: '.env' });

      
// Express App
app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Set CORS policy
app.use('*', function(req, res, next) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8100'
  ];
  const origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  }
  next();
});

// MongoDB setup / connection
const MongoOptions = require('./config/mongo').connection;
const MongoConnectionUri = `mongodb://${MongoOptions.credentials.user}:${MongoOptions.credentials.pass}@${MongoOptions.uri}:${MongoOptions.port}/${MongoOptions.db}?authSource=admin`;
const promiseLib = global.Promise; //mongoose' Promise library is deprecated, so we need to provide our own.
mongoose.Promise = promiseLib;
mongoose.connect(MongoConnectionUri, {
  useMongoClient: true,
  promiseLibrary: promiseLib // Deprecation issue again
})
.then((res) =>  console.log('MongoDB connected successfully to db:', res.db.s.databaseName))
.catch((err) => console.error(err));

app.set('superSecret', process.env.TOKEN_SECRET);

// Parsers
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API files for interacting with MongoDB
const index = require('./routes/index');
const usersApi = require('./routes/users');
const yesListApi = require('./routes/yes-lists');
const yelpApi = require('./routes/yelp');

// API location
app.use('/', index);
app.use('/api/users', usersApi);
app.use('/api/yes-lists', yesListApi);
app.use('/api/yelp', yelpApi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;