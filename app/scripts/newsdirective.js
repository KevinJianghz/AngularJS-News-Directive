'use strict';

/**
 * @jFeed : jQuery feed parser
 * @requires jQuery 1.6.4 
 * @Copyright (C) 2007 Jean-François Hovinne
 */

jQuery.getFeed = function(options) {

    options = jQuery.extend({

        url: null,
        data: null,
        cache: true,
        success: null,
        failure: null,
        error: null,
        global: true

    }, options);

    if (options.url) {
        
        if (jQuery.isFunction(options.failure) && jQuery.type(options.error)==='null') {
          // Handle legacy failure option
          options.error = function(xhr, msg, e){
            options.failure(msg, e);
          }
        } else if (jQuery.type(options.failure) === jQuery.type(options.error) === 'null') {
          // Default error behavior if failure & error both unspecified
          options.error = function(xhr, msg, e){
            window.console&&console.log('getFeed failed to load feed', xhr, msg, e);
          }
        }

        return $.ajax({
            type: 'GET',
            url: options.url,
            data: options.data,
            cache: options.cache,
            dataType: (jQuery.browser.msie) ? "text" : "xml",
            success: function(xml) {
                console.log('xml='+xml);
                var feed = new JFeed(xml);
                if (jQuery.isFunction(options.success)) options.success(feed);
            },
            error: options.error,
            global: options.global
        });
    }
};

function JFeed(xml) {
    if (xml) this.parse(xml);
}
;

JFeed.prototype = {

    type: '',
    version: '',
    title: '',
    link: '',
    description: '',
    parse: function(xml) {

        if (jQuery.browser.msie) {
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.loadXML(xml);
            xml = xmlDoc;
        }

        if (jQuery('channel', xml).length == 1) {

            this.type = 'rss';
            var feedClass = new JRss(xml);

        } else if (jQuery('feed', xml).length == 1) {

            this.type = 'atom';
            var feedClass = new JAtom(xml);
        }

        if (feedClass) jQuery.extend(this, feedClass);
    }
};

function JFeedItem() {};

JFeedItem.prototype = {

    title: '',
    link: '',
    description: '',
    updated: '',
    id: ''
};

function JAtom(xml) {
    this._parse(xml);
};

JAtom.prototype = {
    
    _parse: function(xml) {
    
        var channel = jQuery('feed', xml).eq(0);

        this.version = '1.0';
        this.title = jQuery(channel).find('title:first').text();
        this.link = jQuery(channel).find('link:first').attr('href');
        this.description = jQuery(channel).find('subtitle:first').text();
        this.language = jQuery(channel).attr('xml:lang');
        this.updated = jQuery(channel).find('updated:first').text();
        
        this.items = new Array();
        
        var feed = this;
        
        jQuery('entry', xml).each( function() {
        
            var item = new JFeedItem();
            
            item.title = jQuery(this).find('title').eq(0).text();
            item.link = jQuery(this).find('link').eq(0).attr('href');
            item.description = jQuery(this).find('content').eq(0).text();
            item.updated = jQuery(this).find('updated').eq(0).text();
            item.id = jQuery(this).find('id').eq(0).text();
            
            feed.items.push(item);
        });
    }
};

function JRss(xml) {
    this._parse(xml);
};

JRss.prototype  = {
    
    _parse: function(xml) {
    
        if(jQuery('rss', xml).length == 0) this.version = '1.0';
        else this.version = jQuery('rss', xml).eq(0).attr('version');

        var channel = jQuery('channel', xml).eq(0);
    
        this.title = jQuery(channel).find('title:first').text();
        this.link = jQuery(channel).find('link:first').text();
        this.description = jQuery(channel).find('description:first').text();
        this.language = jQuery(channel).find('language:first').text();
        this.updated = jQuery(channel).find('lastBuildDate:first').text();
        
        //add by kevin, 02-16-2015
        this.image = jQuery(channel).find('image:first url').text();
    
        this.items = new Array();
        
        var feed = this;
        
        jQuery('item', xml).each( function() {
        
            var item = new JFeedItem();
            
            item.title = jQuery(this).find('title').eq(0).text();
            item.link = jQuery(this).find('link').eq(0).text();
            item.description = jQuery(this).find('description').eq(0).text();
            item.updated = jQuery(this).find('pubDate').eq(0).text();
            item.id = jQuery(this).find('guid').eq(0).text();
    
            //add by kevin, 02-16-2015
            item.image = jQuery(this).find('image url').eq(0).text();
            
            feed.items.push(item);
        });
    }
};



/**
 * @AngularJS Directive
 * @Author Kevin Jiang, kevinjianghz@gmail.com
 * @directive name: news 
 * @requires $interval
 * @Restrict To:  Element
 *
 * Usage: 
 *   <news NEWS_ATTRIBUTES></news>
  * Example: 
 *  <news url="http://www.npr.org/rss/rss.php?id=1006"  showInterval="1000"> </news>
 *
 * @param {url} string, URL of news website
 * @param {showInterval} number, in ms
 */

var directives = angular.module('news.directives', []);

