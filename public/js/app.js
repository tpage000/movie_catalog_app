console.log('hi');

// ONLOAD
$(function() {
  // =======================================================================================
  // BEGIN PROCESS FOR WHEN INPUT SUBMIT IS CLICKED
  $('#input-submit').on('click', function() {
    // Get string value from the input box (the intended movie title)
    var $inputString = $('#input-box').val();
    // ==========================================================================================
    // MAKE AJAX REQUEST TO OMDBAPI using the input string in the request url
     // Note: The request url needs to be https or Heroku gives a 'mixed content' error
     $.ajax('https://www.omdbapi.com/?t=' + $inputString + '&y=&plot=short&r=json')
      .done(function(result) {
        // The returned data from OMDB is:
        console.log(result);
        // empty out the movie results box and input box when another request comes in
        $('#result-container').empty();
        $('#input-box').val('');
        // if the AJAX request to OMDB does not have the movie, send this message to the page
        if (result.Error) {
          $('#result-container').text(result.Error + ' Did you spell it correctly though? Maybe OMDB Api hasn\'t added it yet, which is a shame.' );
        // if the AJAX request to OMDB returns a movie, add the movie details to the page
        // and add a button so that user can put the movie in the user's collection
        } else {
          // ====================================================================================
          // MOVIE RESULTS DISPLAY
          var $movieContainer = $('<div>');
          $movieContainer.append($('<h3>').text(result.Title));
          $movieContainer.append($('<p>').text(result.Year));
          $movieContainer.append($('<p>').text(result.Director));
          $movieContainer.append($('<img>').attr('src', result.Poster).addClass('poster-img'));
          $movieContainer.append($('<p>'));
          var $addButton = $('<button type="submit">ADD</button>');
          $addButton.addClass('hit-button');
          $movieContainer.append($addButton);
          $movieContainer.addClass('col-lg-6 text-center');
          $('#result-container').append($movieContainer);
          // END MOVIE RESULTS DISPLAY
          // ===================================================================================

          // ===================================================================================
          // 'ADD' BUTTON FUNCTIONALITY
          // When the 'add' button is clicked, send a POST request to the movie create route
          $addButton.on('click', function() {
            // Takes the user's id from the url bar
            var userId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
            // AJAX request to the server with the user's id and the movie information
            $.ajax({
              method: 'POST',
              url: '/movies/' + userId,
              data: result
            }).done(function(savedUser) {
              // When the request is done, redirect to the user's alphabetical list
              window.location.href = '/movies/' + savedUser._id + '/alphabetical_columns'
            });
          }); // end add button handler
          // END 'ADD' BUTTON FUNCTIONALITY
          // ==================================================================================
        } // end else error
      }); // end movie ajax
      // END AJAX REQUEST TO OMDB API
      // =================================================================================
  }); // end input submit
  // END PROCESS FOR WHEN INPUT SUBMIT IS CLICKED
  // ===========================================================================
}); // end onload
