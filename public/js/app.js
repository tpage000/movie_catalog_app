console.log('hi');

// ONLOAD
$(function() {
  // ===============================================
  // BEGIN PROCESS FOR WHEN INPUT SUBMIT IS CLICKED
  $('#input-submit').on('click', processRequest);
  // ===============================================
}); // end onload

// begins the chain of events
var processRequest = function() {
  displayLoadingGif();
  makeAjaxRequestToOMDBSearch();
}

// just displays the loading / waiting gif
var displayLoadingGif = function() {
  // empty out the movie results box of all previous do-ers
  $('#result-container').empty();
  // create and display the gif
  $loadingGifDiv = $('<div>').addClass("col-lg-6 text-center");
  $loadingGifDiv.append('<img src="http://digitalsynopsis.com/wp-content/uploads/2016/06/loading-animations-preloader-gifs-ui-ux-effects-18.gif"/>')
  $('#result-container').append($loadingGifDiv);
}; // end displayLoadingGif


var makeAjaxRequestToOMDBSearch = function() {
  // Get string value from the input box (the intended movie title)
  var $inputString = $('#input-box').val();
  // MAKE AJAX REQUEST TO OMDBAPI using the input string in the request url
  // Note: The request url needs to be https or Heroku gives a 'mixed content' error
  $.ajax('https://www.omdbapi.com/?s=' + $inputString + '&r=json')
   .done(function(searchResults) {
    console.log('OMDB SEARCH results: ', searchResults);
    // empty the page of all previous do-ers to make way for the result
    $('#result-container').empty();
    $('#input-box').val('');
    // if the AJAX request to OMDB does not have the movie, send this message to the page
    if (searchResults.Error) {
      $('#result-container').text(searchResults.Error + ' Did you spell it correctly though? Maybe OMDB Api hasn\'t added it yet, which is a shame.' );
    // if the AJAX request to OMDB does return movie results, add the movie results to the page
    // and add a button so that user can put the movie in the user's collection
    } else {
      // ==============================================
      displayAllMovieResults(searchResults);
      // ==============================================
    } // end else error
  }); // end OMDB SEARCH
  // =================================================================================
} // end makeAjaxRequestToOMDBSearch


// MOVIE RESULTS DISPLAY
// All the movie results are in an array called .Search
// Loop over the results and give each result (each movie) a container and an 'add' button
var displayAllMovieResults = function(searchResults) {
  searchResults.Search.forEach(function(result) {
    var $movieContainer = $('<div>');
    $movieContainer.append($('<h3>').text(result.Title));
    $movieContainer.append($('<p>').text(result.Year));
    if (result.Poster == "N/A") { result.Poster = "https://svn.alfresco.com/repos/alfresco-open-mirror/alfresco/COMMUNITYTAGS/V5.0.a/root/projects/repository/config/alfresco/thumbnail/thumbnail_placeholder_256_qt.png"; };
    $movieContainer.append($('<img>').attr('src', result.Poster).addClass('poster-img'));
    $movieContainer.append($('<p>'));
    // Each movie's 'add' button will have the imdb ID as an id.
    // This is used when the 'add' button is clicked, in order to make yet another ajax request,
    // this time to the single-movie api in order to get more detailed results on the chosen movie.
    var $addButton = $('<button id=' + result.imdbID + ' type="submit">ADD</button>');
    $addButton.addClass('hit-button');
    $addButton.on('click', getMoreMovieInfoFromOMDB);
    $movieContainer.append($addButton);
    $movieContainer.addClass('col-lg-4 text-center');
    $('#result-container').append($movieContainer);
  });
} // end displayAllMovieResults

// ===================================================================================
// 'ADD' BUTTON FUNCTIONALITY
// When the 'add' button is clicked,
//    1. Make another request to omdb with the imdb id, in order to get more detailed results for the particular movie
//    2. Send a POST request to the movie create route
var getMoreMovieInfoFromOMDB = function() {
  displayLoadingGif();
  // the imdb id is the 'add' button's id.
  console.log(this.id);
  // Retrieves detailed information about the chosen title using imdb id within the search string
  $.ajax('https://www.omdbapi.com/?i=' + this.id + '&y=&plot=short&r=json')
   .done(function(result) {
     if (result.Error) {
       $('#result-container').text(result.Error);
       // if the AJAX request to OMDB returns a movie, add the movie details to the page
     } else {
       // =====================================
       sendMovieDataToServer(result);
       // =====================================
     } // end if error
   }); // end movie ajax
} // end getMoreMovieInfoFromOMDB


// ADDS THE CHOSEN TITLE TO THE USER'S COLLECTION
var sendMovieDataToServer = function(result) {
  // Takes the user's id from the url bar, to be used in ajax url
  var userId = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
  // AJAX request to the server with the user's id and the movie information
  $.ajax({
    method: 'POST',
    url: '/movies/' + userId,
    data: result
  }).done(function(response) {
    // When the request is done, redirect to the new movie show page
    window.location.href = '/movies/' + response.userId + '/' + response.movieId;
  });
} // end sendMovieDataToServer

// END 'ADD' BUTTON FUNCTIONALITY
// ==================================================================================
