$(function () {
  $("#mySlider1").AnimatedSlider({
    prevButton: "#btn_prev1",
    nextButton: "#btn_next1",
    visibleItems: 3,
    infiniteScroll: true,
    willChangeCallback: function (obj, item) {
      $("#statusText").text("Will change to " + item);
    },
    changedCallback: function (obj, item) {
      $("#statusText").text("Changed to " + item);
    },
  });

  $("#mySlider2").AnimatedSlider({
    prevButton: "#btn_prev2",
    nextButton: "#btn_next2",
    visibleItems: 5,
    infiniteScroll: true,
    willChangeCallback: function (obj, item) {
      $("#statusText").text("Will change to " + item);
    },
    changedCallback: function (obj, item) {
      $("#statusText").text("Changed to " + item);
    },
  });
  
$('.menu__btn').on('click', function(){
  $('.menu__list').toggleClass('menu__list--active')
 });

});

