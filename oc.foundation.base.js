var $ = require('jquery');

var Base = function() {
    this.proxiedMethods = {}
}

Base.prototype.dispose = function() {
    for (var key in this.proxiedMethods) {
        this.proxiedMethods[key] = null
    }

    this.proxiedMethods = null
}

/*
 * Creates a proxied method reference or returns an existing proxied method.
 */
Base.prototype.proxy = function(method) {
    if (method.ocProxyId === undefined) {
    	
        $.oc.foundation._proxyCounter++
        method.ocProxyId = $.oc.foundation._proxyCounter
    }

    if (this.proxiedMethods[method.ocProxyId] !== undefined)
        return this.proxiedMethods[method.ocProxyId]

    this.proxiedMethods[method.ocProxyId] = method.bind(this)
    return this.proxiedMethods[method.ocProxyId]
}

/**
 * Register method to register your variables so they will automatically be cleaned up.
 */
Base.prototype.alloc = function(name,value) {
	this.alloclist.push(name);
	this[name] = value;
}

/**
 * clean method that cleans up all variables set by alloc.
 * called when event is destroyed after destroy() and handlers('off');
 */
Base.prototype.free = function() 
{
	for(var c=0; c < this.alloclist.length; c++) 
	{
		var name = this.alloclist[c];
		this[name] = null;
	}
	this.alloclist = null;
}

/**
 * Quick method for binding and unbinding event handlers.
 * this.bind('click',this.$el,this.something);
 * this.bind('click',this.$el,'[data-foobar]',this.somethingelse);
 */
Base.prototype.bind = function(event, $el,  callback_or_subselector, callback) {
	if(typeof callback_or_subselector === 'string') 
	{
		$el[this.event_binding_type](event,callback_or_subselector,this.proxy(callback));
	}
	else {
		$el[this.event_binding_type](event,this.proxy(callback_or_subselector));
	}
}


Base.prototype.sysDestroy = function() 
{
	this.event_binding_type='off';
	this.handlers(this.event_binding_type);
	this.destroy();
	this.free();
	this.$el.off('dispose-control', this.proxy(this.dispose))
    this.$el.removeData(this.oc);
	this.requesthandle = null;
    this.$el = null

    // In some cases options could contain callbacks, 
    // so it's better to clean them up too.
    this.options = null

    BaseProto.dispose.call(this)
};

Base.prototype.getHandle = function(name) 
{
	if(this.handle) {
		return this.handle + name;
	}
	this.handle = this.$el.data('apphandler');
	return this.getHandle(name);
}

Base.prototype.request = function(requestname,data) 
{
	return this.$el.request(this.getHandle(requestname),data);
}

Base.prototype.sysInit = function() 
{
	this.$el.one('dispose-control', this.proxy(this.sysDestroy));
	this.event_binding_type='on';
	this.alloclist = [];
	this.init();
	this.handlers(this.event_binding_type);
	
}

Base.prototype.registerGlobalVersion = function(appVersion, appName) {
	var res = window.hasOwnProperty(appName+"_version") ? window[appName+"_version"] : 0;
	if(res == undefined || res < appVersion ) {
		window[appName+"_version"] = appVersion;
	}
}

Base.prototype.bindApplication = function() {
	var Application = this.constructor;
	var old = $.fn[appName]
	var oc = this.oc;
	var appName = this.appName;
	var appDataHandler = this.appDataHandler;
	var appVersion = this.appVersion;
    $.fn[appName] = function (option) {
        var args = Array.prototype.slice.call(arguments, 1), items, result
        
        items = this.each(function (index, elem) {
            var $this   = $(elem);
            var data    = $this.data(oc);
            var options = $.extend({}, Application.DEFAULTS, $this.data(), typeof option == 'object' && option);
            
            if (!data) {
            	$this.data(oc, (data = new Application(this, options)));
            }
            if (typeof option == 'string') {
            	result = data[option].apply(data, args);
            	
            }
            
            if (typeof result != 'undefined') {
            	return false;
            }
            ;
        });

        return result ? result : items
    };

    $.fn[appName].Constructor = Application;

    $.fn[appName].noConflict = function () {
        $.fn[appName] = old
        return this
    };

    // Add this only if required
    $(document).on('render', function (){
        if(window[appName+"_version"] == appVersion) {
            var $elems = $(appDataHandler);
            $elems[appName]();
        }
    	
    });
} 

module.exports = Base;