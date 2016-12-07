console.log('hi');

// ONLOAD
$(function() {

 // AJAX REQUEST TO OMDBAPI
  $.ajax('http://www.omdbapi.com/?t=eraserhead&y=&plot=short&r=json')
   .done(function(result) {
     console.log(result);
   });

});
