(function($) { 
  
  "use strict";
  
  var nectarAdminStore = {
    mouseX: 0,
    mouseUp: false,
    bindEvents: function() {
      $(window).on('mousemove',function(e) {
        nectarAdminStore.mouseX = e.clientX;
      });
      $(window).on('mouseup',function() {
        nectarAdminStore.mouseUp = true;
        $('.wpb_edit_form_elements .wpb_el_type_nectar_numerical')
          .removeClass('scrubbing')
          .removeClass('no-scrubbing');
      });
    },
    init: function() {
      this.bindEvents();
    }
  };
  
  function ConstrainedInput(el) {
    
    this.$el = el;
    
    this.elements = [];
    this.$elements = '';
    this.className = false;
    this.active = false;
    
    this.createStyle();
    this.getInitialSet();
    this.trackActive();
    this.constrainEvents();
    
  }
  
  ConstrainedInput.prototype.createStyle = function() {
    this.$el.parents('.vc_checkbox-label').wrapInner('<div class="constrained-cb"></div>');
  }
  
  ConstrainedInput.prototype.getInitialSet = function() {
    
    var that = this;
    var classes = this.$el[0].className.split(/\s+/);
    
    // Store classname
    $.each(classes, function(i, name) {
      if (name.indexOf('constrain_group_') === 0 ) {
        that.className = name;
      }
    });
    
    // Store element set.
    $('.wpb_edit_form_elements .vc_wrapper-param-type-nectar_numerical[class*="constrain_group"]').each(function() {
      if( $(this).hasClass(that.className) ) {
        that.elements.push($(this).find('input.wpb_vc_param_value'));
      }
    });
    
    // Cache dom elements.
    that.$elements = $('.wpb_edit_form_elements').find('.' +that.className + ' input.wpb_vc_param_value');
      
  }
  
  ConstrainedInput.prototype.trackActive = function() {
    
    var that = this;
    
    this.active = this.$el.prop('checked');
      
    this.$el.on('change', function() {
      
      // Store state.
      that.active = $(this).prop('checked');
      
      // Alter icon.
      if( that.active == true ) {
        $(this).parents('.vc_checkbox-label').addClass('active');
      } else {
        $(this).parents('.vc_checkbox-label').removeClass('active');
      }
      
      // Trigger changes.
      if( that.elements.length > 0 ) {
        
        $.each(that.elements,function(i, element) {
          if( that.active == true ) {
            element.addClass('constrained');
          } else {
            element.removeClass('constrained');
          }
          element.trigger('keyup');
          element.trigger('change');
        });

      }
      
    });
    
    // Trigger on load.
    this.$el.trigger('change');
    
  }
  
  ConstrainedInput.prototype.constrainEvents = function() {
    
    if( this.className == false ) { 
      return; 
    }
    
    var that = this;
    
    // Bind event.
    $.each(this.elements, function(i, element) {
      
      element.on('change, keyup', function() {
        
        // Keep values in sync when constrain in active.
        if( that.active ) {
          var val = $(this).val();
          that.$elements.val(val).trigger('change');
        }
  
      });
      
    });
  
  };
  
  
  function NectarNumericalInput(el) {
    
    this.$el = el;
    this.$scrubber = '';
    this.$scrubberIndicator = '';
    this.scrubberIndicatorX = 0;
    this.$editFormLine = el.parents('.edit_form_line');
    this.$placeHolder = el.parents('.edit_form_line').find('.placeholder');
    this.mouseDown = false;
    this.initialX = 0;
    this.calculatedVal = 0;
    this.scrubberCurrent = 0;
    this.currentVal = 0;
    this.unit = '';
    
    if( el.is('[class*=padding]') ) {
      this.zeroFloor = true;
    } else {
      this.zeroFloor = false;
    }
    
    this.createMarkup();
    this.trackActive();
    this.scrubbing();

  }
  
  NectarNumericalInput.prototype.createMarkup = function() {
    
    this.$el.parent().append('<span class="scrubber" />');
    
    this.$scrubber = this.$el.parents('.edit_form_line').find('.scrubber');
    this.$scrubber.append('<span class="inner"/>');
    this.$scrubber.find('.inner').append('<span />');
    this.$scrubber.append('<i class="dashicons dashicons-arrow-left-alt2" />');
    this.$scrubber.append('<i class="dashicons dashicons-arrow-right-alt2" />');
    
    this.$scrubberIndicator = this.$scrubber.find('.inner span');
  };
  
  
  NectarNumericalInput.prototype.trackActive = function() {
    
    var that = this;
    
    // focus
    this.$el.on('focus', function() {
      that.$placeHolder.addClass('focus');
    });
    
    // change
    this.$el.on('change',function() {
      if( that.$el.val().length > 0 ) {
        that.$placeHolder.addClass('focus');
      } else {
        that.$placeHolder.removeClass('focus');
      }
    });
    
    // blur
    this.$el.on('blur',function() {
      if( that.$el.val().length == 0 ) {
        that.$placeHolder.removeClass('focus');
      }

      that.$el.trigger('change');
    });
    

  };
  
  NectarNumericalInput.prototype.getUnit = function() {
    
    if( this.currentVal.indexOf('%') != -1 ) {
      this.unit = '%';
    } else if( this.currentVal.indexOf('px') != -1 ) {
      this.unit = 'px';
    } else if( this.currentVal.indexOf('vw') != -1 ) {
      this.unit = 'vw';
    } else if( this.currentVal.indexOf('vh') != -1 ) {
      this.unit = 'vh';
    } else {
      this.unit = '';
    }
    
  };
  
  NectarNumericalInput.prototype.scrubbing = function() {
    
    var that = this;

    this.$scrubber.on('mousedown',function() {
      
      $('.wpb_el_type_nectar_numerical').addClass('no-scrubbing');
      that.$el.parents('.wpb_el_type_nectar_numerical').removeClass('no-scrubbing').addClass('scrubbing');
      
      // Track that the mouse is down / store initial
      that.mouseDown = true;
      nectarAdminStore.mouseUp = false;
      
      // Starting pos
      that.initialX = nectarAdminStore.mouseX;

      // Empty
      if( that.$el.val().length == 0 ) {
        
        this.scrubberCurrent = 0;
        that.currentVal = 0;
        that.unit = '';
        
      } else {
        
        that.currentVal = that.$el.val();

        if( that.$scrubberIndicator.css('transform') != 'none' ) {
          var transformMatrix = that.$scrubberIndicator.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
          that.scrubberCurrent = transformMatrix[12] || transformMatrix[4];
        }
        
        if( isNaN( parseInt(that.currentVal) ) ) {
          that.currentVal = '0';
        }
        
        // Using units?
        that.getUnit();
        
      }
      
      // Change value RAF loop
      requestAnimationFrame(that.scrubbingAlter.bind(that));
      
    });
    

  };
  
  
  NectarNumericalInput.prototype.scrubbingAlter = function(e) {
    
    if( nectarAdminStore.mouseUp != true ) {
      requestAnimationFrame(this.scrubbingAlter.bind(this))
    }
    
    // Value 
    
    //// Every 3 pixels moved, ++ or --
    this.calculatedVal = parseInt(this.currentVal) + parseInt(nectarAdminStore.mouseX - this.initialX)/3;
    
    //// Who wants decimals??
    this.calculatedVal = Math.floor(this.calculatedVal);
    
    //// Stop number from going below 0
    if( this.zeroFloor && this.calculatedVal < 0) {
      this.$el.val(0);
    } else {
      
      this.$el.val(this.calculatedVal + this.unit);
      
      // Indicator
      this.scrubberIndicatorX = linearInterpolate(this.scrubberIndicatorX, parseInt(this.scrubberCurrent) + parseInt(nectarAdminStore.mouseX - this.initialX)/4, 0.14);

      this.$scrubberIndicator.css({
        'transform': 'translate3d('+ this.scrubberIndicatorX +'px, 0px, 0px)'
      });
      
    }
    
    this.$el.trigger('keyup');
    this.$el.trigger('focus');
  
    
  }
  
  
  
  
  
  function salientElementSettingsLoading() {
    
    var $modalContainer = $('div[data-vc-ui-element="panel-edit-element"] .vc_ui-panel-window-inner > .vc_ui-panel-content-container .vc_edit_form_elements');
    $('<div class="salient-element-settings-loading"></di>').insertAfter($modalContainer);
    
    var $loadingContainer = $modalContainer.parent().find('.salient-element-settings-loading');

    $loadingContainer.append('<div class="salient-element-loading"><i class="vc-composer-icon vc-c-icon-cog"></i></div>');

  }
  
  
  function createDeviceGroup($selector) {
    
    // Hide tabbed on load.
    $('body').find('.' + $selector + ':not(.desktop)').hide();
    
    var $title = $('body').find('.' + $selector).find('.group-title').clone();

    // Group Markup.
    $('body').find('.' + $selector).wrapAll('<div class="'+$selector+'-wrap nectar-device-group-wrap vc_column" />');

    // Header Markup.
    $('body').find('.' + $selector).find('.group-title').hide();
    $('.'+$selector+'-wrap').before('<div class="'+$selector+'-header nectar-device-group-header" />');
    
    
    
    var $header = $('.'+$selector+'-header');
    $header.append($title);
    $header.append('<span class="device-selection"><i class="dashicons-before dashicons-desktop active" data-filter="desktop"></i> <i class="dashicons-before dashicons-tablet" data-filter="tablet"></i> <i class="dashicons-before dashicons-smartphone" data-filter="phone"></i></span>');

  }
  
  
  function deviceHighlightInUse($input) {
    
    var $groupHeader = $input.parents('.nectar-device-group-wrap').prev('.nectar-device-group-header');
    var type         = ($input.is('input[type="text"]')) ? 'text' : 'select';
    var inUse        = false;
    
    // Determine which icon is related
    var iconSelector = 'desktop';
    if( $input.parents('div[class*="vc_wrapper-param-type"].tablet').length > 0 ) {
       iconSelector = 'tablet';
    } else if( $input.parents('div[class*="vc_wrapper-param-type"].phone').length > 0 ) {
      iconSelector = 'phone';
    } 
    
    $groupHeader.find('i[data-filter="'+iconSelector+'"]').removeClass('in-use');
    
    // Check each input in the group for value set.
    
    //// Text inputs.
    if( type == 'text' ) {
      $input.parents('.nectar-device-group-wrap').find('.'+iconSelector+' input[type="text"]').each(function(){
        if( $(this).parents('.vc_wrapper-param-type-textfield').length > 0 && $(this).val().length ) {
          inUse = true;
        } else if( $(this).parents('.vc_wrapper-param-type-nectar_numerical').length > 0 && $(this).val().length ) {
          inUse = true;
        }
      });
    }
    //// Selects.
    else {
      $input.parents('.nectar-device-group-wrap').find('.'+iconSelector+' select').each(function() {
        
        if( iconSelector != 'desktop' && $(this).parents('.vc_wrapper-param-type-dropdown').length > 0 && $(this).val().length ) {
          
          if( $(this).val() != 'inherit' && $(this).val() != 'default' ) {
            inUse = true;
          }
          
        } 
        else if( iconSelector == 'desktop' && $(this).parents('.vc_wrapper-param-type-dropdown').length > 0 && $(this).val().length ) {
          
          if( $(this).val() != 'no-extra-padding' && $(this).val() != 'default' ) {
            inUse = true;
          }
          
        }
        
      });
    }
    
    // If using value in group, highlight icon.
    if (inUse == true ) {
      $groupHeader.find('i[data-filter="'+iconSelector+'"]').addClass('in-use');
    }
    
  }
  

  
  function deviceGroupEvents() {
    
    $('.nectar-device-group-header i').on('click', function() {
      
      var filter = $(this).attr('data-filter');
      var group  = $(this).parents('.nectar-device-group-header').next('.nectar-device-group-wrap');
      
      // Already active.
      if( $(this).hasClass('active') ) {
        return;
      }
      
      // Active class.
      $(this).parents('.nectar-device-group-header').find('i').removeClass('active');
      $(this).addClass('active');
      
      // Display Grouping.
      group.find('> div').hide();
      group.find('> div.'+filter).fadeIn();
      
    });
    
    $('.nectar-device-group-header .device-selection i').each(function(){
      var $group = $(this).parents('.nectar-device-group-header').next('.nectar-device-group-wrap');
      
      // On change.
      $group.find('input[type="text"], select').on('change',function(){
        deviceHighlightInUse($(this));
      });
      
      // Inital Load.
      $group.find('input[type="text"], select').each(function(){
        deviceHighlightInUse($(this));
      })
      
    });
    
  }
  


  function colorOverlayImageUpdate() {
    
    var $tab      = $('div[data-vc-shortcode-param-name="color_overlay"]').parents('.vc_edit-form-tab'); 
    var $BGimage  = $tab.parents('.wpb_edit_form_elements').find('div[data-vc-shortcode-param-name="bg_image"].wpb_el_type_fws_image');
    
    if( $BGimage.length == 0 ) {
      // Look for column BG img instead
      $BGimage = $tab.parents('.wpb_edit_form_elements').find('div[data-vc-shortcode-param-name="background_image"].wpb_el_type_fws_image');
    }
    var $colorPreview = $('.nectar-color-overlay-preview');
      
    if( $BGimage.find('img[src]').length > 0 ) {
      
      var src = $BGimage.find('img[src]').attr('src');
      // full size preview.
      if( src.indexOf('-150x150') != -1 ) {
        src = src.replace('-150x150.','.');
      }
      $colorPreview.find('span.wrap').css('background-image','url('+ src +')').addClass('using-img');
    } else {
      $colorPreview.find('span.wrap').css('background-image','').removeClass('using-img');
    }
    
  }
  
  
  
  function colorOverlayPreview(el) {
    
    // Markup.
    var $tab = $('div[data-vc-shortcode-param-name="color_overlay"]').parents('.vc_edit-form-tab'); 
    
    var $colorPreview = $('<div class="nectar-color-overlay-preview"></div>');
    var inputName     = ('row' === el) ? 'bg_image' : 'background_image';
     
    $colorPreview.append('<span class="wrap" />');
    $colorPreview.find('.wrap').append('<span />');
    
    $colorPreview.insertAfter($('.col-md-6-last[data-vc-shortcode-param-name="color_overlay_2"]'));
    
    // Events.
    $('input[name="color_overlay"]').on('change', colorOverlayPreviewUpdate);
    $('input[name="color_overlay_2"]').on('change', colorOverlayPreviewUpdate);
    $('select[name="gradient_direction"]').on('change', colorOverlayPreviewUpdate);
    $('select[name="overlay_strength"]').on('change', colorOverlayPreviewUpdate);
    $('input[name="enable_gradient"]').on('change', colorOverlayPreviewUpdate);
    
    $('input[name="'+inputName+'"].'+inputName+'.fws_image').on('change', colorOverlayImageUpdate);
    
    setTimeout(function() {
      $('div[data-vc-shortcode-param-name="color_overlay"] input.wp-picker-clear').on('mousedown', colorOverlayPreviewUpdate);
      $('div[data-vc-shortcode-param-name="color_overlay_2"] input.wp-picker-clear').on('mousedown', colorOverlayPreviewUpdate);
      $('div[data-vc-shortcode-param-name="color_overlay"] input[type="range"][name="alpha"]').on('change', colorOverlayPreviewUpdate);
      $('div[data-vc-shortcode-param-name="color_overlay_2"] input[type="range"][name="alpha"]').on('change', colorOverlayPreviewUpdate);
    },2000);
    
    colorOverlayPreviewUpdate();
    colorOverlayImageUpdate();
    
  }
  
  function colorOverlayPreviewUpdate() {
    
    setTimeout(function(){
      var $color1  = $('input[name="color_overlay"]');
      var $color2  = $('input[name="color_overlay_2"]');
      var $useGrad = $('input#enable_gradient-true');
      var $gradDir = $('select[name="gradient_direction"]');
      var $opacity = $('select[name="overlay_strength"]');
      
      if( $useGrad.length > 0 && $useGrad.prop('checked') && 
      $color1.length > 0 && 
      $color2.length > 0 && 
      $gradDir.length > 0 ) {
        
        var gradientDirectionDeg = '90deg';
        var $gradDirVal = $gradDir.val();
        
        switch( $gradDirVal ) {
          case 'left_to_right' : 
            gradientDirectionDeg = '90deg';
            break;
          case 'left_t_to_right_b' : 
            gradientDirectionDeg = '135deg';
            break;
          case 'left_b_to_right_t' : 
            gradientDirectionDeg = '45deg';
            break;
          case 'top_to_bottom' : 
            gradientDirectionDeg = 'to bottom';
            break;
        } 
        
        var $color1Val = ( $color1.val().length > 0 ) ? $color1.val() : 'rgba(255,255,255,0.001)';
        var $color2Val = ( $color2.val().length > 0 ) ? $color2.val() : 'rgba(255,255,255,0.001)';
        
        
        $('.nectar-color-overlay-preview .wrap span').css('background', 'linear-gradient('+gradientDirectionDeg+', '+ $color1Val +', '+ $color2Val +')');
        
      } else {
        $('.nectar-color-overlay-preview .wrap span').css({
          'background': '',
          'background-color': $color1.val()
        });
      }
      
      $('.nectar-color-overlay-preview .wrap span').css('opacity', $opacity.val());
      
    }, 150); // settimeout
     
  }
  
  function nectarFancyCheckboxes() {
    
    $('.vc_edit_form_elements .vc_shortcode-param:not(.constrain-icon) input[type="checkbox"].wpb_vc_param_value.checkbox').each(function(){
      
      if( $(this).prop('checked') ) {
        var $checkboxMarkup = $('<label class="cb-enable selected"><span>On</span></label><label class="cb-disable"><span>Off</span></label>');
      } else {
        var $checkboxMarkup = $('<label class="cb-enable"><span>On</span></label><label class="cb-disable selected"><span>Off</span></label>');
      }
      
      // Remove desc.
      var $parent = $(this).parent();
      var $checkbox = $(this).detach();
      
      $parent.empty();
      $parent.append($checkbox);
      
      $checkbox = $parent.find('input[type="checkbox"].wpb_vc_param_value.checkbox');
      
      // Create HTML.
      $checkbox.wrap('<div class="switch-options salient" />');
      $parent.find('.switch-options').prepend($checkboxMarkup);
      
      var $switchOptions = $checkbox.parents('.switch-options');
      
      if( $switchOptions.parent().is('.vc_checkbox-label') ) {
        $switchOptions.unwrap();
      }
      
      $switchOptions.wrap('<div class="nectar-cb-enabled" />');

      
    });
    

    // Start activated.
    $('.vc_edit_form_elements .switch-options.salient').each(function(){
      if( $(this).find('.cb-enable.selected').length > 0 ) {
        $(this).addClass( 'activated');
      }
    });
    
        
  }
  
  function nectarFancyCheckboxEvents() {

    // Click events.
    $('body').on('click', '.vc_edit_form_elements .switch-options.salient .cb-enable' ,function() {

      var parent = $( this ).parents( '.switch-options' );
      
      $( '.cb-disable', parent ).removeClass( 'selected' );
      $( this ).addClass( 'selected' );
      
      $(this).parent().addClass( 'activated');

      $( 'input[type="checkbox"]', parent ).prop("checked", true).trigger('change');

    });
    
    $('body').on('click', '.vc_edit_form_elements .switch-options.salient .cb-disable' ,function() {

      var parent = $( this ).parents( '.switch-options' );
      
      $( '.cb-enable', parent ).removeClass( 'selected' );
      $( this ).addClass( 'selected' );
      $(this).parent().removeClass( 'activated');

      $( 'input[type="checkbox"]', parent ).prop("checked", false).trigger('change');

    });
    
  }
  
  
  function videoAttachFields() {
    
    $(".wpb_edit_form_elements .nectar-add-media-btn").on('click', function(e) {
      
      e.preventDefault();
      
      var $that = $(this);  
      var custom_file_frame = null;
      
      custom_file_frame = wp.media.frames.customHeader = wp.media({
        title: $(this).data("choose"),
        library: {
          type: 'video'
        },
        button: {
          text: $(this).data("update")
        }
      });
      
      custom_file_frame.on( "select", function() {
        
        var file_attachment = custom_file_frame.state().get("selection").first();
        
        $('.wpb_edit_form_elements #' + $that.attr('rel-id') ).val(file_attachment.attributes.url).trigger('change');
        
        $that.parent().find('.nectar-add-media-btn').css('display','none');
        $that.parent().find('.nectar-remove-media-btn').css('display','inline-block');
        
      });
      
      custom_file_frame.open();
      
    });
    
    
    $(".wpb_edit_form_elements .nectar-remove-media-btn").on('click', function(e) {
      
      e.preventDefault();
      
      $('.wpb_edit_form_elements #' + $(this).attr('rel-id')).val('');
      $(this).prev().css('display','inline-block');
      $(this).css('display','none');
      
    });
    
  }
  
  
  
  function studioSortByDate(a, b) {
    
    a = parseFloat($(a).attr("data-date"));
    b = parseFloat($(b).attr("data-date"));
    
    return a > b ? 1 : -1;
    
  };
  
  function studioSortByAlphabetical(a, b) {
    
    a = $(a).find('.vc_ui-list-bar-item-trigger').text();
    b = $(b).find('.vc_ui-list-bar-item-trigger').text();

    return a < b ? 1 : -1;
    
  };
  
  function salientStudioSorting() {
    
    var $container = $(".vc_templates-list-default_templates");
    
    // Create Markup.
    var $selectEl = $('<select id="salient-studio-sorting"></select>');
    $selectEl.append('<option value="alphabetical">'+nectar_translations.alphabetical+'</option>');
    $selectEl.append('<option value="date">'+nectar_translations.date+'</option>');
    
    $('div[data-vc-ui-element="panel-templates"] .library_categories').prepend('<div class="library-sorting" />');
    $('div[data-vc-ui-element="panel-templates"] .library-sorting').prepend($selectEl);
    $('div[data-vc-ui-element="panel-templates"] .library-sorting').prepend('<label for="salient-studio-sorting">'+nectar_translations.sortby+'</label>');
    

    // Events.
    $('body').on('change','select#salient-studio-sorting', function() {
      
      var $items = $(".vc_templates-list-default_templates > div");
      
      // Convert Date to Standard JS Format.
      if( !$(".vc_templates-list-default_templates > div:first-child").is('data-date')) {
        $items.each(function() {
          
          var dateClass = this.className.match(/(date\-[^\s]*)/);
          if(dateClass && typeof dateClass[0] != 'undefined' ){
              var date = dateClass[0].replace('date-','');
              
              var formattedDate = date.split("-");
              var standardDate = formattedDate[1]+" "+formattedDate[0]+" "+formattedDate[2];
              standardDate = new Date(standardDate).getTime();
              $(this).attr("data-date", standardDate); 
          } else {
            $(this).attr("data-date", '1000'); 
          }
    
        });
      }
      
      // Sort
      var val = $(this).val();
      
      if(val === 'date') {
        
        $items.sort(studioSortByDate).each(function(){
            $container.prepend(this);
        });
        
      } else if( val === 'alphabetical' ) {
        
        $items.sort(studioSortByAlphabetical).each(function(){
            $container.prepend(this);
        });
        
      }
    
    });
    
    
  }
  
  
  function linearInterpolate(a, b, n) {
    return (1 - n) * a + n * b;
  }
  
  
  jQuery(document).ready(function($) {
    
    nectarAdminStore.init();
    
    var constrainedInputs     = [],
        nectarNumericalInputs = [];

    // On modal open.
    $("#vc_ui-panel-edit-element").on('vcPanel.shown',function() {
      
      var $shortcode = ( $('#vc_ui-panel-edit-element[data-vc-shortcode]').length > 0 ) ? $('#vc_ui-panel-edit-element').attr('data-vc-shortcode') : '';


      // Row.
      if( 'vc_row' === $shortcode ) {
        
        // Device Groups
        if($('._nectar_full_screen_rows label[for="nectar_meta_on"].ui-state-active').length == 0) {
          createDeviceGroup('row-padding-device-group');
        } else {
          $('.row-padding-device-group.col-md-6').hide();
        }
        
        createDeviceGroup('row-transform-device-group');
        createDeviceGroup('column-direction-device-group');
        
        colorOverlayPreview('row');
        
      } // endif row el.
      
      
      
      // Inner Row.
      if( 'vc_row_inner' === $shortcode ) {
        
          createDeviceGroup('row-padding-device-group');
          createDeviceGroup('row-transform-device-group');
          createDeviceGroup('row-min-width-device-group');
          createDeviceGroup('column-direction-device-group');
      } 
      
      
      // Column.
      if( 'vc_column' === $shortcode || 'vc_column_inner' === $shortcode ) {
        createDeviceGroup('column-padding-device-group');
        createDeviceGroup('column-margin-device-group');
        
        if( 'vc_column' === $shortcode ) {
          createDeviceGroup('column-max-width-device-group');
        }
        
        colorOverlayPreview('column');
      }
      
      
      if( 'image_with_animation' === $shortcode ) {
        createDeviceGroup('image-margin-device-group');
      }
      
      if( 'divider' === $shortcode ) {
        createDeviceGroup('divider-height-device-group');
      }
      
      if( 'fancy_box' === $shortcode ) {
        createDeviceGroup('fancybox-min-height-device-group');
      }
      
    
      // Device Group Events.
      if( 'vc_column' === $shortcode || 
      'vc_column_inner' === $shortcode || 
      'vc_row_inner' === $shortcode || 
      'vc_row' === $shortcode ||
      'image_with_animation' === $shortcode ||
      'divider' === $shortcode ||
      'fancy_box' === $shortcode ) {
        deviceGroupEvents();
      }

      
      // Fancy checkboxes.
      nectarFancyCheckboxes();
      
      // Video field.
      videoAttachFields();
      
      // When full screen rows is active, do not create numerical inputs for disabled params
      if($('._nectar_full_screen_rows label[for="nectar_meta_on"].ui-state-active').length > 0 && 'vc_row' === $shortcode ) {
        
        $('.wpb_edit_form_elements .row-padding-device-group').addClass('fullscreen-rows-disabled');
        
      }
      
      // Constrained values.
      $('.wpb_edit_form_elements input[type="checkbox"][class*="constrain_group_"]').each(function(i) {
        constrainedInputs[i] = new ConstrainedInput($(this));
      });
      
      // Number Scrubber.
      $('input[type="text"].nectar-numerical').each(function(){
        nectarNumericalInputs = new NectarNumericalInput($(this));
      });
      
      
    }); // Modal open end.
    
    // Modal loading markup.
    salientElementSettingsLoading();
    
    // Salient Studio Template Sorting
    salientStudioSorting();
    
    // Fancy checkbox events.
    nectarFancyCheckboxEvents();
    
    // Dynamic el styling - front end page builder
    $(window).load(function() {
      
      if( typeof window.vc_mode !== 'undefined' && 'admin_frontend_editor' === window.vc_mode ) {

        $(window).on('nectar_wpbakery_el_save', function() {
      
          var page_content = window.vc.builder.getContent();

          if( page_content.length > 0 ) {

            $.ajax({
              type: 'POST',
              url: window.ajaxurl, 
              data: {
                'action': 'nectar_frontend_builder_generate_styles',
                '_vcnonce': window.vcAdminNonce,
                'nectar_page_content': page_content
              }, 
              success: function(response) {
                
                var style = document.createElement('style');
        				
        				style.type = 'text/css';
        				if (style.styleSheet) {
        					style.styleSheet.cssText = response;
        				} else {
        					style.appendChild(document.createTextNode(response));
        				}
                
                window.vc.frame_window.vc_iframe.addStyles(style);

                
              } // success

            }); //ajax
        
          }
            
        });
        
        $('body').on('mouseup','.vc_templates-template-type-default_templates button.vc_ui-list-bar-item-trigger',function(){
          
          // When adding studio template, also regenerate the dynamic css
          setTimeout(function() {
            $(window).trigger('nectar_wpbakery_el_save');
          },900);
          setTimeout(function() {
            $(window).trigger('nectar_wpbakery_el_save');
          },1600);
          
        });
        
        
      } // on front end editor

    }); // end dynamic el styling
    


  });
  
})(jQuery);  