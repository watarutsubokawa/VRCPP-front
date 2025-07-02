var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index.cjs');
var usersRouter = require('./routes/users.cjs');
var chatBoxRouter = require('./routes/chatbox.cjs');
import {VRCLogDatabase} from "./database.cjs";
const {database_path} = require('./config.json');

// === shared variables ===
export const vrcDatabaseStatus = {isStarted: false, isFailedToStart: false}
export const vrcDatabase = new VRCLogDatabase(database_path ?? "./", (err) => {
  if (err) {
    vrcDatabaseStatus.isFailedToStart = true;
    throw err;
  } else {
    vrcDatabaseStatus.isStarted = true;
    console.log("Connecting to the database completely!");
  }
});

// === express ===
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chatbox', chatBoxRouter);

// catch 404 and forward to error handler
app.use(function(req: any, res: any, next: any) {
  next(createError(404));
});

// error handler
app.use(function(err: {status?:number, message:string}, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
