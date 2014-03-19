var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var conn = mongoose.createConnection('mongodb://localhost/skkuApp');

autoIncrement.initialize(conn);

var cardScheme = new Schema({
        _id : Number,
        date : Date,
        body : String,
        comments : [{_id : Number, body : String }]
    }, {collection : 'card'});

cardScheme.plugin(autoIncrement.plugin, {model :'Card', field : '_id' });

var cardModel = conn.model('Card', cardScheme);

exports.loadCard = function (req, res){
    cardModel.find({}, null ,{sort: {'_id': -1}}, function(err, data) {
        res.render('main', { cards : data });
    });
};

exports.write = function (req, res) {
    var body = req.body.body,
        date = Date.now();

    var card = new cardModel();

    card.body = body;
    card.date = date;
    card.comments = [];

    card.save(function(err) {
        if (err) {
            throw err;
        }
        else {
            res.json({status : "SUCCESS"});
        }
    });

    res.redirect('/card');
};

exports.addComment = function (req, res) {

};