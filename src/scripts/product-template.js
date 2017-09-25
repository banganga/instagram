/*******************************************************************************
    Product page section
  *****************************************************************************/

theme.ProductImagesSlider = (function() {
  this.$sliderThumbs = null;
  this.$sliderImage = null;

  var classes = {
    thumbs: 'js-product-thumbs',
    image: 'js-product-image'
  };

  function productImagesSlider(el) {
    $wrapper = $(el);
    if ($wrapper.hasClass('product-images--single')) {
      return false;
    }

    var sliderId = $wrapper.attr('id');
    this.$sliderThumbs = $wrapper.find('.' + classes.thumbs);
    this.$sliderImage = $wrapper.find('.' + classes.image);
    this.thumbsSettings = {
      slidesToShow: 4,
      slidesToScroll: 1,
      asNavFor: '#' + sliderId + ' .' + classes.image,
      dots: false,
      arrows: this.$sliderThumbs.data('arrows'),
      centerMode: false,
      focusOnSelect: true,
      vertical: verticalDirection,
      verticalSwiping: true
    };
    this.imageSettings = {
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: this.$sliderImage.data('arrows'),
      dots: false,
      fade: true,
      asNavFor: '#' + sliderId + ' .' + classes.thumbs,
      swipe: false,
      swipeToSlide: false,
    };

    var imageHeight = this.$sliderImage.height();
    //this.$sliderThumbs.css({'max-height': imageHeight + 'px'});
    this.$sliderThumbs.slick(this.thumbsSettings);
    this.$sliderImage.slick(this.imageSettings);
  }

  return productImagesSlider;
})();

theme.RelatedProductsSlider = (function() {
  this.$relSlider = null;
  var classes = {
    wrapper: 'slider-wrapper',
    slider: 'slider',
    currentSlide: 'slick-current'
  };

  function slider(el) {
    this.$relSlider = $(el);

    this.settings = {
      dots: false,
      fade: false,
      speed: 500,
      infinite: true,
      speed: 300,
      slidesToShow: 3,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
    };

    this.$relSlider.slick(this.settings);
  }

  return slider;
})();

theme.ProductPageSection = (function() {

  function ProductPageSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var _self = this;

    this.theProduct = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);

    this.settings = {
      sectionId: sectionId,
      enableHistoryState: $container.data('enable-history-state') || false,
    };

    this.selectors = {
      originalSelectorId: '#ProductSelect-' + sectionId,
      singleOptionSelector: '.product-options__selector-' + sectionId,
      addToCart: '#' + sectionId + ' .product-info .product-form__cart-submit',
      addToCartText: '#' + sectionId + ' .product-info .product-form__cart-submit-text',
      productPrices: '.product-info .product-price',
      originalPrice: '.product-info .product-price__price',
      comparePrice: '.product-info .product-price__old',
      discountPercent: '.product-info .product-price__percent',
      salePriceWrapper: '.product-info .product-price__sale',
      SKU: '.variant-sku',
      qty: '.variant-qty',
      inPageCartButton: '#' + sectionId + ' .product-form__cart',
      stickyBtnStart: '#' + sectionId + ' .js-sticky-btn-start',
      stickyCartButton: '#' + sectionId + ' .product-form__cart--sticky',
      stickyCartButtonText: '#' + sectionId + ' .product-form__cart--sticky button > span.btn-text',
      cartFormMobile: '#' + sectionId + ' .product-form--mobile',
      readMoreBtn: '.product-template .product-info__more',
      productDescription: '.product-template .product-info__description',
      productFullDescription: '.product-template .product-info__full_description',
      accordion: '#' + sectionId + ' .accordion',
      productInfo: '.product-info',
      productVariants: '.content-product-variants',
      productInfoDesktop: '.product-info-desktop',
      addToCartBar: '.product-add-to-cart-bar ',
      addToCartBarBtn: '.product-add-to-cart-bar .btn--add-to-cart',
      addToCartBarBtnText: '.product-add-to-cart-bar .btn--add-to-cart .product-form__cart-submit-text',
      addToCartBarPrice: '.product-add-to-cart-bar .product-price',
      countDownOffer: '.countdown-offer-clock'
    };

    // Thumbs & Slider
    var slider = this.slider = '#' + sectionId + '_images';
    theme.sliders[slider] = new theme.ProductImagesSlider(slider);

    var relSlider = this.relSlider = '#slider_related-products';
    theme.sliders[relSlider] = new theme.RelatedProductsSlider(relSlider);
    theme.productCardsInit($container);

    // Zoom image
    if (turnOnZoom == true) {
      $('.product-images--single .product-images__image, .product-images__image li').each(function(idx, el) {
        var $img = $(el).find('img');
        if(theme.isMobile()) {
          new PinchZoom($img[0], {});
        } else {
          $(el).zoom({ on: $img.data('zoom-type'), url: $img.data('original') });
        }
      });
    }

    $('#tab-container').easytabs();

    // Switch image when variant is changed
    this._initVariants();
    // Switch variant when image is changed
    if (theme.sliders[this.slider].$sliderImage) {
      var $imgSlider = theme.sliders[this.slider].$sliderImage;
      $imgSlider.on('beforeChange', this._matchVariantForCurrentSlide.bind(this));

      // Sometimes the first slide/image does not correspond to selected variant
      // if images was re-ordered. So make sure to adjust variant selectors to 0-position slide
      setTimeout(function(){
        _self._matchVariantForCurrentSlide(null, null, 1, 0);
      }, 500);
    }

    this._stickyCartBtn();
    this._removeReviewsDuplicate();
    theme.initSwatches();
    this._initAccordion();
    this._initCountDownOffer();
    this._productReviews();
    // The following function requires page to be loaded,
    // because it calculates its height. So deleay it for 3 seconds
    setTimeout(function(){
      _self._readMore();
    }, 3000);
  }

  return ProductPageSection;
})();

