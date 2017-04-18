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

	var _interface = __webpack_require__(1);

	Object.keys(_interface).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _interface[key];
	    }
	  });
	});

	var INTERFACE = _interopRequireWildcard(_interface);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	exports['default'] = INTERFACE;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _logger = __webpack_require__(2);

	Object.keys(_logger).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _logger[key];
	    }
	  });
	});

	var _init = __webpack_require__(7);

	Object.keys(_init).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _init[key];
	    }
	  });
	});

	var _transitions = __webpack_require__(9);

	Object.keys(_transitions).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _transitions[key];
	    }
	  });
	});

	var _builders = __webpack_require__(5);

	Object.keys(_builders).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _builders[key];
	    }
	  });
	});

	var _config = __webpack_require__(6);

	Object.keys(_config).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _config[key];
	    }
	  });
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.flush = exports.tracking = exports.buffer = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.print = print;
	exports.immediateFlush = immediateFlush;
	exports.log = log;
	exports.prefix = prefix;
	exports.debug = debug;
	exports.info = info;
	exports.warn = warn;
	exports.error = error;
	exports.track = track;

	var _util = __webpack_require__(3);

	var _builders = __webpack_require__(5);

	var _config = __webpack_require__(6);

	var buffer = exports.buffer = [];
	var tracking = exports.tracking = [];

	if (Function.prototype.bind && window.console && _typeof(console.log) === 'object') {
	    ['log', 'info', 'warn', 'error'].forEach(function (method) {
	        console[method] = this.bind(console[method], console);
	    }, Function.prototype.call);
	}

	var loaded = false;

	setTimeout(function () {
	    loaded = true;
	}, 1);

	function print(level, event, payload) {

	    if (!loaded) {
	        return setTimeout(function () {
	            return print(level, event, payload);
	        }, 1);
	    }

	    if (!window.console || !window.console.log) {
	        return;
	    }

	    var logLevel = window.LOG_LEVEL || _config.config.logLevel;

	    if (_config.logLevels.indexOf(level) > _config.logLevels.indexOf(logLevel)) {
	        return;
	    }

	    payload = payload || {};

	    var args = [event];

	    if ((0, _util.isIE)()) {
	        payload = JSON.stringify(payload);
	    }

	    args.push(payload);

	    if (payload.error || payload.warning) {
	        args.push('\n\n', payload.error || payload.warning);
	    }

	    try {
	        if (window.console[level] && window.console[level].apply) {
	            window.console[level].apply(window.console, args);
	        } else if (window.console.log && window.console.log.apply) {
	            window.console.log.apply(window.console, args);
	        }
	    } catch (err) {
	        // pass
	    }
	}

	function immediateFlush() {
	    var async = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;


	    if (!_config.config.uri) {
	        return;
	    }

	    var hasBuffer = buffer.length;
	    var hasTracking = tracking.length;

	    if (!hasBuffer && !hasTracking) {
	        return;
	    }

	    var meta = {};

	    for (var _iterator = _builders.metaBuilders, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	        var _ref;

	        if (_isArray) {
	            if (_i >= _iterator.length) break;
	            _ref = _iterator[_i++];
	        } else {
	            _i = _iterator.next();
	            if (_i.done) break;
	            _ref = _i.value;
	        }

	        var builder = _ref;

	        try {
	            (0, _util.extend)(meta, builder(), false);
	        } catch (err) {
	            console.error('Error in custom meta builder:', err.stack || err.toString());
	        }
	    }

	    var headers = {};

	    for (var _iterator2 = _builders.headerBuilders, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
	        var _ref2;

	        if (_isArray2) {
	            if (_i2 >= _iterator2.length) break;
	            _ref2 = _iterator2[_i2++];
	        } else {
	            _i2 = _iterator2.next();
	            if (_i2.done) break;
	            _ref2 = _i2.value;
	        }

	        var _builder = _ref2;

	        try {
	            (0, _util.extend)(headers, _builder(), false);
	        } catch (err) {
	            console.error('Error in custom header builder:', err.stack || err.toString());
	        }
	    }

	    var events = buffer;

	    var req = (0, _util.ajax)('post', _config.config.uri, headers, {
	        events: events,
	        meta: meta,
	        tracking: tracking
	    }, async);

	    exports.buffer = buffer = [];
	    exports.tracking = tracking = [];

	    return req;
	}

	var _flush = (0, _util.promiseDebounce)(immediateFlush, _config.config.debounceInterval);

	exports.flush = _flush;
	function enqueue(level, event, payload) {

	    buffer.push({
	        level: level,
	        event: event,
	        payload: payload
	    });

	    if (_config.config.autoLog.indexOf(level) > -1) {
	        _flush();
	    }
	}

	function log(level, event, payload) {

	    if (_config.config.prefix) {
	        event = _config.config.prefix + '_' + event;
	    }

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

	    for (var _iterator3 = _builders.payloadBuilders, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
	        var _ref3;

	        if (_isArray3) {
	            if (_i3 >= _iterator3.length) break;
	            _ref3 = _iterator3[_i3++];
	        } else {
	            _i3 = _iterator3.next();
	            if (_i3.done) break;
	            _ref3 = _i3.value;
	        }

	        var builder = _ref3;

	        try {
	            (0, _util.extend)(payload, builder(), false);
	        } catch (err) {
	            console.error('Error in custom payload builder:', err.stack || err.toString());
	        }
	    }

	    if (!_config.config.silent) {
	        print(level, event, payload);
	    }

	    if (buffer.length === _config.config.sizeLimit) {
	        enqueue('info', 'logger_max_buffer_length');
	    } else if (buffer.length < _config.config.sizeLimit) {
	        enqueue(level, event, payload);
	    }
	}

	function prefix(name) {

	    return {
	        debug: function debug(event, payload) {
	            return log('debug', name + '_' + event, payload);
	        },
	        info: function info(event, payload) {
	            return log('info', name + '_' + event, payload);
	        },
	        warn: function warn(event, payload) {
	            return log('warn', name + '_' + event, payload);
	        },
	        error: function error(event, payload) {
	            return log('error', name + '_' + event, payload);
	        },
	        flush: function flush() {
	            return _flush();
	        }
	    };
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
	    if (payload) {

	        for (var _iterator4 = _builders.trackingBuilders, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
	            var _ref4;

	            if (_isArray4) {
	                if (_i4 >= _iterator4.length) break;
	                _ref4 = _iterator4[_i4++];
	            } else {
	                _i4 = _iterator4.next();
	                if (_i4.done) break;
	                _ref4 = _i4.value;
	            }

	            var builder = _ref4;

	            try {
	                (0, _util.extend)(payload, builder(), false);
	            } catch (err) {
	                console.error('Error in custom tracking builder:', err.stack || err.toString());
	            }
	        }

	        print('debug', 'tracking', payload);

	        tracking.push(payload);
	    }
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.windowReady = undefined;
	exports.extend = extend;
	exports.isSameProtocol = isSameProtocol;
	exports.isSameDomain = isSameDomain;
	exports.ajax = ajax;
	exports.promiseDebounce = promiseDebounce;
	exports.safeInterval = safeInterval;
	exports.uniqueID = uniqueID;
	exports.isIE = isIE;

	var _promise = __webpack_require__(4);

	function extend(dest, src) {
	    var over = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

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

	function isSameProtocol(url) {
	    return window.location.protocol === url.split('/')[0];
	}

	function isSameDomain(url) {
	    var match = url.match(/https?:\/\/[^/]+/);

	    if (!match) {
	        return true;
	    }

	    return match[0] === window.location.protocol + '//' + window.location.host;
	}

	function ajax(method, url) {
	    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	    var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	    var async = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;


	    return new _promise.SyncPromise(function (resolve) {
	        var XRequest = window.XMLHttpRequest || window.ActiveXObject;

	        if (window.XDomainRequest && !isSameDomain(url)) {

	            if (!isSameProtocol(url)) {
	                return resolve();
	            }

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

	            return _promise.SyncPromise.resolve().then(function () {
	                return method.apply(null, args);
	            }).then(resolver, rejector);
	        }, interval);

	        debounce.promise = debounce.promise || new _promise.SyncPromise(function (resolver, rejector) {
	            debounce.resolver = resolver;
	            debounce.rejector = rejector;
	        });

	        return debounce.promise;
	    };
	}

	var windowReady = exports.windowReady = new _promise.SyncPromise(function (resolve) {
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

	function isIE() {
	    return Boolean(window.document.documentMode);
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.patchPromise = patchPromise;

	function trycatch(method, successHandler, errorHandler) {

	    var isCalled = false;
	    var isSuccess = false;
	    var isError = false;
	    var err = void 0,
	        res = void 0;

	    function flush() {
	        if (isCalled) {
	            if (isError) {
	                return errorHandler(err);
	            } else if (isSuccess) {
	                return successHandler(res);
	            }
	        }
	    }

	    try {
	        method(function (result) {
	            res = result;
	            isSuccess = true;
	            flush();
	        }, function (error) {
	            err = error;
	            isError = true;
	            flush();
	        });
	    } catch (error) {
	        return errorHandler(error);
	    }

	    isCalled = true;
	    flush();
	}

	var possiblyUnhandledPromiseHandlers = [];
	var possiblyUnhandledPromises = [];
	var possiblyUnhandledPromiseTimeout = void 0;

	function addPossiblyUnhandledPromise(promise) {
	    possiblyUnhandledPromises.push(promise);
	    possiblyUnhandledPromiseTimeout = possiblyUnhandledPromiseTimeout || setTimeout(flushPossiblyUnhandledPromises, 1);
	}

	function flushPossiblyUnhandledPromises() {

	    possiblyUnhandledPromiseTimeout = null;
	    var promises = possiblyUnhandledPromises;
	    possiblyUnhandledPromises = [];

	    var _loop = function _loop(i) {
	        var promise = promises[i];

	        if (promise.silentReject) {
	            return 'continue';
	        }

	        promise.handlers.push({
	            onError: function onError(err) {
	                if (promise.silentReject) {
	                    return;
	                }

	                dispatchError(err);
	            }
	        });

	        promise.dispatch();
	    };

	    for (var i = 0; i < promises.length; i++) {
	        var _ret = _loop(i);

	        if (_ret === 'continue') continue;
	    }
	}

	var dispatchedErrors = [];

	function dispatchError(err) {

	    if (dispatchedErrors.indexOf(err) !== -1) {
	        return;
	    }

	    dispatchedErrors.push(err);

	    setTimeout(function () {
	        throw err;
	    }, 1);

	    for (var j = 0; j < possiblyUnhandledPromiseHandlers.length; j++) {
	        possiblyUnhandledPromiseHandlers[j](err);
	    }
	}

	var toString = {}.toString;

	function isPromise(item) {
	    try {
	        if (!item) {
	            return false;
	        }

	        if (window.Window && item instanceof window.Window) {
	            return false;
	        }

	        if (window.constructor && item instanceof window.constructor) {
	            return false;
	        }

	        if (toString) {
	            var name = toString.call(item);

	            if (name === '[object Window]' || name === '[object global]' || name === '[object DOMWindow]') {
	                return false;
	            }
	        }

	        if (item && item.then instanceof Function) {
	            return true;
	        }
	    } catch (err) {
	        return false;
	    }

	    return false;
	}

	var SyncPromise = exports.SyncPromise = function SyncPromise(handler) {

	    this.resolved = false;
	    this.rejected = false;

	    this.silentReject = false;

	    this.handlers = [];

	    addPossiblyUnhandledPromise(this);

	    if (!handler) {
	        return;
	    }

	    var self = this;

	    trycatch(handler, function (res) {
	        return self.resolve(res);
	    }, function (err) {
	        return self.reject(err);
	    });
	};

	SyncPromise.resolve = function SyncPromiseResolve(value) {

	    if (isPromise(value)) {
	        return value;
	    }

	    return new SyncPromise().resolve(value);
	};

	SyncPromise.reject = function SyncPromiseResolve(error) {
	    return new SyncPromise().reject(error);
	};

	SyncPromise.prototype.resolve = function (result) {
	    if (this.resolved || this.rejected) {
	        return this;
	    }

	    if (isPromise(result)) {
	        throw new Error('Can not resolve promise with another promise');
	    }

	    this.resolved = true;
	    this.value = result;
	    this.dispatch();

	    return this;
	};

	SyncPromise.prototype.reject = function (error) {
	    if (this.resolved || this.rejected) {
	        return this;
	    }

	    if (isPromise(error)) {
	        throw new Error('Can not reject promise with another promise');
	    }

	    this.rejected = true;
	    this.value = error;
	    this.dispatch();

	    return this;
	};

	SyncPromise.prototype.asyncReject = function (error) {
	    this.silentReject = true;
	    this.reject(error);
	};

	SyncPromise.prototype.dispatch = function () {
	    var _this = this;

	    if (!this.resolved && !this.rejected) {
	        return;
	    }

	    var _loop2 = function _loop2() {

	        var handler = _this.handlers.shift();

	        var result = void 0,
	            error = void 0;

	        try {
	            if (_this.resolved) {
	                result = handler.onSuccess ? handler.onSuccess(_this.value) : _this.value;
	            } else if (_this.rejected) {
	                if (handler.onError) {
	                    result = handler.onError(_this.value);
	                } else {
	                    error = _this.value;
	                }
	            }
	        } catch (err) {
	            error = err;
	        }

	        if (result === _this) {
	            throw new Error('Can not return a promise from the the then handler of the same promise');
	        }

	        if (!handler.promise) {
	            return 'continue';
	        }

	        if (error) {
	            handler.promise.reject(error);
	        } else if (isPromise(result)) {
	            result.then(function (res) {
	                handler.promise.resolve(res);
	            }, function (err) {
	                handler.promise.reject(err);
	            });
	        } else {
	            handler.promise.resolve(result);
	        }
	    };

	    while (this.handlers.length) {
	        var _ret2 = _loop2();

	        if (_ret2 === 'continue') continue;
	    }
	};

	SyncPromise.prototype.then = function (onSuccess, onError) {

	    if (onSuccess && typeof onSuccess !== 'function' && !onSuccess.call) {
	        throw new Error('Promise.then expected a function for success handler');
	    }

	    if (onError && typeof onError !== 'function' && !onError.call) {
	        throw new Error('Promise.then expected a function for error handler');
	    }

	    var promise = new SyncPromise(null, this);

	    this.handlers.push({
	        promise: promise,
	        onSuccess: onSuccess,
	        onError: onError
	    });

	    this.silentReject = true;

	    this.dispatch();

	    return promise;
	};

	SyncPromise.prototype['catch'] = function (onError) {
	    return this.then(null, onError);
	};

	SyncPromise.prototype['finally'] = function (handler) {
	    return this.then(function (result) {
	        return SyncPromise['try'](handler).then(function () {
	            return result;
	        });
	    }, function (err) {
	        return SyncPromise['try'](handler).then(function () {
	            throw err;
	        });
	    });
	};

	SyncPromise.all = function (promises) {

	    var promise = new SyncPromise();
	    var count = promises.length;
	    var results = [];

	    var _loop3 = function _loop3(i) {

	        var prom = isPromise(promises[i]) ? promises[i] : SyncPromise.resolve(promises[i]);

	        prom.then(function (result) {
	            results[i] = result;
	            count -= 1;
	            if (count === 0) {
	                promise.resolve(results);
	            }
	        }, function (err) {
	            promise.reject(err);
	        });
	    };

	    for (var i = 0; i < promises.length; i++) {
	        _loop3(i);
	    }

	    if (!count) {
	        promise.resolve(results);
	    }

	    return promise;
	};

	SyncPromise.onPossiblyUnhandledException = function syncPromiseOnPossiblyUnhandledException(handler) {
	    possiblyUnhandledPromiseHandlers.push(handler);
	};

	SyncPromise['try'] = function syncPromiseTry(method) {
	    return SyncPromise.resolve().then(method);
	};

	SyncPromise.delay = function syncPromiseDelay(delay) {
	    return new SyncPromise(function (resolve) {
	        setTimeout(resolve, delay);
	    });
	};

	SyncPromise.hash = function (obj) {

	    var results = {};
	    var promises = [];

	    var _loop4 = function _loop4(key) {
	        if (obj.hasOwnProperty(key)) {
	            promises.push(SyncPromise.resolve(obj[key]).then(function (result) {
	                results[key] = result;
	            }));
	        }
	    };

	    for (var key in obj) {
	        _loop4(key);
	    }

	    return SyncPromise.all(promises).then(function () {
	        return results;
	    });
	};

	SyncPromise.promisifyCall = function () {

	    var args = Array.prototype.slice.call(arguments);
	    var method = args.shift();

	    if (typeof method !== 'function') {
	        throw new Error('Expected promisifyCall to be called with a function');
	    }

	    return new SyncPromise(function (resolve, reject) {

	        args.push(function (err, result) {
	            return err ? reject(err) : resolve(result);
	        });

	        return method.apply(null, args);
	    });
	};

	function patchPromise() {
	    window.Promise = SyncPromise;
	}

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
	    prefix: '',

	    initial_state_name: 'init',

	    flushInterval: 10 * 60 * 1000,
	    debounceInterval: 10,

	    sizeLimit: 300,

	    // Supress `console.log`s when `true`
	    // Recommended for production usage
	    silent: false,

	    heartbeat: true,
	    heartbeatConsoleLog: true,
	    heartbeatInterval: 5000,
	    heartbeatTooBusy: false,
	    heartbeatTooBusyThreshold: 10000,

	    logLevel: 'debug',

	    autoLog: ['warn', 'error'],

	    logUnload: true,
	    logUnloadSync: false,
	    logPerformance: true
	};

	var logLevels = exports.logLevels = ['error', 'warn', 'info', 'debug'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;

	var _config = __webpack_require__(6);

	var _util = __webpack_require__(3);

	var _performance = __webpack_require__(8);

	var _logger = __webpack_require__(2);

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
	        var async = !_config.config.logUnloadSync;

	        window.addEventListener('beforeunload', function () {
	            (0, _logger.info)('window_beforeunload');
	            (0, _logger.immediateFlush)(async);
	        });

	        window.addEventListener('unload', function () {
	            (0, _logger.info)('window_unload');
	            (0, _logger.immediateFlush)(async);
	        });
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

	var _logger = __webpack_require__(2);

	var _builders = __webpack_require__(5);

	var _util = __webpack_require__(3);

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

	        if (_config.config.heartbeatMaxThreshold && heartbeatCount > _config.config.heartbeatMaxThreshold) {
	            return;
	        }

	        heartbeatCount += 1;

	        var elapsed = heartBeatTimer.elapsed();
	        var lag = elapsed - _config.config.heartbeatInterval;

	        var heartbeatPayload = {
	            count: heartbeatCount,
	            elapsed: elapsed
	        };

	        if (_config.config.heartbeatTooBusy) {
	            heartbeatPayload.lag = lag;

	            if (lag >= _config.config.heartbeatTooBusyThreshold) {
	                (0, _logger.info)('toobusy', heartbeatPayload, {
	                    noConsole: !_config.config.heartbeatConsoleLog
	                });
	            }
	        }

	        (0, _logger.info)('heartbeat', heartbeatPayload, {
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

	var _logger = __webpack_require__(2);

	var _builders = __webpack_require__(5);

	var _util = __webpack_require__(3);

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