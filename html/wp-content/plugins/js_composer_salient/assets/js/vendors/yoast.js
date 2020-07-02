/* global vc, YoastSEO, _, jQuery */
(function ( $ ) {
	'use strict';
	

	jQuery( window ).on( 'YoastSEO:ready', function () {
		var imageEventString, vcYoast, relevantData, pluginName, eventsList;

		relevantData = {};
		pluginName = 'vcVendorYoast';
		eventsList = [
			'sync',
			'add',
			'update'
		];
		
		
		/* nectar addition */
		// Image alt text support.
		var nectarImages = '';
		
		// Grab the attachment for a supplied img ID.
		function preloadAttachment(ID, i, callback) {
			
			var index = i;
			
		  if (typeof wp.media.attachment(ID).get('url') === 'undefined' ) {
				
		    wp.media.attachment(ID).fetch().then(function () {
		      callback(wp.media.attachment(ID), index);
		    });

		    return;
		  }

		  callback(wp.media.attachment(ID), index);
		}
		
		// If there's content, grab all single img elements and get IDs
		if( typeof YoastSEO.app.rawData !== 'undefined' && typeof YoastSEO.app.rawData.text !== 'undefined' && jQuery('#wpb_visual_composer').length > 0 ) { 

			var imgs = [];
			var rawData = YoastSEO.app.rawData.text;

			var imageResult = rawData.match(/image_with_animation image_url=\"(\d+)\"/g);
			
			// If matches are found.
			if( imageResult !== null ) {
				
				imageResult.forEach(function(attribute, i) {
					
					 var attrID = attribute.match(/"([^']+)"/)[1];
					 
						if( typeof attrID !== 'undefined') {
							imgs[i] = {
								image: attrID,
								paramName: 'image_url',
								param: attrID
							}
						}
						
				});
			}
			
			// Loop through IDs and load attachment data.
			for(var i=0; i<imgs.length;i++) {
				
				preloadAttachment(imgs[i].image, i, function (attachment, i) {
					
					//Store images.
					nectarImages += '<img src=\'' + attachment.get( 'url' ) + '\' alt=\'' + (attachment.get( 'alt' ) || attachment.get( 'caption' ) || attachment.get( 'title' )) + '\'>';

					// Refresh Yoast once all are loaded.
					if( i == imgs.length - 1 ) {
						setTimeout(function() {
							YoastSEO.app.pluginReloaded( pluginName );
						}, 1000);
					}
					
				}); // end preload.

			} // end loop.
			
		}
		
		/* nectar addition end */
		

		var contentModification = function ( data ) {
			
			/*nectar addition*/
			// Portfolio support.
			if( jQuery('#nectar-metabox-portfolio-extra').length > 0 && jQuery('textarea#_nectar_portfolio_extra_content').length > 0 ) { 
				var contentPortfolioTinyMce = window.vc_wpnop(jQuery('textarea#_nectar_portfolio_extra_content').val());
				var contentPortfolio = vc_wpautop(contentPortfolioTinyMce);
				data += contentPortfolio;
			}
			
			// Add page builder starting images.
			data += nectarImages;
			/*nectar addition end*/
			
			data = _.reduce( relevantData, function ( memo, value, key ) {

				if ( value.html ) {
					memo = memo.replace( '"' + value.text + '"', value.html );
				}
				if ( value.image && value.param ) {
					var i, imagesString = '', attachment;
					for ( i = 0; value.image.length > i; i ++ ) {
						attachment = window.wp.media.model.Attachment.get( value.image[ i ] );
						if ( attachment.get( 'url' ) ) {
							imagesString += '<img src=\'' + attachment.get( 'url' ) + '\' alt=\'' + (attachment.get( 'alt' ) || attachment.get( 'caption' ) || attachment.get( 'title' )) + '\'>';
						}
					}
					memo += imagesString;
				}
				return memo;
			}, data );
			return data;
		};

		function getImageEventString( e ) {
			return ' shortcodes:' + e + ':param:type:attach_image' + ' shortcodes:' + e + ':param:type:attach_images' + ' shortcodes:' + e + ':param:type:fws_image';
		}

		// add relevant data for images
		imageEventString = _.reduce( eventsList, function ( memo, e ) {
			return memo + getImageEventString( e );
		}, '' );

		vc.events.on( imageEventString, function ( model, param, settings ) {
			if ( param && param.length > 0 ) {
				var ids = param.split( /\s*,\s*/ );
				_.each( ids, function ( id ) {
					var attachment = window.wp.media.model.Attachment.get( id );
					if ( !attachment.get( 'url' ) ) {
						attachment.once( 'sync', function () {
							YoastSEO.app.pluginReloaded( pluginName );
						} );
						attachment.fetch();
					}
				} );
				relevantData[ model.get( 'id' ) + settings.param_name ] = {
					image: ids,
					paramName: settings.param_name,
					param: param
				};
			}
		} );
		vc.events.on( getImageEventString( 'destroy' ), function ( model, param, settings ) {
			delete relevantData[ model.get( 'id' ) + settings.param_name ];
		} );
		
		// Add relevant data to headings
		vc.events.on( 'shortcodes:vc_custom_heading', function ( model, event ) {
			var params, tagSearch;
			params = model.get( 'params' );
			params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );

			if ( 'destroy' === event ) {
				delete relevantData[ model.get( 'id' ) ];
			} else if ( params.text && params.font_container ) {
				tagSearch = params.font_container.match( /tag:([^\|]+)/ );
				if ( tagSearch[ 1 ] ) {
					relevantData[ model.get( 'id' ) ] = {
						html: '<' + tagSearch[ 1 ] + '>' + params.text + '</' + tagSearch[ 1 ] + '>',
						text: params.text
					};
				}
			}
		} );

		var VcVendorYoast = function () {
			// init
			YoastSEO.app.registerPlugin( pluginName, { status: 'ready' } );
			YoastSEO.app.pluginReady( pluginName );
			YoastSEO.app.registerModification( 'content', contentModification, pluginName, 5 );
		};

		vcYoast = new VcVendorYoast();
	} );
})( window.jQuery );
