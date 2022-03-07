(function( $ ) {
	'use strict';

	$( document.body ).on( 'user_follow', userFollow );

	function userFollow( event, responseData, textStatus, jqXHR, formData, form ){
		if( responseData.success == true ){
			form.parent().replaceWith( responseData.data.button );	
			$.showToast( responseData.data.results.message, 'success' );
		}
		else{
			$.showToast( responseData.data.message, 'danger' );
		}	
	}

})( jQuery );
