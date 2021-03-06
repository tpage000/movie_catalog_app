console.log('hi');

// Document Ready
$(() => $('#input-submit').on('click', processRequest));

// Begins the chain of events
const processRequest = () => {
  displayLoadingGif();
  makeAjaxRequestToOMDBSearch();
}

const displayLoadingGif = () => {
  $('#result-container').empty();
  $loadingGifDiv = $('<div>').addClass("col-lg-6 text-center");
  $loadingGifDiv.append('<img src="http://digitalsynopsis.com/wp-content/uploads/2016/06/loading-animations-preloader-gifs-ui-ux-effects-18.gif"/>');
  $('#result-container').append($loadingGifDiv);
};

const makeAjaxRequestToOMDBSearch = () => {
  const $inputString = $('#input-box').val();
  // Either query for a single movie by its IMDB number (tt2527336) or 
  // query by searching OMDB by title, actor, director, etc.
  if ($inputString.startsWith('tt')) {
    requestByIMDB($inputString);
  } else {
    requestBySearch($inputString);
  }
};

const requestByIMDB = async ($inputString) => {
  console.log('query type: imdb');
  // Note: The request url needs to be https or Heroku gives a 'mixed content' error
  try {
    let searchResults = await $.ajax('https://www.omdbapi.com/?i=' + $inputString + '&r=json&apikey=57dc4908');
    console.log('OMDB imdb number search result: ', searchResults);
    $('#result-container').empty();
    $('#input-box').val('');
    // if the AJAX request to OMDB does not have the movie, send this message to the page
    if (searchResults.Error) {
     $('#result-container').text(searchResults.Error + ' Did you spell it correctly though? Maybe OMDB Api hasn\'t added it yet, which is a shame.' );
    } else {
     // ==============================================
     displaySingleMovieResult(searchResults);
     // ==============================================
    } // end else error
   } catch (err) {
     console.log('Error: ', err);
     $('#result-container').empty();
     $('#input-box').val('');
     $('#result-container').text('TRY AGAIN -- ' + err.statusText); 
   } 
};

const requestBySearch = async ($inputString) => {
  console.log('query type: search');
  try {
    // Note: The request url needs to be https or Heroku gives a 'mixed content' error
    let searchResults = await $.ajax('https://www.omdbapi.com/?s=' + $inputString + '&r=json&apikey=57dc4908');
    console.log('OMDB SEARCH results: ', searchResults);
    $('#result-container').empty();
    $('#input-box').val('');
    // if the AJAX request to OMDB does not have the movie, send this message to the page
    if (searchResults.Error) {
      $('#result-container').text(searchResults.Error + ' Did you spell it correctly though? Maybe OMDB Api hasn\'t added it yet, which is a shame.' );
    } else {
      // ==============================================
      displayAllMovieResults(searchResults);
      // ==============================================
    } // end else error
  } catch (err) {
    console.log('Error: ', err);
    $('#result-container').empty();
    $('#input-box').val('');   
    $('#result-container').text('TRY AGAIN -- ' + err.statusText); 
  }
};

// MOVIE RESULTS DISPLAY
// All the movie results are in an array called .Search
// Loop over the results and give each result (each movie) a container and an 'add' button
const displayAllMovieResults = (searchResults) => {

  // Generates rows to put the results for proper formatting. There will be three results per row, so divide the number of results by 3.
  let $row = null;
  
  for (let i=0; i < Math.floor((searchResults.Search.length / 3) + 1); i++) {
    $row = $('<div>').attr('id', 'row' + i);
    $row.addClass("row");
    $('#result-container').append($row);
  } // end generate rows

  let $movieContainer = null;
  let $addButton = null;
  
  searchResults.Search.forEach((result, index) => {
    $movieContainer = $('<div>');
    $movieContainer.append($('<h3>').text(result.Title));
    $movieContainer.append($('<p>').text(result.Year));
    if (result.Poster == "N/A") { result.Poster = "https://svn.alfresco.com/repos/alfresco-open-mirror/alfresco/COMMUNITYTAGS/V5.0.a/root/projects/repository/config/alfresco/thumbnail/thumbnail_placeholder_256_qt.png"; };
    $movieContainer.append($('<img>').attr('src', result.Poster).addClass('poster-img'));
    $movieContainer.append($('<p>'));
    // Each movie's 'add' button will have the imdb ID as an id.
    // This is used when the 'add' button is clicked, in order to make yet another ajax request,
    // this time to the single-movie api in order to get more detailed results on the chosen movie.
    $addButton = $('<button id=' + result.imdbID + ' type="submit">ADD</button>');
    $addButton.addClass('hit-button');
    $addButton.on('click', getMoreMovieInfoFromOMDB);
    $movieContainer.append($addButton);
    $movieContainer.addClass('col-lg-4 text-center');

    // Temporary solution
    if (index < 3 ) { $('#row0').append($movieContainer); }
    if (index >= 3 && index <= 5 ) { $('#row1').append($movieContainer); }
    if (index >= 6 && index <= 8 ) { $('#row2').append($movieContainer); }
    if (index >= 9) { $('#row3').append($movieContainer); }
  });
}; // end displayAllMovieResults

