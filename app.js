var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var user         = require('./lib/middleware/user');
var validate     = require('./lib/middleware/validate');
var page         = require('./lib/middleware/page');

var Entry        = require('./models/entry');

var routes   = require('./routes/index');
var users    = require('./routes/users');
var register = require('./routes/register');
var login    = require('./routes/login');
var entries  = require('./routes/entries');

var messages = require('./lib/messages');
var session  = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(session({secret: 'SomeSecretKey'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(user);
app.use(messages);

app.get('/register',  register.form);
app.post('/register', register.submit);

app.get('/login',     login.form);
app.post('/login',    login.submit);
app.get('/logout',    login.logout);

app.get('/', page(Entry.count, 5), entries.list);
app.get('/post',      entries.form);
app.post('/post',     
          validate.required('entry[title]'),
          validate.lengthAbove('entry[title]', 4),
          validate.required('entry[body]'),
          validate.lengthAbove('entry[body]', 10),
          entries.submit);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
