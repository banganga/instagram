/*******************************************************************************
    Collection Template section
  *****************************************************************************/

theme.CollectionTemplate = (function() {
  function CollectionTemplate(container) {
    var $container = $(container);
    theme.productCardsInit($container);

    $container.find('.collection-filter__items--tags input').change(this.filterUpdate.bind(this));

    $(window).scroll(function(){
      if($(window).width() < 1024) {
        theme.ScrollExecute();
      } else {
        theme.ScrollExecute({
          more_class: ".more-desktop",
          product_wrapper: ".product-desktop",
          end_point: "#product-list-foot-desktop",
          device: "desktop", // mobile or desktop
        });
      }
    });

    this.tagFilterCollapse();
  }

  return CollectionTemplate;
})();

theme.CollectionTemplate.prototype = _.extend({}, theme.CollectionTemplate.prototype, {

  filterUpdate: function(e) {
    var $filterLink = $(e.target).parent().find('a');
    window.location = $filterLink.prop('href');
  },

  tagFilterCollapse: function() {

    var $collapsibleTitle = $('.collapsible-title'),
        $collectionFilter = $('.collection-filter');

    $collapsibleTitle.on('click', toggle);

    function toggle(e){
      $thisCollapsibleTitle = $(this);
      var toggleElement = $thisCollapsibleTitle.attr('toggle'),
          $collapsibleContent = $('.'+toggleElement);

      if($thisCollapsibleTitle.hasClass('closed')){
        $thisCollapsibleTitle.removeClass('closed');
        $collapsibleContent.removeClass('closed');
      }else{
        $thisCollapsibleTitle.addClass('closed');
        $collapsibleContent.addClass('closed');
      }
    }


    $collapsibleTitle.each(function(){
      $thisCollapsibleTitle = $(this);
      var collapsibleContent = '.'+$thisCollapsibleTitle.attr('toggle'),
          maxItems = $thisCollapsibleTitle.attr('max-items'),
          collapsibleContent_li = $(collapsibleContent+'> li'),
          _checked = [];

      collapsibleContent_li.each(function(i, v){
        _checked[i] = $(this).find('input[type=checkbox]').attr('checked');
      });

      if(!isNaN(maxItems) && maxItems != 0){


        if(collapsibleContent_li.length >= maxItems){
          if($.inArray('checked',_checked) == -1){
            collapse();
          }
        }
      }

      function collapse(){
        $thisCollapsibleTitle.addClass('closed');
        $(collapsibleContent).addClass('closed');
      }
    });


    $collectionFilter.css('visibility', 'visible');
    console.log("CollectionTemplate ran");
  }

});

theme.ScrollExecute = (function(){
  function ScrollExecute(opt){
    opt = $.extend({}, {
      more_class: ".more-mobile",
      product_wrapper: ".product-mobile",
      end_point: "#product-list-foot-mobile",
      device: "mobile", // mobile or desktop
      scroll_height: 800, // start point for more view feature
      loading_bar: '<img src=\"{{ "ajax-loader.gif" | asset_url }}\" />',
      delay: 200
    }, opt);

    ///
    setTimeout(function(){
      if($(document).height() - opt.scroll_height < ($(document).scrollTop() + $(window).height())) {
          var loadingImage;
          scrollNode = $(opt.more_class).last();
          scrollURL = $(opt.more_class).find('a').last().attr("href");

        var moreview_ajax = function(pInfScrLoading){
          if(!pInfScrLoading && scrollNode.length > 0 && scrollNode.css('display') != 'none') {
              $.ajax({
                type: 'GET',
                url: scrollURL,
                beforeSend: function() {
                  if(opt.device == "mobile"){
                    $.pInfScrLoading_mobile = true;
                  } else {
                    $.pInfScrLoading_desktop = true;
                  }

                  loadingImage = scrollNode.clone().empty().append(opt.loading_bar);
                  loadingImage.insertAfter(scrollNode);
                  scrollNode.hide();
                },
                success: function(data) {
                  // remove loading feedback
                  scrollNode.next().remove();
                  var filteredData = $(data).find(opt.product_wrapper);
                  filteredData.insertBefore( $(opt.end_point) );
                  loadingImage.remove();

                  if(opt.device == "mobile"){
                    $.pInfScrLoading_mobile = false;
                  } else {
                    $.pInfScrLoading_desktop = false;
                  }
                },
                dataType: "html"
              });
          }
        };

        if(opt.device == "mobile"){
          moreview_ajax($.pInfScrLoading_mobile);
        } else {
          moreview_ajax($.pInfScrLoading_desktop);
        }
      }
    }, opt.delay);
  }

  return ScrollExecute;
})();
