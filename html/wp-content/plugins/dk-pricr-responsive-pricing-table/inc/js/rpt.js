/**
 * Responsive Pricing Table Front JS
 * Last updated: Nov 24, 2017 
 */

;(function($){
  $(document).ready(function (){

  // Centers recommended icon.
  setTimeout(function(){
    $('img.rpt_recommended').each(function(){
      var topPush = ($(this).parent().outerHeight()/2) - ($(this).height()/2);
      $(this).css('top', (topPush - 2)+'px');
    });
  }, 50);
   
});
})(jQuery);