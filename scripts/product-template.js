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
      arrows: false,
      centerMode: false,
      focusOnSelect: true,
      vertical: true,
      verticalSwiping: true
    };
    this.imageSettings = {
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      fade: true,
      asNavFor: '#' + sliderId + ' .' + classes.thumbs,
      swipe: false,
      swipeToSlide: false,
    };

    var imageHeight = this.$sliderImage.height();
    this.$sliderThumbs.css({'max-height': imageHeight + 'px'});
    this.$sliderThumbs.slick(this.thumbsSettings);
    this.$sliderImage.slick(this.imageSettings);
  }

  return productImagesSlider;
})();

theme.ProductPageSection = (function() {

  function ProductPageSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');

    this.theProduct = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);

    this.settings = {
      sectionId: sectionId,
      enableHistoryState: $container.data('enable-history-state') || false,
    };

    this.selectors = {
      originalSelectorId: '#ProductSelect-' + sectionId,
      singleOptionSelector: '.product-options__selector-' + sectionId,
      addToCart: '#AddToCart-' + sectionId,
      addToCartText: '#AddToCartText-' + sectionId,
      productPrices: '.product-info .product-price',
      originalPrice: '.product-info .product-price__price',
      comparePrice: '.product-info .product-price__old',
      discountPercent: '.product-info .product-price__percent',
      salePriceWrapper: '.product-info .product-price__sale',
      SKU: '.variant-sku',
      qty: '.variant-qty',
      inPageCartButton: '#' + sectionId + ' .product-form__cart',
      stickyBtnStart: '#' + sectionId + ' .js-sticky-btn-start',
      stickyCartButton: 'body > .product-form__cart',
      stickyCartButtonText: 'body > .product-form__cart button > span',
      cartForm: '#' + sectionId + ' .product-form',
    }

    // Thumbs & Slider
    var slider = this.slider = '#' + sectionId + '_images';
    theme.sliders[slider] = new theme.ProductImagesSlider(slider);

    // Zoom image
    $('.product-images--single .product-images__image, .product-images__image li').each(function(idx, el) {
      var $img = $(el).find('img');
      $(el).zoom({ on: 'grab', url: $img.data('original') });
    });

    this._initVariants();
    this._stickyCartBtn();
  }

  return ProductPageSection;
})();

theme.ProductPageSection.prototype = _.extend({}, theme.ProductPageSection.prototype, {

  onUnload: function() {
    delete theme.sliders[this.slider];
    $(document).off('touchmove.track-add-to-cart-btn');
    $(document).off('scroll.track-add-to-cart-btn');
  },

  _stickyCartBtn: function() {
    $(this.selectors.stickyCartButton).on('click', this._submitCartForm.bind(this));
    $(document).on('touchmove.track-add-to-cart-btn', this._trackScrolling.bind(this));
    $(document).on('scroll.track-add-to-cart-btn', this._trackScrolling.bind(this));
    this._trackScrolling();
  },

  _submitCartForm: function() {
    $(this.selectors.cartForm).trigger('submit');
  },

  _trackScrolling: function() {
    // only for mobile
    if (theme.cache.$body.width() <= 767) {
      var $stickyBtn = $(this.selectors.stickyCartButton);
      var startPosition = $(this.selectors.stickyBtnStart).position();
      var distanceYBottom = window.pageYOffset + theme.cache.$window.height();
      var stickAt = distanceYBottom + 70;
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

    if (variant) {
      this.$container.find(this.selectors.productPrices).removeClass('visibility-hidden');

      if (variant.available) {
        $(this.selectors.addToCart).prop('disabled', false);
        $(this.selectors.addToCartText).text(backend.strings.addToCart);
      } else {
        $(this.selectors.addToCart).prop('disabled', true);
        $(this.selectors.addToCartText).text(backend.strings.soldOut);
      }

      // Update left in stock label
      this.$container.find(this.selectors.qty).html(variant.inventory_quantity);
    } else {
      // The variant doesn't exist
      $(this.selectors.addToCart).prop('disabled', true);
      $(this.selectors.addToCartText).text(backend.strings.unavailable);
      this.$container.find(this.selectors.productPrices).addClass('visibility-hidden');
      this.$container.find(this.selectors.qty).html('-');
    }
    // Update sticky button
    $(this.selectors.stickyCartButtonText).text($(this.selectors.addToCartText).text());
    $(this.selectors.stickyCartButton).find('button').prop('disabled', $(this.selectors.addToCart).prop('disabled'));

  },

  _switchImage: function(evt) {
    var variant = evt.variant;
    var $productImagesSlider = theme.sliders[this.slider];
    $productImagesSlider.$sliderImage.slick('slickGoTo', variant.featured_image.position - 1);
  },

  _updatePrice: function(evt) {
    var variant = evt.variant;

    // Update the product price
    this.$container.find(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, backend.moneyFormat));

    // Update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      var discountPercent = Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price);
      this.$container.find(this.selectors.comparePrice)
        .html(theme.Currency.formatMoney(variant.compare_at_price, backend.moneyFormat));
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
});
