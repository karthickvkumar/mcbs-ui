(function($) {
    "use strict";

    $(function() {
    	/**
    	 * Load cropperJS
    	 */
		$( '.cropper-img' ).each( function(e){
			var me = $(this);
			me[0].addEventListener('crop', function (e) {
				me.closest( 'form' ).find( 'input[name=image_data]' ).val( JSON.stringify(e.detail) );
			});
		} );

        /**
         *
         * Attach appear event to all .jsappear elements
         *
         * @since 1.0.0
         * 
         */
        $('.jsappear').scrolling();

        /**
         * Load autosize
         * @since 1.0.0
         */
        autosize($('.autosize'));

       /**
         *
         * Theme switcher button handler
         * @since 1.0.0
         */
        $( '#theme-switcher' ).on( 'click', function( event ){

        	var path = window.location.pathname;
        	var text = '';

            var theme = $( 'html' ).attr( 'data-theme' );

            if( theme == 'dark' ){
                theme = 'light';
                $( '.custom-logo-link img' ).attr( 'src', streamtube.light_logo );
                text = streamtube.dark_mode_text;
            }
            else{
                theme = 'dark';   
                $( '.custom-logo-link img' ).attr( 'src', streamtube.dark_logo );
                text = streamtube.light_mode_text;
            }

            document.cookie = 'theme_mode=' + theme + ';path=/';

            $( 'html' ).attr( 'data-theme', theme );

            $(this).find( 'span.menu-text' ).html( text );

            $( document.body ).trigger( 'theme_mode_changed', [ theme ] );

        } );

        $( '.login #loginform' ).find( '.input' ).addClass( 'form-control' );

        /**
         *
         * Load slick slider
         * @since 1.0.0
         * 
         */
        $(".js-slick").not('.slick-initialized').slick();
        
        /**
         * JS playlist widget
         * @since 1.0.0
         */
         $( '.widget-videos-playlist' ).playlistBlock();

        /**
         * Playlist Auto Up Next
         */
		window.addEventListener( 'message' , (event) => {
			if( event.data == 'PLAYLIST_UPNEXT' ){

				var playListWdiget = $( '.widget-videos-playlist' );

				if( playListWdiget.hasClass( 'up-next' ) ){

					setTimeout(function () {

						var activePost = playListWdiget.find( '.post-item.active' );

						var nextPost = activePost.next();

						if( nextPost ){
							activePost.removeClass( 'active' );

							nextPost.addClass( 'active' );

							nextPost[0].scrollIntoView({
								behavior : 'smooth',
								block : 'nearest',
								inline : 'start'
							});

							var embedUrl = nextPost.find( 'article' ).attr( 'data-embed-url' ) + '&autoplay=1';

							playListWdiget.find( 'iframe' ).attr( 'src', embedUrl );							
						}

					}, 3000 );

				}
			}
		}, false );

		if( streamtube.has_woocommerce ){
			$.getCartTotal();
		}
	});

	$( window ).resize(function() {
		$( '.widget-videos-playlist' ).playlistBlock();
	});

	$( window ).on( 'elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/streamtube_posts_elementor.default', function($scope, $){
			$scope.find('.js-slick').not('.slick-initialized').slick();
		} );
	} );

	$( window ).on( 'elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/streamtube-playlist.default', function($scope, $){
			$scope.find('.widget-videos-playlist').playlistBlock();
		} );
	} );	

	$( document.body )
	.on( 'upload_video_before_send', uploadVideoBeforeSend )
	.on( 'upload_video', uploadVideo )
	.on( 'upload_video_failed', uploadVideoFailed )
	.on( 'add_video', addVideo )
	.on( 'import_embed', importEmbed )
	.on( 'add_post', addPost )
	.on( 'update_post', updatePost )
	.on( 'trash_post', trashPost )
	.on( 'approve_post', approvePost )
	.on( 'reject_post', rejectPost )
	.on( 'restore_post', restorePost )
	.on( 'file_encode_done', fileEncodeDone )
	.on( 'post_comment', postComment )
	.on( 'edit_comment', editComment )
	.on( 'moderate_comment', moderateComment )
	.on( 'trash_comment', trashComment )
	.on( 'spam_comment', spamComment )
	.on( 'load_more_comments', loadMoreComments )
	.on( 'load_comments', loadComments )
	.on( 'load_comments_before_send', loadCommentsBeforeSend )
	.on( 'update_profile', updateProfile )
	.on( 'update_user_photo', updateUserPhoto )
	.on( 'widget_load_more_posts', widgetLoadMoreposts )
	.on( 'load_more_users', loadMoreUsers )
	.on( 'post_like', postLike )
	.on( 'added_to_cart', addedToCart )
	.on( 'updated_cart_totals', updatedCartTotals )
	.on( 'removed_from_cart', removedFromCart )
	.on( 'join_us', joinUs )
	.on( 'transfers_points', transfersPoints )
	.on( 'bp_messages_new_thread', newMessageThread );

	/**
	 *
	 * uploadVideoBeforeSend hander
	 *
	 * Reset the progress bar and show it.
	 * 
	 * @param  string event
	 * @param  object form
	 * @param  object formData
	 *
	 * @since  1.0.0
	 * 
	 */
	function uploadVideoBeforeSend( event, form, formData, file = null ){
		form.find( '.row-info' ).remove();

		if( file === null ){
			file = formData.get( 'video_file' );	
		}

		form.find( '.drag-drop-upload' ).addClass( 'active' )
		.find( '.progress-bar' )
		.css( 'width', '0%' )
		.attr( 'aria-valuenow', '0' )
		.html( '0%' )
		.closest( '.progress-wrap' )
		.find( '.file-name' ).html( file.name );
	}

	/**
	 *
	 * uploadVideo handler
	 * 
	 * @param  string event
	 * @param  object responseData
	 * @param  string textStatus
	 * @param  object jqXHR
	 * @param  object formData
	 * @param  object form
	 *
	 * @since  1.0.0
	 * 
	 */
	function uploadVideo( event, responseData, textStatus, jqXHR, formData, form  ){

		var data = responseData.data;

		if( responseData.success == false ){
			form
			.find( '.drag-drop-upload' )
			.removeClass( 'active' )
			.find( 'input[name=video_file]' )
			.val('');	

			$.showToast( data.message, 'danger' );
		}
		else{

			form.find( '.tab-upload-file' ).remove();

			form.closest( '.modal-content' ).find( '.modal-footer' ).removeClass( 'd-none' );

			var post = data.post;

			form.find( '.tab-pane' ).removeClass( 'active' );

			form.find( '.tab-details' ).addClass( 'active' );

			form.find( 'input#post_title' ).val( post.post_title );

			if( post.post_thumbnail ){
				form
				.find( '.post-thumbnail' )
				.html( '<img src="'+ post.post_thumbnail +'">' );
			}

			form.find( 'input[name=post_date]' ).val( post.post_date_format );

			form.find( 'input[name=action]' ).val( 'update_post' );
			form.find( 'input[name=post_ID]' ).val( post.ID );

			if( post.post_status == 'publish' ){

				form.find( 'select#post_status option[value=publish]' ).remove();
					
				var option = '<option value="publish">'+ streamtube.publish +'</option>';
				
				form.find( 'select#post_status' ).prepend( option ).val( 'publish' );
			}
		}
	}

	function uploadVideoFailed( event, message, jqXHR, form ){

		$.showToast( message , 'danger' );

		form.find( '.drag-drop-upload' )
		.removeClass( 'active' )
		.find( 'input[name=video_file]' )
		.val('');		
	}

	function addVideo( event, responseData, textStatus, jqXHR, formData, form ){
		return uploadVideo( event, responseData, textStatus, jqXHR, formData, form );
	}

	function importEmbed( event, responseData, textStatus, jqXHR, formData, form ){

		return uploadVideo( event, responseData, textStatus, jqXHR, formData, form );
	}

	/**
	 * addPost handler
	 * @since 1.0.0
	 */
	function addPost( event, responseData, textStatus, jqXHR, formData, form ){
		$.showToast( responseData.data.message, responseData.success == true ? 'success' : 'danger' );

		if( responseData.success == true ){
			window.location.href = responseData.data.redirect_url;	
		}
		
	}	

	/**
	 * updatePost handler
	 * @since 1.0.0
	 */
	function updatePost( event, responseData, textStatus, jqXHR, formData, form ){

		$.showToast( responseData.data.message, responseData.success == true ? 'success' : 'danger' );

		var data = responseData.data;

		var post = data.post;

		if( responseData.success == true ){
			if( data.quick_update === undefined ){
				var title_field = form.find( '.field-post_title' );

				$( 'h1.page-title' ).html( post.post_title );
				form.find( '#post_name' ).val( post.post_name );

				if( post.post_status == 'future' ){
					if( title_field.prev( '.alert-scheduled' ).length == 0 ){
						title_field.before( '<p class="alert alert-scheduled alert-info p-2 px-3">'+ data.message2 +'</div>' );	
					}
				}else{
					title_field.prev( '.alert-scheduled' ).remove();
				}

				form.find( 'input[name=featured-image]' ).val('');
			}
			else{

				var output = '';

				output += '<div class="bg-light d-flex p-3 mb-4">';
					output += '<div class="post-thumbnail ratio ratio-16x9 rounded overflow-hidden bg-dark w-200px">';
						if( post.post_thumbnail ){
							output += '<a href="'+ post.post_link +'"><img src="'+ post.post_thumbnail +'"></a>';
						}
					output += '</div>';

					output += '<div class="post-meta ms-2">';

						output += '<h3><a href="'+ post.post_link +'" class="post-title text-decoration-none text-body fw-bold">';
							output += post.post_title;
						output += '</a></h3>';

					output += '</div>';

				output += '</div>';

				output += '<div class="bg-light d-flex p-3">';
					output += '<a class="post-title text-decoration-none fw-bold" href="'+ post.post_link +'">'+ post.post_link +'</a>'
				output += '</div>';

				output += '</div>';


				form.html( output )
				.closest( '.modal-content' )
				.find( '.modal-footer' ).remove();

				var modalTitle = streamtube.pending_review;

				if( post.post_status == 'publish' ){
					modalTitle = streamtube.video_published;
				}

				form.closest( '.modal-content' )
				.find( '.modal-title' ).html( modalTitle );
			}
		}
	}

	/**
	 * trashPost handler
	 * @since 1.0.0
	 **/
	function trashPost( event, responseData, textStatus, jqXHR, formData, form ){

		if( responseData.success == false ){
			$.showToast( responseData.data.message, 'danger' );
		}
		else{

			var rowId = $( '.table-videos' ).find( 'tr#row-' + responseData.data.post.ID );

			if( rowId.length != 0 ){
				rowId.remove();
			}
			else{
				window.location.href = responseData.data.redirect_url;
			}

			$( '#deletePostModal' ).modal( 'hide' );

			$.showToast( responseData.data.message, 'success' );
		}
	}

	/**
	 *
	 * approvePost handler
	 * @since 1.0.0
	 * 
	 */
	function approvePost( event, responseData, textStatus, jqXHR, formData, form ){
		if( responseData.success == false ){
			$.showToast( responseData.data.message, 'danger' );
		}
		else{
			$( '.table-videos' ).find( 'tr#row-' + responseData.data.post_id ).remove();

			$( '#updatePostMessageModal' ).modal( 'hide' );
			
			$.showToast( responseData.data.message, 'success' );
		}
	}

	/**
	 *
	 * rejectPost handler
	 * @since 1.0.0
	 * 
	 */
	function rejectPost( event, responseData, textStatus, jqXHR, formData, form ){
		if( responseData.success == false ){
			$.showToast( responseData.data.message, 'danger' );
		}
		else{
			$( '.table-videos' ).find( 'tr#row-' + responseData.data.post_id ).remove();

			$( '#updatePostMessageModal' ).modal( 'hide' );
			
			$.showToast( responseData.data.message, 'success' );
		}
	}

	/**
	 *
	 * restorePost handler
	 * @since 1.0.0
	 * 
	 */
	function restorePost( event, responseData, textStatus, jqXHR, formData, form ){
		if( responseData.success == false ){
			$.showToast( responseData.data.message, 'danger' );
		}
		else{
			$( '.table-videos' ).find( 'tr#row-' + responseData.data.post.ID ).remove();
			$.showToast( responseData.data.message, 'success' );
		}
	}

	/**
	 *
	 * fileEncodeDone handler
	 * @since  1.0.0
	 */
	function fileEncodeDone( event, attachment, textStatus, jqXHR ){

		if( attachment.parent_name ){

			var message = '<strong>'+ attachment.parent_name +'</strong>' + ' ' + streamtube.file_encode_done;

			if( attachment.parent_url ){
				message += '<a class="text-white ms-1" href="'+attachment.parent_url+'"><strong>'+streamtube.view_video +'</strong></a>';
			}
			
			$.showToast( message , 'success' );

			if( $( 'body' ).hasClass( 'single-video' ) ){
				setTimeout(function(){ 
					window.location.href = attachment.parent_url;
				}, 3000 );
			}
		}
	}

	/**
	 * postComment handler
	 * @since 1.0.0
	 */
	function postComment( event, responseData, textStatus, jqXHR, formData, form ){

		if( responseData.success == false ){
			$.showToast( responseData.data.message, 'danger' );
		}
		else{
			var commentList	= $( '#comments-list' );
			var comment 	= responseData.data.comment;
			var output		= responseData.data.comment_output;

			commentList.find( '.no-comments' ).remove();

			if( parseInt( comment.comment_parent ) == 0 ){
				commentList.prepend( output );
			}
			else{

				var parent = $( 'li#comment-' + comment.comment_parent );

				if( parent.find( 'ul.children' ).length == 0 ){
					parent.append( '<ul class="children d-block">'+ output +'</ul>' );
				}
				else{
					parent.find( 'ul.children' ).addClass( 'd-block' ).append( output );
				}
			}

			// Update comments number
			$( '.comment-title .widget-title' ).html( responseData.data.comments_number );

			// Clear comment textarea
			$( '#commentform #comment' ).val('');

			$.showToast( responseData.data.message, 'success' );
		}
	}

	function editComment( event, responseData, textStatus, jqXHR, formData, form ){
		if( responseData.success == false ){
			return $.showToast( responseData.data[0].message, 'danger' );
		}

		var comment = responseData.data.comment;

		$( '#row-comment-' + comment.comment_ID )
		.find( '.comment-content' )
		.html( comment.comment_content_filtered );

		$( '#modal-edit-comment' ).modal( 'hide' );

		return $.showToast( responseData.data.message, 'success' );
	}

	function moderateComment( event, responseData, textStatus, jqXHR, element ){

		if( responseData.success == false ){
			return $.showToast( responseData.data[0].message, 'danger' );
		}

		var approve = responseData.data.comment_approved;

		if( approve == '1' ){
			element
			.removeClass( 'text-success' )
			.addClass( 'text-warning' )
			.html( responseData.data.status )
		}
		else{
			element
			.removeClass( 'text-warning' )
			.addClass( 'text-success' )
			.html( responseData.data.status )
		}

		element.closest( 'tr' ).toggleClass( 'table-warning' );
	}

	function trashComment( event, responseData, textStatus, jqXHR, element ){

		if( responseData.success == false ){
			return $.showToast( responseData.data[0].message, 'danger' );
		}

		element.closest( 'tr#row-comment-' + responseData.data.comment_id ).remove();

		return $.showToast( responseData.data.message, 'success' );
	}

	function spamComment( event, responseData, textStatus, jqXHR, element ){

		if( responseData.success == false ){
			return $.showToast( responseData.data[0].message, 'danger' );
		}

		element.closest( 'tr#row-comment-' + responseData.data.comment_id ).remove();

		return $.showToast( responseData.data.message, 'success' );
	}	

    /**
     *
     * load_comments event
     * 
     * @param  string event   [description]
     * @param  object data    [description]
     * @param  DOM object element [description]
     * @param  int postId  [description]
     * @param  int page    [description]
     *
     * @since  1.0.0
     * 
     */
    function loadMoreComments( event, responseData, textStatus, jqXHR, element ){
    	element.removeClass( 'active' );
        if( responseData.data.output ){
            element.closest( 'li' ).before( responseData.data.output );

            element.attr( 'data-params', responseData.data.data );    
        }
        else{
            element.closest( 'li' ).remove();
        }
    }

    function loadCommentsBeforeSend( event, element, formData ){

    	var commentsList = $( 'ul#comments-list' );

    	if( commentsList.find( 'li.load-more-comments-wrap' ).length != 0 ){
    		commentsList.find( 'li:not(:last-child)' ).remove();
    		commentsList.find( 'li' ).addClass( 'd-none' ).before( '<li class="spinner">'+ $.getSpinner() +'</li>' );
    	}
    	else{
    		commentsList.html( '<li class="spinner">'+ $.getSpinner() +'</li>' );
    	}
    }

    /**
     *
     * Reload comments
     *
     * @since  1.0.0
     * 
     */
    function loadComments( event, responseData, textStatus, jqXHR, element ){

    	var commentsList = $( 'ul#comments-list' );

    	setTimeout(function (){

	    	if( responseData.success == true ){
	    		commentsList
	    		.find( '.spinner' )
	    		.replaceWith( responseData.data.output );

	    		commentsList
	    		.find( 'li.load-more-comments-wrap' )
	    		.removeClass( 'd-none' )
	    		.find( 'button' )
	    		.attr( 'data-params', element.attr( 'data-params' ) );
	    		
	    	}else{
	    		$.showToast( responseData.data.message, 'danger' );
	    	}

	        element
	        .addClass( 'active' )
	        .closest( '.dropdown-menu' )
	        .find( '.dropdown-item' )
	        .removeClass( 'active waiting' );

	        element
	        .closest( '.dropdown-menu' )
	        .prev()
	        .html( element.html() );

        }, 300 );
    }

	/**
	 * updateProfile handler
	 * @since 1.0.0
	 */
	function updateProfile( event, responseData, textStatus, jqXHR, formData, form ){
		$.showToast( responseData.data.message, responseData.success == true ? 'success' : 'danger' );
	}

	/**
	 * 
	 * Update user photo
	 * @param  string event
	 * @param  object data 
	 * @param  string textStatus
	 * @param  object jqXHR
	 * @param  object formData
	 * @since 1.0.0
	 */
	function updateUserPhoto( event, responseData, textStatus, jqXHR, formData, form ){

		if( responseData.success == true ){
			if( responseData.data.field == 'avatar' ){
				$( '.header-user__dropdown .user-avatar img' ).replaceWith( responseData.data.output );

				$( '.profile-header__avatar .user-avatar img' ).replaceWith( responseData.data.output );
			}
			else{
				$( '.profile-header__photo' ).html( responseData.data.output );
			}
		}

		$.showToast( responseData.data.message, responseData.success == true ? 'success' : 'danger' );
	}

	/**
	 *
	 * AJAX load more posts of the Posts widget
	 *
	 * @since  1.0.0
	 * 
	 */
	function widgetLoadMoreposts( event, responseData, textStatus, jqXHR, element  ){
		element.next().remove();

		if( responseData.success == true ){

			var output = responseData.data.output;
			var count_post = $( output ).find( '.post-item' ).length;
			var dataJson = $.parseJSON( responseData.data.data );

			if( output != "" ){
				element
				.attr( 'data-params', responseData.data.data )
				.removeClass( 'd-none active waiting' )
				.parent()
				.before( output );

				element.parent()
				.prev().fadeIn('slow');

				if( parseInt( count_post ) < parseInt( dataJson.posts_per_page ) ){
					element.parent().remove();
				}else{
					element.find( '.spinner' ).remove();
				}
			}
			else{
				element.parent().remove();
			}
		}
	}

	function loadMoreUsers( event, responseData, textStatus, jqXHR, element ){

		if( responseData.success == false ){
			$.showToast( responseData.data.message, 'danger' );
		}
		else{
			if( responseData.data.output != "" ){
				element
				.attr( 'data-params', responseData.data.data )
				.removeClass( 'active waiting d-none' )
				.parent()
				.before( responseData.data.output )
				.find( '.spinner-border' )
				.remove();
			}
			else{
				element.parent().remove();
			}
		}
	}

	/**
	 *
	 * uploadVideo handler
	 * 
	 * @param  string event
	 * @param  object responseData
	 * @param  string textStatus
	 * @param  object jqXHR
	 * @param  object formData
	 * @param  object form
	 *
	 * @since  1.0.0
	 * 
	 */
	function postLike( event, responseData, textStatus, jqXHR, formData, form  ){

		var data = responseData.data;
		var button = form.find( 'button[type=submit]' );

		if( data.code == 'liked' ){
			button.addClass( 'button-liked' );
		}

		if( data.code == 'unliked' ){
			button.removeClass( 'button-liked' );	
		}

		button
		.removeClass( 'disabled' )
		.removeAttr( 'disabled' )
		.find( '.badge' ).html( data.count );

		$.showToast( data.message, responseData.success == true ? 'success' : 'danger' );
	}

	/**
	 *
	 * Woocommerce added to cart event
	 * 
	 */
	function addedToCart( event, fragment, hash, button ){

		var productTitle = '';
		var product = button.closest('.product');

		if( product.find( '.woocommerce-loop-product__title' ).length !== 0 ){
			productTitle = product.find( '.woocommerce-loop-product__title' ).text();
		}

		if( product.find( '.post-title' ).length !== 0 ){
			productTitle = product.find( '.post-title a' ).text();
		}

		var text = streamtube.added_to_cart.replace( '%s', '<strong>' + productTitle + '</strong>' );

		text += ', <a class="text-white" href="'+streamtube.cart_url+'">'+ streamtube.view_cart +'</a>';

		$.getCartTotal();

		$.showToast( text, 'success' );
	}

	/**
	 *
	 * Updated cart event
	 * 
	 */
	function updatedCartTotals( event, data ){
		$.getCartTotal();
	}

	/**
	 *
	 * Removed from cart event
	 * 
	 */
	function removedFromCart( event ){
		$.getCartTotal();
	}

	function joinUs( event, responseData, textStatus, jqXHR, formData, form ){

		if( responseData.success == false ){
			return $.showToast( responseData.data[0].message, 'danger' );
		}

		$('#modal-join-us').modal('hide');

		return $.showToast( responseData.data.message, 'success' );
	}

	function transfersPoints( event, responseData, textStatus, jqXHR, formData, form ){
		if( responseData.success == false ){
			return $.showToast( responseData.data[0].message, 'danger' );
		}

		$('#modal-donate').modal('hide');

		return $.showToast( responseData.data.message, 'success' );
	}

	/**
	 *
	 * New Message Thread handler
	 *
	 * Better Messages
	 * 
	 */
	function newMessageThread( event, responseData, textStatus, jqXHR, formData, form ){

		if( ! responseData.result ){
			return $.showToast( responseData.errors[0], 'danger' );
		}

		$('#modal-private-message').modal('hide');

		return $.showToast( streamtube.bp_message_sent, 'success' );
	}

	/**
	 * Upload Video controller
	 */
	function uploadVideoController( files, form ){

		var chunkUpload		= streamtube.chunkUpload;
		
		var extensions 		= streamtube.video_extensions;
		var max_upload_size = parseInt( streamtube.max_upload_size );

		var input 			= form.find( 'input[name=video_file]' );

		var file 			= files[0];

		if( ! file ){
			return;
		}

		//var form  			= input.closest( 'form' );

		var parts 			= file.name.split('.');
		var ext 			= parts[parts.length - 1].toLowerCase();

		var error 			= false;

		// Check file extension
		if( $.inArray( ext, extensions ) == -1 ){
			error = streamtube.invalid_file_format;
		}

		// Check file size
		if( chunkUpload == 'off' && file.size > max_upload_size ){
			error = streamtube.exceeds_file_size.replace( '{size}', Math.round( file.size /1048576 ) );
		}

		if( error !== false ){
			return $.showToast( error, 'danger' );
		}
	
		if( chunkUpload == 'on' ){

			var sliceSize = parseInt( streamtube.sliceSize );

			if( sliceSize == 0 ){
				sliceSize = 10240;
			}

			$( document.body ).trigger( 'upload_video_before_send', [ form, new FormData(form[0]), file ] );

			return $.uploadBigFile( file, sliceSize * 1024, form );
		}
		else{
			
			return form.trigger( 'submit' );
		}		
	}

	/**
	 * AJAX regular form handler
	 */
	$( document ).on( 'submit', '.form-ajax', $.ajaxFormRequest );

	$( document ).on( 'click', '.ajax-elm', $.ajaxElementOnEventRequest );	

	/**
	 * Cropper
	 *
	 * @since 1.0.0
	 * 
	 */
    $( document ).on( 'change', '.cropper-input', function(e){
    	var input 				=	$(this);
    	var form 				=	input.closest( 'form' );
    	var opts 				=	JSON.parse(form.find( '.cropper-img' ).attr( 'data-option' ));
    	var cropper 			=	form.find( '.cropper-img' ).cropper(opts);
        
        var URL 				=	window.URL || window.webkitURL;
        var imageName 			=	'';
        var imageType 			=	'';
        var imageURL 			=	'';
        var files 				=	this.files;
        var file;

        if (URL) {

            if ( ! cropper.data('cropper') ) {
            	console.log('no data');
                return;
            }

            if (files && files.length) {
                file = files[0];

                if (/^image\/\w+$/.test(file.type)) {
                    imageName = file.name;
                    imageType = file.type;
                    imageURL = URL.createObjectURL(file);

					cropper.cropper('destroy').attr('src', imageURL).cropper(opts);

                }else{
                	input.attr( 'value', '' );
                    
                    $.showToast( streamtube.incorrect_image, 'danger' );
                }
            }
        }
    });

    /**
     * The featured image handler
     * 
     * @since 1.0.0
     * 
     */
    $( document ).on( 'change', 'input[name=featured-image]', function(e){
    	var input 				=	$(this);
        var URL 				=	window.URL || window.webkitURL;
        var imageURL 			=	'';
        var files 				=	this.files;
        var file;

        if (URL) {

            if (files && files.length) {
                file = files[0];

                if (/^image\/\w+$/.test(file.type)) {
                    imageURL = URL.createObjectURL(file);

                    var imgTag = '<img class="wp-post-image" src="'+imageURL+'">';

                    $(this).closest( '.thumbnail-group' ).find( '.post-thumbnail' ).html( imgTag );
                }else{
                	input.attr( 'value', '' );
                    
                    $.showToast( streamtube.incorrect_image, 'danger' );
                }
            }
        }
    });

    /**
     *
     * AJAX load comments handler
     *
     * @since 1.0.0
     * 
     */
    $( document ).on( 'scrollin click', '.load-comments.load-on-scroll', $.ajaxElementOnEventRequest );

    /**
     *
     * Used for single video 1
     *
     * Catch the scroll end event of the comment list
     * 
     * @since  1.0.0
     * 
     */
	$(  '.single_video__comments--fixed #comments-list' ).on( 'scroll', function( event ) {

		$(this).trigger( 'resize' );
	});

	/**
	 *
	 * Load more comments on click event
	 *
	 * @since  1.0.0
	 * 
	 */
    $( document ).on( 'click', '.load-comments.load-on-click', $.ajaxElementOnEventRequest );

	/**
	 *
	 * Load more posts
	 *
	 * @since  1.0.0
	 * 
	 */
	$( document ).on( 'click', '.widget-load-more-posts', $.ajaxElementOnEventRequest );

	$( document ).on( 'scrollin', '.widget-load-more-posts.load-on-scroll', $.ajaxElementOnEventRequest );

	$( document ).on( 'scrollin', '.load-users', $.ajaxElementOnEventRequest );
	$( document ).on( 'click', '.load-users', $.ajaxElementOnEventRequest );

	$( document ).on( 'scrollout', '.player-wrapper.jsappear', function( event = null, $elements ){
		$(this).find( '.player-container' ).addClass( 'animate slideIn rounded sticky-player shadow' );
	} );

	$( document ).on( 'scrollin', '.player-wrapper.jsappear', function( event = null, $elements ){
		$(this).find( '.player-container' ).removeClass( 'animate slideIn rounded sticky-player shadow' );
	} );

	$( document ).on( 'click', '.player-wrapper .player-header button', function( event ){
		$(this)
		.closest( '.player-container' )
		.removeClass( 'rounded sticky-player shadow' )
		.parent().removeClass( 'jsappear' );
	} );

	/**
	 *
	 * scroll trigger
	 * @since  1.0.0
	 */
	$( '.single-video__body' ).on( 'scroll', function( event ) {

		$(this).trigger( 'resize' );
	});

	/**
	 *
	 * Row IDs auto select handler
	 *
	 * @since  1.0.0
	 * 
	 */
	$( document ).on( 'change', 'input[name=row_id]', function( event ){

		var input 		= $(this);
		var isChecked	= input.is( ':checked' );
		var table 		= input.closest( 'table' );

		table.find( '.row-id-input' ).each( function( k, v ){
			console.log(isChecked);
			if( isChecked ){
				$(this).prop('checked', true );
			}
			else{
				$(this).prop('checked', false );
			}
		} );
	} )

	/**
	 *
	 * updatePostMessageModal handler
	 * @since  1.0.0
	 */
	$( '#updatePostMessageModal' ).on( "show.bs.modal", function ( event ) {

		var modal = $(this);

		var clickedBtn = $(event.relatedTarget);

		modal.find( 'button[type=submit]' ).html( clickedBtn.html() );
		modal.find( 'input[name=action]' ).val( clickedBtn.attr( 'data-action' ) );
		modal.find( 'input[name=post_id]' ).val( clickedBtn.attr( 'data-post-id' ) );

		var thumbnail = clickedBtn.closest( 'tr' ).find('.post-title').clone();

		modal.find( '.modal-body' ).find( '.post-title' ).remove();
		modal.find( '.modal-body' ).prepend( thumbnail );
	});

	/**
	 *
	 * deletePostModal handler
	 * @since  1.0.0
	 */
	$( '#deletePostModal' ).on( "show.bs.modal", function ( event ) {

		var modal = $(this);

		var clickedBtn = $(event.relatedTarget);

		modal.find( 'input[name=post_id]' ).val( clickedBtn.attr( 'data-post-id' ) );

		var title = clickedBtn.closest( 'tr' ).find('.post-title').clone();
		var thumbnail = clickedBtn.closest( 'tr' ).find('.post-thumbnail').clone();

		if( thumbnail.length != 0 ){
			modal.find( '.post-list-wrap' ).html( thumbnail ).append(title).removeClass('d-none');
		}
	});

	/**
	 *
	 * Upload video file on changing
	 *
	 * @since 1.0.0
	 * 
	 */
	$( document ).on( 'change', 'input[name=video_file]', function( event ){
		var files = event.target.files || event.dataTransfer.files;
		return uploadVideoController( files, $(this).closest( 'form' ) );
	} );

	/**
	 * Drag drop upload
	 *
	 * @since 1.0.0
	 * 
	 */
	var dragDropContainer = document.querySelector( '.upload-form__label' );

	if( dragDropContainer !== null && dragDropContainer.length != 0 ){
		/**
		 *
		 * Add dragover class
		 *
		 * @since 1.0.0
		 * 
		 */
		dragDropContainer.addEventListener( 'dragover', function(event) {
			event.preventDefault();
			event.stopPropagation();			
			$(this).addClass( 'drag-over' );
		} , false );

		/**
		 *
		 * Add dragleave class
		 *
		 * @since 1.0.0
		 * 
		 */
		dragDropContainer.addEventListener( 'dragleave', function(event) {
			$(this).removeClass( 'drag-over' );
		});

		/**
		 *
		 * do upload on droping
		 *
		 * @since 1.0.0
		 * 
		 */
		dragDropContainer.addEventListener( 'drop' , function(event) {
			event.preventDefault();
			event.stopPropagation();
			$(this).removeClass( 'drag-over' );
			var files = event.target.files || event.dataTransfer.files;

			return uploadVideoController( files, $(this).closest( 'form' ));
		});
	}

	/**
	 *
	 * Show animation image on hovering
	 *
	 * @since 1.0.6
	 * 
	 */
	$( document ).on( 'mouseover', '.type-video .post-thumbnail', function(e){
		var thumbnail 			= $(this);

		var parent 				= thumbnail.closest( '.type-video' );

		var thumbnailImage2Url 	= parent.attr( 'data-thumbnail-image-2' );

		if( thumbnailImage2Url !== undefined ){
			var imageTag = '<img class="thumbnail-image-2" src="'+thumbnailImage2Url+'">';

			if( thumbnail.find( '.thumbnail-image-2' ).length != 0 ){
				thumbnail.find( '.thumbnail-image-2' )
				.attr( 'src', thumbnailImage2Url )
				.show();
			}
			else{
				thumbnail.append( imageTag );
			}
		}
	});

	$( document ).on( 'mouseout', '.type-video .post-thumbnail', function(e){
		$(this).find( '.thumbnail-image-2' ).attr( 'src', '' ).hide();
	});

	/**
	 *
	 * Edit Comment modal on show event handler
	 *
	 * @since 1.0.8
	 * 
	 */
	$( '#modal-edit-comment' ).on( 'show.bs.modal', function( event ){
		var modal = $(this);
		var button = event.relatedTarget;
		var comment = $.parseJSON( $( button ).attr( 'data-params' ) );

		modal.find( 'input[name=comment_ID]' ).val( comment.comment_id );

		var requestUrl = streamtube.ajaxUrl + '?action=get_comment&comment_id=' + comment.comment_id + '&_wpnonce='+streamtube._wpnonce;

		$.get( requestUrl, function( response ){

			tinyMCE.get( "comment_content" ).setContent( response.data.comment_content.replace( '/\r?\n/g', '<br />') );

			modal
			.find( '.spinner-wrap' )
			.addClass( 'd-none' )
			.next()
			.removeClass( 'd-none' );
		} );
	} );

	/**
	 *
	 * Edit Comment modal on hidden event handler
	 *
	 * @since 1.0.8
	 * 
	 */
	$( '#modal-edit-comment' ).on( 'hidden.bs.modal', function( event ){
		var modal = $(this);
		modal.find( 'input[name=comment_ID]' ).val('0');
		modal
		.find( '.spinner-wrap' )
		.removeClass( 'd-none' )
		.next()
		.addClass( 'd-none' );		
		tinyMCE.get( 'comment_content' ).setContent('');
	});

	/**
	 *
	 * Private Message modal on show event handler
	 *
	 * @since 1.1.5
	 * 
	 */
	$( '#modal-private-message' ).on( 'show.bs.modal', function( event ){
		var modal 			= $(this);
		var button 			= event.relatedTarget;
		var recipient_id 	= $( button ).attr( 'data-recipient-id' );
		var queryParams 	= '?action=get_recipient_info&recipient_id=' +recipient_id + '&_wpnonce='+streamtube._wpnonce;
		var requestUrl 		= streamtube.ajaxUrl + queryParams;

		$.get( requestUrl, function( response ){

			if( response.success == false ){
				$.showToast( response.data[0].message, 'danger' );
			}else{

				var avatar = '<div class="avatar-wrap m-4">';
					avatar += response.data.avatar;
				avatar += '</div>';

				modal.find( 'form' ).prepend( avatar );

				modal.find( '#recipients' ).val( recipient_id );
			}

			modal
			.find( '.spinner-wrap' )
			.addClass( 'd-none' )
			.removeClass( 'd-block' );
		} );
	} );

	/**
	 *
	 * Private Message modal on hidden event handler
	 *
	 * @since 1.1.5
	 * 
	 */
	$( '#modal-private-message' ).on( 'hidden.bs.modal', function( event ){
		var modal = $(this);
		modal.find( '#recipients' ).val('');
		modal.find( '#subject' ).val('');
		modal.find( '#message' ).val('');
		modal
		.find( '.spinner-wrap' )
		.removeClass( 'd-block' )
		.addClass( 'd-none' );

		modal.find( '.avatar-wrap' ).remove();
	});	

})(jQuery);
