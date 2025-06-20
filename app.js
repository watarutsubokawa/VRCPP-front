"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vrcDatabase = exports.vrcDatabaseStatus = void 0;
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const database_1 = require("./database");
const { database_path } = require('./config.json');
// === shared variables ===
exports.vrcDatabaseStatus = { isStarted: false, isFailedToStart: false };
exports.vrcDatabase = new database_1.VRCLogDatabase(database_path !== null && database_path !== void 0 ? database_path : "./", (err) => {
    if (err) {
        exports.vrcDatabaseStatus.isFailedToStart = true;
        throw err;
    }
    else {
        exports.vrcDatabaseStatus.isStarted = true;
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
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;
