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
    user: String,
    date: Number,
    body: String,
    like: Number,
    isAdmin: Boolean,
    report: Number,
    reportUser: [
        {user: String}
    ],
    comments: [
        { user: String, body: String, isAdmin: Boolean }
    ],
    favoriteUser: [ String ],
    available: Boolean
}, {collection: 'card'});

cardScheme.plugin(autoIncrement.plugin, {model: 'Card', field: '_id' });

var cardModel = mongoConn.model('Card', cardScheme);

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

exports.checkLoginStatus = function (req, res) {
    //loginStatus on
    if (req.cookies.rememberMe === true || req.session.loginStatus) {
        req.session.userId = req.cookies.userId;
        req.session.isAdmin = req.cookies.admin;
        req.session.loginStatus = true;
        res.redirect('/card');
    }

    //loginStatus off
    else {
        req.session.isAdmin = false;
        req.session.loginStatus = false;
        res.cookie('rememberMe', false, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        res.cookie('userId', null, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        res.cookie('admin', false, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        res.redirect('/user/login');
    }
};

exports.welcome = function (req, res) {
    res.render('welcome');
};

exports.loadWholeCard = function (req, res) {
    var isLogin = req.session.loginStatus;

    if (isLogin === false) {
        res.redirect('/');
    }
    cardModel.find({available: true}, null, {sort: {'date': -1}}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            var dataLen = data.length;
            //console.log(dataLen);
            for (var i = 0; dataLen < i; i++) {

            }
            res.render('main', { cards: data, tab: 0 });
        }
    });
};

exports.sendUserCard = function (req, res) {
    res.redirect('/card/user/' + req.session.userId);
};

exports.loadUserCard = function (req, res) {
    var isLogin = req.session.loginStatus,
        userSessionId = req.session.userId,
        userId = req.params.id,
        hashedUserId = crypto.createHash('sha512').update(req.session.userId).digest('hex');

    if (isLogin === false) {
        res.redirect('/');
    }
    if (userSessionId !== userId) {
        res.redirect('/');
    }
    cardModel.find({user: hashedUserId, available: true}, null, {sort: {'date': -1}}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            var dataLen = data.length;
            //console.log(dataLen);
            for (var i = 0; dataLen < i; i++) {

            }
            res.render('main', { cards: data, tab: 3 });
        }
    });
};

exports.sendHitCard = function (req, res) {
    res.redirect('/card/hit');
};

exports.loadHitCard = function (req, res) {
    var isLogin = req.session.loginStatus;

    if (isLogin === false) {
        res.redirect('/');
    }
    cardModel.find({available: true, comments: {$exists: true}, $where: 'this.comments.length >= 5'}, null, {sort: {'date': -1}}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.render('main', { cards: data, tab: 1 });
        }
    });
};

exports.setFavoriteCard = function (req, res) {
    var card_id = req.params.card_id,
        curUser = req.session.userId;

    if (curUser === null || curUser === undefined) {
        res.redirect('/');
    }

    cardModel.findOne({_id: card_id, available: true}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            var dataLen = data.length;
            if (dataLen === 0) {
                res.render('message', {message: '존재하지 않는 카드 주소입니다.'});
            }
            else {
                data.favoriteUser.push(curUser);
                data.save(function (err) {
                    if (err) {
                        res.render('message', {message: '관심글 설정에서 에러가 생겼네요!'});
                    }
                    else {
                        res.render('message', {message: '관심글로 설정되었습니다.'});
                    }
                });
            }
        }
    });
};

exports.sendFavoriteCard = function (req, res) {
    res.redirect('/card/favorite/' + req.session.userId);
};

