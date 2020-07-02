/**
 * Responsive Pricing Table Admin JS
 */

;(function($){
$(document).ready(function (){

  /* Debounce function for fallback keyup. */
  // http://davidwalsh.name/javascript-debounce-function
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
  };


  // Spencer Tipping jQuery's clone method fix (for select fields).
  (function (original) {
    jQuery.fn.clone = function () {
      var result           = original.apply(this, arguments),
          my_textareas     = this.find('textarea').add(this.filter('textarea')),
          result_textareas = result.find('textarea').add(result.filter('textarea')),
          my_selects       = this.find('select').add(this.filter('select')),
          result_selects   = result.find('select').add(result.filter('select'));
  
      for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
      for (var i = 0, l = my_selects.length;   i < l; ++i) result_selects[i].selectedIndex = my_selects[i].selectedIndex;
  
      return result;
    };
  }) (jQuery.fn.clone);


  // Define vars
  var pluginFolderSlug = 'dk-pricr-responsive-pricing-table';


  // Inits color pickers.
  $('.dmb_color_picker').each(function(i, obj){$(this).wpColorPicker();});


  // Shows/hides notice/clone/add buttons
  function refreshPlanCountRelatedUI(){
    // Shows notice when pricing table has no plan.
    if($('.dmb_main').not('.dmb_empty_plan').length > 0){
      $( '.dmb_no_row_notice' ).hide();
    } else {
      $( '.dmb_no_row_notice' ).show();
    }
    // Shows/hides Add a pricing plan/Clone buttons when table is full.
    if($('.dmb_main').not('.dmb_empty_plan').length > 4){
      $( '.dmb_add_row, .clone-row' ).hide();
    } else {
      $( '.dmb_add_row, .clone-row' ).show();
    }
  }

  // Checks UI related to plan count
  refreshPlanCountRelatedUI();


  // Color conversions
  var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
  function dmb_rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + dmb_hex(rgb[1]) + dmb_hex(rgb[2]) + dmb_hex(rgb[3]);
  }
  function dmb_hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
  }


  // JS strip_tags
  function dmb_strip_tags(input, allowed) {
    allowed = (((allowed || '') + '')
    .toLowerCase()
    .match(/<[a-z][a-z0-9]*>/g) || [])
    .join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
    .replace(tags, function($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
  }


  // Shows icon/remove button if exists on page load.
  $('.dmb_icon_data_url').each(function(i, obj) {
    var imgUrl = $(this).attr("data-icon");
    if (imgUrl != ''){
      var upload_button = $(this).siblings('.dmb_upload_icon_btn');
      $(this).siblings('.dmb_icon_field').val(imgUrl);
      $("<br/><img src='"+imgUrl+"' class='dmb_icon_img'/><div class='dmb_clearfix imgClearfix'></div>").insertAfter(upload_button);
      $('<a class="dmb_remove_icon_btn dmb_button dmb_button_large dmb_button_compact" href="#"><span class="dashicons dashicons-trash"></span></a>').insertAfter(upload_button);
    }
  });


  // Inits visual features for each plan on page load.
  $('.dmb_main').not('.dmb_empty_plan').each(function(i, obj){
    
    // Gets feature dump hidden textarea's content.
    var featureDump = $(this).find('.dmb_feature_dump').val();

    // Gets visual feature container.
    var features = $(this).find('.dmb_features');

    if(featureDump != ''){

      // Adds key to last feature.
      featureDump = featureDump + '\n';

      // Adds a new visual line per feature.
      $.each(featureDump.split("\n").slice(0,-1), function(index, item) {

        // Filters commas.
        cleanedItem = item.replace(')--(', ',');

        // Creates visual features
        features.append('<div class="dmb_feature"><input class="dmb_field dmb_feature_field" type="text" value="" /><a class="dmb_remove_feature_btn" href="#"><span class="dashicons dashicons-no-alt"></span></a>		<a class="dmb_move_feature_down_btn" class="button" href="#"><span class="dashicons dashicons-arrow-down-alt2"></span></a><a class="dmb_move_feature_up_btn" class="button" href="#"><span class="dashicons dashicons-arrow-up-alt2"></span></a></div>');
        features.find('.dmb_feature_field:last').val(cleanedItem);

      });

    }

  });


  // Removes plan's icon.
  $('body').on('click', '.dmb_remove_icon_btn', function(e) {
    $(this).parent().find('.dmb_icon_img').remove();
    $(this).parent().find('.imgClearfix').remove();
    // Empties icon URL.
    $(this).parent().find('.dmb_icon_field').val('');
    $(this).remove();
    return false;
  });


  // Uploads plan's icon.
  $('body').on('click', '.dmb_upload_icon_btn', function() {

    upload_button = $(this);
    isAlreadyImg = $(this).siblings('.dmb_icon_data_url').attr("data-icon");

    window.send_to_editor = function(html) {
      imgUrl = $(html).attr('src');
      if(isAlreadyImg){
        upload_button.parent().find('.dmb_icon_img').remove();
        upload_button.parent().find('.dmb_remove_icon_btn').remove();
      }
      $("<br/><img src='"+imgUrl+"' class='dmb_icon_img'/><div class='dmb_clearfix imgClearfix'></div>").insertAfter(upload_button);
      // Adds icon image/remove button (imgClearfix so can be removed).
      $('<a class="dmb_remove_icon_btn dmb_button dmb_button_large dmb_button_compact" href="#"><span class="dashicons dashicons-trash"></span></a>').insertAfter(upload_button);
      // Stores icon URL.
      upload_button.siblings('.dmb_icon_field').val(imgUrl);
      tb_remove();
    }

    tb_show( '', 'media-upload.php?type=image&amp;TB_iframe=true' );
    return false;

  });


  function updateFeatureList(el) {

    // Gets feature dump.
    var featureDump = $(el).closest('.dmb_main').find('.dmb_feature_dump');

    // Gets feature list.
    var featureList = $(el).closest('.dmb_main').find('.dmb_feature_field');

    // If no visual feature.
    if(featureList.length == 0){
      // Empties dump.
      featureDump.val('');
    } else {

      var remainingFeatures = [];
      featureList.each(function(i, obj){

        // If feature field is not empty.
        if($(this).val()){ // Removed feature will not pass here.
          // Protects comma.
          var cleanFeature = $(this).val().split(',').join(')--(');
          // Stores feature.
          remainingFeatures.push(cleanFeature);
          // Prepares features for textarea / TOFIX: not at each iteration.
          var newFeatures = remainingFeatures.toString().split(',').join("\n").split(')--(').join(',');
          // Adds features to dump.
          featureDump.val(newFeatures);
        }

      });

    }

    return false;

  }
  

  // Adds a new visual line for a new feature.
  $('body').on('click', '.dmb_add_feature', function() {

    var lastFeature = $(this).siblings('.dmb_features').find('.dmb_feature:last .dmb_feature_field');
    // Adds new line if last feature is not empty.
    if(lastFeature.val() != ''){
      var feature = $( '.empty-feature' ).clone(true);
      feature.removeClass( 'empty-feature' ).show();
      $(this).siblings('.dmb_features').append(feature);
      feature.find('.dmb_feature_field').focus();
      return false;
    // If last feature is empty, focuses on it.
    } else {
      lastFeature.focus();
    }
    return false;

  });


  // Removes a feature/updates feature dump.
  $('body').on('click', '.dmb_remove_feature_btn', function(e) {

    // Removes entire visual feature.
    featureList= $(this).closest('.dmb_features');
    $(this).parent().remove();
    updateFeatureList($(featureList));
    return false;

  });


  $('body').on('click', '.dmb_move_feature_down_btn', function(e){
    var thisFeature = $(this).closest('.dmb_feature');
    if(thisFeature.next().length > 0){
      var newFeature= thisFeature.clone().insertAfter(thisFeature.next());
      thisFeature.remove(); 
      updateFeatureList($(newFeature));
    }
    return false;
  });


  $('body').on('click', '.dmb_move_feature_up_btn', function(e){
    var thisFeature = $(this).closest('.dmb_feature');
    if(thisFeature.prev().length > 0){
      var newFeature= thisFeature.clone().insertBefore(thisFeature.prev());
      thisFeature.remove(); 
      updateFeatureList($(newFeature));
    }
    
    return false;
  });


  // Watches new features and adds them to dump.
  $('body').on('keyup', '.dmb_feature_field', debounce(function(e) {
    updateFeatureList($(this));
  }, 150));


  // Adds a plan to the pricing table.
  $('body').on('click', '.dmb_add_row', function() {
    // Clones the empty plan.
    var row = $( '.dmb_empty_plan' ).clone(true);
    // Cleans class.
    row.removeClass( 'dmb_empty_plan' ).addClass('dmb_main').show();
    // Cleans feature field.
    row.find('.emptyDump').removeClass('emptyDump').addClass('dmb_feature_dump');
    // Shows the empty plan.
    row.insertBefore( $('.dmb_empty_plan') );
    row.find('.dmb_title_of_plan').focus();
    // Inits color picker.
    row.find('.dmb_color_picker_ready').removeClass('.dmb_color_picker_ready').addClass('.dmb_color_picker').wpColorPicker().css({'padding':'3px'});
    // Fills default title in.
    row.find('.dmb_handle_title').html(objectL10n.untitled);
    // Refreshes UI.
    refreshPlanCountRelatedUI();
    return false;
  });


  // Removes a plan.
  $('body').on('click', '.dmb_remove_row_btn',function(e) {
    // Removes the plan.
    $(this).closest('.dmb_main').remove();
    // Refreshes UI.
    refreshPlanCountRelatedUI();
    return false;
  });


  // Expands/collapses plan.
  $('body').on('click', '.dmb_handle', function(e) {
    // Toggles plan.
    $(this).siblings('.dmb_inner').slideToggle(50);
    // Updates state class.
    ($(this).hasClass('closed')) 
      ? $(this).removeClass('closed') 
      : $(this).addClass('closed');
    return false;
  });


  // Collapses all plans.
  $('body').on('click', '.dmb_collapse_rows', function(e) {
    $('.dmb_handle').each(function(i, obj){
      if(!$(this).closest('.dmb_empty_plan').length){ // Makes sure not to collapse empty plan.
        if($(this).hasClass('closed')){
          // Does nothing.
        } else {
          // Toggles plan.
          $(this).siblings('.dmb_inner').slideToggle(50);
          // Updates state class.
          $(this).addClass('closed');
        }
      }
    });
    return false;
  });


  // Expands all plans.
  $('body').on('click', '.dmb_expand_rows', function(e) {
    $('.dmb_handle').each(function(i, obj){
      if($(this).hasClass('closed')){
        // Toggles plan.
        $(this).siblings('.dmb_inner').slideToggle(50);
        // Updates state class.
        $(this).removeClass('closed');
      }
    });
    return false;
  });


  // Shifts a plan down (clones and deletes).
  $('body').on('click', '.dmb_move_row_down', function(e) {
    if($(this).closest('.dmb_main').next().hasClass('dmb_main')){ // If there's a next plan.
      // Clones the plan.
      var movingPlan = $(this).closest('.dmb_main').clone(true);
      // Inserts it after next plan.
      movingPlan.insertAfter($(this).closest('.dmb_main').next());
      // Handles color picker's travel.
      var rgbColorToMove = movingPlan.find('.wp-color-result').css('backgroundColor');
      movingPlan.find('.wp-picker-container').remove();
      movingPlan.find('.dmb_color_box').append('<input class="dmb_color_picker dmb_field" name="plan_colors[]" type="text" value="'+dmb_rgb2hex(rgbColorToMove)+'" />');
      movingPlan.find('.dmb_color_picker').wpColorPicker();
      // Removes original plan.
      $(this).closest('.dmb_main').remove();
    }
    return false;
  });


  // Shifts a plan up (clones and deletes).
  $('body').on('click', '.dmb_move_row_up', function(e) {
    if($(this).closest('.dmb_main').prev().hasClass('dmb_main')){ // If there's a previous plan.
    // Clones the plan.
      var movingPlan = $(this).closest('.dmb_main').clone(true);
      // Inserts it before previous plan.
      movingPlan.insertBefore($(this).closest('.dmb_main').prev());
      // Handles color picker's travel.
      var rgbColorToMove = movingPlan.find('.wp-color-result').css('backgroundColor');
      movingPlan.find('.wp-picker-container').remove();
      movingPlan.find('.dmb_color_box').append('<input class="dmb_color_picker dmb_field" name="plan_colors[]" type="text" value="'+dmb_rgb2hex(rgbColorToMove)+'" />');
      movingPlan.find('.dmb_color_picker').wpColorPicker();
      // Removes original plan.
      $(this).closest('.dmb_main').remove();
    }
    return false;
  });


  // Duplicates a plan.
  $('body').on('click', '.dmb_clone_row', function(e) {
    // Clones the plan.
    var clone = $(this).closest('.dmb_main').clone(true);
    // Inserts it after original plan.
    clone.insertAfter($(this).closest('.dmb_main'));
    // Adds 'copy' to title.
    clone.find('.dmb_handle_title').html(clone.find('.dmb_title_of_plan').val() + ' ('+objectL10n.copy+')');
    clone.find('.dmb_title_of_plan').focus();
    // Handles color picker's travel.
    var rgbColorToMove = $(this).closest('.dmb_main').find('.wp-color-result').css('backgroundColor');
    clone.find('.wp-picker-container').remove();
    clone.find('.dmb_color_box').append('<input class="dmb_color_picker dmb_field" name="plan_colors[]" type="text" value="'+dmb_rgb2hex(rgbColorToMove)+'" />');
    clone.find('.dmb_color_picker').wpColorPicker();
    // Refreshes UI
    refreshPlanCountRelatedUI(); 
    return false;
  });


  // Adds plan title to handle.
  $('.dmb_title_of_plan').each(function(i, obj){
    if($(this).val() != ''){
      // Finds plan handle.
      var handleTitle = $(this).closest('.dmb_main').find('.dmb_handle_title');
      handleTitle.html($(this).val());
    }
  });


  // Watches plan title and updates handle.
  $('body').on('keyup', '.dmb_title_of_plan', debounce(function(e) {
    // Gets current title.
    var titleField = $(this);
    // Gets handle.
    var handleTitle = titleField.closest('.dmb_main').find('.dmb_handle_title');
    // Updates handle title
    (titleField.val() != '')
      ? handleTitle.html(titleField.val())
      : handleTitle.html(objectL10n.untitled);
  }, 50));


  // Shows the font settings.
  $('body').on('click', '.dmb_text_settings_box_show', function(){
    // Shows font settings.
    $('.dmb_text_settings_box').toggle();
  });


  // Previews pricing table.
  $('body').on('click', '.dmb_show_preview_table', function(){
    
    // Gets settings.
    var settings = {};

    settings.planCount = $('.dmb_main').not('.dmb_empty_plan').size();
    settings.tableCurrency = $("input[name='table_currency']").val();

    settings.fontTitleAlignment = $("select[name='font_title_alignment'] option:selected").val();
    settings.fontSizeTitle = $("select[name='font_size_title'] option:selected").val();
    settings.fontSizeSubtitle = $("select[name='font_size_subtitle'] option:selected").val();
    settings.fontSizeDescription = $("select[name='font_size_description'] option:selected").val();
    settings.fontSizePrice = $("select[name='font_size_price'] option:selected").val();
    settings.fontSizeRecurrence = $("select[name='font_size_recurrence'] option:selected").val();
    settings.fontSizeButton = $("select[name='font_size_button'] option:selected").val();
    settings.fontSizeFeatures = $("select[name='font_size_features'] option:selected").val();

    // Processes font sizes.
    if (settings.fontSizeTitle == 'small') { settings.fontSizeTitle = ' rpt_sm_title'; } 
    else if (settings.fontSizeTitle == 'tiny') { settings.fontSizeTitle = ' rpt_xsm_title'; } 
    else { settings.fontSizeTitle = ''; }

    if (settings.fontSizeSubtitle == 'small') { settings.fontSizeSubtitle = ' rpt_sm_subtitle'; } 
    else if (settings.fontSizeSubtitle == 'tiny') { settings.fontSizeSubtitle = ' rpt_xsm_subtitle'; } 
    else { settings.fontSizeSubtitle = ''; }

    if (settings.fontSizeDescription == 'small') { settings.fontSizeDescription = ' rpt_sm_description'; } 
    else { settings.fontSizeDescription = ''; }

    if (settings.fontSizePrice == 'small') { settings.fontSizePrice = ' rpt_sm_price'; } 
    else if (settings.fontSizePrice == 'tiny') { settings.fontSizePrice = ' rpt_xsm_price'; } 
    else if (settings.fontSizePrice == 'supertiny') { settings.fontSizePrice = ' rpt_xxsm_price'; } 
    else { settings.fontSizePrice = ''; }

    if (settings.fontSizeRecurrence == 'small') { settings.fontSizeRecurrence = ' rpt_sm_recurrence'; } 
    else { settings.fontSizeRecurrence = ''; }

    if (settings.fontSizeFeatures == 'small') { settings.fontSizeFeatures = ' rpt_sm_features'; } 
    else { settings.fontSizeFeatures = ''; }

    if (settings.fontSizeButton == 'small') { settings.fontSizeButton = ' rpt_sm_button'; } 
    else { settings.fontSizeButton = ''; }

    // Renders the preview.
    var preview_html = '';

    // Prepares the HTML.
    preview_html += '<div id="rpt_pricr" style="margin-top:100px;" class="rpt_plans rpt_' + settings.planCount + '_plans rpt_style_basic">';
      preview_html += '<div class="' + settings.fontSizeTitle + ' ' + settings.fontSizeSubtitle + ' ' + settings.fontSizeDescription + ' ' + settings.fontSizePrice + ' ' + settings.fontSizeRecurrence + ' ' + settings.fontSizeButton + ' ' + settings.fontSizeFeatures + '">';

      preview_html += '<style>.rpt_plans .rpt_plan .rpt_foot{line-height:34px;} #rpt_pricr{font-family: "Helvetica Neue", Arial, sans-serif; font-weight: 300; line-height: 27px;}</style>'

      $('.dmb_main').not('.dmb_empty_plan').each(function(i, obj){

        // Gets plan fields.
        var fields = {},
        plan = {};
    
        fields.title = $(this).find(".dmb_title_of_plan").val();
        fields.subtitle = $(this).find(".dmb_subtitle_of_plan").val();
        fields.recurrence = $(this).find(".dmb_recurrence_of_plan").val();
        fields.price = $(this).find(".dmb_price_of_plan").val();
        fields.description = $(this).find(".dmb_description_of_plan").val();
        fields.icon = $(this).find(".dmb_icon_of_plan").attr('data-icon');
        fields.recommended = $(this).find(".dmb_switch_recommended").find(":selected").val();
        fields.free = $(this).find(".dmb_switch_free").find(":selected").val();
        fields.features = $(this).find(".dmb_features_of_plan").val();
        fields.buttonText = $(this).find(".dmb_button_text_of_plan").val();
        fields.customButton = $(this).find(".dmb_custom_button_of_plan").val();
        fields.color = dmb_rgb2hex($(this).find(".wp-color-result").css('backgroundColor')) || '#8dba09';

        // Recommended plan processing.
        if(fields.recommended && fields.recommended == 'yes'){
          plan.recoClass = 'rpt_recommended_plan';
          plan.recoImg = '<img class="rpt_recommended" src="../wp-content/plugins/' + pluginFolderSlug + '/inc/img/rpt_recommended.png"/>';
        } else {
          plan.recoImg = '';
          plan.recoClass = '';
        }

        // Starts current plan.
        preview_html += '<div class="rpt_plan rpt_plan_' + i + ' ' + plan.recoClass + '">';

          // Defines title styles.
          plan.titleStyle = 'style="text-align:' + settings.fontTitleAlignment + ';"';

          // Plan title.
          if (fields.title){
            preview_html += '<div ' + plan.titleStyle + ' class="rpt_title rpt_title_' + i + '">';

            if (fields.icon){
              preview_html += '<img height=30px width=30px src="' + fields.icon + '" class="rpt_icon rpt_icon_' + i + '"/> ';
            }

            preview_html += fields.title;
            preview_html += plan.recoImg + '</div>'; // Closes title.
          }

          // Starts plan's head
          preview_html += '<div class="rpt_head rpt_head_' + i + '">';

            /* Recurrence. */
            if (fields.recurrence){
              preview_html += '<div class="rpt_recurrence rpt_recurrence_' + i + '">' + fields.recurrence + '</div>';
            }

            /* Price. */
            if (fields.price){

              preview_html += '<div class="rpt_price rpt_price_' + i + '">';

                if (fields.free == 'yes' || fields.free == 'on'){
                  preview_html += '<sup class="rpt_currency">';
                  preview_html += '</sup>';
                } else {
                  if (settings.tableCurrency){
                    preview_html += '<sup class="rpt_currency">';
                      preview_html += settings.tableCurrency;
                    preview_html += '</sup>';
                  } else {
                    preview_html += '<sup class="rpt_currency">';
                    preview_html += '</sup>';
                  }
                }

                preview_html += fields.price;
              
              preview_html += '</div>';
            }

            if (fields.subtitle){
              preview_html += '<div style="color:' + fields.color + ';" class="rpt_subtitle rpt_subtitle_' + i + '">' + fields.subtitle + '</div>';
            }

            // Description.
            if (fields.description){
              preview_html += '<div class="rpt_description rpt_description_' + i + '">' + fields.description + '</div>';
            }

            preview_html += '<div style="clear:both;"></div>';

          preview_html += '</div>'; // Close plan's head.

          // Processes and renders features.
          if (fields.features){
              
            preview_html += '<div class="rpt_features rpt_features_' + i + '">'; 

              plan.features = [];
              
              plan.featureString = fields.features;
              plan.featureStringArray = plan.featureString.split("\n");
              plan.featureStringArray = plan.featureStringArray.map(function (el) {
                return el.trim();
              });

              $.each(plan.featureStringArray, function( index, value ) {
                plan.features.push(dmb_strip_tags(value,'<strong></strong><br><br/></br><img><a>'));
              });

              $.each(plan.featureStringArray, function( smallKey, feature ) {
                if (feature){

                  var check = feature.substr(0, 2);
                  if (check == '-n') {
                    feature = feature.substr(2);
                    var checkColor = '#bbbbbb';
                  } else {
                    checkColor = 'black';
                  }

                  preview_html += '<div style="color:' + checkColor + ';" class="rpt_feature rpt_feature_' + i + '-' + smallKey + '">';
                  preview_html += feature;
                  preview_html += '</div>';

                }
              });

            preview_html += '</div>'; // Closes features.
            preview_html += '<div style="clear:both;"></div>';
  
          }

          /* If custom button. */
          if (fields.customButton){
            preview_html += '<div class="rpt_custom_btn" style="background-color:' + fields.color + '">';
              preview_html += fields.customButton;
            preview_html += '</div>';
          } else {
            /* --- Default footer (Plan button) --- */
            if (fields.buttonText){
              preview_html += '<a href="#" style="background:' + fields.color + '" class="rpt_foot rpt_foot_' + i + '">';
              preview_html += fields.buttonText;
            } else {
              preview_html += '<a style="background:' + fields.color + '" class="rpt_foot rpt_foot_' + i + '">';
            }
            /* --- Closing footer --- */
            preview_html += '</a>';
          }

        preview_html += '</div>'; // Closes plan.

      });

      preview_html += '</div>'; // Closes inner.
    preview_html += '</div>'; // Closes pricing table.
    preview_html += '<div style="clear:both;"></div>';

    preview_html += '<div class="dmb_accuracy_preview_notice">' + objectL10n.previewAccuracy + '</div>';

    // Attaches the preview to container.
    (settings.planCount == 0)
    ? $('#dmb_preview_table').append('<div class="dmb_no_row_preview_notice">' + objectL10n.noPlan + '</div>')
    : $('#dmb_preview_table').append(preview_html);
    
    $('#dmb_preview_table').fadeIn(100);

    setTimeout(function(){
      $('img.rpt_recommended').each(function(){
        var topPush = ($(this).parent().outerHeight()/2) - ($(this).height()/2);
        $(this).css('top', (topPush - 2)+'px');
      });
    }, 50);
    
  });


  // Closes the preview.
  $('body').on('click', '.dmb_preview_table_close', function(){
    $('#dmb_preview_table #rpt_pricr, .dmb_accuracy_preview_notice, .dmb_no_row_preview_notice').remove();
    $('#dmb_preview_table').fadeOut(100);
  });

});
})(jQuery);