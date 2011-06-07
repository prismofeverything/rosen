var linkage = function() {
    // add properties from one object to another.
    var extend = function() {
        var target = arguments[0];
        var len = arguments.length;

        for (var i = 1; i < len; i++) {
            if ((options = arguments[i]) != null) {
                for (var name in options) {
                    var src = target[name];
                    var copy = options[name];

                    if (!options.hasOwnProperty(name)) {continue;} // avoid random things
                    if (target === copy) {continue;} // prevent never-ending loop

                    // provide access to overwritten methods by attaching an 'uber' property 
                    // on the new version that references the function it is overwriting.
                    if (src && typeof src == 'function') {
                        copy.uber = src;
                    }

                    // recurse if we're merging object values (from jquery)
                    if (copy && typeof copy == "object" && !copy.nodeType) {
                        target[name] = extend( // never move original objects, clone them
                            src || (copy.length != null ? [] : {}), 
                            copy
                        );
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };

    var type = function() {
        var methods = {};
        var ancestors = [];

        // if one argument is given, it is the methods.
        // if two, the first is the list of ancestors, the second the methods.
        if (arguments.length === 1) {
            methods = arguments[0];
        } else if (arguments.length === 2) {
            ancestors = arguments[0];
            methods = arguments[1];
        }

        // encapsulate the creation of the function object type.
        var fn = function(args) {
            if (!(this instanceof arguments.callee)) {
                return new arguments.callee(arguments);
            }

            if (typeof this.init == 'function') {
                var ultimate_args = args.callee ? args : arguments;
                this.init.apply(this, ultimate_args);
            }

            return null;
        };
        
        // extend the type with the ancestor types' prototypes.
        var y, len = ancestors.length;
        for (y = 0; y < len; y++) {
            extend(fn.prototype, ancestors[y].prototype);
        }

        // add the methods
        extend(fn.prototype, methods);
        return fn;
    };

    // a simple cache ---------------------

        // give it a function that computes a value
    // it will compute the value the first time it is called,
    // and then cache it.  It uses the cached value
    // until expire is called, which triggers the cache
    // to be recomputed on its next access.
    var cache = function() {
        var obj, find = arguments[0];
        if (arguments.length > 1) {
            obj = arguments[0];
            find = arguments[1];
        }

	    var value = null;

	    var that = function() {
	        if (value === null) {
		        value = obj ? find.call(obj) : find();
	        }
	        return value;
	    };

        that.expiring = function() {};
	    that.expire = function() {
	        value = null;
            obj ? that.expiring.call(obj) : that.expiring();
	    };

	    return that;
    };


    // model of dependent values --------------------

    // a link is a single value which can be watched for changes.
    var link = function() {
	    var value = arguments.length === 0 ? null : arguments[0];
	    var index = 1;
	    var keys = [];
	    var observers = [];

	    // if called with no arguments, returns its value
	    // a single argument sets the value
	    var that = function() {
	        if (arguments.length === 0) {
		        return value;
	        } else {
		        value = arguments[0];

		        // trigger observers
		        if (keys.length > 0) {
		            for (var key=0; key < keys.length; key++) {
			            observers[keys[key]](value);
		            }
		        }

		        return value;
	        }
	    };

	    // watch takes a function of one argument
	    // which is called whenever this value changes
	    that.watch = function(observer) {
	        var id = index;
	        observers[id] = observer;
	        keys.push(id);
	        index++;

	        return id;
	    };

	    // given the id returned from a previous watch() call,
	    // disables that observer
	    that.unwatch = function(id) {
	        keys.splice(keys.indexOf(id), 1);
            observers[id] = undefined;
	    };

	    return that;
    };
    
    var wheel = type({
        init: function() {
            this.scope = 0;
            this.slots = [];
            this.oddsmap = {}; },

        add: function(item, probability) {
            this.scope += probability;
            this.oddsmap[''+item] = probability;
            this.slots.push({item: item, probability: probability}); },

        odds: function(item) {
	        return this.oddsmap[''+item]; },

        spectrum: function(point) {
            var wheee = point * this.scope;
            var seek = 0;
            var chosen;
            while (wheee > 0) {
                chosen = this.slots[seek].item;
                wheee -= this.slots[seek].probability;
                seek += 1; }
            return chosen; },

        spin: function() {
            return this.spectrum(Math.random()); } });

    // provide a means to call any chain of properties or functions by string
    var access = function(obj, entry) {
	    if (entry) {
	        var path = entry.split('.');
	        var component = path.shift();
	        var parts = component.match(/([^\(]+)\(([^\)]*)\)/);
	        var found = parts === null ? obj[component] : obj[parts[1]](parts[2]);

	        return found.access(path.join('.'));
	    } else {
		    return obj;
	    }
    };
    
    return {
        extend: extend,
        type: type,
        cache: cache,
        link: link,
        wheel: wheel,
        access: access
    };


}();

