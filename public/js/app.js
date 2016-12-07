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

        var $addButton = $('<button>ADD THIS MOVIE</button>');
        $('body').append($addButton);
        $addButton.on('click', function() {
          // SEND MOVIE TO SERVER - CREATE MOVIE
          $.ajax({
            method: 'POST',
            url: '/users/584844f1a72b8458a2be54ce/movies',
            data: result
          }).done(function(savedUser) {
            console.log(savedUser);
            $addButton.remove();
            $('#input-box').val('');
          });
        }); // end add button handler
      }); // end movie ajax
  }); // end input submit
}); // end onload
