var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

var routes = require('./routes/index');
var about = require('./routes/about');
var contact = require('./routes/contact');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/about', about);
app.use('/contact', contact);

app.get('/contact', contact);

// nodemailer setup
app.post('/contact', function (req, res) {
  var transporter = nodemailer.createTransport();
  // mail options
  mailOptions = {
    from: req.body.name + ' &lt;' + req.body.email + '&gt;', 
    to: req.body.name + ' &lt;' + req.body.email + '&gt;',
    subject: req.body.subject,
    text: req.body.message};
  // send mail
  transporter.sendMail(mailOptions, function (error, response) {
    if (error) {
        res.render('contact', {msg: 'Error occured! Message not sent.', err: true})
    } else {
        res.render('contact', {msg: 'Message sent! Thank you.', err: false })
    }
  });
});

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