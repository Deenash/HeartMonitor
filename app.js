
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
var nodemailer = require('nodemailer');
var favicon = require('serve-favicon');




var loginRoute = require('./routes/loginRoute');
var dataRoute = require('./routes/dataRoute');
var showGraph = require('./routes/graph');

// all environments
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'ssshhhhh'}));
//setting favicon
app.use(favicon(__dirname + '/public/images/favicon.png'));

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/dataPage',dataRoute);
app.use('/',loginRoute);
app.use('/userGraph',showGraph);



app.listen(3000);
console.log("Running from port 3000");

module.exports = app;
 