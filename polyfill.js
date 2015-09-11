/**
 * @fileoverview Polyfills.
 * Taken from Mozilla Developer Network https://developer.mozilla.org.
 * @author yuhuibc@gmail.com (Yuhui)
 *
 * @preserve Copyright 2015 Yuhui.
 * Licensed under the GNU General Public License v3.0.
 * Refer to LICENSE for the full license text and copyright
 * notice for this file.
 */

if (!String.isString) {
  String.isString = function(arg) {
    'use strict';
    return Object.prototype.toString.call(arg) === '[object String]';
  };
}

if (!Array.isArray) {
  Array.isArray = function(arg) {
    'use strict';
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';
    if (this === void 0 || this === null) throw new TypeError();
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') throw new TypeError();
    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];
        if (fun.call(thisArg, val, i, t)) res.push(val);
      }
    }
    return res;
  };
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;
    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) return value;
    }
    return undefined;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    'use strict';
    var T, k;
    if (this == null) throw new TypeError(' this is null or not defined');
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) T = thisArg;
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) return false;
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) k = 0;
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
          (searchElement !== searchElement &&
            currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {
    'use strict';
    var T, A, k;
    if (this === null) throw new TypeError(' this is null or not defined');
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) T = thisArg;
    A = new Array(len);
    k = 0;
    while (k < len) {
      var kValue, mappedValue;
      if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
      }
      k++;
    }
    return A;
  };
}

if (!Array.prototype.some) {
  Array.prototype.some = function(fun/*, thisArg*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.some called on null or undefined');
    }
    if (typeof fun !== 'function') throw new TypeError();
    var t = Object(this);
    var len = t.length >>> 0;
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t && fun.call(thisArg, t[i], i, t)) return true;
    }
    return false;
  };
}

if (!Array.prototype.unique) {
  Array.prototype.unique = function() {
    'use strict';
    if (this === void 0 || this === null) throw new TypeError();
    return this.filter(function(elem, pos, self) {
      return self.indexOf(elem) === pos;
    });
  };
}

if (!Object.isObject) {
  Object.isObject = function(arg) {
    'use strict';
    return Object.prototype.toString.call(arg) === '[object Object]';
  };
}

if (!Object.keys) {
  Object.keys = function(arg) {
    'use strict';
    if (arg !== Object(arg)) {
      throw new TypeError('Object.keys called on a non-object');
    }
    var k=[], p;
    for (p in arg) {
      if (Object.prototype.hasOwnProperty.call(arg, p)) {
        k.push(p);
      }
    }
    return k;
  };
}

/**
 * end Polyfill
 */
