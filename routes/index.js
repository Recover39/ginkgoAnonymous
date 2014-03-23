///////////////////////////////////////////////
//////  configure App Database Setting
///////////////////////////////////////////////

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var conn = mongoose.createConnection('mongodb://localhost/ginkgoAnonymous');

autoIncrement.initialize(conn);

var cardScheme = new Schema({
    _id: { type: Number, index: true},
    date: Number,
    body: String,
    like: Number,
    comments: [
        { body: String }
    ]
}, {collection: 'card'});

cardScheme.plugin(autoIncrement.plugin, {model: 'Card', field: '_id' });

var cardModel = conn.model('Card', cardScheme);

//var userScheme = new Schema({
//
//}, {collection: 'user'});
//
//userScheme.plugin(autoIncrement.plugin, {model: 'User', field: '_id'});
//
//var userModel = conn.model('User', userScheme);

///////////////////////////////////////////////
//////  configure App Mail Setting
///////////////////////////////////////////////

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: "ginkgoanonymous@gmail.com",
        pass: "angtree!"
    }
});


///////////////////////////////////////////////
//////  App function
///////////////////////////////////////////////

exports.welcome = function (req, res) {
    res.render('welcome');
};

exports.loadCard = function (req, res) {
    cardModel.find({}, null, {sort: {'date': -1}}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            var dataLen = data.length;
            //console.log(dataLen);
            for (var i = 0; dataLen < i; i++) {

            }
            res.render('main', { cards: data });
        }
    });
};

exports.checkNewCard = function (req, res) {
    cardModel.find({}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.contentType('json');
            res.send({data: data});
        }
    });
};

exports.userRegisterPage = function (req, res) {
    res.render('register');
};

exports.userReviewPage = function (req, res) {
    res.render('userReview');
};

exports.userReviewAdd = function (req, res) {
    var body = req.body.body;

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "은행잎필무렵 <noReply@ginkgoanonymous.com>", // sender address
        to: "ginkgoanonymous@gmail.com", // list of receivers
        subject: "고객 피드백", // Subject line
        text: "고객 피드백", // plaintext body
        html: body
    };

    // send mail with defined transport object
//    smtpTransport.sendMail(mailOptions, function (error, response) {
//        if (error) {
//            console.log(error);
//        } else {
//            console.log("Message sent: " + response.message);
//        }
//
//        // if you don't want to use this transport object anymore, uncomment following line
//        //smtpTransport.close(); // shut down the connection pool, no more messages
//    });

    res.render('message', {message: "감사합니다"});
};

exports.write = function (req, res) {
    var body = req.body.body,
        date = Date.now();

    var card = new cardModel();

    card.body = body;
    card.date = date;
    card.like = 0;
    card.comments = [];

    // prevent null value on body
    if (body === undefined || body === "") {
        res.render('message', {message: "글 입력란은 빈칸으로 둘 수 없습니다."});
    }
    else {
        // not using ajax
        card.save(function (err) {
            if (err) {
                throw err;
            }
            else {
//            res.contentType('json');
//            res.send(card);
            }
        });

        res.redirect('/card');
    }
};

exports.addComment = function (req, res) {
    var card_id = req.params.card_id,
        commentBody = req.body.commentBody;

    // prevent null value on commentBody
    if (commentBody === undefined || commentBody === "") {
        res.render('message', {message: "댓글란은 빈칸으로 둘 수 없습니다."});
    }
    else {
        cardModel.findOne({_id: card_id}, function (err, data) {
            if (err) {
                throw err;
            }
            else {
                data.comments.push({ body: commentBody});
                data.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    else {
                        res.contentType('json');
                        res.send({commentBody: commentBody});
                    }
                });
            }
        });
    }
};