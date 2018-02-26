videojs.plugin('alltimeViews', function(options) {
  var player = this,
    el,
    txt,
    video_id,
    alltimeViewsEl,
    videoElement = document.getElementById('bcls_alltimePlaysPlayer'),
    account_id = videoElement.getAttribute('data-account'),
    baseURL = "https://analytics.api.brightcove.com/v1/alltime/accounts/";
    options.requestType = "GET";

    // listener for the first video load
    player.one('loadedmetadata', function() {
      // +++ Create the element to hold the video views +++
      el = document.createElement('p');
      el.setAttribute('id', 'bcls_alltimeViews');
      el.setAttribute('style', 'font-weight:bold;');
      if (options.hasPlaylist) {
        var playlistEl = document.getElementById('bcls_alltimePlaysPlaylist');
        playlistEl.insertAdjacentElement('afterend', el);
      } else {
        videoElement.insertAdjacentElement('afterend', el);
      }
      alltimeViewsEl = document.getElementById('bcls_alltimeViews');


      // +++ Get the current video id from mediainfo then start process to get views count +++
      video_id = player.mediainfo.id;
      // launch the Analytics API request to get the alltime video views
      createRequest();


      // +++ Set listener for future requests +++
      player.on('loadedmetadata', function() {
        // Clear element where count is shown
        alltimeViewsEl.textContent = '';
        // get the current video id from mediainfo
        video_id = player.mediainfo.id;
        // launch the Analytics API request to get the alltime video views
        createRequest();
      });
    });

  /**
   * formats an integer by adding commas for thousands separators
   * @param  {Integer} x Number to format
   * @return {String}   The formatted number
   */
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  // +++ Prepare information for request to proxy/Analytics API +++
  /**
   * createRequest sets up requests, send them to makeRequest(), and handles responses
   * @param  {string} type the request type
   */
   function createRequest() {
     var JSONresponse;

     // set the Analytics API request
     options.url = baseURL + account_id + '/videos/' + video_id;
     // send the request and handle the response
     makeRequest(options, function (response) {
     // Convert response string into JSON
     JSONresponse = JSON.parse(response);
       // should always get a response, but just in case...
       if (JSONresponse && JSONresponse.alltime_video_views) {
         // write the views to the UI
         alltimeViewsEl.textContent = numberWithCommas(JSONresponse.alltime_video_views) + ' views';
       } else {
         alltimeViewsEl.textContent = 'All-time views for this video are not available';
       }
     });
   }


  // +++ Make actual call to proxy/Analytics API +++
/**
* send API request to the proxy
* @param  {Object} options for the request
* @param  {String} options.url the full API request URL
* @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
* @param  {String} options.proxyURL proxyURL to send the request to
* @param  {String} options.client_id client id for the account (default is in the proxy)
* @param  {String} options.client_secret client secret for the account (default is in the proxy)
* @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
* @param  {Function} [callback] callback function that will process the response
*/
  function makeRequest(options, callback) {
    var httpRequest = new XMLHttpRequest(),
        response,
        requestParams,
        dataString,
        proxyURL = options.proxyURL,
        // response handler
        getResponse = function() {
          try {
            if (httpRequest.readyState === 4) {
              if (httpRequest.status >= 200 && httpRequest.status < 300) {
                response = httpRequest.responseText;
                // some API requests return '{null}' for empty responses - breaks JSON.parse
                if (response === "{null}") {
                  response = null;
                }
                // return the response
                callback(response);
              } else {
                alert(
                  "There was a problem with the request. Request returned " +
                  httpRequest.status
                );
              }
            }
          } catch (e) {
            alert("Caught Exception: " + e);
          }
        };
     /**
       * set up request data
         * the proxy used here takes the following request body:
         * JSON.strinify(options)
         */
    // set response handler
    httpRequest.onreadystatechange = getResponse;
    // open the request
    httpRequest.open("POST", proxyURL);
    // set headers if there is a set header line, remove it
    // open and send request
    httpRequest.send(JSON.stringify(options));
  }
});
