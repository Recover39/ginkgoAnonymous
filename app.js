/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments

app.configure(function () {
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
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//testFunction
app.get('/test', function (req, res) {
    res.render('testmain');
});
app.get('/cardTest', routes.loadCardTest);

//basic function
app.get('/', routes.checkLoginStatus);

app.get('/card/:id', routes.loadCard);
app.get('/card/checkNewCard', routes.checkNewCard);

//user register
app.get('/user/register', routes.userRegisterPage);
app.get('/privacy', function(req, res) {
    res.render('privacy');
});
app.post('/user/register/add', routes.userRegisterAdd);
//app.get('/user/register/checkId', routes.userRegisterCheckId);
//app.get('/user/register/checkMail', routes.userRegisterCheckMail);
app.get('/user/register/complete/:authKey', routes.userRegisterComplete);

//user login
app.get('/user/login', function(req, res) {
   res.render('signin');
});
app.post('/user/login/complete', routes.userLoginComplete);
app.get('/user/logout', routes.userLogoutComplete);

app.get('/user/review', routes.userReviewPage);
app.post('/user/review/add', routes.userReviewAdd);

//writeCard
app.post('/card/add', routes.write);

//modifyCard
//app.post('/card/:card_id/like', routes.like);
app.post('/card/:card_id/comment/add', routes.addComment);
app.post('/card/:card_id/delete', routes.deleteCard);


http.createServer(app).listen(app.get('port'), function () {
    console.log('\n///////////////////////////////////////////////\n' +
        '//// Express server listening on port ' + app.get('port') + ' ////' +
        '\n///////////////////////////////////////////////\n');
});
