console.log('hi');

// Gets today's date and corrects for timezone
// Use in the date picker input for default value (today)
Date.prototype.toDateInputValue = (function() {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});

// ONLOAD
$(function() {

  // Set the default value of the date picker to today's date
  $('#date-input').val(new Date().toDateInputValue());

  $('#add-review-button').on('click', function() {
    console.log('add review button');
  });
  
  $('.remove-date-form').submit(( event ) => {
    console.log('form ...');
    confirm('Are you sure you want to remove this date?');
    event.preventDefault();
  });
  
});
