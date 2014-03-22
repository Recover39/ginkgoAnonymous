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