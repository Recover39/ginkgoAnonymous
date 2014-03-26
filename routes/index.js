///////////////////////////////////////////////
//////  configure App Database Setting
///////////////////////////////////////////////

// mysql connection configure
// for userData

var mysql = require('mysql');
var crypto = require('crypto');

var extractConnection = (function () {
    var mysqlConfig = {
            host: 'localhost',
            port: 3306,
            user: 'ginkgoanonymous',
            password: 'Angtree!',
            database: 'ginkgoanonymous'
        },

        returnInfo = function () {
            return mysqlConfig;
        };

    return {
        returnInfo: returnInfo
    };
}());

var mysqlConn = mysql.createConnection(extractConnection.returnInfo());

// mongodb connection configure
// for Document Data

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var mongoConn = mongoose.createConnection('mongodb://localhost/ginkgoAnonymous');

autoIncrement.initialize(mongoConn);

var cardScheme = new Schema({
    _id: { type: Number, index: true},
    date: Number,
    expirationDate: Number,
    body: String,
    like: Number,
    comments: [
        { body: String }
    ]
}, {collection: 'card'});

cardScheme.plugin(autoIncrement.plugin, {model: 'Card', field: '_id' });

var cardModel = mongoConn.model('Card', cardScheme);

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

exports.loadCardTest = function (req, res) {
    cardModel.find({}, null, {sort: {'date': -1}}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            var dataLen = data.length;
            //console.log(dataLen);
            for (var i = 0; dataLen < i; i++) {

            }
            res.render('test', { cards: data });
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

exports.userRegisterAdd = function (req, res) {
    var id = req.body.userId,
        password = req.body.userPs,
        mail = req.body.userMail,
    //  to convert Date to JSON Data
        now = new Date(),
        jsonDate = now.toJSON(),
        time = new Date(jsonDate);

    //  make hashed Password for security
    var salt = Math.round((new Date().valueOf() * Math.random())) + '',
        hashpassword = crypto.createHash('sha512').update(salt + password).digest('hex'),
        hashAuthKey = crypto.createHash('sha512').update(salt + id).digest('hex');

    var userData = {
        id: id,
        password: hashpassword,
        passwordSalt: salt,
        universityMail: mail + "@skku.edu",
        registerDate: time,
        grade: '0'
    };

    var userAuth = {
        user_id: id,
        key: hashAuthKey
    };

    //  Email에 혹시 @을 넣었는지 확인해볼 것.
    var emailRegExp = /.+\@.+\..+/;

    if (emailRegExp.test(mail) === true) {
        res.render('message', {message: '@skku.edu를 제외한 이메일 앞자리만 입력해주세요'})
    }
    else {
        mysqlConn.query(
            'INSERT INTO user SET ?', userData, function (err, info) {
                if (err) {
                    throw err;
                    //res.render('message', {message: '이미 사용중인 아이디 혹은 대학 메일입니다. 다시 입력해주세요'});
                }
                else {
                    mysqlConn.query(
                        'INSERT INTO userAuthKey SET ?', userAuth, function (err, info) {
                            if (err) {
                                res.render('message', {message: '내부오류입니다. 죄송합니다. 다시 시도해주세요.'});
                            }
                            else {
                                // 회원가입이 무사히 이루어졌을 때,
                                var mailOptions = {
                                    from: "은행잎필무렵 <noReply@ginkgoanonymous.com>", // sender address
                                    to: userData.universityMail, // list of receivers
                                    subject: "은행꽃 필무렵 회원가입 인증 메일입니다.", // Subject line
                                    html: "<b>다음 링크를 클릭해 이메일 인증을 해주세요.</b>"
                                        + "<br/><br/>http://localhost:3000/user/register/complete/" + userAuth.key
                                        + "<br/><br/><b>감사합니다.</b>"
                                };

                                smtpTransport.sendMail(mailOptions, function (error, response) {
                                    if (error) {
                                        res.render('message', {message: '내부오류입니다. 죄송합니다. 다시 시도해주세요.'});
                                    } else {
                                        console.log("Message sent: " + response.message);
                                    }
                                    // if you don't want to use this transport object anymore, uncomment following line
                                    //smtpTransport.close(); // shut down the connection pool, no more messages
                                });
                                res.render('message', {message: '입력하신 이메일 계정으로 보내진 메일을 통해 대학 인증을 해주세요'});
                            }
                        }
                    );
                }
            }
        );
    }
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
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });

    res.render('message', {message: "감사합니다"});
};

exports.write = function (req, res) {
    var body = req.body.body,
        date = Date.now();

    var card = new cardModel();

    card.body = body;
    card.date = date;
    card.expirationDate = card.date + 86400000;
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
                res.redirect('/card');
//            res.render('message', {message : "입력하신 카드번호는 " ++ "번 입니다. 기억해주세요!"})
            }
        });
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

exports.deleteCard = function (req, res) {
    var card_id = req.params.card_id;
    cardModel.remove({_id: card_id}, function (err) {
        if (err) {
            throw err;
        }
    });
};