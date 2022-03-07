(function($) {
    "use strict";

    $.fn.playlistBlock = function() {

        var block = $(this);

        if( block.length != 0 ){

        	var embedSize = block.find( '.ratio' ).height();

        	var videoList = block.find( '.post-grid' );

        	videoList.css( 'height', embedSize ).removeClass( 'd-none' );

        	var embedReloader = '<div class="embed-reloader bg-black">';
        		embedReloader += '<div class="position-absolute top-50 start-50 translate-middle">';
        			embedReloader += $.getSpinner();
        		embedReloader += '</div>';	
        	embedReloader += '</div>';

        	block.find( '.post-permalink' ).on( 'click', function(e){
        		e.preventDefault();

        		if( block.find( '.embed-reloader' ).length == 0 ){
        			block.find( '.embed-wrap .ratio' ).append( embedReloader );
        		}
        		else{
        			block.find( '.embed-reloader' ).show();
        		}

        		var postItem = $(this).closest( '.post-item' );
        		var postGrid = $(this).closest( '.post-grid' );

        		postGrid.find( '.post-item' ).removeClass( 'active' );
        		postItem.addClass( 'active' );

        		var embedUrl = postItem.find( 'article' ).attr( 'data-embed-url' ) + '&autoplay=1&logo=0';

        		block.find( 'iframe' ).attr( 'src', embedUrl ).next().fadeOut( 'slow' );
        	} );
        }
    }

	/**
	 *
	 * Get the spinner
	 * 
	 * @return HTML
	 *
	 * @since 1.0.0
	 * 
	 */
	$.getSpinner = function( $wrap = true ){
		var output = '';

		if( $wrap === true ){
			output += '<div class="spinner-wrap d-flex justify-content-center p-3">';	
		}
		
			output += '<div class="spinner spinner-border text-secondary" role="status">';
				output += '<span class="visually-hidden">Loading...</span>';
			output += '</div>';

		if( $wrap === true ){
			output += '</div>';	
		}
		
		return output;
	}

	/**
	 * Show toast
	 * @param string message
	 * @param string type
	 * @since 1.0.0
	 */
	$.showToast = function( message, type = true ){

		var output = '';
		var icon = '';

		switch( type ) {
			case 'success':
				icon = 'icon-ok-circled2';
			break;

			case 'danger':
			case 'warning':
				icon = 'icon-cancel-circled';
			break;

			default:
				icon = 'icon-help-circled';
			break;
		}

		if ( typeof message === 'object') {
			message = message.join( '<br/>' );
		}

		output += '<div class="toast-wrap position-fixed bottom-0 start-50 translate-middle-x p-3">';
			output += '<div id="notify-toast" class="toast fade hide border-0 p-1 align-items-center text-white bg-'+ type +'" role="alert" aria-live="assertive" aria-atomic="true">';
				output += '<div class="d-flex">';
					output += '<div class="toast-body">';
						output += '<div class="d-flex align-items-center">';
							output += '<span class="h3 me-2 '+icon+'"></span>';
							output += '<p class="m-0">'+ message +'</p>';
						output += '</div>';
					output += '</div><!--.toast-body-->';

					output += '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>';
				output += '</div><!--.d-flex-->';
			output += '</div><!--.toast-->';
		output += '</div><!--.toast-wrap-->';

		if( $('#notify-toast').length != 0 ){
			$('#notify-toast').remove();
		}

		$( 'body' ).append( output );

		$('#notify-toast').toast('show');
	}

	/**
	 * Get ajaxUrl
	 * 
	 * @return string
	 *
	 * @since 1.0.0
	 * 
	 */
	$.getAjaxRequestUrl = function(){
		return streamtube.ajaxUrl;
	}

	/**
	 * Get rest URL
	 * @return string
	 *
	 * @since 1.0.6
	 * 
	 */
	$.getRestUrl = function( $endpoint = '' ){
		return streamtube.rest_url + $endpoint;
	}

	/**
	 *
	 * The main ajaxFormRequest handler
	 * @since 1.0.0
	 * 
	 */
	$.ajaxFormRequest = function( event ) {
		event.preventDefault();

		var form 		= $(this);
		var method 		= form.attr( 'method' );

		if( ! method ){
			method = 'POST';
		}

		var formData 	= new FormData(form[0]);
		var button 		= $(document.activeElement);

		var action 		= formData.get( 'action' );

		var requestUrl 	= formData.get( 'request_url' );

		if( ! requestUrl ){
			// Should use in admin-ajax
			
			var formNonce = formData.get('_wpnonce');

			if( ! formNonce ){
				formData.append( '_wpnonce', streamtube._wpnonce );
			}
			
			requestUrl 	= $.getAjaxRequestUrl();
		}

		var nonce 		= formData.get( 'nonce' );

		if( ! nonce ){
			nonce = streamtube.nonce;
		}

		formData.append( 'submit', button.val() );

		var jqxhr = $.ajax({
			url 			: requestUrl,
			data 			: formData,
			processData 	: false,
			contentType 	: false,
			type 			: method,
          	xhr 			: function() {
                var jqXHR = new XMLHttpRequest();

                jqXHR.upload.addEventListener( 'progress', function( event ) {
                	if( event.lengthComputable ){
                		var percentComplete = Math.round( (event.loaded / event.total) * 100 );
                		form.find( '.progress-bar' )
                		.css( 'width', percentComplete + '%' )
                		.attr( 'aria-valuenow', percentComplete )
                		.html( percentComplete  + '%' )
                	}

                }, false );

                return jqXHR;
            },			
			beforeSend: function( jqXHR ) {

				jqXHR.setRequestHeader( 'X-WP-Nonce', nonce );

				$( document.body ).trigger( action + '_before_send', [ form, formData ] );

				form.find( 'button[type=submit]' )
				.addClass( 'disabled' )
				.attr( 'disabled', 'disabled' )
				.append( $.getSpinner(false) );
			}
		})

		.fail( function( jqXHR, textStatus, errorThrown ){

			$( document.body ).trigger( action + '_failed', [ errorThrown, jqXHR, form, formData ] );

			if( jqXHR.responseJSON !== undefined && jqXHR.responseJSON.message !== undefined ){
				$.showToast( jqXHR.responseJSON.message , 'danger' );
			}
			else{
				$.showToast( errorThrown, 'danger' );
			}

		})

		.done( function( data, textStatus, jqXHR ){
			$( document.body ).trigger( action, [ data, textStatus, jqXHR, formData, form ] );
		})

		.always( function( jqXHR, textStatus ){
			$( document.body ).trigger( 'form_submit_complete', [ jqXHR, textStatus ] );
			$( document.body ).trigger( action + '_complete', [ jqXHR, textStatus ] );
			form.find( 'button[type=submit]' )
			.removeClass( 'disabled' )
			.removeAttr( 'disabled' )
			.find( '.spinner-border' ).remove();
		});
	}

	/**
	 *
	 * Call AJAX on Element's event
	 *
	 * @since  1.0.0
	 * 
	 */
	$.ajaxElementOnEventRequest = function( event = null ){

		if( event !== null ){
			event.preventDefault();	
		}

        var element =   $(this);

        if( element.hasClass( 'waiting' ) ){
        	return false;
        }

        var	data	=   element.attr( 'data-params' );
        var action	=	element.attr( 'data-action' );
        var method	=	element.attr( 'data-method' );

        var formData = new FormData();

        formData.append( '_wpnonce', streamtube._wpnonce );
        formData.append( 'action', action );
        formData.append( 'data', data );

        if( method === undefined ){
        	method = 'POST';
        }

        var jqxhr = $.ajax({
			url: $.getAjaxRequestUrl(),
			data: formData,
			processData: false,
			contentType: false,
			type: method,
			beforeSend: function( jqXHR ) {
	        	element.addClass( 'active waiting' );

				element
				.addClass( 'disabled' )
				.attr( 'disabled', 'disabled' )
				.append( $.getSpinner(false) );	        	

	        	$( document.body ).trigger( action + '_before_send', [ element, formData ] );
			}
        })
        .done( function( responseData, textStatus, jqXHR ){

        	element
        	.removeClass( 'active waiting disabled' )
        	.removeAttr( 'disabled' );

        	/**
        	 *
        	 * Action trigger
        	 *
        	 * @since 1.0.0
        	 * 
        	 */
            $( document.body ).trigger( action, [ responseData, textStatus, jqXHR, element ] );
        })
        .fail( function( jqXHR, textStatus, errorThrown) {
            $.showToast( errorThrown, 'danger' );
        })
        .always( function( jqXHR, textStatus ){
        	element.find( '.spinner-border' ).remove();
        } );
	}

	/**
	 *
	 * Upload Big File Size
	 *
	 * @since 1.0.0
	 * 
	 */
	$.uploadBigFile = function( file, sliceSize = 10240, form = null ){
		var size = parseInt( file.size );

		sliceSize = parseInt( sliceSize );

		if( ! sliceSize ){
			sliceSize = 10240;
		}

		if( sliceSize >= size ){
			sliceSize = size/2;
		}

		//sliceSize = Math.min( sliceSize, size );

		var start = 0;

		// First chunk size.
		var end = sliceSize;

		// First chunk index
		var chunkIndex = 0;

		$.uploadChunk( file, start, end, chunkIndex, sliceSize, form );
	}	

	/**
	 *
	 * Upload Chunk
	 *
	 * @since 1.0.0
	 * 
	 */
	$.uploadChunk = function( file, start, end, chunkIndex, sliceSize, form ){

	    var formData 	= new FormData();

	    var jqXHR 		= new XMLHttpRequest();

	    var fileSize	= file.size;

	    var chunkTotal	= Math.ceil( fileSize/sliceSize );

	    //formData.append( 'action' , 'tux_big_file_uploads');
	    
	    formData.append( 'action' , 'upload_video_chunk');

	    formData.append( 'size' , file.size );
	    formData.append( 'type' , file.type );

	    formData.append( 'name' , file.name );

	    formData.append( 'chunks' , chunkTotal );
	    formData.append( 'chunk' , chunkIndex );

	    formData.append( 'async-upload' , file.slice( start, end ) );

	    // Regular upload without rest.
	    formData.append( '_wpnonce' , streamtube.media_form );

	    if (fileSize - end < 0) {
	        end = fileSize;
	    }		

	    if (end < fileSize) {
	        jqXHR.onreadystatechange = function() {
	            if ( jqXHR.readyState == XMLHttpRequest.DONE ) {
					var status = jqXHR.status;
					if (status === 0 || (status >= 200 && status < 400)) {
		                chunkIndex++;
		                $.uploadChunk( file, start + sliceSize, start + (sliceSize * 2), chunkIndex, sliceSize, form );
					}else{

						// Request Entity Too Large or something else.
						$( document.body ).trigger( 'upload_video_failed', [ jqXHR.statusText, jqXHR, form ] );
					}
	            }
	        }
	    }

		jqXHR.upload.onprogress = function( event ) { 

		    var percentComplete = parseInt( ( chunkIndex * 100)/( chunkTotal - 1 ) );

    		form.find( '.progress-bar' )
    		.css( 'width', percentComplete + '%' )
    		.attr( 'aria-valuenow', percentComplete )
    		.html( percentComplete  + '%' );
		}

		jqXHR.onload = function() {
			if( jqXHR.readyState === 4 && jqXHR.responseText ){

				var status = jqXHR.status;

				if (status === 0 || (status >= 200 && status < 400)) {
					var responseData = $.parseJSON( jqXHR.responseText );

					if( responseData.success != undefined && responseData.success == false ){
						$( document.body ).trigger( 'upload_video_failed', [ responseData.data.message, jqXHR, form ] );
					}

					if( responseData.data.id ){
						$.post( $.getAjaxRequestUrl(), {
							action : 'upload_video_chunks',
							attachment_id : responseData.data.id,
							post_status: form.find( 'select[name=post_status]' ).val(),
							'_wpnonce' : streamtube._wpnonce
						} )
						.done( function( data, textStatus, jqXHR ){
							$( document.body ).trigger( 'add_video', [ data, textStatus, jqXHR, null, form ] );
						} );
					}
				}
			}
		}


	    jqXHR.open( 'POST', $.getAjaxRequestUrl(), true );

	    jqXHR.setRequestHeader( 'X-WP-Nonce', streamtube.nonce );

	    jqXHR.send( formData );
	}

	$.getCartTotal = function(){
		$.get( $.getAjaxRequestUrl() + '?action=get_cart_total', function( data ){
			if( data.success ){

				var output = '<span class="cart-total bg-danger text-white small p-1 px-2 ms-2 rounded">'+ data.data.item_count + ' (' +  data.data.total + ')</span>';

				var elm = $( '.header-user__dropdown .nav-cart a' );

				elm.find( '.cart-total' ).remove();
				elm.append( output );

				$( document.body ).trigger( 'get_cart_total_loaded', [ data ] );
			}
		} );
	}

})(jQuery);