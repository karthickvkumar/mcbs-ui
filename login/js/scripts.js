(function($) {
    "use strict";

    /**
     * Remove overlay div
     *
     * @since 1.0.0
     */
    function removeOverlayDiv(){
        if( $( window ).width() > 1200 ){
            $( 'body' )
            .removeClass( 'sidebar-secondary-active' )
            .find( '.body-overlay' )
            .remove();
        }        
    }

    /**
     * Remove the mobile search form
     *
     * @since 1.0.0
     */
    function removeMobileSearchForm(){
        if( $( window ).width() > 992 ){
            $( '#site-header .col-center' ).removeClass( 'show-search' );
        }        
    }

    function setMobileBootstrapMenu(){
        if( $( window ).width() < 992 ){
            $( '.main-menu .dropdown-menu' ).click( function( event ){
                event.stopPropagation();
            } );      
        }
    }

    /**
     *
     * Preloader handler
     *
     * @since 1.0.0
     * 
     */
    $( window ).on('load', function() {
        if( $( 'body' ).hasClass( 'has-preloader' ) ){
            $( '#preloader' ).fadeOut( 'slow' );
        }
    });

    /**
     * Window Resize event
     * 
     * @since 1.0.0
     */
    $( window ).resize(function(){

        removeMobileSearchForm();

        removeOverlayDiv();

        setMobileBootstrapMenu();
    });

    $( document ).ready(function() {

        setMobileBootstrapMenu();

        $( '.main-menu .dropdown-menu .dropdown-toggle' ).click( function( event ){
            $(this).toggleClass( 'show' ).next().toggleClass( 'show' );
        } );

        /**
         *
         * BS tooltip render
         * 
         */
        $('body').tooltip({selector: '[data-bs-toggle="tooltip"]'});

        $( 'select' ).addClass( 'form-select' );  

        /**
         *
         * The float sidebar toggler
         * 
         * @since 1.0.0
         */
        $( '#toggle-nav' ).on( 'click', function( event ){
            $( 'body' ).toggleClass( 'sidebar-secondary-active' );
            
            if( $( '.body-overlay' ).length == 0 ){
                $( 'body' ).append( '<div class="body-overlay"></div>' );
            }
            else{
                $( '.body-overlay' ).remove();
            }
           
        } );

        $( document ).on( 'click', '.body-overlay', function( event ){
            $( 'body' )
            .removeClass( 'sidebar-secondary-active' )
            .find( '.body-overlay' )
            .remove();
        });

        /**
         * Mobile search toggler
         * @since 1.0.0
         */
        $( '.toggle-search' ).on( 'click', function( event ){
            $( '#site-search' )
            .closest( '.col-center' )
            .toggleClass( 'show-search' )
            .find( '#site-search input[name=s]' )
            .focus();
        } );     

        /**
         *
         * The post content JS read more handler
         *
         * @since  1.0.0
         * 
         */
        if( $( '.js-read' ).height() > 60 ){
            $( '.js-read' )
            .addClass( 'js-more' )
            .next().removeClass( 'd-none' );
        }

        /**
         * 
         * The post content JS read more link toggler handler
         *
         * @since  1.0.0
         * 
         */
        $( '.js-read-toggler' ).on( 'click', function( event ){
            $(this).toggleClass( 'js-read-less' ).prev().toggleClass( 'js-more' );
        } );

        /**
         *
         *
         * Comment JS read more handler
         * 
         * @since 1.0.0
         * 
         */

        $( document ).on( 'click', '.comment-show-more', function( event ){
            event.preventDefault();

            $(this).parent().toggleClass( 'show-less' );
        } );


        /**
         *
         *
         * Comment JS read less handler
         * 
         * @since 1.0.0
         * 
         */

        $( document ).on( 'click', '.comment-show-less', function( event ){
            event.preventDefault();

            $(this).parent().toggleClass( 'show-less' );
        });


        /**
         *
         * The replies link click event handler
         *
         * @since 1.0.0
         */
        $( document ).on( 'click', '.toggle-replies-link', function( event ){

            event.preventDefault();

            //$( this ).toggleClass( 'active' ).closest( '.comment-body' ).next().toggleClass( 'd-block' );
                
            var children = $( this ).toggleClass( 'active' ).closest( '.comment-body' ).next();

            if( children.hasClass( 'expanded' ) ){
                children.removeClass( 'expanded' ).slideUp();
            }
            else{
                children.addClass( 'expanded' ).slideDown();
            }
        } ); 

        $( '.search-type-select' ).on( 'change', function( event ){
            var searchType = $(this).val();
            var action = '';
            if( searchType == 'topics' ){
                action = 'bbp-search-request';
            }
            else{
                action = 'search-' + searchType;   
            }
            
            $(this).closest( 'form' ).find( 'input[name=action]' ).val( action );
        } );
    });

    $( '#sidebar-secondary .dropdown' ).on( 'show.bs.dropdown', function () {
        if( $( window ).width() <= 1300 ){
            
            $( 'body' ).addClass( 'sidebar-secondary-active' ); 

            if( $( '.body-overlay' ).length == 0 ){
                $( 'body' ).append( '<div class="body-overlay"></div>' );
            }            
        }
    });

})(jQuery);