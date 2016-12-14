var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var movieSchema = new Schema({
  Director: { type: String, default: 'N/A'},
  Poster: { type: String, default: 'https://svn.alfresco.com/repos/alfresco-open-mirror/alfresco/COMMUNITYTAGS/V5.0.a/root/projects/repository/config/alfresco/thumbnail/thumbnail_placeholder_256_qt.png'},
  Title: { type: String, default: 'N/A'},
  Writer: { type: String, default: 'N/A'},
  Year: { type: String, default: 'N/A'},
  Plot: { type: String, default: 'N/A'},
  DatesWatched: [],
  Reviews: [],
  Rating: { type: Number, min: 0, max: 5, default: 0 }
});


var Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
