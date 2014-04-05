/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express(),
    server = http.createServer(app);
    //io = require('socket.io').listen(4000);

// all environments

app.configure(function () {
    app.use(express.static(path.join(__dirname, 'public')), {maxAge : 30 * 24 * 60 * 60 * 1000});
    app.set('port', process.env.PORT || 80);
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
    app.use(express.compress());
    app.use(app.router);
    // Since this is the last non-error-handling
    // middleware use()d, we assume 404, as nothing else
    // responded.

    app.use(function (req, res, next) {
        // the status option, or res.statusCode = 404
        // are equivalent, however with the option we
        // get the "status" local available as well
        res.render('message', { message : "페이지를 찾을 수 없어요!" });
    });

    // error-handling middleware, take the same form
    // as regular middleware, however they require an
    // arity of 4, aka the signature (err, req, res, next).
    // when connect has an error, it will invoke ONLY error-handling
    // middleware.

    // If we were to next() here any remaining non-error-handling
    // middleware would then be executed, or if we next(err) to
    // continue passing the error, only error-handling middleware
    // would remain being executed, however here
    // we simply respond with an error page.

    app.use(function (err, req, res, next) {
        // we may use properties of the error object
        // here and next(err) appropriately, or if
        // we possibly recovered from the error, simply next().
        res.render('message', {message : "알 수 없는 에러입니다. 다시 시도해주세요" });
    });
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

////////////////
//basic function
////////////////
app.get('/', routes.checkLoginStatus);

app.get('/card/:id', routes.loadCard);
app.get('/card/checkNewCard', routes.checkNewCard);

////////////////
//user register
////////////////
app.get('/user/register', routes.userRegisterPage);
app.get('/privacy', function(req, res) {
    res.render('privacy');
});
app.get('/agreement', function(req, res) {
    res.render('agreement');
});
app.post('/user/register/add', routes.userRegisterAdd);
//app.get('/user/register/checkId', routes.userRegisterCheckId);
//app.get('/user/register/checkMail', routes.userRegisterCheckMail);
app.get('/user/register/complete/:authKey', routes.userRegisterComplete);

////////////////
//user login
////////////////
app.get('/user/login', function(req, res) {
   res.render('signin');
});
app.post('/user/login/complete', routes.userLoginComplete);
app.get('/user/logout', routes.userLogoutComplete);

////////////////
//user review
////////////////
app.get('/user/review', routes.userReviewPage);
app.post('/user/review/add', routes.userReviewAdd);

////////////////////
//user close account
////////////////////
app.get('/user/closeAccount', routes.userCloseAccountPage);
app.post('/user/closeAccount/complete', routes.userCloseAccountComplete);

////////////////
//writeCard
////////////////
//app.post('/card/add', routes.write(io));
app.post('/card/add', routes.write);

////////////////
//modifyCard
////////////////
//app.post('/card/:card_id/like', routes.like);
app.post('/card/:card_id/comment/add', routes.addComment);
app.post('/card/:card_id/delete', routes.deleteCard);
app.get('/card/:card_id/report', routes.reportCard);

server.listen(app.get('port'), function () {
    console.log('\n///////////////////////////////////////////////\n' +
        '//// Express server listening on port ' + app.get('port') + ' ////' +
        '\n///////////////////////////////////////////////\n');
});