theme.ProductPageSection.prototype = _.extend({}, theme.ProductPageSection.prototype, {

  onLoad: function() {
    if (_.isFunction(ajaxCart.qtySelectors)) {
      ajaxCart.qtySelectors();
    }
    this._initAddToCartStickyBar();
  },

  onUnload: function() {
    delete theme.sliders[this.slider];
    delete theme.sliders[this.relSlider];
    $(document).off('touchmove.track-add-to-cart-btn');
    $(document).off('scroll.track-add-to-cart-btn');
  },

  _stickyCartBtn: function() {
    if ($(this.selectors.stickyCartButton).length > 0) {
      if($('.product-template').data('lock-atc-btn') === true){
        var $stickyBtn = $(this.selectors.stickyCartButton);
        $stickyBtn.addClass('stuck');
      }else{
        //this._trackScrolling();
        $(document).on('scroll.track-add-to-cart-btn', this._trackScrolling.bind(this));
        $(document).on('touchmove.track-add-to-cart-btn', this._trackScrolling.bind(this));
      }
      $(this.selectors.stickyCartButton).on('click', this._submitCartForm.bind(this));
    }
  },

  _submitCartForm: function() {
    $(this.selectors.cartFormMobile).trigger('submit');
  },

  _trackScrolling: function() {
    // only for mobile
    if (theme.cache.$body.width() <= 767) {
      var $stickyBtn = $(this.selectors.stickyCartButton);
      var startPosition = $(this.selectors.stickyBtnStart).position();
      var distanceYBottom = window.pageYOffset + theme.cache.$window.height();
      var stickAt = distanceYBottom;

      if (startPosition.top <= stickAt) {
        $stickyBtn.addClass('stuck');
      } else {
        $stickyBtn.removeClass('stuck');
      }
    }
  },

  _initVariants: function() {
    var options = {
      $container: this.$container,
      enableHistoryState: this.$container.data('enable-history-state') || false,
      singleOptionSelector: this.selectors.singleOptionSelector,
      originalSelectorId: this.selectors.originalSelectorId,
      product: this.theProduct
    };

    this.variants = new theme.Variants(options);

    this.$container.on('variantChange', this._updateAddToCart.bind(this));
    this.$container.on('variantImageChange', this._switchImage.bind(this));
    this.$container.on('variantPriceChange', this._updatePrice.bind(this));
    this.$container.on('variantSKUChange', this._updateSKU.bind(this));
  },

  _updateAddToCart: function(evt) {
    var variant = evt.variant;
    var qty;
    var self = this;

    if (variant) {
      this.$container.find(this.selectors.productPrices).removeClass('visibility-hidden');

      //Update Add to cart bar
      $(this.selectors.addToCartBarPrice).removeClass('visibility-hidden').css('width', 'auto');

      if (variant.available) {
        updateATCButtons(false, backend.strings.addToCart)
      } else {
        updateATCButtons(true, backend.strings.soldOut)
      }

      // Update left in stock label
      if (variant.inventory_quantity > 0) {
        qty = variant.inventory_quantity;
      } else {
        if (variant.available) {
          qty = 1;
        } else {
          qty = 0;
        }
      }

      this.$container.find(this.selectors.qty).html(qty);

      // There are two separated variant selectors for mobile and desktop
      // So it needs to be updated manually
      $(this.selectors.originalSelectorId + '--desktop').val(variant.id)

    } else {
      // The variant doesn't exist
      updateATCButtons(true, backend.strings.unavailable)
      this.$container.find(this.selectors.productPrices).addClass('visibility-hidden');
      $(this.selectors.addToCartBarPrice).addClass('visibility-hidden').css('width', 0); //add to cart bar
      this.$container.find(this.selectors.qty).html('-');
    }
    /**
     * Update ALL Add to Cart buttons
     * @param disabled
     * @param text
     */
    function updateATCButtons(disabled, text) {
      $(self.selectors.addToCart).prop('disabled', disabled);
      $(self.selectors.addToCartText).text(text);

      // Update mobile sticky button
      $(self.selectors.stickyCartButton).find('button').prop('disabled', disabled);
      $(self.selectors.stickyCartButtonText).text(text);

      //Update Add to cart bar
      $(self.selectors.addToCartBarBtn).prop('disabled', disabled)
      $(self.selectors.addToCartBarBtnText).text(text);
    }


  },

  _switchImage: function(evt) {
    var variant = evt.variant;
    var $productImagesSlider = theme.sliders[this.slider];
    var slideIdx;
    if (variant.featured_image) {
      slideIdx = this._getSlideIndexForVariant($productImagesSlider, variant);
      if (slideIdx || slideIdx == 0) {
        $productImagesSlider.$sliderImage.slick('slickGoTo', slideIdx);
      }
    }
  },

  _matchVariantForCurrentSlide: function(event, slick, currentSlide, nextSlide) {
    var variant = this._getVariantBySlideIndex(nextSlide);

    if (!variant) { return false; }

    var variantSelector = $(this.selectors.originalSelectorId);
    var _self = this;
    if (variantSelector.val() != variant.id) {
      _.each(variant.options, function(opt, idx) {
        var optIdx = idx + 1;
        var optName = 'option-' + optIdx;
        // If swatches
        var $swatches = _self.$container.find('.swatches[data-index=' + optIdx + ']');
        if ($swatches.length > 0) {
          $swatches.find('input[name=' + optName + ']').each(function(idx, el) {
            if ($(el).val() == opt) {
              $(el).trigger('click');
              return true;
            }
          });
        } else {
          $dropdown = _self.$container.find('.product-options__selector[data-index=option' + optIdx + ']');
          $dropdown.val(opt).trigger('change');
          return true;
        }
      });
    }

  },

  _getSlideIndexForVariant: function($slider, variant) {
      var index;
      var $slides = $slider.$sliderThumbs.find('.slick-slide:not(.slick-cloned)');
      $slides.each(function(idx, slide){
        // find image position in slider
        if (!index && $(slide).find('img[data-id=' + variant.featured_image.id + ']').length > 0) {
          index = idx;
          return false;
        }
      });
      return index;
  },

  _getVariantBySlideIndex: function(index) {
    var $slider = theme.sliders[this.slider].$sliderThumbs;
    var slide = $slider.find('.slick-slide:not(.slick-cloned)')[index];
    var imageId, variant;
    if (slide) {
      imageId = $(slide).find('img:first').data('id');
      variant = _.find(this.theProduct.variants, function(variant){
        return variant.featured_image && variant.featured_image.id == imageId
      });
    }
    return variant;
  },

  _updatePrice: function(evt) {
    var variant = evt.variant;
    var variantPrice = theme.Currency.formatMoney(variant.price, backend.moneyFormat),
        $pricesRef,
        $inCurrency,
        compareAtPriceInCurrency;

    // Convert currency when price is changed after changing variant
    var isCurrencyEnabled = (new String("{{settings.show_multiple_currencies}}")) == "true";
    if (isCurrencyEnabled) {
      $pricesRef = this.$container.find(".product-variant-prices-ref");
      inCurrency = $pricesRef.find("[data-variant-id=" + variant.id + "]").html();
      if (inCurrency) {
        // price|compare_at_price
        inCurrencyParts = inCurrency.split("|");
        variantPrice = inCurrencyParts[0];
        compareAtPriceInCurrency = inCurrencyParts[1];
      }
    }

    // Update the product price
    this.$container.find(this.selectors.originalPrice).html(variantPrice);

    // Update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      var discountPercent = Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price);
      if (!compareAtPriceInCurrency) {
        compareAtPriceInCurrency = theme.Currency.formatMoney(variant.compare_at_price, backend.moneyFormat);
      }
      this.$container.find(this.selectors.comparePrice).html(compareAtPriceInCurrency);
      this.$container.find(this.selectors.discountPercent).html('-' + discountPercent + '%');
      this.$container.find(this.selectors.salePriceWrapper).removeClass('hide');
    } else {
      this.$container.find(this.selectors.salePriceWrapper).addClass('hide');
    }
  },

  _updateSKU: function(evt) {
    var variant = evt.variant;
    // Update the sku
    this.$container.find(this.selectors.SKU).html(variant.sku);
  },

  // Initialize read more button to expand/collapse hidden text
  // do not truncate if the hidden part is going to be too small
  _readMore: function() {
    var minToHide = '20'; // percent
    this.$description = $(this.selectors.productDescription);
    this.descriptionHeight = Number($(this.selectors.productFullDescription).height());
    var blockHeight = this.$description.height();
    var hasDescription = this.descriptionHeight > 0;
    var hasEnoughToHide = hasDescription && (100 - blockHeight / (this.descriptionHeight / 100)) > minToHide;

    if (theme.isDesktop()) {
      this.descriptionHeight = null;
      this._disableReadMore();
    } else if (hasDescription && hasEnoughToHide) {
      this.$readMoreBtn = $(this.selectors.readMoreBtn);
      $(this.selectors.readMoreBtn).on('click', this._toggleReadMore.bind(this));
    } else {
      this._disableReadMore();
    }
  },

  _toggleReadMore: function() {
    if (this.$description.hasClass('product-info__description--shrunk')) {
      this._expandDescription();
    } else {
      this._collapseDescription();
   }
  },

  _expandDescription: function() {
    this.$description.animate({'height': this.descriptionHeight + 'px'}, 300)
                     .removeClass('product-info__description--shrunk');
    $(this.selectors.readMoreBtn).find('.icon').removeClass('icon-chevron-thin-down')
                                               .addClass('icon-chevron-thin-up');
  },

  _collapseDescription: function() {
    theme.smoothScroll(this.$description, 300, -120);
    this.$description.animate({'height': this.$description.data('original-height')}, 300)
                     .addClass('product-info__description--shrunk');
    $(this.selectors.readMoreBtn).find('.icon').removeClass('icon-chevron-thin-up')
                                               .addClass('icon-chevron-thin-down');
  },

  _disableReadMore: function() {
    if (this.descriptionHeight) {
      this.$description.css('height', this.descriptionHeight + 20 + 'px');
    } else {
      this.$description.css('height', '100%');
    }
    this.$description.removeClass('product-info__description--shrunk');
    $(this.selectors.readMoreBtn).remove();
  },

  _removeReviewsDuplicate: function() {
    // As #shopify-product-reviews must be unique block for the page
    // we delete its duplicate depending on which version loaded
    // TODO: I think there might be a race condition in mobile version
    if (theme.cache.$body.width() <= 767) {
      $('.medium-down--hide .js-delete--mobile').remove();
    } else {
      $('.large--hide .js-delete--desktop').remove();
    }
  },

  _initAccordion: function() {
    var $accordion = $(this.selectors.accordion);
    var $allPanels = $accordion.find('dd').hide();
    var $firstTab = $(this.selectors.accordion + ' > dt:first-child').next();
    if ($firstTab.data("closed") != true) {
      $firstTab.addClass('active').slideDown();
    }
    $(this.selectors.accordion + ' > .accordion__tab-title').click(function() {
      $this = $(this);
      $target =  $this.next();
      if($target.hasClass('active')){
        $target.removeClass('active').slideUp();
      } else {
        if (theme.cache.$body.scrollTop() > $accordion.offset().top) {
          theme.smoothScroll($accordion, 1000);
        }
        $allPanels.removeClass('active').slideUp();
        $target.addClass('active').slideDown();
      }
      return false;
    });
  },

  _initAddToCartStickyBar: function() {
    if($('#product-add-to-cart-bar').length != 0){

      var $window = $(window),
          $addToCartBarBtn = $(this.selectors.productInfoDesktop).find('.product-form__cart-submit'),
          addToCartBtnOffsetFromTop = $(this.selectors.addToCart).offset().top,
          $bar = $(this.selectors.addToCartBar),
          $barAddToCartBtn = $(this.selectors.addToCartBarBtn);

      $window.scroll(function(){
        if ($window.scrollTop() > addToCartBtnOffsetFromTop) {
          $bar.addClass('shown');
        }else {
          $bar.removeClass('shown');
        }
      });

      $barAddToCartBtn.on('click', function(event){
        $addToCartBarBtn.click();
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        event.preventDefault();
      });

      /**
       * Reflect product variants with Add to cart bar variants
       **/

      var $topbarProductQuantityMinus = $bar.find('.js-qty__adjust--minus');
      var $topbarProductQuantityPlus = $bar.find('.js-qty__adjust--plus');
      var $topbarProductQuantityNum = $bar.find('.js-qty__num');
      var $productQuantityMinus = $(this.selectors.productInfoDesktop).find('.js-qty__adjust--minus');
      var $productQuantityPlus = $(this.selectors.productInfoDesktop).find('.js-qty__adjust--plus');
      var $productQuantityNum = $(this.selectors.productInfoDesktop).find('.js-qty__num');
      var hasSwatches = $(this.selectors.productVariants).hasClass('product-options--swatches');


      var $productPrice = $(this.selectors.productInfoDesktop).find('.product-price__price');
      var $topbarProductPrice = $bar.find('.product-price');

      $topbarProductQuantityMinus.click(matchQuantityInputs);
      $topbarProductQuantityPlus.click(matchQuantityInputs);
      $productQuantityMinus.click(matchQuantityInputs);
      $productQuantityPlus.click(matchQuantityInputs);

      function matchQuantityInputs(){
        //if is topbar
        if($(this).closest('.product-add-to-cart-bar')[0] != undefined){
          $productQuantityNum.val($topbarProductQuantityNum.val());
        }else{
          $topbarProductQuantityNum.val($productQuantityNum.val());
        }
        updatePrice();
      }

      var self = this;
      $bar.find('.product-options__selector').each(function(i, v){
        var topBarSelect = $(this);
        matchSelectValues($(self.selectors.productInfoDesktop).find('.product-options__selector').eq(i), topBarSelect);
      });

      function matchSelectValues(el1, el2){
        el1.change(function(){
          if(el1.val() != 'non'){
            el2.val(el1.val());
            updatePrice();
          }
        });
        el2.change(function(){
          if(el2.val() != 'non'){
            el1.val(el2.val()).trigger('change');
            updatePrice();
          }
        });
      }

      if(hasSwatches){
        $bar.find('.product-options__selector').each(function(i, v){
          var topBarSelect = $(this);
          var index = $(this).attr('data-index').replace('option', '').trim();
          topBarSelect.change(function(){
            $('.swatches__option.swatches__option-index-'+index+'.swatches__option--'+$(this).val().replace(/\s+/g, '-').toLowerCase()).click();
            updatePrice();
          })
        });
      }

      function updatePrice() {
        $topbarProductPrice.html($productPrice.html());
      }
    }
  },



  _initCountDownOffer: function() {
    var _restart = '{{ settings.countdown_offer_repeat }}';

    var timers = {
      coc: $('.countdown-offer-clock'),
      show : function () {
        this.coc.removeClass('hide');
      },
      hide : function () {
        this.coc.addClass('hide');
      }
    };

    // Cookie
    var _cookie = new theme.CookieManager();

    // If the array contain str string return first val found
    function arrayContain(arr, str) {
      var ret = null;
      $.each(arr, function (i, v) {
        if(v.includes(str)){
          ret = v;
        }
      });
      if(ret){
        return ret;
      }else{
        return false;
      }
    }

    // Countdown timer
    function countDownOfferTimer(toDateSplittedStr, productId, $element) {
      var timer;
      var cookieName = "konversion-countdown-" + productId;
      var endDate = null;


      //Check if cookie already exists
      if(_cookie.check(cookieName)){
        var part = _cookie.get(cookieName).split('-');
        var timestamp = part[0];
        if(part[1] == parseInt(toDateSplittedStr[0], 10) + parseInt(toDateSplittedStr[1], 10) +parseInt(toDateSplittedStr[2], 10)){
          endDate = new Date(parseInt(timestamp));
        }else{
          createOrUpdate();
        }
      }else{
        createOrUpdate();
      }

      //create or update cookie
      function createOrUpdate() {
        var now = new Date();
        endDate = now.addDays(parseInt(toDateSplittedStr[0], 10)).addHours(parseInt(toDateSplittedStr[1], 10)).addMinutes(parseInt(toDateSplittedStr[2], 10));
        _cookie.set(cookieName, endDate.getTime()+'-'+parseInt(toDateSplittedStr[0], 10) + parseInt(toDateSplittedStr[1], 10) +parseInt(toDateSplittedStr[2], 10), 30);
      }


      //restart timer
      function restart() {
        //console.log('restart');
        timers.hide();
        if(_restart == 'true') {
          createOrUpdate();
          interval();
        }
      }



      //Timer interval
      function interval() {
        setTimeout(function () {
          timers.show();
        }, 1000);
        var currentDate = new Date();
        var difference = endDate.getTime() - currentDate.getTime();
        timer = setInterval(function() {
          var diff = difference;
          if (diff < 0) {
            clearInterval(timer);
            restart();
          } else {
            var seconds = Math.floor(diff / 1000);
            var minutes = Math.floor(seconds / 60);
            var hours = Math.floor(minutes / 60);
            var days = Math.floor(hours / 24);
            hours %= 24;
            minutes %= 60;
            seconds %= 60;
            days %= 24;
            $element.text(days+ 'd ' +hours+ 'h ' +minutes + 'm ' +seconds+ 's ');
          }
          difference -= 1000;
        }, 1000);
      }
      interval();
    }

    var countdown_offer_enabled = (new String("{{settings.countdown_offer_enabled}}")) == "true";
    var api_endpoint = window.location.href +'.json';

    //Get product data from product json
    $.ajax({
      url:  api_endpoint,
      dataType: "JSON",
      async: true,
      success: getProductSuccess,
      error: function () {
        console.error('Countdown offer: Oops, something went wrong Unable to load product data');
      }
    });

    var self = this;
    function getProductSuccess(data) {
      //if setting is enabled
      if(countdown_offer_enabled){

        var $countDownOffer = $(self.selectors.countDownOffer);

        var productId = data.product.id;
        var tags = data.product.tags.split(', ');
        var toDate = arrayContain(tags, 'countdown-');//return first tag with 'countdown-' str


        //if tag 'countdown-' exists show timer else remove cookie
        if(toDate){

          //style it (not sure about this)
          $countDownOffer.css('display', 'block')
              .css('text-transform','lowercase')
              .css('font-size', '13px');

          if($countDownOffer.parents('.product-form__cart--sticky').length == 1){
            $countDownOffer.parents('.product-form__cart--sticky')
                .addClass('w-countdown')
                .find(self.selectors.countDownOffer);

          }
          var toDateSplittedStr = toDate.split('-'); // days-hours-minutes
          toDateSplittedStr.shift();//remove first elem from array

          //Initialize countdown
          countDownOfferTimer(toDateSplittedStr, productId, $('.countdown-offer-clock .countdown-clock'))

        }else{
          $countDownOffer.parents('.product-form__cart--sticky').removeClass('w-countdown');
          _cookie.remove("konversion-countdown-"+ productId);
        }
      }
    }
  },

  _productReviews: function () {
    $('.open-reviews-tab').on('click', function(e) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: $(".open-reviews-tab").offset().top
      }, 700);
      $('.reviews-tab').click();
    });
  }

});
