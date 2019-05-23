The october foundation framework.

installation:

     npm install @tschallacka/oc.foundation.base

Allows you to make your own october foundation application, tschallacka style.
See https://octobercms.com/docs/ui/foundation


# Example:
js/myApplication.js
```
var $ = require('jquery');
var Base = require('@tschallacka/oc.foundation.base');

/**
 * Set here your default application name.
 * Any capital letter will be replaced by lowercase and a - will be inserted 
 * in between.
 * WhoIsTheCaptain turns into who-is-the-captain and 
 * this script will tag elements with the attributes <div data-who-is-the-captain>
 *
 * The formatted name will be stored in the variable  `appID` 'app-data-handler'
 * the jQuery selector will be stored in the variable `appDataHandler` [data-app-data-handler]
 * the instance reference will be 'oc.appDataHandler' which can be gotten by $(appDataHandler).data('oc.appDataHandler')
 */
var APPNAME = 'WhoIsTheCaptain';

var Application = function (element, options) 
{
	Base.call(this, APPNAME, element, options);
}; 
Application.prototype = Object.create(Base.prototype); 
Application.prototype.constructor = Application;

/**
 * ================================================================================================================
 *            ****                       edit below this line                             ****
 * ================================================================================================================
 */

/**
 * Bind jQuery event handlers here. 
 * @var type is the event type('on') or ('off') for binding and unbinding events manually
 * this.$el[type]('click',this.proxy(this.something));
 * 
 * If you just wish the Base to handle it use the 'bind' helper method.
 * this.bind('click',this.$el,this.something);
 * this.bind('click',this.$el,'.some-subclass',this.somethingelse);
 */
Application.prototype.handlers = function(type) 
{
	this.bind('click', this.$prepend, this.showDetails);	
};

/**
 * This code is called when the application is initialised. Initialise variables here.
 * This is called BEFORE the event handlers are bound.
 * For automatically cleaning variables you can define variables with
 * this.alloc('foobar',42)
 * will be the same as this.foobar = 42;
 * only difference is that the alloc'ed variable will be cleand up automatically on destroy
 * whislt the foobar needs a this.foobar=null in the destroy function.
 */
Application.prototype.init = function() 
{	
	this.alloc('$prepend', $('<div>I am the captain now</div>'));
	this.$el.addClass('look-at-me');    	
	this.$el.append(this.$prepend);
	this.$prepend.addClass('i-am-special');		
}

/**
 * This code is called when the application is being destroyed/cleaned up.
 * Deinitialise/null your variables here.
 * This is called AFTER the event handlers are unbound.
 * and BEFORE the variables that were set in alloc() are unbound.
 */
Application.prototype.destroy = function() 
{
    this.$el.find('i-am-special').remove();
    this.$el.removeClass('look-at-me');
}

Application.prototype.showDetails = function(e) 
{
	// .....
};

/**
 * You can also put this in your index.js if you need more control/overview
 * over when your applications are bound, or for testing.
 * Example code:
 * var Base = require('@tschallacka/oc.foundation.base');
 * Base.bindToRender(require('js/myApplication.js'));
 */
 */
Base.bindToRender(Application);

module.exports = Application;
```

myPartial.html 
```
<div data-who-is-the-captain>
   I am the captain!
</div>
```