const displaySingleMovieResult = (result) => {
  const $movieContainer = $('<div>');
  $movieContainer.append($('<h3>').text(result.Title));
  $movieContainer.append($('<p>').text(result.Year));
  if (result.Poster == "N/A") { result.Poster = "https://svn.alfresco.com/repos/alfresco-open-mirror/alfresco/COMMUNITYTAGS/V5.0.a/root/projects/repository/config/alfresco/thumbnail/thumbnail_placeholder_256_qt.png"; };
  $movieContainer.append($('<img>').attr('src', result.Poster).addClass('poster-img'));
  $movieContainer.append($('<p>'));
  // Each movie's 'add' button will have the imdb ID as an id.
  // This is used when the 'add' button is clicked, in order to make yet another ajax request,
  // this time to the single-movie api in order to get more detailed results on the chosen movie.
  const $addButton = $('<button id=' + result.imdbID + ' type="submit">ADD</button>');
  $addButton.addClass('hit-button');
  $addButton.on('click', getMoreMovieInfoFromOMDB);
  $movieContainer.append($addButton);
  $movieContainer.addClass('col-lg-4 text-center');
  $('#result-container').append($movieContainer);
};

// ===================================================================================
// 'ADD' BUTTON FUNCTIONALITY
// When the 'add' button is clicked,
//    1. Make another request to omdb with the imdb id, in order to get more detailed results for the particular movie
//    2. Send a POST request to the movie create route
const getMoreMovieInfoFromOMDB = async (event) => {
  displayLoadingGif();
  // the imdb id is the 'add' button's id.
  console.log('Retrieving movie by imdb id: ' + event.currentTarget.id + ' ...');
  try {
    // Retrieves detailed information about the chosen title using imdb id within the search string
    let result = await $.ajax('https://www.omdbapi.com/?i=' + event.currentTarget.id + '&y=&plot=short&r=json&apikey=57dc4908')
     if (result.Error) {
       $('#result-container').text(result.Error);
       // if the AJAX request to OMDB returns a movie, add the movie details to the page
     } else {
       // correct the absence of a Poster (again)
       console.log("Movie " + result.Title + " found on omdb! Adding to database ...");
       if (result.Poster == "N/A") { result.Poster = "https://svn.alfresco.com/repos/alfresco-open-mirror/alfresco/COMMUNITYTAGS/V5.0.a/root/projects/repository/config/alfresco/thumbnail/thumbnail_placeholder_256_qt.png"; };
       // =====================================
       sendMovieDataToServer(result);
       // =====================================
     } // end if error
  } catch (err) {
    console.log('Error: ', err);
    $('#result-container').empty();
    $('#input-box').val('');   
    $('#result-container').text('TRY AGAIN -- ' + err.statusText);      
  }
}; // end getMoreMovieInfoFromOMDB


// ADDS THE CHOSEN TITLE TO THE USER'S COLLECTION
const sendMovieDataToServer = async (movie) => {
  try {
    let response = await $.ajax({
      method: 'POST',
      url: '/movies',
      data: movie
    });
    window.location.href = '/movies/' + response.movieId;
  } catch (err) {
    console.log('Error: ', err);
    $('#result-container').empty();
    $('#input-box').val('');   
    $('#result-container').text('TRY AGAIN -- Could not complete request');         
  }
} // end sendMovieDataToServer

// END 'ADD' BUTTON FUNCTIONALITY
// ==================================================================================
