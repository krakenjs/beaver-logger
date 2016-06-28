(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("$logger", [], factory);
	else if(typeof exports === 'object')
		exports["$logger"] = factory();
	else
		root["$logger"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _logger = __webpack_require__(1);

	Object.keys(_logger).forEach(function (key) {
	  if (key === "default") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _logger[key];
	    }
	  });
	});

	var _init = __webpack_require__(7);

	Object.keys(_init).forEach(function (key) {
	  if (key === "default") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _init[key];
	    }
	  });
	});

	var _transitions = __webpack_require__(9);

	Object.keys(_transitions).forEach(function (key) {
	  if (key === "default") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _transitions[key];
	    }
	  });
	});

	var _builders = __webpack_require__(5);

	Object.keys(_builders).forEach(function (key) {
	  if (key === "default") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _builders[key];
	    }
	  });
	});
	exports['default'] = module.exports;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.flush = exports.tracking = exports.buffer = undefined;
	exports.print = print;
	exports.immediateFlush = immediateFlush;
	exports.log = log;
	exports.debug = debug;
	exports.info = info;
	exports.warn = warn;
	exports.error = error;
	exports.track = track;

	var _util = __webpack_require__(2);

	var _builders = __webpack_require__(5);

	var _config = __webpack_require__(6);

	var buffer = exports.buffer = [];
	var tracking = exports.tracking = {};

	function print(level, event, payload) {

	    if (!window.console || !window.console.log) {
	        return;
	    }

	    payload = payload || {};

	    var args = [event];

	    args.push(payload);

	    if (payload.error || payload.warning) {
	        args.push('\n\n', payload.error || payload.warning);
	    }

	    (window.console[level] || window.console.log).apply(window.console, args);
	}

	function immediateFlush() {
	    var async = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];


	    if (!_config.config.uri) {
	        return;
	    }

	    var hasBuffer = buffer.length;
	    var hasTracking = Object.keys(tracking).length;

	    if (!hasBuffer && !hasTracking) {
	        return;
	    }

	    if (hasTracking) {
	        print('info', 'tracking', tracking);
	    }

	    var meta = {};

	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        for (var _iterator = _builders.metaBuilders[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var builder = _step.value;

	            try {
	                (0, _util.extend)(meta, builder(), false);
	            } catch (err) {
	                console.error('Error in custom meta builder:', err.stack || err.toString());
	            }
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator['return']) {
	                _iterator['return']();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }

	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;

	    try {
	        for (var _iterator2 = _builders.trackingBuilders[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var _builder = _step2.value;

	            try {
	                (0, _util.extend)(tracking, _builder(), false);
	            } catch (err) {
	                console.error('Error in custom tracking builder:', err.stack || err.toString());
	            }
	        }
	    } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
	                _iterator2['return']();
	            }
	        } finally {
	            if (_didIteratorError2) {
	                throw _iteratorError2;
	            }
	        }
	    }

	    var headers = {};

	    var _iteratorNormalCompletion3 = true;
	    var _didIteratorError3 = false;
	    var _iteratorError3 = undefined;

	    try {
	        for (var _iterator3 = _builders.headerBuilders[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var _builder2 = _step3.value;

	            try {
	                (0, _util.extend)(headers, _builder2(), false);
	            } catch (err) {
	                console.error('Error in custom header builder:', err.stack || err.toString());
	            }
	        }
	    } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
	                _iterator3['return']();
	            }
	        } finally {
	            if (_didIteratorError3) {
	                throw _iteratorError3;
	            }
	        }
	    }

	    var events = buffer;

	    var req = (0, _util.ajax)('post', _config.config.uri, headers, {
	        events: events,
	        meta: meta,
	        tracking: tracking
	    }, async);

	    exports.buffer = buffer = [];
	    exports.tracking = tracking = {};

	    return req;
	}

	var flush = exports.flush = (0, _util.promiseDebounce)(immediateFlush, _config.config.debounceInterval);

	function enqueue(level, event, payload) {

	    buffer.push({
	        level: level,
	        event: event,
	        payload: payload
	    });

	    if (_config.config.autoLog.indexOf(level) > -1) {
	        flush();
	    }
	}

	function log(level, event, payload) {

	    payload = payload || {};

	    if (typeof payload === 'string') {
	        payload = {
	            message: payload
	        };
	    } else if (payload instanceof Error) {
	        payload = {
	            error: payload.stack || payload.toString()
	        };
	    }

	    payload.timestamp = Date.now();

	    var _iteratorNormalCompletion4 = true;
	    var _didIteratorError4 = false;
	    var _iteratorError4 = undefined;

	    try {
	        for (var _iterator4 = _builders.payloadBuilders[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	            var builder = _step4.value;

	            try {
	                (0, _util.extend)(payload, builder(), false);
	            } catch (err) {
	                console.error('Error in custom payload builder:', err.stack || err.toString());
	            }
	        }
	    } catch (err) {
	        _didIteratorError4 = true;
	        _iteratorError4 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion4 && _iterator4['return']) {
	                _iterator4['return']();
	            }
	        } finally {
	            if (_didIteratorError4) {
	                throw _iteratorError4;
	            }
	        }
	    }

	    print(level, event, payload);

	    if (buffer.length === _config.config.sizeLimit) {
	        enqueue('info', 'logger_max_buffer_length');
	    } else if (buffer.length < _config.config.sizeLimit) {
	        enqueue(level, event, payload);
	    }
	}

	function debug(event, payload) {
	    return log('debug', event, payload);
	}

	function info(event, payload) {
	    return log('info', event, payload);
	}

	function warn(event, payload) {
	    return log('warn', event, payload);
	}

	function error(event, payload) {
	    return log('error', event, payload);
	}

	function track(payload) {
	    (0, _util.extend)(tracking, payload || {}, false);
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.windowReady = undefined;
	exports.extend = extend;
	exports.isSameDomain = isSameDomain;
	exports.ajax = ajax;
	exports.promiseDebounce = promiseDebounce;
	exports.safeInterval = safeInterval;
	exports.uniqueID = uniqueID;

	var _es6PromiseMin = __webpack_require__(3);

	function extend(dest, src) {
	    var over = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

	    dest = dest || {};
	    src = src || {};

	    for (var i in src) {
	        if (src.hasOwnProperty(i)) {
	            if (over || !dest.hasOwnProperty(i)) {
	                dest[i] = src[i];
	            }
	        }
	    }

	    return dest;
	}

	function isSameDomain(url) {
	    var match = url.match(/https?:\/\/[^/]+/);

	    if (!match) {
	        return true;
	    }

	    return match[0] === window.location.protocol + '//' + window.location.host;
	}

	function ajax(method, url) {
	    var headers = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	    var data = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
	    var async = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];


	    return new _es6PromiseMin.Promise(function (resolve) {
	        var XRequest = window.XMLHttpRequest || window.ActiveXObject;

	        if (window.XDomainRequest && !isSameDomain(url)) {
	            XRequest = window.XDomainRequest;
	        }

	        var req = new XRequest('MSXML2.XMLHTTP.3.0');
	        req.open(method.toUpperCase(), url, async);

	        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	        req.setRequestHeader('Content-type', 'application/json');

	        for (var headerName in headers) {
	            if (headers.hasOwnProperty(headerName)) {
	                req.setRequestHeader(headerName, headers[headerName]);
	            }
	        }

	        req.onreadystatechange = function () {
	            if (req.readyState > 3) {
	                resolve();
	            }
	        };
	        req.send(JSON.stringify(data).replace(/&/g, '%26'));
	    });
	}

	function promiseDebounce(method, interval) {

	    var debounce = {};

	    return function () {
	        var args = arguments;

	        if (debounce.timeout) {
	            clearTimeout(debounce.timeout);
	            delete debounce.timeout;
	        }

	        debounce.timeout = setTimeout(function () {

	            var resolver = debounce.resolver;
	            var rejector = debounce.rejector;

	            delete debounce.promise;
	            delete debounce.resolver;
	            delete debounce.rejector;
	            delete debounce.timeout;

	            return _es6PromiseMin.Promise.resolve().then(function () {
	                return method.apply(null, args);
	            }).then(resolver, rejector);
	        }, interval);

	        debounce.promise = debounce.promise || new _es6PromiseMin.Promise(function (resolver, rejector) {
	            debounce.resolver = resolver;
	            debounce.rejector = rejector;
	        });

	        return debounce.promise;
	    };
	}

	var windowReady = exports.windowReady = new _es6PromiseMin.Promise(function (resolve) {
	    if (document.readyState === 'complete') {
	        resolve();
	    }

	    window.addEventListener('load', resolve);
	});

	function safeInterval(method, time) {

	    var timeout = void 0;

	    function loop() {
	        timeout = setTimeout(function () {
	            method();
	            loop();
	        }, time);
	    }

	    loop();

	    return {
	        cancel: function cancel() {
	            clearTimeout(timeout);
	        }
	    };
	}

	function uniqueID() {
	    var chars = '0123456789abcdef';

	    return 'xxxxxxxxxx'.replace(/./g, function () {
	        return chars.charAt(Math.floor(Math.random() * chars.length));
	    });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   2.0.1
	 */

	(function(){function r(a,b){n[l]=a;n[l+1]=b;l+=2;2===l&&A()}function s(a){return"function"===typeof a}function F(){return function(){process.nextTick(t)}}function G(){var a=0,b=new B(t),c=document.createTextNode("");b.observe(c,{characterData:!0});return function(){c.data=a=++a%2}}function H(){var a=new MessageChannel;a.port1.onmessage=t;return function(){a.port2.postMessage(0)}}function I(){return function(){setTimeout(t,1)}}function t(){for(var a=0;a<l;a+=2)(0,n[a])(n[a+1]),n[a]=void 0,n[a+1]=void 0;
	l=0}function p(){}function J(a,b,c,d){try{a.call(b,c,d)}catch(e){return e}}function K(a,b,c){r(function(a){var e=!1,f=J(c,b,function(c){e||(e=!0,b!==c?q(a,c):m(a,c))},function(b){e||(e=!0,g(a,b))});!e&&f&&(e=!0,g(a,f))},a)}function L(a,b){1===b.a?m(a,b.b):2===a.a?g(a,b.b):u(b,void 0,function(b){q(a,b)},function(b){g(a,b)})}function q(a,b){if(a===b)g(a,new TypeError("You cannot resolve a promise with itself"));else if("function"===typeof b||"object"===typeof b&&null!==b)if(b.constructor===a.constructor)L(a,
	b);else{var c;try{c=b.then}catch(d){v.error=d,c=v}c===v?g(a,v.error):void 0===c?m(a,b):s(c)?K(a,b,c):m(a,b)}else m(a,b)}function M(a){a.f&&a.f(a.b);x(a)}function m(a,b){void 0===a.a&&(a.b=b,a.a=1,0!==a.e.length&&r(x,a))}function g(a,b){void 0===a.a&&(a.a=2,a.b=b,r(M,a))}function u(a,b,c,d){var e=a.e,f=e.length;a.f=null;e[f]=b;e[f+1]=c;e[f+2]=d;0===f&&a.a&&r(x,a)}function x(a){var b=a.e,c=a.a;if(0!==b.length){for(var d,e,f=a.b,g=0;g<b.length;g+=3)d=b[g],e=b[g+c],d?C(c,d,e,f):e(f);a.e.length=0}}function D(){this.error=
	null}function C(a,b,c,d){var e=s(c),f,k,h,l;if(e){try{f=c(d)}catch(n){y.error=n,f=y}f===y?(l=!0,k=f.error,f=null):h=!0;if(b===f){g(b,new TypeError("A promises callback cannot return that same promise."));return}}else f=d,h=!0;void 0===b.a&&(e&&h?q(b,f):l?g(b,k):1===a?m(b,f):2===a&&g(b,f))}function N(a,b){try{b(function(b){q(a,b)},function(b){g(a,b)})}catch(c){g(a,c)}}function k(a,b,c,d){this.n=a;this.c=new a(p,d);this.i=c;this.o(b)?(this.m=b,this.d=this.length=b.length,this.l(),0===this.length?m(this.c,
	this.b):(this.length=this.length||0,this.k(),0===this.d&&m(this.c,this.b))):g(this.c,this.p())}function h(a){O++;this.b=this.a=void 0;this.e=[];if(p!==a){if(!s(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof h))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");N(this,a)}}var E=Array.isArray?Array.isArray:function(a){return"[object Array]"===
	Object.prototype.toString.call(a)},l=0,w="undefined"!==typeof window?window:{},B=w.MutationObserver||w.WebKitMutationObserver,w="undefined"!==typeof Uint8ClampedArray&&"undefined"!==typeof importScripts&&"undefined"!==typeof MessageChannel,n=Array(1E3),A;A="undefined"!==typeof process&&"[object process]"==={}.toString.call(process)?F():B?G():w?H():I();var v=new D,y=new D;k.prototype.o=function(a){return E(a)};k.prototype.p=function(){return Error("Array Methods must be provided an Array")};k.prototype.l=
	function(){this.b=Array(this.length)};k.prototype.k=function(){for(var a=this.length,b=this.c,c=this.m,d=0;void 0===b.a&&d<a;d++)this.j(c[d],d)};k.prototype.j=function(a,b){var c=this.n;"object"===typeof a&&null!==a?a.constructor===c&&void 0!==a.a?(a.f=null,this.g(a.a,b,a.b)):this.q(c.resolve(a),b):(this.d--,this.b[b]=this.h(a))};k.prototype.g=function(a,b,c){var d=this.c;void 0===d.a&&(this.d--,this.i&&2===a?g(d,c):this.b[b]=this.h(c));0===this.d&&m(d,this.b)};k.prototype.h=function(a){return a};
	k.prototype.q=function(a,b){var c=this;u(a,void 0,function(a){c.g(1,b,a)},function(a){c.g(2,b,a)})};var O=0;h.all=function(a,b){return(new k(this,a,!0,b)).c};h.race=function(a,b){function c(a){q(e,a)}function d(a){g(e,a)}var e=new this(p,b);if(!E(a))return (g(e,new TypeError("You must pass an array to race.")), e);for(var f=a.length,h=0;void 0===e.a&&h<f;h++)u(this.resolve(a[h]),void 0,c,d);return e};h.resolve=function(a,b){if(a&&"object"===typeof a&&a.constructor===this)return a;var c=new this(p,b);
	q(c,a);return c};h.reject=function(a,b){var c=new this(p,b);g(c,a);return c};h.prototype={constructor:h,then:function(a,b){var c=this.a;if(1===c&&!a||2===c&&!b)return this;var d=new this.constructor(p),e=this.b;if(c){var f=arguments[c-1];r(function(){C(c,d,f,e)})}else u(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}};var z={Promise:h,polyfill:function(){var a;a="undefined"!==typeof global?global:"undefined"!==typeof window&&window.document?window:self;"Promise"in a&&"resolve"in
	a.Promise&&"reject"in a.Promise&&"all"in a.Promise&&"race"in a.Promise&&function(){var b;new a.Promise(function(a){b=a});return s(b)}()||(a.Promise=h)}}; true?!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return z}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"undefined"!==typeof module&&module.exports?module.exports=z:"undefined"!==typeof this&&(this.ES6Promise=z)}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.addPayloadBuilder = addPayloadBuilder;
	exports.addMetaBuilder = addMetaBuilder;
	exports.addTrackingBuilder = addTrackingBuilder;
	exports.addHeaderBuilder = addHeaderBuilder;
	var payloadBuilders = exports.payloadBuilders = [];
	var metaBuilders = exports.metaBuilders = [];
	var trackingBuilders = exports.trackingBuilders = [];
	var headerBuilders = exports.headerBuilders = [];

	function addPayloadBuilder(builder) {
	    payloadBuilders.push(builder);
	}

	function addMetaBuilder(builder) {
	    metaBuilders.push(builder);
	}

	function addTrackingBuilder(builder) {
	    trackingBuilders.push(builder);
	}

	function addHeaderBuilder(builder) {
	    headerBuilders.push(builder);
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var config = exports.config = {

	    uri: '',

	    initial_state_name: 'init',

	    flushInterval: 10 * 60 * 1000,
	    debounceInterval: 10,

	    sizeLimit: 300,

	    heartbeat: true,
	    heartbeatConsoleLog: true,
	    heartbeatInterval: 5000,
	    hearbeatMaxThreshold: 50,
	    heartbeatTooBusyThreshold: 10000,

	    autoLog: ['warn', 'error'],

	    logUnload: true,
	    logUnloadSync: false,
	    logPerformance: true
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;

	var _config = __webpack_require__(6);

	var _util = __webpack_require__(2);

	var _performance = __webpack_require__(8);

	var _logger = __webpack_require__(1);

	var initiated = false;

	function init(conf) {
	    (0, _util.extend)(_config.config, conf || {});

	    if (initiated) {
	        return;
	    }

	    initiated = true;

	    if (_config.config.logPerformance) {
	        (0, _performance.initPerformance)();
	    }

	    if (_config.config.heartbeat) {
	        (0, _performance.initHeartBeat)();
	    }

	    if (_config.config.logUnload) {
	        (function () {
	            var async = !_config.config.logUnloadSync;

	            window.addEventListener('beforeunload', function () {
	                (0, _logger.info)('window_beforeunload');
	                (0, _logger.immediateFlush)(async);
	            });

	            window.addEventListener('unload', function () {
	                (0, _logger.info)('window_unload');
	                (0, _logger.immediateFlush)(async);
	            });
	        })();
	    }

	    if (_config.config.flushInterval) {
	        setInterval(_logger.flush, _config.config.flushInterval);
	    }

	    if (window.beaverLogQueue) {
	        window.beaverLogQueue.forEach(function (payload) {
	            (0, _logger.log)(payload.level, payload.event, payload);
	        });
	        delete window.beaverLogQueue;
	    }
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.reqTimer = exports.clientTimer = undefined;
	exports.now = now;
	exports.reqStartElapsed = reqStartElapsed;
	exports.initHeartBeat = initHeartBeat;
	exports.initPerformance = initPerformance;

	var _config = __webpack_require__(6);

	var _logger = __webpack_require__(1);

	var _builders = __webpack_require__(5);

	var _util = __webpack_require__(2);

	var enablePerformance = window && window.performance && performance.now && performance.timing && performance.timing.connectEnd && performance.timing.navigationStart && Math.abs(performance.now() - Date.now()) > 1000 && performance.now() - (performance.timing.connectEnd - performance.timing.navigationStart) > 0;

	function now() {
	    if (enablePerformance) {
	        return performance.now();
	    } else {
	        return Date.now();
	    }
	}

	function timer(startTime) {
	    startTime = startTime !== undefined ? startTime : now();

	    return {
	        startTime: startTime,

	        elapsed: function elapsed() {
	            return parseInt(now() - startTime, 10);
	        },
	        reset: function reset() {
	            startTime = now();
	        }
	    };
	}

	function reqStartElapsed() {
	    if (enablePerformance) {
	        var timing = window.performance.timing;
	        return parseInt(timing.connectEnd - timing.navigationStart, 10);
	    }
	}

	var clientTimer = exports.clientTimer = timer();
	var reqTimer = exports.reqTimer = timer(reqStartElapsed());

	function initHeartBeat() {

	    var heartBeatTimer = timer();
	    var heartbeatCount = 0;

	    (0, _util.safeInterval)(function () {

	        if (!_logger.buffer.length || _logger.buffer[_logger.buffer.length - 1].event !== 'heartbeat') {
	            heartbeatCount = 0;
	        }

	        if (!_logger.buffer.length || heartbeatCount > _config.config.hearbeatMaxThreshold) {
	            return;
	        }

	        heartbeatCount += 1;

	        var elapsed = heartBeatTimer.elapsed();
	        var lag = elapsed - _config.config.heartbeatInterval;

	        if (lag >= _config.config.heartbeatTooBusyThreshold) {
	            (0, _logger.info)('toobusy', {
	                count: heartbeatCount,
	                elapsed: elapsed,
	                lag: lag
	            }, {
	                noConsole: !_config.config.heartbeatConsoleLog
	            });
	        }

	        (0, _logger.info)('heartbeat', {
	            count: heartbeatCount,
	            elapsed: elapsed,
	            lag: lag
	        }, {
	            noConsole: !_config.config.heartbeatConsoleLog
	        });
	    }, _config.config.heartbeatInterval);
	}

	function initPerformance() {

	    if (!enablePerformance) {
	        return (0, _logger.info)('no_performance_data');
	    }

	    (0, _builders.addPayloadBuilder)(function () {

	        var payload = {};

	        payload.client_elapsed = clientTimer.elapsed();

	        if (enablePerformance) {
	            payload.req_elapsed = reqTimer.elapsed();
	        }

	        return payload;
	    });

	    _util.windowReady.then(function () {

	        var keys = ['connectEnd', 'connectStart', 'domComplete', 'domContentLoadedEventEnd', 'domContentLoadedEventStart', 'domInteractive', 'domLoading', 'domainLookupEnd', 'domainLookupStart', 'fetchStart', 'loadEventEnd', 'loadEventStart', 'navigationStart', 'redirectEnd', 'redirectStart', 'requestStart', 'responseEnd', 'responseStart', 'secureConnectionStart', 'unloadEventEnd', 'unloadEventStart'];

	        var timing = {};

	        keys.forEach(function (key) {
	            timing[key] = parseInt(window.performance.timing[key], 10) || 0;
	        });

	        var offset = timing.connectEnd - timing.navigationStart;

	        if (timing.connectEnd) {
	            Object.keys(timing).forEach(function (name) {
	                var time = timing[name];
	                if (time) {
	                    (0, _logger.info)('timing_' + name, {
	                        client_elapsed: parseInt(time - timing.connectEnd - (clientTimer.startTime - offset), 10),
	                        req_elapsed: parseInt(time - timing.connectEnd, 10)
	                    });
	                }
	            });
	        }

	        (0, _logger.info)('timing', timing);
	        (0, _logger.info)('memory', window.performance.memory);
	        (0, _logger.info)('navigation', window.performance.navigation);

	        if (window.performance.getEntries) {
	            window.performance.getEntries().forEach(function (resource) {
	                if (['link', 'script', 'img', 'css'].indexOf(resource.initiatorType) > -1) {
	                    (0, _logger.info)(resource.initiatorType, resource);
	                }
	            });
	        }
	    });
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.startTransition = startTransition;
	exports.endTransition = endTransition;
	exports.transition = transition;

	var _performance = __webpack_require__(8);

	var _logger = __webpack_require__(1);

	var _builders = __webpack_require__(5);

	var _util = __webpack_require__(2);

	var _config = __webpack_require__(6);

	var windowID = (0, _util.uniqueID)();
	var pageID = (0, _util.uniqueID)();

	var currentState = _config.config.initial_state_name;
	var startTime = void 0;

	function startTransition() {
	    startTime = (0, _performance.now)();
	}

	function endTransition(toState) {
	    startTime = startTime || (0, _performance.reqStartElapsed)();

	    var currentTime = (0, _performance.now)();
	    var elapsedTime = void 0;

	    if (startTime !== undefined) {
	        elapsedTime = parseInt(currentTime - startTime, 0);
	    }

	    var transitionName = 'transition_' + currentState + '_to_' + toState;

	    (0, _logger.info)(transitionName, {
	        duration: elapsedTime
	    });

	    (0, _logger.track)({
	        transition: transitionName,
	        transition_time: elapsedTime
	    });

	    (0, _logger.immediateFlush)();

	    startTime = currentTime;
	    currentState = toState;
	    pageID = (0, _util.uniqueID)();
	}

	function transition(toState) {
	    startTransition();
	    endTransition(toState);
	}

	(0, _builders.addPayloadBuilder)(function () {
	    return {
	        windowID: windowID,
	        pageID: pageID
	    };
	});

	(0, _builders.addMetaBuilder)(function () {
	    return {
	        state: 'ui_' + currentState
	    };
	});

/***/ }
/******/ ])
});
;