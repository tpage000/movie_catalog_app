console.log('hi');

// ONLOAD
$(function() {

  $('#input-submit').on('click', function() {

    // INPUT VALUE STRING
    var $inputString = $('#input-box').val();
    // AJAX REQUEST TO OMDBAPI
     $.ajax('http://www.omdbapi.com/?t=' + $inputString + '&y=&plot=short&r=json')
      .done(function(result) {
        console.log(result);
      });

  })



});
