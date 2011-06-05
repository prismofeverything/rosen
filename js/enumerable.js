Object.K = function(x) {return x;};

Object.extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

Object.extend(Object, {
    inspect: function(object) {
        try {
            if (Object.isUndefined(object)) return 'undefined';
            if (object === null) return 'null';
            return object.inspect ? object.inspect() : String(object);
        } catch (e) {
            if (e instanceof RangeError) return '...';
            throw e;
        }
    },

    toJSON: function(object) {
        var type = typeof object;
        switch (type) {
          case 'undefined':
          case 'function':
          case 'unknown': return;
          case 'boolean': return object.toString();
        }

        if (object === null) return 'null';
            if (object.toJSON) return object.toJSON();
        if (Object.isElement(object)) return;

        var results = [];
        for (var property in object) {
            var value = Object.toJSON(object[property]);
            if (!Object.isUndefined(value))
                results.push(property.toJSON() + ': ' + value);
        }

        return '{' + results.join(', ') + '}';
    },

    toQueryString: function(object) {
        return $H(object).toQueryString();
    },

    toHTML: function(object) {
        return object && object.toHTML ? object.toHTML() : String.interpret(object);
    },

        keys: function(object) {
            var keys = [];
            for (var property in object)
                keys.push(property);
            return keys;
        },

    values: function(object) {
        var values = [];
        for (var property in object)
            values.push(object[property]);
        return values;
    },

    clone: function(object) {
        return Object.extend({ }, object);
    },

    isElement: function(object) {
        return object && object.nodeType == 1;
    },

    isArray: function(object) {
        return object != null && typeof object == "object" &&
            'splice' in object && 'join' in object;
    },

    isFunction: function(object) {
        return typeof object == "function";
    },

    isString: function(object) {
        return typeof object == "string";
    },

    isNumber: function(object) {
        return typeof object == "number";
    },

    isUndefined: function(object) {
        return typeof object == "undefined";
    }
});

Object.extend(Function.prototype, {
    argumentNames: function() {
        var names = this.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",").invoke("strip");
        return names.length == 1 && !names[0] ? [] : names;
    },

    bind: function() {
            if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
        var __method = this, args = $A(arguments), object = args.shift();
        return function() {
            return __method.apply(object, args.concat($A(arguments)));
        };
    },

    bindAsEventListener: function() {
        var __method = this, args = $A(arguments), object = args.shift();
        return function(event) {
            return __method.apply(object, [event || window.event].concat(args));
        };
    },

    curry: function() {
        if (!arguments.length) return this;
        var __method = this, args = $A(arguments);
        return function() {
            return __method.apply(this, args.concat($A(arguments)));
        };
    },

    delay: function() {
        var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
        return window.setTimeout(function() {
            return __method.apply(__method, args);
        }, timeout);
    },

    wrap: function(wrapper) {
        var __method = this;
        return function() {
            return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
        };
    },

    methodize: function() {
        if (this._methodized) return this._methodized;
        var __method = this;
        return this._methodized = function() {
            return __method.apply(null, [this].concat($A(arguments)));
        };
    }
});

Object.extend = function(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
};

Object.extend(Object, {
    inspect: function(object) {
        try {
            if (Object.isUndefined(object)) return 'undefined';
            if (object === null) return 'null';
            return object.inspect ? object.inspect() : String(object);
        } catch (e) {
            if (e instanceof RangeError) return '...';
            throw e;
        }
    },

    toJSON: function(object) {
        var type = typeof object;
        switch (type) {
          case 'undefined':
          case 'function':
          case 'unknown': return;
          case 'boolean': return object.toString();
        }

        if (object === null) return 'null';
        if (object.toJSON) return object.toJSON();
            if (Object.isElement(object)) return;

        var results = [];
        for (var property in object) {
            var value = Object.toJSON(object[property]);
            if (!Object.isUndefined(value))
                results.push(property.toJSON() + ': ' + value);
        }

        return '{' + results.join(', ') + '}';
    },

    toQueryString: function(object) {
        return $H(object).toQueryString();
    },

    toHTML: function(object) {
        return object && object.toHTML ? object.toHTML() : String.interpret(object);
    },

    keys: function(object) {
        var keys = [];
        for (var property in object)
            keys.push(property);
        return keys;
    },

    values: function(object) {
        var values = [];
        for (var property in object)
            values.push(object[property]);
        return values;
    },

    clone: function(object) {
        return Object.extend({ }, object);
    },

    isElement: function(object) {
        return object && object.nodeType == 1;
    },

    isArray: function(object) {
        return object != null && typeof object == "object" &&
            'splice' in object && 'join' in object;
    },

    isHash: function(object) {
            return object instanceof Hash;
        },

    isFunction: function(object) {
        return typeof object == "function";
    },

    isString: function(object) {
        return typeof object == "string";
    },

        isNumber: function(object) {
            return typeof object == "number";
        },

    isUndefined: function(object) {
        return typeof object == "undefined";
    }
});

