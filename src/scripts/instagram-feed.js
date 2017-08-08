/*******************************************************************************
    Instagram feed
  *****************************************************************************/
var x;
var y = x.substr(0,10);
theme.InstagramFeed = (function() {
  var feed = new Instafeed({
						      get: 'user',
						      userId: y,
						      clientId: '39159bcdbda74377a52599de365340d1',
						      accessToken: x

    							});
  feed.run();
})();

