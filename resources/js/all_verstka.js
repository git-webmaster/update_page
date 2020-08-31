 //- --------------------------------------------------------------------------
    //- Load Jquery
    //- --------------------------------------------------------------------------

    //- $script('https://yastatic.net/jquery/2.1.4/jquery.min.js', function() {

    $script('/js/jquery.js', function() {

        console.log('Loaded jquery.');


        // --------------------------------------------------------------------------
        // Variables
        // --------------------------------------------------------------------------

        var jwindow = jwindow || $(window), jhtml = jhtml || $('html'), jhtmlbody = jhtmlbody || $('html, body');

        // --------------------------------------------------------------------------
        // Functions
        // --------------------------------------------------------------------------


        function toggleElementClass(t, selector) {
            if (t.closest(selector).is('.is-open')) {
                t.closest(selector).removeClass('is-open');
            } else {
                $(selector).removeClass('is-open');
                t.closest(selector).addClass('is-open');
            }
        }


        // --------------------------------------------------------------------------
        // Load matchMedia
        // --------------------------------------------------------------------------

        $script('/js/matchMedia.js', function() {

            console.log('Loaded matchMedia');

        });


        // --------------------------------------------------------------------------
        // Swipe Menu & Offcanvas
        // --------------------------------------------------------------------------


        // --------------------------------------------------------------------------
        // Offcanvas
        // --------------------------------------------------------------------------

        $(document).on('click', '.js-offcanvas-btn', function(event) {
            event.preventDefault();
            jhtml.toggleClass('is-offcanvas-open');

            $('.js-offcanvas-dropdown').css({
                'transition': '',
                'transform' : ''
            });


        });


        $(document).on('click', '.js-offcanvas-close', function(event) {
            event.preventDefault();
            jhtml.removeClass('is-offcanvas-open');

            $('.js-offcanvas-dropdown').css({
                'transition': '',
                'transform' : ''
            });

        });

        $(document).on('click', function (event) {
            if ($(event.target).closest('.js-offcanvas').length === 0) {
                jhtml.removeClass('is-offcanvas-open');

                $('.js-offcanvas-dropdown').css({
                    'transition': '',
                    'transform' : ''
                });

            }
        });


        // --------------------------------------------------------------------------
        // Messages
        // --------------------------------------------------------------------------

        $(document).on('click', '.js-messages-btn', function(event) {
            event.preventDefault();

            if ( $('html').is('.is-massages-open') ) {

                $('html').removeClass('is-massages-open');

                $('.js-messages-sidebar').css({
                    'transition': '',
                    'transform' : ''
                });

            } else {

                $('html').addClass('is-massages-open');
            }

        });


        $(document).on('click', '.js-messages-overlay', function(event) {
            event.preventDefault();
            $('html').removeClass('is-massages-open');

            $('.js-messages-sidebar').css({
                'transition': '',
                'transform' : ''
            });
        });


        // -----


        $(window).on('load resize scroll', function(event) {

            if (typeof $('.js-messages-content').offset() !== 'undefined')
            {
                var sidebarOffsetTop = $('.js-messages-content').offset().top;
                var scrollTop = $(window).scrollTop();
                var setTop  = sidebarOffsetTop - scrollTop;
            }


            if (window.matchMedia('(min-width: 992px)').matches) {

                $('.js-messages-sidebar').css({
                    'top': ''
                });

            } else {

                $('.js-messages-sidebar').css({
                    'top': setTop + 1
                });

            }

        });


        $script('/js/jquery.touchSwipe.js', function() {

            console.log('Loaded Swipe Menu');

            $('.js-offcanvas-dropdown').swipe({
                swipeStatus: function(event, phase, direction, distance, duration, fingers) {

                    if ( phase == 'move' && direction == "right" ) {

                        $('.js-offcanvas-dropdown').css({
                            'transition' : 'none',
                            'transform': 'translate(' + distance + 'px,0)'
                        });

                    }


                    if ( phase == 'cancel' ) {

                        $('.js-offcanvas-dropdown').css({
                            'transition' : '0.25s',
                            'transform': 'translate(0,0)'
                        });

                    }

                    if ( phase == 'end' && direction == "right" ) {

                        $('.js-offcanvas-dropdown').css({
                            'transition' : '0.25s',
                            'transform': 'translate(100%,0)'
                        });

                        jhtml.removeClass('is-offcanvas-open');

                        $('.js-offcanvas-dropdown').on('transitionend webkitTransitionEnd oTransitionEnd', function () {

                            $('.js-offcanvas-dropdown').removeAttr('style');

                        });

                    }

                    if ( phase == 'end' && direction != "right" ) {

                        $('.js-offcanvas-dropdown').css({
                            'transition' : '0.25s',
                            'transform': 'translate(0,0)'
                        });

                    }

                },
                //- triggerOnTouchEnd: false,
                allowPageScroll: 'vertical',
                threshold: 70
            });


            function updateOffcanvas() {
                if (window.matchMedia('(min-width: 1200px)').matches) {
                    $('.js-offcanvas-dropdown').swipe('disable');
                } else {
                    $('.js-offcanvas-dropdown').swipe('enable');
                }
            }

            updateOffcanvas();

            $(window).on('resize orientationchange', function(event) {

                updateOffcanvas();

            });

            // -----


            $('.js-messages-sidebar').swipe({
                swipeStatus: function(event, phase, direction, distance, duration, fingers) {

                    if ( direction == "left" ) {

                        $('.js-messages-sidebar').find('.js-scrollbar').addClass('is-disabled');

                    } else {

                        $('.js-messages-sidebar').find('.js-scrollbar').removeClass('is-disabled');

                    }

                    // -----

                    if ( phase == 'move' && direction == "left" ) {

                        $('.js-messages-sidebar').css({
                            'transition' : 'none',
                            'transform': 'translate(' + -1 * distance + 'px,0)'
                        });

                    }


                    if ( phase == 'cancel' ) {

                        $('.js-messages-sidebar').css({
                            'transition' : '0.25s',
                            'transform': 'translate(0,0)'
                        });

                    }

                    if ( phase == 'end' && direction == "left" ) {

                        $('.js-messages-sidebar').css({
                            'transition' : '0.25s',
                            'transform': 'translate(-100%,0)'
                        });

                        jhtml.removeClass('is-massages-open');

                        $('.js-messages-sidebar').on('transitionend webkitTransitionEnd oTransitionEnd', function () {

                            $('.js-messages-sidebar').css({
                                'transition': '',
                                'transform': ''
                            })

                        });

                    }

                    if ( phase == 'end' && direction != "left" ) {

                        $('.js-messages-sidebar').css({
                            'transition' : '0.25s',
                            'transform': 'translate(0,0)'
                        });

                    }

                },
                //- triggerOnTouchEnd: false,
                allowPageScroll: 'vertical',
                threshold: 70
            });

            function updateMessages() {
                if (window.matchMedia('(min-width: 992px)').matches) {
                    $('.js-messages-sidebar').swipe('disable').find('.js-scrollbar').removeClass('is-disabled');
                } else {
                    $('.js-messages-sidebar').swipe('enable').find('.js-scrollbar').removeClass('is-disabled');
                }
            }

            updateMessages();

            $(window).on('resize orientationchange', function(event) {

                updateMessages();

            });


        });

        // --------------------------------------------------------------------------
        // Load Sticky-kit
        // --------------------------------------------------------------------------

        $script(['/js/sticky-kit.js', '/js/matchMedia.js'], function() {

            console.log('Loaded sticky-kit & matchMedia');


            function sticky() {

                if (window.matchMedia('(min-width: 1480px)').matches) {

                    $('.js-scrolltop .icon-scrolltop').stick_in_parent({
                        offset_top: 30,
                        bottoming: true,
                        spacer: false,
                        inner_scrolling: true,
                        sticky_class: 'is-sticky',
                        parent: '.js-scrolltop'
                    });

                } else {

                    $('.js-scrolltop .icon-scrolltop').trigger('sticky_kit:detach');

                }

                if (window.matchMedia('(min-width: 1200px)').matches) {


                    $('.js-sticky').stick_in_parent({
                        offset_top: 30,
                        bottoming: true,
                        spacer: false,
                        inner_scrolling: true,
                        sticky_class: 'is-sticky',
                        parent: '.js-sticky-container'
                    });




                } else {

                    $('.js-sticky').trigger('sticky_kit:detach');

                }

            }


            sticky();

            $(window).on('resize', function(event) {

                sticky();

            });


        });



        // --------------------------------------------------------------------------
        // Load Selectric
        // --------------------------------------------------------------------------


        loadCSS('/css/plugins/selectric.css');

        $script('/js/jquery.selectric.js', function() {

            console.log('Loaded selectric.js');

            $('.js-select').selectric({
                maxHeight: 380,
                keySearchTimeout: 500,
                arrowButtonMarkup: '<span class="arrow"><svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0.396135C0 0.289855 0.0413793 0.193237 0.124138 0.115942C0.289655 -0.0386473 0.558621 -0.0386473 0.724138 0.115942L6 5.04348L11.2759 0.115942C11.4414 -0.0386473 11.7103 -0.0386473 11.8759 0.115942C12.0414 0.270531 12.0414 0.521739 11.8759 0.676328L6.3 5.88406C6.13448 6.03865 5.86552 6.03865 5.7 5.88406L0.124138 0.676328C0.0413793 0.599034 0 0.502415 0 0.396135Z" fill="currentColor"/></svg></span>',
                disableOnMobile: false,
                nativeOnMobile: true,
                openOnHover: false,
                hoverIntentTimeout: 500,
                expandToItemText: false,
                responsive: false,
                customClass: {
                    prefix: 'ui-selectric',
                    camelCase: false
                },
                optionsItemBuilder: '{text}',
                labelBuilder: '{text}',
                preventWindowScroll: false,
                inheritOriginalWidth: false,
                allowWrap: true,
                multiple: {
                    separator: ', ',
                    keepMenuOpen: true,
                    maxLabelEntries: false
                },
                onBeforeInit: function() {

                },
                onInit: function(itemData, element, index) {

                },
                onBeforeOpen: function() {

                },
                onOpen: function() {

                },
                onBeforeClose: function() {

                },
                onClose: function() {

                },
                onBeforeChange: function() {

                },
                onChange: function(element) {
                    $(element).change();
                },
                onRefresh: function() {

                },
            });


            $('.js-select-search').selectric({
                optionsItemBuilder: function(itemData, element, index) {
                    var icon = itemData.element.data('icon');
                    return element.val().length ? '<span class="' + icon +  '"></span>' + itemData.text : itemData.text;
                }
            });

            $('.js-select-icons').selectric({
                labelBuilder: function(itemData, element, index) {
                    var icon = itemData.element.data('icon');

                    return icon.length ? '<span class="ui-selectric-icon"><img src="' + icon + '"></span>' +  itemData.text : itemData.text;

                },
                optionsItemBuilder: function(itemData, element, index) {
                    var icon = itemData.element.data('icon');
                    return icon.length ? '<span class="ui-selectric-icon"><img src="' + icon + '"></span>' +  itemData.text : itemData.text;
                }
            });


            $('.js-select-svg').selectric({
                nativeOnMobile: false,
                labelBuilder: function(itemData, element, index) {
                    var icon = itemData.element.data('svg');
                    return icon.length ? '<span class="ui-selectric-svg"><svg class="' + icon +'"><use xlink:href="#' + icon + '"></use></svg></span>' +  itemData.text : itemData.text;

                },
                optionsItemBuilder: function(itemData, element, index) {
                    var icon = itemData.element.data('svg');
                    return icon.length ? '<span class="ui-selectric-svg"><svg class="' + icon +'"><use xlink:href="#' + icon + '"></use></svg></span>' +  itemData.text : itemData.text;
                }
            });




        });


        // --------------------------------------------------------------------------
        // Load PriorityNav
        // --------------------------------------------------------------------------


        //- $script(['/js/classlist.js', '/js/priority-nav.js'], function() {

        $script('/js/priority-nav.js', function() {

            console.log('Loaded priority-nav.js');





            if ( $('.js-filter').length ) {

                var filterMore = priorityNav.init({
                    initClass:                  "is-filter",
                    mainNavWrapper:             ".js-filter",
                    mainNav:                    ".js-filter-list",
                    navDropdownClassName:       "ui-filter__dropdown",
                    navDropdownToggleClassName: "ui-filter__dropdown-toggle",
                    navDropdownLabel:           "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Еще фильтры",
                    navDropdownBreakpointLabel: "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Показать фильтры",
                    breakPoint:                 480,
                    throttleDelay:              50,
                    offsetPixels:               0,
                    count:                      true,
                    //Callbacks
                    moved: function () {
                        // $('html').addClass('is-info-open');
                    }, // executed when item is moved to dropdown
                    movedBack: function () {
                        // $('html').removeClass('is-info-open');
                    } // executed when item is moved back to main menu
                });

            }



            if ( $('.js-sorting').length ) {

                var sortingMore = priorityNav.init({
                    initClass:                  "is-sorting",
                    mainNavWrapper:             ".js-sorting",
                    mainNav:                    ".js-sorting-list",
                    navDropdownClassName:       "ui-sorting__dropdown",
                    navDropdownToggleClassName: "ui-sorting__dropdown-toggle",
                    navDropdownLabel:           "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Еще фильтры",
                    navDropdownBreakpointLabel: "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Показать фильтры",
                    //- breakPoint:                 576,
                    breakPoint:                 0,
                    throttleDelay:              50,
                    offsetPixels:               0,
                    count:                      true,
                    //Callbacks
                    moved: function () {
                        // $('html').addClass('is-info-open');
                    }, // executed when item is moved to dropdown
                    movedBack: function () {
                        // $('html').removeClass('is-info-open');
                    } // executed when item is moved back to main menu
                });

            }


            if ( $('.js-priority').length ) {

                var navPriority = priorityNav.init({
                    initClass:                  "is-navmore",
                    mainNavWrapper:             ".js-priority",
                    mainNav:                    ".js-priority-menu",
                    navDropdownClassName:       "l__nav-dropdown",
                    navDropdownToggleClassName: "l__nav-dropdown-toggle",
                    navDropdownLabel:           "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> <u>Еще</u>",
                    navDropdownBreakpointLabel: "<svg width='20' height='5' viewBox='0 0 20 5' fill='none' class='icon-dots'><path fill-rule='evenodd' clip-rule='evenodd' d='M2.27271 4.56007C1.01753 4.56007 0 3.54255 0 2.28736C0 1.03218 1.01753 0.0146484 2.27271 0.0146484C3.5279 0.0146484 4.54542 1.03218 4.54542 2.28736C4.54542 3.54255 3.5279 4.56007 2.27271 4.56007ZM10 4.56007C8.74482 4.56007 7.72729 3.54255 7.72729 2.28736C7.72729 1.03218 8.74482 0.0146484 10 0.0146484C11.2552 0.0146484 12.2727 1.03218 12.2727 2.28736C12.2727 3.54255 11.2552 4.56007 10 4.56007ZM17.7273 4.56007C16.4721 4.56007 15.4546 3.54255 15.4546 2.28736C15.4546 1.03218 16.4721 0.0146484 17.7273 0.0146484C18.9825 0.0146484 20 1.03218 20 2.28736C20 3.54255 18.9825 4.56007 17.7273 4.56007Z' fill='currentColor'></svg> Показать фильтры",
                    breakPoint:                 0,
                    throttleDelay:              50,
                    offsetPixels:               0,
                    count:                      true,
                    //Callbacks
                    moved: function () {
                        // $('html').addClass('is-info-open');
                    }, // executed when item is moved to dropdown


                    movedBack: function () {
                        // $('html').removeClass('is-info-open');
                    } // executed when item is moved back to main menu
                });




            }







        });








        // --------------------------------------------------------------------------
        // Load Owl Carousel
        // --------------------------------------------------------------------------

        loadCSS('/css/plugins/owl.carousel.css');

        $script('/js/owl.carousel.js', function() {

            console.log('Loaded owl.carousel');

            var owlPrev = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.96916 15.8359C8.85445 15.9427 8.72266 15.9958 8.57371 15.9958C8.42494 15.9958 8.29314 15.9427 8.17862 15.8359L0.171757 8.36635C0.0572323 8.25963 0 8.13686 0 7.99797C0 7.85908 0.0572323 7.73608 0.171757 7.6293L8.17862 0.160334C8.29308 0.0535009 8.42488 0 8.57371 0C8.72266 0 8.85445 0.0533325 8.96892 0.160334L9.82794 0.961557C9.94265 1.06833 9.99982 1.19128 9.99982 1.33022C9.99982 1.46911 9.94265 1.59206 9.82794 1.69889L3.07562 7.99797L9.82812 14.2973C9.94283 14.4041 10 14.527 10 14.6658C10 14.8048 9.94283 14.9278 9.82812 15.0346L8.96916 15.8359Z" fill="currentColor"/></svg>',
                owlNext = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.03084 15.8359L0.171877 15.0346C0.0571721 14.9278 0 14.8048 0 14.6658C0 14.527 0.0571721 14.4041 0.171877 14.2973L6.92438 7.99797L0.172058 1.69889C0.0573526 1.59206 0.000180543 1.46911 0.000180543 1.33022C0.000180543 1.19128 0.0573526 1.06833 0.172058 0.961557L1.03108 0.160334C1.14555 0.0533325 1.27734 0 1.42629 0C1.57512 0 1.70692 0.0535009 1.82138 0.160334L9.82824 7.6293C9.94277 7.73608 10 7.85908 10 7.99797C10 8.13686 9.94277 8.25963 9.82824 8.36635L1.82138 15.8359C1.70686 15.9427 1.57506 15.9958 1.42629 15.9958C1.27734 15.9958 1.14555 15.9427 1.03084 15.8359Z" fill="currentColor"/></svg>';

            $('.js-owl-cards').owlCarousel({
                loop: false,
                margin: 20,
                items: 1,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext],
                autoHeight: true,
                responsive: {
                    480: {
                        autoWidth: true,
                        autoHeight: false
                    }
                }
            });

            $('.js-owl-gallery').owlCarousel({
                loop: false,
                margin: 2,
                autoWidth: true,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext]
            });


            $('.js-owl-places').owlCarousel({
                items: 1,
                loop: false,
                margin: 20,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext],
                autoHeight: true,
                responsive: {
                    768: {
                        items: 2,
                        autoHeight: false
                    }
                }
            });


            $('.js-owl-specials').owlCarousel({
                autoWidth: true,
                loop: false,
                margin: 20,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext]
            });


            $('.js-owl-reviews').owlCarousel({
                autoWidth: true,
                loop: false,
                margin: 20,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext]
            });


            $('.js-owl-reviews-new').owlCarousel({
                items: 1,
                loop: false,
                margin: 20,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext],
                responsive: {
                    480: {
                        autoWidth: true,
                        nav: false
                    },
                    768: {
                        autoWidth: false,
                        items: 2,
                        nav: false
                    },
                    992: {
                        autoWidth: false,
                        items: 3,
                        nav: false
                    }
                }
            });

            $('.js-owl-reviews-primary').owlCarousel({
                items: 1,
                loop: false,
                margin: 20,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext],
                responsive: {
                    768: {
                        items: 2
                    },
                    992: {
                        items: 3
                    },
                    1200: {
                        items: 4
                    }
                }
            });


            $('.js-owl-hotels-primary').owlCarousel({
                items: 1,
                loop: false,
                margin: 20,
                nav: true,
                dots: false,
                autoWidth: true,
                navText: [owlPrev, owlNext],
                responsive: {
                    480: {
                        items: 2
                    },
                    768: {
                        items: 3,
                        autoWidth: false
                    },
                    992: {
                        items: 4,
                        autoWidth: false
                    },
                    1200: {
                        items: 5,
                        autoWidth: false
                    }
                }
            });


            $('.js-owl-photos').owlCarousel({
                items: 1,
                loop: false,
                margin: 20,
                nav: false,
                dots: false,
                navText: [owlPrev, owlNext],
                autoWidth: true,
                responsive: {
                    576: {
                        autoWidth: false,
                        items: 2
                    },
                    768: {
                        autoWidth: false,
                        items: 3
                    },
                    992: {
                        autoWidth: false,
                        items: 4
                    }
                }
            });


            $('.js-owl-photos_5').owlCarousel({
                items: 1,
                loop: false,
                margin: 20,
                nav: false,
                dots: false,
                navText: [owlPrev, owlNext],
                autoWidth: true,
                responsive: {
                    576: {
                        autoWidth: false,
                        items: 2
                    },
                    768: {
                        autoWidth: false,
                        items: 3
                    },
                    992: {
                        autoWidth: false,
                        items: 4
                    },
                    1200: {
                        autoWidth: false,
                        items: 5
                    }
                }
            });



            $('.js-gallery').each(function(index) {

                var gallery = $(this),
                    gallerySlides = gallery.find('.js-gallery-slides'),
                    galleryThumbs = gallery.find('.js-gallery-thumbs');


                gallerySlides.owlCarousel({
                    items: 1,
                    loop: false,
                    margin: 10,
                    nav: true,
                    dots: false,
                    navText: [owlPrev, owlNext],
                    onChanged: function(event) {

                        var index = event.item.index;


                        galleryThumbs.children().removeClass('is-active');
                        galleryThumbs.children().eq(index).addClass('is-active');

                    }
                });


                galleryThumbs.children().on('click', function(event) {

                    var index = $(this).index();

                    galleryThumbs.children().removeClass('is-active');
                    galleryThumbs.children().eq(index).addClass('is-active');

                    gallerySlides.trigger('to.owl.carousel', [index, 250]);

                });
            });


            // ------



            $('.js-owl-dates').owlCarousel({
                items: 1,
                loop: false,
                margin: 10,
                nav: true,
                dots: false,
                navText: [owlPrev, owlNext],
                autoWidth: true
            });



            // -----



            $('.js-owl-mouse').owlCarousel({
                items: 1,
                loop: false,
                margin: 2,
                nav: true,
                dots: false,
                speed: 300,
                autoWidth: true,
                navText: [owlPrev, owlNext],

                responsive: {
                    768: {
                        margin: 0,
                        autoWidth: false,
                        dots: true,
                        nav: false
                    }
                }
            });


            $('.js-owl-mouse').on('mouseover', '.owl-dot', function(event) {
                var index = $(this).index();
                $(this).closest('.js-owl-mouse').trigger('to.owl.carousel', [index, 0]);
            });


        });



        // --------------------------------------------------------------------------
        // Load Perfect Scrollbar
        // --------------------------------------------------------------------------

        //- loadCSS('/css/plugins/perfect.scrollbar.css');

        //- $script('/js/perfect-scrollbar.js', function() {

        loadCSS('/css/plugins/smooth.scrollbar.css');

        $script('/js/smooth-scrollbar.js', function() {

            console.log('Loaded smooth.scrollbar');

            if ( $('.js-scrollbar').length ) {


                $.each( $('.js-scrollbar'), function(i) {

                    var scrollbar = 'scrollbar' + i;

                    var scrollbar = Scrollbar.init(this, {
                        renderByPixels: true,
                        alwaysShowTracks: true,
                        continuousScrolling: true
                    });

                });

                Scrollbar.detachStyle();


            }

        });


        // --------------------------------------------------------------------------
        // Load Tooltipster
        // --------------------------------------------------------------------------

        loadCSS('/css/plugins/tooltipster.css');

        $script('/js/tooltipster.bundle.js', function() {

            console.log('Loaded tooltipster');

            $('.js-tooltip').tooltipster({
                animation: 'fade',
                delay: 0,
                delayTouch: [0,0],
                theme: 'tooltipster-sidetip'
            });

        });


        // --------------------------------------------------------------------------
        // Load Autosize Textarea
        // --------------------------------------------------------------------------

        $script('/js/autosize.js', function() {

            console.log('Loaded autosize textarea');


            autosize($('textarea'));

            $('textarea').on('focus', function(event) {
                $(this).closest('.ui-textarea-wrapper').addClass('is-focus');
            }).on('blur', function(event) {
                $(this).closest('.ui-textarea-wrapper').removeClass('is-focus');
            });

        });


        // --------------------------------------------------------------------------
        // Load Readmore
        // --------------------------------------------------------------------------

        $script('/js/readmore.js', function() {

            console.log('Loaded readmore');


            $('.js-readmore').readmore({
                speed: 200,
                collapsedHeight: 200,
                heightMargin: 0,
                moreLink: '<button class="panel__offer-readmore-btn">Читать дальше</button>',
                lessLink: '<button class="panel__offer-readmore-btn">Свернуть</button>',
                embedCSS: true,
                blockCSS: 'display: inline-block;',
                startOpen: false,
                beforeToggle: function() {},
                afterToggle: function() {},
                blockProcessed: function() {}
            });


        });



        // --------------------------------------------------------------------------
        // Load Colorpicker
        // --------------------------------------------------------------------------



        loadCSS('/css/plugins/minicolors.css');


        $script('/js/jquery.minicolors.js', function() {


            console.log('Loaded minicolors.js');


            $.minicolors = {
                defaults: {
                    animationSpeed: 50,
                    animationEasing: 'swing',
                    change: null,
                    changeDelay: 0,
                    control: 'hue',
                    defaultValue: '',
                    format: 'hex',
                    hide: null,
                    hideSpeed: 100,
                    inline: true,
                    keywords: '',
                    letterCase: 'lowercase',
                    opacity: false,
                    position: 'bottom left',
                    show: null,
                    showSpeed: 100,
                    theme: 'default',
                    swatches: []
                }
            };



            $('.js-colors-picker').minicolors({
                change: function(value, opacity) {
                    $(this).closest('.js-colors').find('.js-colors-input').val(value);
                    $(this).closest('.js-colors').find('.js-colors-style').css({'background': value});
                }
            });



            $(document).on('click', '.js-colors-btn', function(event) {
                event.preventDefault();

                if ( $(this).closest('.js-colors').is('.is-open') ) {
                    $(this).closest('.js-colors').removeClass('is-open');
                } else {
                    $(this).closest('.js-colors').addClass('is-open');
                }

            });

            $(document).on('click', function (event) {
                if ($(event.target).closest('.js-colors').length === 0) {
                    $('.js-colors').removeClass('is-open');
                }
            });


        });




        // --------------------------------------------------------------------------
        // Load ChartJs
        // --------------------------------------------------------------------------

        loadCSS('/css/plugins/chartjs.css');

        $script('/js/Chart.js', function() {

            console.log('Loaded chartJs');


            if ( $('#chartjs').length ) {


                var customTooltips = function(tooltip) {

                    var tooltipEl = document.getElementById('chartjs-tooltip');

                    // Hide if no tooltip
                    if (tooltip.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    // Set caret Position
                    tooltipEl.classList.remove('above', 'below', 'no-transform');
                    if (tooltip.yAlign) {
                        tooltipEl.classList.add(tooltip.yAlign);
                    } else {
                        tooltipEl.classList.add('no-transform');
                    }


                    var tooltipData = this._data,

                        tooltipDataColor = tooltipData.datasets[tooltip.dataPoints[0].datasetIndex].borderColor,
                        tooltipDataCaption = tooltipData.datasets[tooltip.dataPoints[0].datasetIndex].caption,
                        tooltipDataLabel = tooltipData.labels[tooltip.dataPoints[0].index];


                    $(tooltipEl).html(
                        '<span class="chartjs-tooltip__title" style="color:' + tooltipDataColor + '">' + tooltip.dataPoints[0].value + '<small>' + tooltipDataCaption + '</small></span>' +
                        '<span class="chartjs-tooltip__label">' + tooltipDataLabel + '</span>'
                    );



                    var positionY = this._chart.canvas.offsetTop;
                    var positionX = this._chart.canvas.offsetLeft;


                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
                    tooltipEl.style.top = positionY + tooltip.caretY + 'px';

                };


                var ctx = document.getElementById('chartjs');

                var randomScalingFactor = function() {
                    return Math.round(Math.random() * 100);
                };

                var randomData1 = [
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                ];

                var randomData2 = [
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                    randomScalingFactor(),
                ];



                var myChart = new Chart(ctx, {
                    type: 'line',

                    data: {
                        labels: [
                            '1 ноября',
                            '2 ноября',
                            '3 ноября',
                            '4 ноября',
                            '5 ноября',
                            '6 ноября',
                            '7 ноября',
                            '8 ноября',
                            '9 ноября',
                            '10 ноября',
                            '11 ноября',
                            '12 ноября',
                            '13 ноября',
                            '14 ноября',
                            '15 ноября',
                            '16 ноября',
                            '17 ноября',
                            '18 ноября',
                            '19 ноября',
                            '20 ноября',
                            '21 ноября',
                            '22 ноября',
                            '23 ноября',
                            '24 ноября',
                            '25 ноября',
                            '26 ноября',
                            '27 ноября',
                            '28 ноября',
                            '29 ноября',
                            '30 ноября'
                        ],
                        datasets: [{
                            label: 'Визиты',
                            caption: 'визитов',
                            data: randomData1,

                            fill: false,
                            borderColor: '#72BB53',
                            borderWidth: 2,

                            pointStyle: 'circle',
                            pointRadius: 6,
                            pointBorderColor: '#72BB53',
                            backgroundColor: '#fff',

                            hoverRadius: 6,
                            hoverBackgroundColor: '#72BB53',

                        },
                            {
                                label: 'Отзывы',
                                caption: 'отзывов',
                                data: randomData2,

                                fill: false,
                                borderColor: '#FFC959',
                                borderWidth: 2,

                                pointStyle: 'circle',
                                pointRadius: 6,
                                pointBorderColor: '#FFC959',
                                backgroundColor: '#fff',

                                hoverRadius: 6,
                                hoverBackgroundColor: '#FFC959',

                            }
                        ]
                    },
                    options: {
                        legendCallback: function(chart) {
                            var text = [];

                            for (var i=0; i<chart.data.datasets.length; i++) {


                                text.push('<span class="chartjs-legend"><span class="chartjs-legend__color" style="background-color:' + chart.data.datasets[i].borderColor + '"></span><span class="chartjs-legend__text">' + chart.data.datasets[i].label + '</span></span>');

                            }

                            return text.join("");
                        },


                        maintainAspectRatio: false,

                        legend: {
                            display: false,
                        },

                        tooltips: {
                            enabled: false,
                            mode: 'nearest',
                            intersect: false,
                            custom: customTooltips
                        },

                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    fontSize: 15,
                                    fontColor: '#999',
                                    padding: 15
                                },
                                gridLines: {
                                    drawBorder: false,
                                    color: '#ebebeb',
                                    zeroLineColor: '#ebebeb'
                                }

                            }],
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    fontSize: 15,
                                    fontColor: '#999',
                                    padding: 5,
                                    callback: function(dataLabel, index) {

                                        //- console.log(dataLabel);

                                        index ++
                                        return index === 1 || index === 5 || index === 10 || index === 15 || index === 20 || index === 25 || index === 30 ? parseInt(dataLabel) : '';
                                    }
                                },
                                gridLines: {
                                    display: false,
                                    color: '#ebebeb',
                                    zeroLineColor: '#ebebeb',
                                }
                            }]
                        }
                    }
                });


                document.getElementById("chart-legends").innerHTML = myChart.generateLegend();



            }



        });


        // --------------------------------------------------------------------------
        // Load Photoswipe
        // --------------------------------------------------------------------------

        loadCSS('/css/plugins/photoswipe.css');


        $script(['/js/photoswipe.js', '/js/photoswipe-ui-default.js'], function() {

            console.log('Loaded photoswipe');



            var openPhotoSwipe = function(id, array) {

                var pswpElement = document.querySelectorAll('.pswp')[0];

                // build items array
                var images = [
                    {
                        src: 'https://farm4.staticflickr.com/3894/15008518202_c265dfa55f_h.jpg',
                        msrc: 'https://farm4.staticflickr.com/3894/15008518202_b016d7d289_m.jpg',
                        w: 1600,
                        h: 1600
                    },
                    {
                        src: 'https://farm6.staticflickr.com/5591/15008867125_b61960af01_h.jpg',
                        msrc: 'https://farm6.staticflickr.com/5591/15008867125_68a8ed88cc_m.jpg',
                        w: 1600,
                        h: 1600
                    },
                    {
                        src: 'https://farm4.staticflickr.com/3902/14985871946_24f47d4b53_h.jpg',
                        msrc: 'https://farm4.staticflickr.com/3902/14985871946_86abb8c56f_m.jpg',
                        w: 1600,
                        h: 1600
                    },
                    {
                        src: 'https://farm6.staticflickr.com/5584/14985868676_b51baa4071_h.jpg',
                        msrc: 'https://farm6.staticflickr.com/5584/14985868676_4b802b932a_m.jpg',
                        w: 1600,
                        h: 1600
                    },
                    {
                        src: 'https://farm4.staticflickr.com/3920/15008465772_d50c8f0531_h.jpg',
                        msrc: 'https://farm4.staticflickr.com/3920/15008465772_383e697089_m.jpg',
                        w: 1600,
                        h: 1600
                    },

                    {
                        src: 'https://farm4.staticflickr.com/3894/15008518202_c265dfa55f_h.jpg',
                        msrc: 'https://farm4.staticflickr.com/3894/15008518202_b016d7d289_m.jpg',
                        w: 1600,
                        h: 1600
                    },
                    {
                        src: 'https://farm6.staticflickr.com/5591/15008867125_b61960af01_h.jpg',
                        msrc: 'https://farm6.staticflickr.com/5591/15008867125_68a8ed88cc_m.jpg',
                        w: 1600,
                        h: 1600
                    },
                    {
                        src: 'https://farm4.staticflickr.com/3902/14985871946_24f47d4b53_h.jpg',
                        msrc: 'https://farm4.staticflickr.com/3902/14985871946_86abb8c56f_m.jpg',
                        w: 1600,
                        h: 1600
                    },
                    {
                        src: 'https://farm6.staticflickr.com/5584/14985868676_b51baa4071_h.jpg',
                        msrc: 'https://farm6.staticflickr.com/5584/14985868676_4b802b932a_m.jpg',
                        w: 1600,
                        h: 1600
                    }
                ];

                var hotels = [
                    {
                        src: 'images/img-hotel-01.jpg',
                        msrc: 'images/img-hotel-01.jpg',
                        w: 550,
                        h: 400
                    },
                    {
                        src: 'images/img-hotel-02.jpg',
                        msrc: 'images/img-hotel-02.jpg',
                        w: 550,
                        h: 400
                    },
                    {
                        src: 'images/img-hotel-03.jpg',
                        msrc: 'images/img-hotel-03.jpg',
                        w: 550,
                        h: 400
                    },
                    {
                        src: 'images/img-hotel-04.jpg',
                        msrc: 'images/img-hotel-04.jpg',
                        w: 550,
                        h: 400
                    },
                    {
                        src: 'images/img-hotel-05.jpg',
                        msrc: 'images/img-hotel-05.jpg',
                        w: 550,
                        h: 400
                    },

                ];

                var photos = [
                    {
                        src: 'images/img-photo-page-01.jpg',
                        msrc: 'images/img-photo-page-01.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-02.jpg',
                        msrc: 'images/img-photo-page-02.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-03.jpg',
                        msrc: 'images/img-photo-page-03.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-04.jpg',
                        msrc: 'images/img-photo-page-04.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-05.jpg',
                        msrc: 'images/img-photo-page-05.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-06.jpg',
                        msrc: 'images/img-photo-page-06.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-07.jpg',
                        msrc: 'images/img-photo-page-07.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-08.jpg',
                        msrc: 'images/img-photo-page-08.jpg',
                        w: 218,
                        h: 218
                    },
                    {
                        src: 'images/img-photo-page-09.jpg',
                        msrc: 'images/img-photo-page-09.jpg',
                        w: 218,
                        h: 218
                    }

                ];


                var array = eval(array);


                // define options (if needed)
                var options = {
                    index: id,
                    history: false,
                    focus: false,
                    preloaderEl : true,
                    //- showAnimationDuration: 0,
                    getThumbBoundsFn: function(index) {

                        // See Options -> getThumbBoundsFn section of documentation for more info
                        var thumbnail = $('[data-photoswipe-id="' + index + '"]').find('img'), // find thumbnail
                            pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                            rect = thumbnail.get(0).getBoundingClientRect();

                        return {
                            x: rect.left,
                            y: rect.top + pageYScroll,
                            w: rect.width
                        };
                    }

                };

                var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, array, options);

                gallery.init();
            };


            $(document).on('click', '[data-photoswipe]', function(event) {
                event.preventDefault();
                var id = $(this).data('photoswipe-id'),
                    array = $(this).data('photoswipe-array');

                console.log(array)
                openPhotoSwipe(id, array);
            });




        });

        // --------------------------------------------------------------------------
        // Load Events - click, chenge
        // --------------------------------------------------------------------------


        function loadEvents() {


            console.log('Loaded events');



            // --------------------------------------------------------------------------
            // Modal
            // --------------------------------------------------------------------------

            $('.js-modal').fadeIn(400);

            $(document).on('click', '.js-modal-close', function(event) {
                event.preventDefault();
                $(this).closest('.js-modal').hide();
            });

            // --------------------------------------------------------------------------
            // Flag
            // --------------------------------------------------------------------------

            $(document).on('change', '.js-flag', function(event) {

                if ( $(this).is(':checked') ) {
                    $(this).closest('.panel__photo, .panel__comment, .panel__renewal').addClass('is-flag');
                } else {
                    $(this).closest('.panel__photo, .panel__comment, .panel__renewal').removeClass('is-flag');
                }

            });

            // --------------------------------------------------------------------------
            // Scrolltop
            // --------------------------------------------------------------------------

            var scrollPos = 0;

            $(document).on('click', '.js-scrolltop', function(event) {


                event.preventDefault();

                var t = t || $(this), scrollPosCurrent = $(window).scrollTop();

                // Запоминаем позицию при скролле вверх, и если кнопка нажата ещё раз - скроллим обратно


                if (scrollPosCurrent === 0)
                {
                    if (scrollPos > 0)
                    {
                        $('html, body').animate({
                            scrollTop: scrollPos
                        }, 300);

                        scrollPos = 0;

                    }
                }
                else
                {
                    scrollPos = scrollPosCurrent;

                    $('html, body').animate({
                        scrollTop: 0
                    }, 300);

                }


            });

            // --------------------------------------------------------------------------
            // Themes
            // --------------------------------------------------------------------------

            var loadTheme = function(url, callback){
                var link = document.createElement('link');
                link.type = 'text/css';
                link.rel = 'stylesheet';
                link.href = url;

                document.getElementsByTagName('body')[0].appendChild(link);

                var img = document.createElement('img');
                img.onerror = function(){
                    if(callback) callback(link);
                }
                img.src = url;
            }

            var themeDark = false;
            var themeBlind = false;

            $(document).on('click', '.js-theme-dark', function(event) {
                event.preventDefault();

                jhtml.removeClass('is-theme-blind').toggleClass('is-theme-dark');
                jwindow.trigger('resize');

                if( themeDark == false) {

                    $('.js-theme-dark').addClass('is-loading');


                    loadTheme('/css/themes/theme-dark.css', function(){
                        $('.js-theme-dark').removeClass('is-loading');
                        themeDark = true;
                    });

                }


            });

            $(document).on('click', '.js-theme-blind', function(event) {
                event.preventDefault();

                jhtml.removeClass('is-theme-dark').toggleClass('is-theme-blind');
                jwindow.trigger('resize');


                if( themeBlind == false) {

                    $('.js-theme-blind').addClass('is-loading');

                    loadTheme('/css/themes/theme-blind.css', function(){
                        $('.js-theme-blind').removeClass('is-loading');
                        themeBlind = true;
                    });

                }


            });


            //- if ( $('html').is('.is-theme-brand') ) {
            //- loadCSS('/css/themes/theme-brand.css');
            //- loadTheme('/css/themes/theme-brand.css');
            //- }




            // --------------------------------------------------------------------------
            // Nav
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-nav-btn', function(event) {
                event.preventDefault();
                var t = t || $(this);
                toggleElementClass(t, '.js-nav');
            });

            // --------------------------------------------------------------------------
            // Collapse
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-collapse-btn', function(event) {

                event.preventDefault();

                var t = t || $(this);
                if ( t.closest('.js-collapse').find('.js-collapse-content').is(':visible') ) {

                    t.closest('.js-collapse').removeClass('is-open').find('.js-collapse-content').slideUp('150');

                } else {
                    t.closest('.js-collapse').addClass('is-open').find('.js-collapse-content').slideDown('150');
                }

            });


            // --------------------------------------------------------------------------
            // Toggle
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-toggle-btn', function(event) {
                event.preventDefault();
                var t = t || $(this);

                toggleElementClass(t, '.js-toggle');
            });



            $(document).on('click', function (event) {
                if ($(event.target).closest('.js-toggle').length === 0)
                {
                    $('.js-toggle').removeClass('is-open');
                }
            });

            // --------------------------------------------------------------------------
            // Cookies
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-cookies-trigger', function(event) {
                event.preventDefault();

                if ( $(this).closest('.js-cookies').is('.is-open')) {

                    $(this).closest('.js-cookies').removeClass('is-open').find('.js-cookies-dropdown').slideUp('fast');

                } else {

                    $(this).closest('.js-cookies').addClass('is-open').find('.js-cookies-dropdown').slideDown('fast');

                }
            });


            $(document).on('click', '.js-cookies-hide', function(event) {

                event.preventDefault();
                $(this).closest('.js-cookies').addClass('is-hide');

            });

            // --------------------------------------------------------------------------
            // Tabs
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-tabs-btn', function(event) {
                event.preventDefault();
                var t = t || $(this),
                    jtabs = jtabs || t.closest('.js-tabs'),
                    tabsIndex = tabsIndex || t.closest('li').index();

                jtabs.find('.js-tabs-btn').removeClass('is-active').eq(tabsIndex).addClass('is-active');
                jtabs.find('.js-tabs-content').removeClass('is-active').eq(tabsIndex).addClass('is-active');

            });


            // --------------------------------------------------------------------------
            // Tabs ID
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-tabsid-btn', function(event) {
                event.preventDefault();

                var tab = $(this),
                    tab_id = $(this).attr('data-tabs-btn');



                if ( $(this).is('.is-active') ) {

                    $(this).closest('.js-tabsid').find('.js-tabsid-btn').removeClass('is-active');
                    $(this).closest('.js-tabsid').find('.js-tabsid-content').removeClass('is-active');


                } else {

                    $(this).closest('.js-tabsid').find('.js-tabsid-btn').removeClass('is-active');
                    $(this).closest('.js-tabsid').find('.js-tabsid-content').removeClass('is-active');

                    $(this).closest('.js-tabsid').find('[data-tabs-btn=' + tab_id + ']').addClass('is-active');
                    $(this).closest('.js-tabsid').find('[data-tabs-content=' + tab_id + ']').addClass('is-active');

                }


                //- $(this).closest('.js-tabsid').find('.js-tabsid-btn').removeClass('is-active');
                //- $(this).closest('.js-tabsid').find('.js-tabsid-content').removeClass('is-active');





            });


            // --------------------------------------------------------------------------
            // Answers
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-answers-btn', function(event) {
                event.preventDefault();
                var t = t || $(this);

                toggleElementClass(t, '.js-answers');

            });

            // --------------------------------------------------------------------------
            // Pin
            // --------------------------------------------------------------------------


            $(document).on('change', '.js-pin-btn', function() {
                var t = t || $(this);

                if ( t.is(':checked') ) {
                    t.prop('checked', true).closest('.js-pin').addClass('is-open').find('.js-pin-content').slideDown('250');
                    pined();

                } else {
                    t.prop('checked', false).closest('.js-pin').removeClass('is-open').find('.js-pin-content').slideUp('250');
                    unpined();
                }

            });

            $(document).on('change', '.js-pin-input', function() {
                pined();
            });

            function pined() {
                var days  = $('.js-pin-input:checked').data('days'),
                    notice = $('.js-pin-input:checked').data('notice');

                $('.js-pin-notice').text(notice);
                $('.js-pin-text').text(' + Закрепить на ' + days);
            }

            function unpined() {
                $('.js-pin-text').text('');
            }

            // --------------------------------------------------------------------------
            // Ellipsis
            // --------------------------------------------------------------------------

            $('.js-ellipsis').each(function(){

                var t = t || $(this);

                t.html('<span style>' + t.text() + '</span>');

                t.hover(function(){

                    var speed  = 250,
                        length = t.find('span').width() - t.width(),
                        time   = length/speed;

                    t.find('span').css('transition', 'left ' + time + 's linear').css('left', '-' + length + 'px');

                }, function(){

                    t.find('span').attr('style', '');

                });
            });


            //- // --------------------------------------------------------------------------
            //- // Sorting
            //- // --------------------------------------------------------------------------

            //- $(document).on('click', '.js-sorting-btn', function(event) {
            //-     event.preventDefault();
            //-     var t = t || $(this);

            //-     if ( t.closest('.js-sorting').is('.is-open') ) {

            //-         t.closest('.js-sorting').removeClass('is-open');

            //-     } else {

            //-         t.closest('.js-sorting').addClass('is-open');

            //-     }
            //- });


            // --------------------------------------------------------------------------
            // Clickwall
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-clickwall-btn', function(event) {
                event.preventDefault();
                var t = t || $(this);

                if ( t.closest('.js-clickwall').is('.is-open') ) {

                    t.closest('.js-clickwall').removeClass('is-open');

                } else {

                    t.closest('.js-clickwall').addClass('is-open');

                }
            });

            // --------------------------------------------------------------------------
            // Notice
            // --------------------------------------------------------------------------


            $(document).on('click', '.js-notice-btn, .js-notice-close', function(event) {
                event.preventDefault();
                var t = t || $(this);

                if ( t.closest('.js-notice').is('.is-closed') ) {

                    t.closest('.js-notice').removeClass('is-closed');

                } else {

                    t.closest('.js-notice').addClass('is-closed');

                }
            });


            // --------------------------------------------------------------------------
            // Accordion
            // --------------------------------------------------------------------------



            $(document).on('click', '.js-accordion-btn', function(event) {
                event.preventDefault();

                if ( $(this).closest('.js-accordion-item').is('.is-open') ) {
                    $(this).closest('.js-accordion-item').removeClass('is-open').children('.js-accordion-content').slideUp('fast');
                } else {
                    $(this).closest('.js-accordion-item').addClass('is-open').children('.js-accordion-content').slideDown('fast')
                }
            });


            // --------------------------------------------------------------------------
            // Search
            // --------------------------------------------------------------------------


            $('.js-search-input').on('input', function(event) {

                var searchValue  = this.value.toLowerCase(),
                    searchLength = this.value.length;

                if (searchLength >= 1) {

                    $('html').addClass('is-search-open');

                } else {

                    $('html').removeClass('is-search-open');
                }

            }).on('focusout', function(event){

                $('html').removeClass('is-search-open');

            });




            // --------------------------------------------------------------------------
            // Toggle
            // --------------------------------------------------------------------------

            $(document).on('click', '.js-selection-btn', function(event) {
                event.preventDefault();

                if ( $(this).closest('.js-selection').is('.is-open') ) {

                    $(this).closest('.js-selection').removeClass('is-open');

                } else {
                    $('.js-selection').removeClass('is-open');
                    $(this).closest('.js-selection').addClass('is-open');
                }

            });

            $(document).on('click', '.js-selection-option', function(event) {
                event.preventDefault();

                var selected = $(this).text();

                $(this).closest('.js-selection').addClass('is-changed');
                $(this).closest('.js-selection').find('.js-selection-text').text(selected);

            });

            $(document).on('click', function (event) {
                if ($(event.target).closest('.js-selection').length === 0) {
                    $('.js-selection').removeClass('is-open');
                }
            });


            // --------------------------------------------------------------------------
            // Worktime
            // --------------------------------------------------------------------------

            $(document).on('change', '.js-worktime-checkbox', function(event) {

                if ( $(this).is(':checked') ) {
                    $(this).closest('.js-worktime').addClass('is-active');
                } else {
                    $(this).closest('.js-worktime').removeClass('is-active');
                    $(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
                    $(this).closest('.js-worktime').find('.js-worktime-content').hide();
                }

            });



            $(document).on('click', '.js-worktime-btn', function(event) {
                event.preventDefault();
                var targetId = $(this).data('target');

                $(this).closest('.js-worktime').find('.js-worktime-content').hide();

                if ( $(this).is('.is-active') ) {
                    $(this).removeClass('is-active');
                } else {
                    $(this).closest('.js-worktime').find('.js-worktime-btn').removeClass('is-active');
                    $(this).addClass('is-active');
                    $(this).closest('.js-worktime').find(targetId).show();
                }

            });


            $(document).on('click', '.js-worktime-comment-btn, .js-worktime-comment-cancel', function(event) {
                event.preventDefault();

                if ( $(this).closest('.js-worktime-comment').is('.is-open') ) {

                    $(this).closest('.js-worktime-comment').removeClass('is-open');

                } else {

                    $(this).closest('.js-worktime-comment').addClass('is-open');
                }

            });




        }

        loadEvents();


        // --------------------------------------------------------------------------
        // Load Yandex Map
        // --------------------------------------------------------------------------

        $script('https://api-maps.yandex.ru/2.1/?lang=ru_RU', function() {

            console.log('Loaded YandexMap');

            ymaps.ready(initMaps);

            function initMaps(){

                if ( $('#map').length ) {

                    var myMap = new ymaps.Map('map', {
                        center: [59.992309, 30.206468],
                        zoom: 15,
                        controls: []
                    });

                    myMap.behaviors.disable('scrollZoom');

                }

                if ( $('#mapRoute').length ) {

                    var myMap = new ymaps.Map('mapRoute', {
                        center: [59.992309, 30.206468],
                        zoom: 15,
                        controls: []
                    });

                    myMap.behaviors.disable('scrollZoom');




                }


                if ( $('#mapDrag').length ) {

                    var myMap = new ymaps.Map('mapDrag', {
                            center: [59.992309, 30.206468],
                            zoom: 15,
                            controls: []
                        },
                        {
                            iconLayout: 'islands#icon',
                            iconColor: '#ED4543',
                        });

                    myMap.behaviors.disable('scrollZoom');

                    var myGeoObject = new ymaps.GeoObject({
                        geometry: {
                            type: "Point",
                            coordinates: [59.992309, 30.206468]
                        }
                    }, {
                        draggable: true
                    });


                    myMap.geoObjects.add(myGeoObject);

                }


                if ( $('#mapSearch').length ) {


                    // Создаем карту
                    var myMap = new ymaps.Map('mapSearch', {
                        center: [59.929624, 30.323130],
                        zoom: 10,
                        controls: []
                    });


                    var zoomControl = new ymaps.control.ZoomControl({
                        options: {
                            size: "large",
                            position: {
                                top: 20,
                                left: 'auto',
                                right: 20
                            }
                        }
                    });
                    myMap.controls.add(zoomControl);

                    // Отключаем zoom
                    myMap.behaviors.disable('scrollZoom');


                    // Создаем кастомный baloon
                    var MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
                        '<div class="map__marker">' +
                        '<div class="map__marker-baloon map__marker-baloon--$[properties.balloonType]">' +
                        '<span class="map__marker-close"></span>' +
                        '$[[options.contentLayout observeSize minWidth=210 maxWidth=210 maxHeight=350]]' +
                        '</div>' +
                        '</div>', {
                            /**
                             * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                             * @function
                             * @name build
                             */
                            build: function () {
                                this.constructor.superclass.build.call(this);

                                this._$element = $('.map__marker', this.getParentElement());

                                this.applyElementOffset();

                                this._$element.find('.map__marker-close').on('click', $.proxy(this.onCloseClick, this));

                            },

                            /**
                             * Удаляет содержимое макета из DOM.
                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                             * @function
                             * @name clear
                             */
                            clear: function () {
                                this._$element.find('.map__marker-close').off('click');

                                this.constructor.superclass.clear.call(this);
                            },

                            /**
                             * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                             * @function
                             * @name onSublayoutSizeChange
                             */
                            onSublayoutSizeChange: function () {
                                MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                                if(!this._isElement(this._$element)) {
                                    return;
                                }

                                this.applyElementOffset();

                                this.events.fire('shapechange');
                            },

                            /**
                             * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                             * @function
                             * @name applyElementOffset
                             */
                            applyElementOffset: function () {
                                //- this._$element.css({
                                //- 	left: -(this._$element[0].offsetWidth / 2),
                                //- 	top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
                                //- });
                            },

                            /**
                             * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                             * @function
                             * @name onCloseClick
                             */
                            onCloseClick: function (e) {
                                e.preventDefault();
                                this.events.fire('userclose');
                            },

                            /**
                             * Используется для автопозиционирования (balloonAutoPan).
                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
                             * @function
                             * @name getClientBounds
                             * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
                             */
                            getShape: function () {
                                if(!this._isElement(this._$element)) {
                                    return MyBalloonLayout.superclass.getShape.call(this);
                                }

                                var position = this._$element.position();

                                return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                                    [position.left, position.top], [
                                        position.left + this._$element[0].offsetWidth,
                                        position.top + this._$element[0].offsetHeight
                                    ]
                                ]));
                            },

                            /**
                             * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                             * @function
                             * @private
                             * @name _isElement
                             * @param {jQuery} [element] Элемент.
                             * @returns {Boolean} Флаг наличия.
                             */
                            _isElement: function (element) {
                                //- return element && element[0] && element.find('.arrow')[0];
                            }
                        });



                    // Создание вложенного макета содержимого балуна

                    var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                        '<span class="map__marker-title">' +
                        '<a href="$[properties.balloonLink]" class="ui-link ui-link--underline ui-link--blue">$[properties.balloonTitle]</a>' +
                        '</span>' +
                        '<ul class="map__marker-rating">' +
                        '<li>' +
                        '<span class="ui-badge ui-badge--$[properties.balloonRatingColor]">$[properties.balloonRating]</span>' +
                        '</li>' +
                        '<li>$[properties.balloonRatingCount]</li>' +
                        '</ul>' +
                        '<span class="map__marker-phone">$[properties.balloonPhone]</span>' +
                        '<span class="map__marker-address">$[properties.balloonAddress]</span>'
                    );

                    // Добавляем маркеры
                    var markers = [
                        {
                            id: 1,
                            location: {
                                lat : 59.929624,
                                lng : 30.323130
                            },
                            type: 'white',
                            link: '#',
                            title: 'Форт — Агентство недвижимости',
                            rating: '4.8',
                            ratingCount: '190 отзывов',
                            ratingColor: 'greenlight',
                            phone: '+7 (953) 25-11-135',
                            address: 'Санкт-Петербург, Яхтенный проезд, 9к1, оф. 127'

                        },
                        {
                            id: 2,
                            location: {
                                lat : 60.012426,
                                lng : 30.243111
                            },
                            type: 'green',
                            link: '#',
                            title: 'Хабнер & Ко  —   Многопрофильная фирма',
                            rating: '4.3',
                            ratingCount: '42 отзывов',
                            ratingColor: 'greenlight',
                            phone: '+7 (953) 25-11-135',
                            address: 'Луначарского, 3/2, 308 офис (3 этаж, БЦ Луначарский)  '
                        },
                        {
                            id: 3,
                            location: {
                                lat : 59.896695297732755,
                                lng : 30.479307458984263
                            },
                            type: 'red',
                            link: '#',
                            title: 'Хабнер & Ко  —   Многопрофильная фирма',
                            rating: '4.3',
                            ratingCount: '42 отзывов',
                            ratingColor: 'red',
                            phone: '+7 (953) 25-11-135',
                            address: 'Луначарского, 3/2, 308 офис (3 этаж, БЦ Луначарский)  '
                        },
                        {
                            id: 4,
                            location: {
                                lat : 59.824862020315265,
                                lng : 30.310392664062384
                            },
                            type: 'orange',
                            link: '#',
                            title: 'Форт — Агентство недвижимости',
                            rating: '4.8',
                            ratingCount: '190 отзывов',
                            ratingColor: 'orange',
                            phone: '+7 (953) 25-11-135',
                            address: 'Санкт-Петербург, Яхтенный проезд, 9к1, оф. 127'

                        }
                    ];

                    for(var i = 0; i < markers.length; i++ ) {


                        var myPlacemark = new ymaps.Placemark([markers[i].location.lat, markers[i].location.lng], {
                            balloonType: markers[i].type,
                            balloonLink: markers[i].link,
                            balloonTitle: markers[i].title,
                            balloonRating: markers[i].rating,
                            balloonRatingCount: markers[i].ratingCount,
                            balloonRatingColor: markers[i].ratingColor,
                            balloonPhone: markers[i].phone,
                            balloonAddress: markers[i].address,
                        }, {
                            // Опции.
                            // Необходимо указать данный тип макета.
                            iconLayout: 'islands#icon',
                            iconColor: '#ED4543',
                            // Своё изображение иконки метки.
                            //- iconImageHref: 'images/icon-location.svg',
                            // Размеры метки.
                            //- iconImageSize: [17, 22],
                            // Смещение левого верхнего угла иконки относительно
                            // её "ножки" (точки привязки).
                            //- iconImageOffset: [-16, -40],
                            // Смещение слоя с содержимым относительно слоя с картинкой.
                            //- iconContentOffset: [15, 15],
                            // Макет содержимого.
                            //- iconContentLayout: MyIconContentLayout,
                            hideIconOnBalloonOpen: false,

                            balloonShadow: false,
                            balloonLayout: MyBalloonLayout,
                            balloonContentLayout: MyBalloonContentLayout,
                            balloonPanelMaxMapArea: 0
                        });


                        myMap.geoObjects.add(myPlacemark);

                        // Открываеи нужный Baloon
                        if( markers[i].id == 1) {
                            myPlacemark.balloon.open();
                        }

                    }



                }

            }
        });

    });