Object.extend(Function.prototype, {
    argumentNames: function() {
        var names = this.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",").invoke("strip");
        return names.length == 1 && !names[0] ? [] : names;
    },

    bind: function() {
        if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
        var __method = this, args = $A(arguments), object = args.shift();
        return function() {
            return __method.apply(object, args.concat($A(arguments)));
        };
    },

    bindAsEventListener: function() {
        var __method = this, args = $A(arguments), object = args.shift();
        return function(event) {
            return __method.apply(object, [event || window.event].concat(args));
        };
    },

    curry: function() {
            if (!arguments.length) return this;
        var __method = this, args = $A(arguments);
        return function() {
            return __method.apply(this, args.concat($A(arguments)));
        };
    },

    delay: function() {
        var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
        return window.setTimeout(function() {
            return __method.apply(__method, args);
        }, timeout);
    },

    wrap: function(wrapper) {
        var __method = this;
        return function() {
            return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
        };
    },

    methodize: function() {
        if (this._methodized) return this._methodized;
        var __method = this;
        return this._methodized = function() {
            return __method.apply(null, [this].concat($A(arguments)));
        };
    }
});

var $break = { };

var Enumerable = {
    each: function(iterator, context) {
            var index = 0;
        try {
            this._each(function(value) {
                iterator(value, index++);
            });
        } catch (e) {
            if (e != $break) throw e;
        }
        return this;
    },

    eachSlice: function(number, iterator, context) {
        var index = -number, slices = [], array = this.toArray();
        while ((index += number) < array.length)
            slices.push(array.slice(index, index+number));
        return slices.collect(iterator, context);
    },

    all: function(iterator, context) {
        var result = true;
        this.each(function(value, index) {
            result = result && !!iterator(value, index);
            if (!result) throw $break;
        });
        return result;
    },

    any: function(iterator, context) {
        var result = false;
        this.each(function(value, index) {
            if (result = !!iterator(value, index))
                throw $break;
        });
        return result;
    },

    collect: function(iterator, context) {
        var results = [];
        this.each(function(value, index) {
            results.push(iterator(value, index));
        });
        return results;
    },

    detect: function(iterator, context) {
        var result;
        this.each(function(value, index) {
            if (iterator(value, index)) {
                result = value;
                throw $break;
            }
        });
        return result;
    },

    findAll: function(iterator, context) {
        var results = [];
        this.each(function(value, index) {
            if (iterator(value, index))
                results.push(value);
        });
        return results;
    },

    grep: function(filter, iterator, context) {
        var results = [];

        if (Object.isString(filter))
            filter = new RegExp(filter);

        this.each(function(value, index) {
            if (filter.match(value))
                results.push(iterator(value, index));
        });
        return results;
    },

    include: function(object) {
        if (Object.isFunction(this.indexOf))
            if (this.indexOf(object) != -1) return true;

        var found = false;
        this.each(function(value) {
            if (value == object) {
                found = true;
                throw $break;
            }
        });
        return found;
    },

    inGroupsOf: function(number, fillWith) {
        fillWith = Object.isUndefined(fillWith) ? null : fillWith;
        return this.eachSlice(number, function(slice) {
            while(slice.length < number) slice.push(fillWith);
            return slice;
        });
    },

    inject: function(memo, iterator, context) {
        this.each(function(value, index) {
            memo = iterator(memo, value, index);
        });
        return memo;
    },

    invoke: function(method) {
        var args = $A(arguments).slice(1);
        return this.map(function(value) {
            return value[method].apply(value, args);
        });
    },

    max: function(iterator, context) {
        var result;
        this.each(function(value, index) {
            value = iterator(value, index);
            if (result == null || value >= result)
                result = value;
        });
        return result;
    },

    min: function(iterator, context) {
        var result;
        this.each(function(value, index) {
            value = iterator(value, index);
            if (result == null || value < result)
                result = value;
        });
        return result;
    },

    partition: function(iterator, context) {
        var trues = [], falses = [];
        this.each(function(value, index) {
            (iterator(value, index) ?
             trues : falses).push(value);
        });
        return [trues, falses];
    },

    pluck: function(property) {
        var results = [];
        this.each(function(value) {
                results.push(value[property]);
        });
        return results;
    },

    reject: function(iterator, context) {
        var results = [];
        this.each(function(value, index) {
            if (!iterator(value, index))
                results.push(value);
        });
        return results;
    },

    sortBy: function(iterator, context) {
            return this.map(function(value, index) {
                return {value: value, criteria: iterator(value, index)};
            }).sort(function(left, right) {
                var a = left.criteria, b = right.criteria;
                return a < b ? -1 : a > b ? 1 : 0;
            }).pluck('value');
    },

    toArray: function() {
        return this.map();
    },

    zip: function() {
        var iterator = Object.K, args = $A(arguments);
        if (Object.isFunction(args.last()))
            iterator = args.pop();

        var collections = [this].concat(args).map($A);
        return this.map(function(value, index) {
            return iterator(collections.pluck(index));
        });
    },

    size: function() {
        return this.toArray().length;
    },

    inspect: function() {
        return '#<Enumerable:' + this.toArray().inspect() + '>';
    }
};

