var $ = require('jquery');
require('@tschallacka/jquery.request');
var controlUtils = require('@tschallacka/oc.foundation.controlutils');

var Base = function(appName, element, options) 
{
  this.proxiedMethods = {}
  if(typeof appName != 'undefined') {
    this.appName = appName;
  }
  if(typeof this.appName == 'undefined' || this.appName === null) {
    throw new Error("No appName defined for application");
  }
  this.appID = this.appName.replace(/[^a-z]+/gi, '').replace(/(.)([A-Z])/g, "$1-$2").toLowerCase();
  this.appDataHandler = '[data-'+this.appID+']';  
  this.oc = 'oc.'+this.appName;
  this.$el = $(element); 
  this.options = options || {};
  
  if(element) {
    controlUtils.markDisposable(element);
    this.sysInit();
  }
};

/**
 * Removes all proxied methods.
 */
Base.prototype.dispose = function() 
{
    for (let key in this.proxiedMethods) {
      if(this.proxiedMethods.hasOwnProperty(key)) {
        this.proxiedMethods[key] = null
      }
    }
    this.proxiedMethods = null
};

/**
 * Creates a proxied method reference or returns an existing proxied method.
 * @param method function
 */
Base.prototype.proxy = function(method) 
{  
  if (method.ocProxyId === undefined) {      
    $.oc.foundation._proxyCounter++
    method.ocProxyId = $.oc.foundation._proxyCounter
  }

  if (this.proxiedMethods[method.ocProxyId] !== undefined) {
    return this.proxiedMethods[method.ocProxyId];
  }

  this.proxiedMethods[method.ocProxyId] = method.bind(this);
  return this.proxiedMethods[method.ocProxyId];
};

/**
 * Register method to register your variables so they will automatically be cleaned up.
 * @param name string
 * @param value variable
 */
Base.prototype.alloc = function(name, value) 
{
  this.alloclist.push(name);
  this[name] = value;
};

/**
 * clean method that cleans up all variables set by alloc.
 * called when event is destroyed after destroy() and handlers('off');
 */
Base.prototype.free = function() 
{
  for(let i = 0; i < this.alloclist.length; i++) 
  {
    var name = this.alloclist[i];
    this[name] = null;
  }
  this.alloclist = null;
};

/**
 * Quick method for binding and unbinding event handlers.
 * this.bind('click',this.$el,this.something);
 * this.bind('click',this.$el,'[data-foobar]',this.somethingelse);
 * @param event string
 * @param $el jQuery
 * @param callback_or_subselector string|function
 * @param callback undefined|function
 */
Base.prototype.bind = function(event, $el, callback_or_subselector, callback) 
{
  if(typeof callback_or_subselector === 'string') {
    $el[this.event_binding_type](event, callback_or_subselector, this.proxy(callback));
  }
  else {
    $el[this.event_binding_type](event, this.proxy(callback_or_subselector));
  }
};

/**
 * Destroys the application completely
 * Usually called via the dispose route
 */
Base.prototype.sysDestroy = function() 
{
  this.event_binding_type='off';
  this.handlers(this.event_binding_type);
  this.destroy();
  this.free();
  this.$el.off('dispose-control', this.proxy(this.dispose));
  this.$el.removeData(this.oc);
  this.requesthandle = null;
  this.$el = null

  // In some cases options could contain callbacks, 
  // so it's better to clean them up too.
  this.options = null
  Base.prototype.dispose.call(this);
};

/**
 * Returns the namespaced apphandle for ajax requests
 * @param name string
 * @return string
 */
Base.prototype.getHandle = function(name) 
{
  if(this.handle) {
    return this.handle + name;
  }
  
  this.handle = this.$el.data('apphandler');
  
  if(this.handle != null && this.handle.match(/::$/) != null) {
    this.handle += '::';
  }
  
  return this.getHandle(name);
};

/**
 * Performs an ajax request
 * @param requestname where to send a request to.
 * @param data data to send on the request { success: function, complete: function, data: {}, error: function() }
 * @returns request object
 */
Base.prototype.request = function(requestname, data) 
{
  return this.$el.request(this.getHandle(requestname), data);
};

/**
 * Initialisation of the underlying object
 */
Base.prototype.sysInit = function() 
{
  this.$el.one('dispose-control', this.proxy(this.sysDestroy));
  this.event_binding_type='on';
  this.alloclist = [];
  
  this.init();
  this.handlers(this.event_binding_type);
};

/**
 * Trigger that needs to be called from where
 * the application is required(index.js)
 * 
 * This will make sure that when the render event is triggered on the document
 * that this application will automagically bind to the relevant objects.
 * 
 * Otherwise you can bind your Application manually however you wish to bind it
 * 
 * Example code:
 * var Base = require('@tschallacka/oc.foundation.base');
 * Base.bindToRender(require('js/myApplication.js'));
 */
Base.bindToRender = function(Application) 
{
  let app = new Application();
  let oc = app.oc;
  let appName = app.appName;
  let old = $.fn[appName];
  let appDataHandler = app.appDataHandler;
  let appVersion = app.appVersion;
  
  $.fn[appName] = function (option) {
    let args = Array.prototype.slice.call(arguments, 1), items, result;
        
    items = this.each(function (index, elem) {
      let $this   = $(elem);
      let data    = $this.data(oc);
      let options = $.extend({}, Application.DEFAULTS, $this.data(), typeof option == 'object' && option);    
      if (!data) {
	    $this.data(oc, (data = new Application(this, options)));
      }
      if (typeof option == 'string') {
        result = data[option].apply(data, args);
      }            
      if (typeof result != 'undefined') {
        return false;
      }
	});

    return result ? result : items;
  };

  $.fn[appName].Constructor = Application;

  $.fn[appName].noConflict = function () {
    $.fn[appName] = old;
    return this;
  };

  $(document).on('render', function (){
    let $elems = $(appDataHandler);
    $elems[appName]();
  });
}

module.exports = Base;