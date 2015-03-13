
<h3>How to install demo</h3>
<strong>npm install</strong> <br>
<strong>bower install</strong> <br>
<strong>grunt runsetup</strong> <br>
<strong>grunt </strong><br>

<br>
<br>

<h3>How to use it</h3>
You must include <em>newsdirective.min.js</em> & <em>newsdirective.min.css</em> in your index.html<br>
You must include the newsdirectives dependency on your angular module:<br>
var app = angular.module('yourApp', ['news.directives']);<br>


<strong>Directive name: </strong>news <br>
<strong>Requires: </strong>$interval <br>
<strong>Restrict To: </strong>Element <br>

<strong>Usage: </strong><br>
 &lt;news url="..." showInterval="..."&gt; &lt;/news&gt;<br>
@param {url} string, URL of news website<br>
@param {showInterval} number, in ms<br>

<strong>Example: </strong><br>
&lt;news url="data/test-news.xml" showInterval="2000"&gt; &lt;/news&gt;<br>

<strong>Usage: </strong><br>
 &lt;news ng-controller="..."&gt; &lt;/news&gt;<br>

<strong>Example: </strong><br>
&lt;news ng-controller="newsController"&gt;&lt;/news&gt;<br>

app.controller('newsCtrl', ['$scope', function($scope) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;     $scope.newsUrl = '"http://www.npr.org/rss/rss.php?id=1006"';<br>
&nbsp;&nbsp;&nbsp;&nbsp;     $scope.showInterval = 4000;<br>
}]);<br><br>



<strong>DEMO：</strong>
http://www.gogorenting.com/NewsDirective/index.html
