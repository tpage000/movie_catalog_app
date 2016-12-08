console.log('hi');

// ONLOAD
$(function() {

  $('#input-submit').on('click', function() {

    // INPUT VALUE STRING
    var $inputString = $('#input-box').val();
    // AJAX REQUEST TO OMDBAPI
     $.ajax('https://www.omdbapi.com/?t=' + $inputString + '&y=&plot=short&r=json')
      .done(function(result) {
        console.log(result);

        $('#result-container').empty();
        $('#input-box').val('');

        if (result.Error) {

          $('#result-container').text(result.Error + ' Did you spell it correctly though? Maybe OMDB Api hasn\'t added it yet, which is a shame.' );

        } else {

          var $movieContainer = $('<div>');

          $movieContainer.append($('<h3>').text(result.Title));
          $movieContainer.append($('<p>').text(result.Year));
          $movieContainer.append($('<p>').text(result.Director));
          $movieContainer.append($('<img>').attr('src', result.Poster).addClass('poster-img'));
          $movieContainer.append($('<p>'));
          var $addButton = $('<button type="submit">ADD</button>');
          $addButton.addClass('hit-button');
          // $addButton.addClass('btn btn-lg-success');
          $movieContainer.append($addButton);

          $movieContainer.addClass('col-lg-6 text-center');

          $('#result-container').append($movieContainer);

          $addButton.on('click', function() {
            // SEND MOVIE TO SERVER - CREATE MOVIE

            var userId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);

            console.log('user is: ', userId);

            $.ajax({
              method: 'POST',
              url: '/movies/' + userId,
              data: result
            }).done(function(savedUser) {
              window.location.href = '/movies/' + savedUser._id + '/alphabetical_columns'
              // console.log(savedUser);
              // $addButton.remove();
              // $('#input-box').val('');
            });
          }); // end add button handler
        } // end else error
      }); // end movie ajax
  }); // end input submit
}); // end onload
