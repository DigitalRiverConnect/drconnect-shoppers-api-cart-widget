define(['util/Class'], function(Class) {
    return Class.extend({
        init: function(options) {
            var self = this;
            self.setOptions(options);
            self.compileTemplates();
        },

        compileTemplates : function() {
            // Extend this function in implementing classes.
        },

        setOptions : function(o) {
            var self = this;
            self.options = $.extend({}, self.getDefaults(), o);
        },

        getOptions : function() {
            var self = this;
            return (self.options) ? self.options : {};
        },

        getOption : function(k) {
            var self = this;
            return self.options[k];
        },

        setOption : function(k, v) {
            var self = this;
            self.options[k] = v;
        },

        getDefaults : function() {
            return {};
        }
    });
});