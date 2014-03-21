// configure App Setting

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var conn = mongoose.createConnection('mongodb://localhost/skkuApp');

autoIncrement.initialize(conn);

var cardScheme = new Schema({
    _id: { type: Number, index: true},
    date: Date,
    body: String,
    like: Number,
    comments: [
        { body: String }
    ]
}, {collection: 'card'});

cardScheme.plugin(autoIncrement.plugin, {model: 'Card', field: '_id' });

var cardModel = conn.model('Card', cardScheme);

//

exports.loadCard = function (req, res) {
    cardModel.find({}, null, {sort: {'date': -1}}, function (err, data) {
        if (err) {
            throw err;
        }
        else {
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

exports.write = function (req, res) {
    var body = req.body.body,
        date = Date.now();

    var card = new cardModel();

    card.body = body;
    card.date = date;
    card.like = 0;
    card.comments = [];

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
};

exports.addComment = function (req, res) {
    var card_id = req.params.card_id,
        commentBody = req.body.commentBody;

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
};