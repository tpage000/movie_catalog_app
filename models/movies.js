var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var movieSchema = new Schema({

});


var Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
