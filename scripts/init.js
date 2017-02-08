$(document).ready(function() {
  var sections = new theme.Sections();
  sections.register('slideshow-section', theme.SlideshowSection);
  sections.register('slider-section', theme.SliderSection);
  sections.register('product-template', theme.ProductPageSection);
});

theme.init = function () {
  FastClick.attach(document.body);
  theme.cacheSelectors();
  theme.drawersInit();
  theme.mobileNavInit();
};

$(theme.init);