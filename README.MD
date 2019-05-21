The october foundation framework.

installation:

     npm install @tschallacka/oc.foundation.base

Allows you to make your own october foundation application
See https://octobercms.com/docs/ui/foundation


# Example:
```
 +function ($) { "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    var MyApplication = function (element, options) {
        this.$el = $(element)
        this.options = options || {}

        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }

    MyApplication.prototype = Object.create(BaseProto)
    MyApplication.prototype.constructor = MyApplication

    MyApplication.prototype.init = function() {
        this.$el.on('click', this.proxy(this.onClick))
        this.$el.one('dispose-control', this.proxy(this.dispose))
    }

    MyApplication.prototype.dispose = function() {
        this.$el.off('click', this.proxy(this.onClick))
        this.$el.off('dispose-control', this.proxy(this.dispose))
        this.$el.removeData('oc.myApplication')

        this.$el = null

        // In some cases options could contain callbacks, 
        // so it's better to clean them up too.
        this.options = null

        BaseProto.dispose.call(this)
    }

    MyApplication.DEFAULTS = {
        someParam: null
    }

    // PLUGIN DEFINITION
    // ============================

    var old = $.fn.myApplication

    $.fn.myApplication = function (option) {
        var args = Array.prototype.slice.call(arguments, 1), items, result

        items = this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.myApplication')
            var options = $.extend({}, MyApplication.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.myApplication', (data = new MyApplication(this, options)))
            if (typeof option == 'string') result = data[option].apply(data, args)
            if (typeof result != 'undefined') return false
        })

        return result ? result : items
    }

    $.fn.myApplication.Constructor = MyApplication

    $.fn.myApplication.noConflict = function () {
        $.fn.myApplication = old
        return this
    }

    // Add this only if required
    $(document).render(function (){
        $('[data-my-application]').myApplication()
    })

}(window.jQuery);
```
