var express      = require('express');
var app          = express();
var port         = process.env.PORT || 8080;
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var mongoose     = require('mongoose');


mongoose.connect('mongodb://localhost/driveit');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');
app.use(express.static(__dirname, 'public'));
app.use(session({ secret: 'thisismyboilerplate' }));


require('./controller/routes.js')(app);




app.listen(port);
console.log('The magic happens on port ' + port);