exports.loadFavoriteCard = function (req, res) {
    var isLogin = req.session.loginStatus,
        userSessionId = req.session.userId;
    var userId = req.params.id;

    if (isLogin === false) {
        res.redirect('/');
    }
    if (userSessionId !== userId) {
        res.redirect('/');
    }
    cardModel.find({available: true, favoriteUser: {$in: [userSessionId]}}, null, {sort: {'date': -1}}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.render('main', { cards: data, tab: 2 });
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
        user_key: hashAuthKey
    };

    //  Email에 혹시 @을 넣었는지 확인해볼 것.
    var emailRegExp = /.+\@.+\..+/;

    if (emailRegExp.test(mail) === true) {
        res.render('message', {message: '@skku.edu를 제외한 이메일 앞자리만 입력해주세요'})
    }
    else {
        mysqlConn.query(
            'INSERT INTO user SET ?', userData, function (err) {
                if (err) {
                    res.render('message', {message: '이미 사용중인 아이디 혹은 대학 메일입니다. 다시 입력해주세요'});
                }
                else {
                    mysqlConn.query(
                        'INSERT INTO userAuthKey SET ?', userAuth, function (err) {
                            if (err) {
                                res.render('message', {message: '내부오류입니다. 죄송합니다. 다시 시도해주세요.'});
                            }
                            else {
                                var mailURL = "http://www.skkuleaf.com/user/register/complete/" + userAuth.user_key;
                                // callback으로 성공여부를 확인할 것.
                                // 회원가입이 무사히 이루어졌을 때,
                                var mailOptions = {
                                    from: "은행잎필무렵 <noReply@ginkgoanonymous.com>", // sender address
                                    to: userData.universityMail, // list of receivers
                                    subject: "은행꽃 필무렵 회원가입 인증 메일입니다.", // Subject line
                                    html: "<b>다음 링크를 클릭해 이메일 인증을 해주세요.</b>"
                                        + "<br/><br/><a href = " + mailURL + ">인증하기</a>"
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

exports.userRegisterComplete = function (req, res) {
    var authKey = req.params.authKey;

    mysqlConn.query(
        'SELECT user_id FROM userAuthKey WHERE user_key = ?', [authKey], function (err, result) {
            if (err) {
                res.render('message', {message: "잘못된 접근입니다"});
            }
            else {
                if (result.length === 0) {
                    res.render('message', {message: "이미 인증 되었거나, 없는 인증 번호 입니다."});
                }
                else {
                    var userId = result[0].user_id;
                    mysqlConn.query(
                        'UPDATE user SET grade = \'1\' WHERE id =?', [userId], function (err) {
                            if (err) {
                                res.render('message', {message: "다시 시도해 주세요"});
                            }
                            else {
                                mysqlConn.query(
                                    'DELETE FROM userAuthKey WHERE user_key = ?', [authKey], function (err) {
                                        if (err) {
                                            console.log("user_id = " + authKey + "의 AuthKey가 삭제되지 않음");
                                        }
                                        else {
                                            res.render('message', {message: "인증 되었습니다. 감사합니다."});
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        }
    );
};

exports.userLoginComplete = function (req, res) {
    var userId = req.body.userId,
        password = req.body.password;

    function setUserSession() {
        req.session.isAdmin = false;
        req.session.loginStatus = true;
        req.session.userId = userId;
        res.cookie('rememberMe', true, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        res.cookie('userId', userId, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        res.cookie('admin', false, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
    }

    function setAdminSession() {
        req.session.isAdmin = true;
        req.session.loginStatus = true;
        req.session.userId = userId;
        res.cookie('rememberMe', true, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        res.cookie('userId', userId, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        res.cookie('admin', true, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
    }

    mysqlConn.query(
        'SELECT id, password, passwordSalt, grade FROM user WHERE id = ?', [userId], function (err, result) {
            if (err) {
                res.render('message', {message: "다시 시도해 주세요"});
            }
            if (result.length === 0) {
                res.render('message', {message: "없는 아이디 입니다."});
            }
            else {
                var newhash = crypto.createHash('sha512').update(result[0].passwordSalt + password).digest('hex');

                if (result[0].password === newhash) {
                    if (result[0].grade === '0') {
                        //인증 안한 사용자
                        res.render('message', {message: "대학 메일 인증을 해주세요"});
                    }
                    else {
                        if (result[0].grade === '1') {
                            // 인증한 사용자
                            setUserSession();
                            res.redirect('/');
                        }
                        else {
                            // 관리자
                            setAdminSession();
                            res.redirect('/');
                        }
                    }
                }
                else {
                    res.render('message', {message: "비밀 번호 오류입니다."});
                }
            }
        }
    );
};

exports.userLogoutComplete = function (req, res) {
    req.session.loginStatus = false;
    req.session.isAdmin = false;
    res.cookie('rememberMe', false, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
    res.cookie('userId', null, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
    res.cookie('admin', false, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
    res.redirect('/');
};

exports.userReviewPage = function (req, res) {
    var isLogin = req.session.loginStatus;
    res.render('userReview', {login: isLogin});
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

exports.userCloseAccountPage = function (req, res) {
    var userId = req.session.userId,
        isLogin = req.session.loginStatus;
    res.render('closeAccount', {user: userId, login: isLogin});
};

exports.userCloseAccountComplete = function (req, res) {
    var password = req.body.password,
        userId = req.session.userId;

    mysqlConn.query('SELECT password, passwordSalt FROM user WHERE id = ?', [userId], function (err, result) {
        if (err) {
            res.render('message', {message: '이런! 시스템이 탈퇴를 거부하나봐요. 다시 시도해주세요'});
        }
        else {
            if (result.length === 0) {
                res.render('message', {message: '잡았다 요놈!'});
            }
            else {
                var hashpassword = crypto.createHash('sha512').update(result[0].passwordSalt + password).digest('hex');
                if (result[0].password === hashpassword) {
                    mysqlConn.query('DELETE FROM user WHERE id = ?', [userId], function (err) {
                        if (err) {
                            res.render('message', {message: '이런! 시스템이 탈퇴를 거부하나봐요. 다시 시도해주세요'});
                        }
                        else {
                            req.session.loginStatus = false;
                            req.session.isAdmin = false;
                            res.render('message', {message: '탈퇴되셨습니다. 다음에 또 뵈요.. 꼭..!'});
                        }
                    });
                }
                else {
                    res.render('message', {message: '비밀번호가 틀리셨어요. 탈퇴하지 마세용 ㅜㅠ'});
                }
            }
        }
    });
};

exports.write = function (socket) {
    return function (req, res) {
        var write = function (req, res) {
            var curTime = Date.now(),
                ms6Hour = 6 * 60 * 60 * 1000,
                hashedUserId = crypto.createHash('sha512').update(req.session.userId).digest('hex');
            cardModel.find({user: hashedUserId, available: true}).sort({'date': -1}).limit(30).exec(function (err, result) {
                if (err) {
                    res.render('message', {message: "다시 시도해 주세요"});
                }
                else {
                    // maximum : 30
                    var userCardNum = result.length;
                    if (userCardNum === 30) {
                        var lastCardTime = curTime - result[userCardNum - 1].date;
                        if (lastCardTime < ms6Hour) {
                            preventWriteCard(req, res);
                        }
                        else {
                            listLastCard(req, res);
                        }
                    }
                    else if (userCardNum < 30) {
                        listLastCard(req, res);
                    }
                }
            });
        };

        var listLastCard = function (req, res) {
            var hashedUserId = crypto.createHash('sha512').update(req.session.userId).digest('hex');
            cardModel.find({available: true}).sort({'date': -1}).limit(1).exec(function (err, result) {
                if (err) {
                    res.render('message', {message: "다시 시도해 주세요"});
                }
                else {
                    if (result.length === 0) {
                        writeCard(req, res);
                    }
                    else {
                        if (result[0].user === hashedUserId) {
                            threeMinutes(req, res);
                        }
                        else {
                            findLastCard(req, res);
                        }
                    }
                }
            });
        };

        var threeMinutes = function (req, res) {
            var curTime = Date.now(),
                ms3Minutes = 180000;
            cardModel.find({available: true}).sort({'date': -1}).limit(1).exec(function (err, result) {
                if (err) {
                    res.render('message', {message: "다시 시도해 주세요"});
                }
                else {
                    if (curTime - result[0].date < ms3Minutes) {
                        preventWriteCard(req, res);
                    }
                    else {
                        writeCard(req, res);
                    }
                }
            });
        };

        var findLastCard = function (req, res) {
            var hashedUserId = crypto.createHash('sha512').update(req.session.userId).digest('hex'),
                curTime = Date.now(),
                ms1Minutes = 60 * 1000;
            cardModel.find({user: hashedUserId, available: true}).sort({'date': -1}).limit(1).exec(function (err, result) {
                if (err) {
                    res.render('message', {message: "다시 시도해 주세요"});
                }
                else {
                    if (result.length === 0) {
                        writeCard(req, res);
                    }
                    else {
                        if (curTime - result[0].date < ms1Minutes) {
                            preventWriteCard(req, res);
                        }
                        else {
                            writeCard(req, res);
                        }
                    }
                }
            });
        };

        var writeCard = function (req, res) {
            var XSSfilter = function (content) {
                return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            };

            var checkURL = function (string) {
                var URLregxp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

                var result = string.replace(URLregxp, '<a href="$1" target="_blank">$1</a>');

                return result;
            };

            var body = checkURL(XSSfilter(req.body.body)),
                date = Date.now(),
                hashedUserId = crypto.createHash('sha512').update(req.session.userId).digest('hex'),
                isAdmin = req.session.isAdmin;

            var card = new cardModel();

            card.body = body;
            card.user = hashedUserId;
            card.date = date;
            card.like = 0;
            card.isAdmin = isAdmin;
            card.report = 0;
            card.reportUser = [];
            card.comments = [];
            card.favoriteUser = [];
            card.available = true;

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
//                  res.contentType('json');
//                  res.send(card);
                        res.redirect('/');
                        socket.broadcast.emit('newCard');
//                  res.render('message', {message : "입력하신 카드번호는 " ++ "번 입니다. 기억해주세요!"})
                    }
                });
            }
        };

        var preventWriteCard = function (req, res) {
            res.render('message', {message: "도배를 방지합니다. 2분간 기다린 후 작성해주세요"});
        };

        //// start function ////
        write(req, res);
    }
};

exports.addComment = function (req, res) {
    var XSSfilter = function (content) {
        return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    var checkURL = function (string) {
        var URLregxp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

        var result = string.replace(URLregxp, '<a href="$1" target="_blank">$1</a>');

        return result;
    };

    var card_id = req.params.card_id,
        commentBody = checkURL(XSSfilter(req.body.commentBody)),
        commentUserId = crypto.createHash('sha512').update(req.session.userId).digest('hex'),
        isAdmin = req.session.isAdmin;

    // prevent null value on commentBody
    if (commentBody === undefined || commentBody === "") {
        res.render('message', {message: "댓글란은 빈칸으로 둘 수 없습니다."});
    }
    else {
        cardModel.findOne({_id: card_id, available: true}, function (err, data) {
            if (err) {
                throw err;
            }
            else {
                if (data.length === 1) {
                    var writeUser = data.user;
                    var userCompare = function (cardUser, commentUser) {
                        if (cardUser === commentUser) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    };
                    var userSame = userCompare(writeUser, commentUserId);

                    data.comments.push({ user: commentUserId, body: commentBody, isAdmin: isAdmin});
                    data.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            res.contentType('json');
                            res.send({commentBody: commentBody, isAdmin: isAdmin, userSame: userSame});
                        }
                    });
                }
                else {
                    res.render('message', {message: '존재하지 않는 카드 주소입니다.'});
                }
            }
        });
    }
};

exports.deleteCard = function (req) {
    var checkAdmin = function (req) {
        if (req.session.isAdmin === true) {
            return true;
        }
        else {
            return false;
        }
    };
    if (checkAdmin(req) === true) {
        var card_id = req.params.card_id;
        cardModel.remove({_id: card_id}, function (err) {
            if (err) {
                throw err;
            }
        });
    }
};

var deleteCard = function () {
    var cardLifeMs = 24 * 60 * 60 * 1000,
        curTime = Date.now();
    cardModel.find({available: true}, null, null, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            var dataLen = data.length;
            for (var i = 0; i < dataLen; i++) {
                var cardTime = data[i].date,
                    cardSurviveTime = curTime - cardTime;
                if (cardSurviveTime >= cardLifeMs) {
                    data[i].available = false;
                    data.save(function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        }
    });
};

(function () {
    setInterval(function () {
        deleteCard();
    }, 60000);
})();

exports.reportCard = function (req, res) {
    var curUser = crypto.createHash('sha512').update(req.session.userId).digest('hex'),
        card_id = req.params.card_id;

    if (curUser === null || curUser === undefined) {
        res.redirect('/');
    }

    cardModel.findOne({_id: card_id, available: true}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            if (data.length === 1) {
                var reportNum = data.report;
                var firstReport = 0;
                for (var i = 0; i < reportNum; i++) {
                    if (data.reportUser[i].user === curUser) {
                        firstReport = firstReport + 1;
                    }
                }
                if (firstReport === 0) {
                    if (req.session.isAdmin === true) {
                        var adminReport = 4;
                        data.report = reportNum + adminReport;
                        for (var j = 0; j < adminReport; j++) {
                            data.reportUser.push({ user: curUser});
                        }
                    }
                    else {
                        data.report = reportNum + 1;
                        data.reportUser.push({ user: curUser});
                    }
                    data.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            res.render('message', {message: '신고되었습니다. 감사합니다.'});
                        }
                    });
                }
                else {
                    res.render('message', {message: '이미 신고하신 글은 다시 신고할 수 없어요!'});
                }
            }
            else {
                res.render('message', {message: '존재하지 않는 카드 주소입니다.'});
            }
        }
    });
};