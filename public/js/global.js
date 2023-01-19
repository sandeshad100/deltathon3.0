// responsive navbar START
$(document).ready(function(){

    // $('.menu').hide();
    $('.ham-wrap').click(function(){
  
        // $('.menu').toggle();
        $('.navLinks').toggleClass('show');
        $(".btn-close").fadeIn(1000);
    });
  
    $('.css-btn-close').click(function(){
  
        $('.navLinks').removeClass('show');
       
    });
   });
  // responsive navbar END
  
  //scroll to top function START
  var btnTop = $('.toTop');
  $(window).scroll(function() {
      if ($(window).scrollTop() > 400) {
        btnTop.addClass('showToTop');
      } else {
        btnTop.removeClass('showToTop');
      }
    });
     function toTop(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  //scroll to top function END
  
  // nav brand logo redirect START
  $('.logoBox img').click(function(){
    window.location.replace("index.html");
  });
  // nav brand logo redirect END