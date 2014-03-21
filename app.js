/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments

app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view option', { layout: false });
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.cookieDecoder());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: "keyboard cat" }));
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//testFunction
app.get('/test', function (req, res) {
    res.render('testmain');
});

//basic function
app.get('/', function (req, res) {
    res.redirect('/card');
});
app.get('/card', routes.loadCard);
app.get('/card/checkNewCard', routes.checkNewCard);

//customer
app.get('/customer/review', routes.customerReviewPage);
app.post('/customer/review/add', routes.customerReviewAdd);

//writeCard
app.post('/card/add', routes.write);

//modifyCard
//app.post('/card/:card_id/like', routes.like);
app.post('/card/:card_id/comment/add', routes.addComment);


http.createServer(app).listen(app.get('port'), function () {
    console.log('\n///////////////////////////////////////////////\n' +
        '//// Express server listening on port ' + app.get('port') +' ////'+
        '\n///////////////////////////////////////////////\n');
});
