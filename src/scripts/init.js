theme.init = function () {
  FastClick.attach(document.body);
  theme.cacheSelectors();
  theme.drawersInit();
  theme.modalInit();
  theme.mobileNavInit();
  theme.loginForms();
  theme.dealOfTheDay();
  theme.topBar();
  theme.footer();
};

// Blog: filter by tag
(function() {
  var $filterBy = $('#BlogTagFilter');
  if (!$filterBy.length) {
    return;
  }
  $filterBy.on('change', function() {
    location.href = $(this).val(); 
  });
})();

$(theme.init);

$(document).ready(function() {
  var sections = new theme.Sections();
  sections.register('header-section', theme.HeaderSection);
  sections.register('slideshow-section', theme.SlideshowSection);
  sections.register('slider-section', theme.SliderSection);
  sections.register('product-template', theme.ProductPageSection);
  sections.register('collection-template', theme.CollectionTemplate);
  sections.register('contact-template', theme.ContactTemplate);
  sections.register('featured-collection-section', theme.FeaturedCollectionSection);
  sections.register('featured-product-section', theme.FeaturedProductSection);
  sections.register('password-header', theme.PasswordHeader);
  sections.register('instagram-feed-section', theme.InstagramFeedSection);

  $('[data-tooltip!=""]').qtip({
    content: {attr: 'data-tooltip'},
    style: {classes: 'qtip-light qtip-shadow'}
  });

});