Object.extend(Enumerable, {
    map:     Enumerable.collect,
    find:    Enumerable.detect,
    select:  Enumerable.findAll,
    filter:  Enumerable.findAll,
    member:  Enumerable.include,
    entries: Enumerable.toArray,
    every:   Enumerable.all,
    some:    Enumerable.any
});

function $A(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
    _each: function(iterator) {
        for (var i = 0, length = this.length; i < length; i++)
            iterator(this[i]);
    },

    clear: function() {
        this.length = 0;
        return this;
    },

    first: function() {
        return this[0];
    },

    last: function() {
            return this[this.length - 1];
    },

    compact: function() {
        return this.select(function(value) {
            return value != null;
        });
    },

    flatten: function() {
        return this.inject([], function(array, value) {
            return array.concat(Object.isArray(value) ? value.flatten() : [value]);
        });
    },

    without: function() {
        var values = $A(arguments);
        return this.select(function(value) {
            return !values.include(value);
        });
    },

    reverse: function(inline) {
        return (inline !== false ? this : this.toArray())._reverse();
    },

    reduce: function() {
        return this.length > 1 ? this : this[0];
    },

    uniq: function(sorted) {
        return this.inject([], function(array, value, index) {
            if (0 == index || (sorted ? array.last() != value : !array.include(value)))
                array.push(value);
            return array;
        });
    },

    intersect: function(array) {
        return this.uniq().findAll(function(item) {
            return array.detect(function(value) { return item === value });
        });
    },

    clone: function() {
        return [].concat(this);
    },

    size: function() {
        return this.length;
    },

    inspect: function() {
        return '[' + this.map(Object.inspect).join(', ') + ']';
    },

    push: function(el) {
        this[this.length] = el;
        return this;
    },

    // borrowed from sylvester ------------------------

    // Returns the result of adding the argument to the vector
    add: function(vector) {
        var V = vector;
        if (this.length != V.length) { return null; }
        return this.map(function(x, i) { return x + V[i]; });
    },

    // Returns the result of subtracting the argument from the vector
    subtract: function(vector) {
        var V = vector;
        if (this.length != V.length) { return null; }
        return this.map(function(x, i) { return x - V[i]; });
    },

    // Returns the result of multiplying the elements of the vector by the argument
    multiply: function(k) {
        return this.map(function(x) { return x*k; });
    },

    // Returns the scalar product of the vector with the argument
    // Both vectors must have equal dimensionality
    dot: function(vector) {
        var V = vector;
        var i, product = 0, n = this.length;
        if (n != V.length) { return null; }
        do { product += this[n-1] * V[n-1]; } while (--n);
        return product;
    },

    // Returns the vector's distance from the argument, when considered as a point in space
    distanceSquared: function(obj) {
        if (obj.anchor) { return obj.distanceFrom(this); }
        var V = obj;
        if (V.length != this.length) { return null; }
        var sum = 0, part;
        this.each(function(x, i) {
            part = x - V[i];
            sum += part * part;
        });
        return sum;
    },

    distanceFrom: function(obj) {
        return Math.sqrt(this.distanceSquared(obj));
    },

    // Returns a new vector created by normalizing the receiver
    toUnitVector: function() {
        var r = this.modulus();
        if (r === 0) { return this.clone(); }
        return this.map(function(x) { return x/r; });
    },

    // Returns the modulus ('length') of the vector
    modulus: function() {
        return Math.sqrt(this.dot(this));
    },

    // Rotation matrix about some axis. If no axis is
    // supplied, assume we're after a 2D transform
    rotation_matrix: function(theta, a) {
        if (!a) {
            return [
                [Math.cos(theta),  -Math.sin(theta)],
                [Math.sin(theta),   Math.cos(theta)]
            ];
        }
        var axis = a.clone();
        if (axis.length != 3) { return null; }
        var mod = axis.modulus();
        var x = axis[0]/mod, y = axis[1]/mod, z = axis[2]/mod;
        var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
        // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
        // That proof rotates the co-ordinate system so theta
        // becomes -theta and sin becomes -sin here.
        return [
            [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
            [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
            [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
        ];
    },

    // Rotates the vector about the given object. The object should be a
    // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
    rotate: function(t, obj) {
        var V, R, x, y, z;
        switch (this.length) {
          case 2:
            V = obj || obj;
            if (V.length != 2) { return null; }
            R = this.rotation_matrix(t);
            x = this[0] - V[0];
            y = this[1] - V[1];
            return [
                V[0] + R[0][0] * x + R[0][1] * y,
                V[1] + R[1][0] * x + R[1][1] * y
            ];
            break;
          case 3:
            if (!obj.direction) { return null; }
            var C = obj.pointClosestTo(this);
            R = this.rotation_matrix(t, obj.direction);
            x = this[0] - C[0];
            y = this[1] - C[1];
            z = this[2] - C[2];
            return [
                C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
                C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
                C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
            ];
            break;
        default:
            return null;
        }
    },

    toJSON: function() {
        var results = [];
        this.each(function(object) {
            var value = Object.toJSON(object);
            if (!Object.isUndefined(value)) results.push(value);
        });
        return '[' + results.join(', ') + ']';
    }
});

// use native browser JS 1.6 implementation if available
if (Object.isFunction(Array.prototype.forEach))
    Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
        if (this[i] === item) return i;
    return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

Object.extend(Number.prototype, {
    toColorPart: function() {
        return this.toPaddedString(2, 16);
    },

    succ: function() {
        return this + 1;
    },

    times: function(iterator) {
        $R(0, this, true).each(iterator);
        return this;
    },

    toPaddedString: function(length, radix) {
        var string = this.toString(radix || 10);
        return '0'.times(length - string.length) + string;
    },

    toJSON: function() {
        return isFinite(this) ? this.toString() : 'null';
    }
});

var $R = function(start, end, exclusive) {
    var range = {};

    Object.extend(range, Enumerable);

    range._each = function(iterator) {
        var value = start;
        while (range.include(value)) {
            iterator(value);
            value = value.succ();
        }
    };

    range.include = function(value) {
        if (value < start)
            return false;
        if (exclusive)
            return value < end;
        return value <= end;
    };

    return range;
};

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