directives.directive('news', ['$interval',function($interval) {

    return {
        restrict: 'E',
        replace: true,
        template:  '<div class="news-container">'  
                  +   '<div class="news-preview">'  
                  +    '</div>' 
                  +    '<div class="news-logo"></div>'
                  +    '<div class="news-headline">' 
                  +        '<div class="news-title">Loading ...</div>'  
                  +    '</div>' 
                  +    '<div class="news-control">' 
                  +        '<button class="news-backward"><</button>' 
                  +        '<button class="news-play">||</button>' 
                  +        '<button class="news-forward">></button>' 
                  +    '</div>' 
                  +'</div>' ,

        link: function(scope, element, attrs) {

            var newsContainer = $(element[0]),
                neswPlayBtn = newsContainer.find('.news-play'),
                newsBackwardBtn =  newsContainer.find('.news-backward'),
                newsForwardBtn =  newsContainer.find('.news-forward'),
                newsHeadline =  newsContainer.find('.news-headline'),
                newsLogo =  newsContainer.find('.news-logo'),
                newsTitle = newsContainer.find('.news-title'),
                newsPreview = newsContainer.find('.news-preview'),
                newscontrol = newsContainer.find('.news-control');

            var newsSetting = {};
            var timeoutId;

            var newsContainerWidth = newsContainer.width();

            newscontrol.css('left', (newsContainerWidth/2)-45 + 'px');

            console.log((newsContainerWidth) + 'px');
             console.log((newsContainer.parent().width()));
            //console.log((newsContainerWidth/2)-45 + 'px');
            console.log($.fn.jquery)

            /**
             * get news url & showInterval form directive attribute value or controller scope vars
             */
            function getUserSetting(){
                var setting = {};
                if(typeof(scope.newsUrl)=='undefined') {
                    if(typeof(attrs.url)=='undefined') {
                        newsTitle.html("Error: No news link specifized.");
                        setting.url = '';
                    }
                    else {
                        setting.url = attrs.url;
                    }
                }
                else {
                    setting.url = scope.newsUrl;
                }
               if(typeof(scope.showInterval)=='undefined') {
                    if(typeof(attrs.showInterval)=='undefined') {
                        //default showInterval 3000ms
                        setting.showInterval = 3000;
                    }
                    else {
                        setting.showInterval = attrs.showInterval;
                    }
                }
                else {
                    setting.showInterval = scope.showInterval;
                }

                return setting;
            };


            newsSetting = getUserSetting();

            if(newsSetting.url) {
                //Get News Feeds
                jQuery.getFeed({
                    url: newsSetting.url,
                    success: showNews,
                    error: showErr
                });
            }

            /**
             * Get News Feeds error
             */
            function showErr(){
              newsTitle.html("Error: Can't access the news web or invalid link...");
              newsTitle.css("color","red");
            }

            /**
             * Get News Feeds success
             */
            function showNews(feed) {
                  var curIndex = 0,
                      prevIndex = 0,
                      totalNews = feed.items.length;

                  var isPreviewing = 0,
                      isPlaying = 1,
                      playDirection = 1;

                  //var newsSwitchInterval = 2000;


                  neswPlayBtn.click(function(){
                      if(isPlaying) {
                          isPlaying=0;console.log($(this).text())
                          neswPlayBtn.text('>');
                      }
                      else{
                          isPlaying=1;
                          $(this).text('||');
                        }
                  });

                  newsBackwardBtn.click(function(){
                      playDirection = 0;
                      switchNews();
                  });

                  newsForwardBtn.click(function(){
                      playDirection = 1;
                      switchNews();
                  });

                  newsTitle.mouseenter(function(){
                      //Set news preview content
                      newsPreview.html(
                          feed.items[curIndex].description
                          + '<a href="' + feed.items[curIndex].link + '">' + '[...]</a>'
                          );
                      //Show news preview
                      newsPreview.animate({ opacity: 1 }, 0, function(){newsPreview.css('display','block');});
                      isPreviewing = 1;
                  });

                  newsPreview.mouseleave(function(){
                      //Hide news preview
                      newsPreview.animate({ opacity: 0 }, 500, function(){newsPreview.css('display','none');});
                      isPreviewing =0;
                  });

                  //Show web logo & first news title
                  newsTitle.html(feed.items[curIndex].title);
                  if(feed.image) {
                      newsLogo.html('<img style="width:36px;height:36px" src="' + feed.image + '">' );
                  }
                  else{
                      newsHeadline.css("left","16px");
                  }
                                   

                  timeoutId = $interval(switchNews, newsSetting.showInterval);  

                  function switchNews() {
                      if(isPlaying) {
                          if(!isPreviewing) {
                              if(playDirection) {
                                  curIndex = (prevIndex + 1) % totalNews;
                                  //console.log(curIndex)
                              }
                              else{
                                  curIndex = (prevIndex-1 < 0) ? totalNews-1 : prevIndex-1;
                                  //console.log(curIndex)
                              }
                              
                              newsTitle.animate
                                  (
                                      {left: playDirection ? newsContainerWidth + "px" : '-' + newsContainerWidth + "px"},
                                      800,
                                      function(){
                                          newsTitle.animate({left:"16px"},0);
                                          newsTitle.html(feed.items[curIndex].title);
                                      }
                                  );
                              
                              prevIndex = curIndex;
                          }
                          else {
                              isPreviewing++;
                              if( isPreviewing==4 && !(newsTitle.css('cursor')=='pointer' || newsPreview.css('cursor')=='pointer')){
                                    //Hide news preview
                                    newsPreview.animate({ opacity: 0 }, 500, function(){newsPreview.css('display','none');});
                                    isPreviewing =0;
                              }
                          }
                      }
                  }          
            }//End of function showNews()  

        }//End of link function

    }//End of directiv object return

}]);//End of 'news' directive define







