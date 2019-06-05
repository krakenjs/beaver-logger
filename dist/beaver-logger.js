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
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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

	var _init = __webpack_require__(11);

	Object.keys(_init).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _init[key];
	    }
	  });
	});

	var _transitions = __webpack_require__(13);

	Object.keys(_transitions).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _transitions[key];
	    }
	  });
	});

	var _builders = __webpack_require__(9);

	Object.keys(_builders).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _builders[key];
	    }
	  });
	});

	var _config = __webpack_require__(10);

	Object.keys(_config).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _config[key];
	    }
	  });
	});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.track = exports.flush = exports.tracking = exports.buffer = undefined;
	exports.getTransport = getTransport;
	exports.setTransport = setTransport;
	exports.print = print;
	exports.immediateFlush = immediateFlush;
	exports.log = log;
	exports.prefix = prefix;
	exports.debug = debug;
	exports.info = info;
	exports.warn = warn;
	exports.error = error;

	var _util = __webpack_require__(3);

	var _builders = __webpack_require__(9);

	var _config = __webpack_require__(10);

	var buffer = exports.buffer = [];
	var tracking = exports.tracking = [];

	var transport = function transport(headers, data, options) {
	    return (0, _util.ajax)('post', _config.config.uri, headers, data, options);
	};

	function getTransport() {
	    return transport;
	}

	function setTransport(newTransport) {
	    transport = newTransport;
	}

	var loaded = false;

	setTimeout(function () {
	    loaded = true;
	}, 1);

	function print(level, event, payload) {

	    if (typeof window === 'undefined' || !window.console || !window.console.log) {
	        return;
	    }

	    if (!loaded) {
	        return setTimeout(function () {
	            return print(level, event, payload);
	        }, 1);
	    }

	    var logLevel = _config.config.logLevel;

	    if (window.LOG_LEVEL) {
	        logLevel = window.LOG_LEVEL;
	    }

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
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        _ref$fireAndForget = _ref.fireAndForget,
	        fireAndForget = _ref$fireAndForget === undefined ? false : _ref$fireAndForget;

	    if (typeof window === 'undefined') {
	        return;
	    }

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
	        var _ref2;

	        if (_isArray) {
	            if (_i >= _iterator.length) break;
	            _ref2 = _iterator[_i++];
	        } else {
	            _i = _iterator.next();
	            if (_i.done) break;
	            _ref2 = _i.value;
	        }

	        var builder = _ref2;

	        try {
	            (0, _util.extend)(meta, builder(meta), false);
	        } catch (err) {
	            console.error('Error in custom meta builder:', err.stack || err.toString());
	        }
	    }

	    var headers = {};

	    for (var _iterator2 = _builders.headerBuilders, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
	        var _ref3;

	        if (_isArray2) {
	            if (_i2 >= _iterator2.length) break;
	            _ref3 = _iterator2[_i2++];
	        } else {
	            _i2 = _iterator2.next();
	            if (_i2.done) break;
	            _ref3 = _i2.value;
	        }

	        var _builder = _ref3;

	        try {
	            (0, _util.extend)(headers, _builder(headers), false);
	        } catch (err) {
	            console.error('Error in custom header builder:', err.stack || err.toString());
	        }
	    }

	    var events = buffer;

	    var req = transport(headers, {
	        events: events,
	        meta: meta,
	        tracking: tracking
	    }, {
	        fireAndForget: fireAndForget
	    });

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

	    if (typeof window === 'undefined') {
	        return;
	    }

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

	    try {
	        JSON.stringify(payload);
	    } catch (err) {
	        return;
	    }

	    payload.timestamp = Date.now();

	    for (var _iterator3 = _builders.payloadBuilders, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
	        var _ref4;

	        if (_isArray3) {
	            if (_i3 >= _iterator3.length) break;
	            _ref4 = _iterator3[_i3++];
	        } else {
	            _i3 = _iterator3.next();
	            if (_i3.done) break;
	            _ref4 = _i3.value;
	        }

	        var builder = _ref4;

	        try {
	            (0, _util.extend)(payload, builder(payload), false);
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
	        track: function track(payload) {
	            return _track(payload);
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

	function _track(payload) {

	    if (typeof window === 'undefined') {
	        return;
	    }

	    if (payload) {

	        try {
	            JSON.stringify(payload);
	        } catch (err) {
	            return;
	        }

	        for (var _iterator4 = _builders.trackingBuilders, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
	            var _ref5;

	            if (_isArray4) {
	                if (_i4 >= _iterator4.length) break;
	                _ref5 = _iterator4[_i4++];
	            } else {
	                _i4 = _iterator4.next();
	                if (_i4.done) break;
	                _ref5 = _i4.value;
	            }

	            var builder = _ref5;

	            try {
	                (0, _util.extend)(payload, builder(payload), false);
	            } catch (err) {
	                console.error('Error in custom tracking builder:', err.stack || err.toString());
	            }
	        }

	        print('debug', 'tracking', payload);

	        tracking.push(payload);
	    }
	}
	exports.track = _track;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.extend = extend;
	exports.isSameProtocol = isSameProtocol;
	exports.isSameDomain = isSameDomain;
	exports.ajax = ajax;
	exports.promiseDebounce = promiseDebounce;
	exports.onWindowReady = onWindowReady;
	exports.safeInterval = safeInterval;
	exports.uniqueID = uniqueID;
	exports.isIE = isIE;

	var _src = __webpack_require__(4);

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

	    var _ref = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},
	        _ref$fireAndForget = _ref.fireAndForget,
	        fireAndForget = _ref$fireAndForget === undefined ? false : _ref$fireAndForget;

	    return new _src.ZalgoPromise(function (resolve) {
	        var XRequest = window.XMLHttpRequest || window.ActiveXObject;

	        if (window.XDomainRequest && !isSameDomain(url)) {

	            if (!isSameProtocol(url)) {
	                return resolve();
	            }

	            XRequest = window.XDomainRequest;
	        }

	        var req = new XRequest('MSXML2.XMLHTTP.3.0');
	        req.open(method.toUpperCase(), url, true);

	        if (typeof req.setRequestHeader === 'function') {
	            req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	            req.setRequestHeader('Content-type', 'application/json');

	            for (var headerName in headers) {
	                if (headers.hasOwnProperty(headerName)) {
	                    req.setRequestHeader(headerName, headers[headerName]);
	                }
	            }
	        }

	        if (fireAndForget) {
	            resolve();
	        } else {
	            req.onreadystatechange = function () {
	                if (req.readyState > 3) {
	                    resolve();
	                }
	            };
	        }

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

	            return _src.ZalgoPromise.resolve().then(function () {
	                return method.apply(null, args);
	            }).then(resolver, rejector);
	        }, interval);

	        debounce.promise = debounce.promise || new _src.ZalgoPromise(function (resolver, rejector) {
	            debounce.resolver = resolver;
	            debounce.rejector = rejector;
	        });

	        return debounce.promise;
	    };
	}

	function onWindowReady() {
	    return new _src.ZalgoPromise(function (resolve) {
	        if (typeof document !== 'undefined' && document.readyState === 'complete') {
	            resolve();
	        }

	        window.addEventListener('load', resolve);
	    });
	}

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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(5);

	Object.defineProperty(exports, 'ZalgoPromise', {
	  enumerable: true,
	  get: function get() {
	    return _promise.ZalgoPromise;
	  }
	});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ZalgoPromise = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(6);

	var _exceptions = __webpack_require__(7);

	var _flush = __webpack_require__(8);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ZalgoPromise = function () {
	    function ZalgoPromise(handler) {
	        var _this = this;

	        _classCallCheck(this, ZalgoPromise);

	        this.resolved = false;
	        this.rejected = false;
	        this.errorHandled = false;

	        this.handlers = [];

	        if (handler) {

	            var _result = void 0;
	            var _error = void 0;
	            var resolved = false;
	            var rejected = false;
	            var isAsync = false;

	            (0, _flush.startActive)();

	            try {
	                handler(function (res) {
	                    if (isAsync) {
	                        _this.resolve(res);
	                    } else {
	                        resolved = true;
	                        _result = res;
	                    }
	                }, function (err) {
	                    if (isAsync) {
	                        _this.reject(err);
	                    } else {
	                        rejected = true;
	                        _error = err;
	                    }
	                });
	            } catch (err) {
	                (0, _flush.endActive)();
	                this.reject(err);
	                return;
	            }

	            (0, _flush.endActive)();

	            isAsync = true;

	            if (resolved) {
	                // $FlowFixMe
	                this.resolve(_result);
	            } else if (rejected) {
	                this.reject(_error);
	            }
	        }

	        if (false) {
	            try {
	                throw new Error('ZalgoPromise');
	            } catch (err) {
	                this.stack = err.stack;
	            }
	        }
	    }

	    _createClass(ZalgoPromise, [{
	        key: 'resolve',
	        value: function resolve(result) {
	            if (this.resolved || this.rejected) {
	                return this;
	            }

	            if ((0, _utils.isPromise)(result)) {
	                throw new Error('Can not resolve promise with another promise');
	            }

	            this.resolved = true;
	            this.value = result;
	            this.dispatch();

	            return this;
	        }
	    }, {
	        key: 'reject',
	        value: function reject(error) {
	            var _this2 = this;

	            if (this.resolved || this.rejected) {
	                return this;
	            }

	            if ((0, _utils.isPromise)(error)) {
	                throw new Error('Can not reject promise with another promise');
	            }

	            if (!error) {
	                // $FlowFixMe
	                var _err = error && typeof error.toString === 'function' ? error.toString() : Object.prototype.toString.call(error);
	                error = new Error('Expected reject to be called with Error, got ' + _err);
	            }

	            this.rejected = true;
	            this.error = error;

	            if (!this.errorHandled) {
	                setTimeout(function () {
	                    if (!_this2.errorHandled) {
	                        (0, _exceptions.dispatchPossiblyUnhandledError)(error, _this2);
	                    }
	                }, 1);
	            }

	            this.dispatch();

	            return this;
	        }
	    }, {
	        key: 'asyncReject',
	        value: function asyncReject(error) {
	            this.errorHandled = true;
	            this.reject(error);
	            return this;
	        }
	    }, {
	        key: 'dispatch',
	        value: function dispatch() {
	            var _this3 = this;

	            var dispatching = this.dispatching,
	                resolved = this.resolved,
	                rejected = this.rejected,
	                handlers = this.handlers;


	            if (dispatching) {
	                return;
	            }

	            if (!resolved && !rejected) {
	                return;
	            }

	            this.dispatching = true;
	            (0, _flush.startActive)();

	            var _loop = function _loop(i) {
	                var _handlers$i = handlers[i],
	                    onSuccess = _handlers$i.onSuccess,
	                    onError = _handlers$i.onError,
	                    promise = _handlers$i.promise;


	                var result = void 0;

	                if (resolved) {

	                    try {
	                        result = onSuccess ? onSuccess(_this3.value) : _this3.value;
	                    } catch (err) {
	                        promise.reject(err);
	                        return 'continue';
	                    }
	                } else if (rejected) {

	                    if (!onError) {
	                        promise.reject(_this3.error);
	                        return 'continue';
	                    }

	                    try {
	                        result = onError(_this3.error);
	                    } catch (err) {
	                        promise.reject(err);
	                        return 'continue';
	                    }
	                }

	                if (result instanceof ZalgoPromise && (result.resolved || result.rejected)) {

	                    if (result.resolved) {
	                        promise.resolve(result.value);
	                    } else {
	                        promise.reject(result.error);
	                    }

	                    result.errorHandled = true;
	                } else if ((0, _utils.isPromise)(result)) {

	                    if (result instanceof ZalgoPromise && (result.resolved || result.rejected)) {
	                        if (result.resolved) {
	                            promise.resolve(result.value);
	                        } else {
	                            promise.reject(result.error);
	                        }
	                    } else {
	                        // $FlowFixMe
	                        result.then(function (res) {
	                            promise.resolve(res);
	                        }, function (err) {
	                            promise.reject(err);
	                        });
	                    }
	                } else {

	                    promise.resolve(result);
	                }
	            };

	            for (var i = 0; i < handlers.length; i++) {
	                var _ret = _loop(i);

	                if (_ret === 'continue') continue;
	            }

	            handlers.length = 0;
	            this.dispatching = false;
	            (0, _flush.endActive)();
	        }
	    }, {
	        key: 'then',
	        value: function then(onSuccess, onError) {

	            if (onSuccess && typeof onSuccess !== 'function' && !onSuccess.call) {
	                throw new Error('Promise.then expected a function for success handler');
	            }

	            if (onError && typeof onError !== 'function' && !onError.call) {
	                throw new Error('Promise.then expected a function for error handler');
	            }

	            var promise = new ZalgoPromise();

	            this.handlers.push({
	                promise: promise,
	                onSuccess: onSuccess,
	                onError: onError
	            });

	            this.errorHandled = true;

	            this.dispatch();

	            return promise;
	        }
	    }, {
	        key: 'catch',
	        value: function _catch(onError) {
	            return this.then(undefined, onError);
	        }
	    }, {
	        key: 'finally',
	        value: function _finally(onFinally) {

	            if (onFinally && typeof onFinally !== 'function' && !onFinally.call) {
	                throw new Error('Promise.finally expected a function');
	            }

	            return this.then(function (result) {
	                return ZalgoPromise['try'](onFinally).then(function () {
	                    return result;
	                });
	            }, function (err) {
	                return ZalgoPromise['try'](onFinally).then(function () {
	                    throw err;
	                });
	            });
	        }
	    }, {
	        key: 'timeout',
	        value: function timeout(time, err) {
	            var _this4 = this;

	            if (this.resolved || this.rejected) {
	                return this;
	            }

	            var timeout = setTimeout(function () {

	                if (_this4.resolved || _this4.rejected) {
	                    return;
	                }

	                _this4.reject(err || new Error('Promise timed out after ' + time + 'ms'));
	            }, time);

	            return this.then(function (result) {
	                clearTimeout(timeout);
	                return result;
	            });
	        }

	        // $FlowFixMe

	    }, {
	        key: 'toPromise',
	        value: function toPromise() {
	            // $FlowFixMe
	            if (typeof Promise === 'undefined') {
	                throw new TypeError('Could not find Promise');
	            }
	            // $FlowFixMe
	            return Promise.resolve(this); // eslint-disable-line compat/compat
	        }
	    }], [{
	        key: 'resolve',
	        value: function resolve(value) {

	            if (value instanceof ZalgoPromise) {
	                return value;
	            }

	            if ((0, _utils.isPromise)(value)) {
	                // $FlowFixMe
	                return new ZalgoPromise(function (resolve, reject) {
	                    return value.then(resolve, reject);
	                });
	            }

	            return new ZalgoPromise().resolve(value);
	        }
	    }, {
	        key: 'reject',
	        value: function reject(error) {
	            return new ZalgoPromise().reject(error);
	        }
	    }, {
	        key: 'asyncReject',
	        value: function asyncReject(error) {
	            return new ZalgoPromise().asyncReject(error);
	        }
	    }, {
	        key: 'all',
	        value: function all(promises) {
	            // eslint-disable-line no-undef

	            var promise = new ZalgoPromise();
	            var count = promises.length;
	            var results = [];

	            if (!count) {
	                promise.resolve(results);
	                return promise;
	            }

	            var _loop2 = function _loop2(i) {
	                var prom = promises[i];

	                if (prom instanceof ZalgoPromise) {
	                    if (prom.resolved) {
	                        results[i] = prom.value;
	                        count -= 1;
	                        return 'continue';
	                    }
	                } else if (!(0, _utils.isPromise)(prom)) {
	                    results[i] = prom;
	                    count -= 1;
	                    return 'continue';
	                }

	                ZalgoPromise.resolve(prom).then(function (result) {
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
	                var _ret2 = _loop2(i);

	                if (_ret2 === 'continue') continue;
	            }

	            if (count === 0) {
	                promise.resolve(results);
	            }

	            return promise;
	        }
	    }, {
	        key: 'hash',
	        value: function hash(promises) {
	            // eslint-disable-line no-undef
	            var result = {};

	            return ZalgoPromise.all(Object.keys(promises).map(function (key) {
	                return ZalgoPromise.resolve(promises[key]).then(function (value) {
	                    result[key] = value;
	                });
	            })).then(function () {
	                return result;
	            });
	        }
	    }, {
	        key: 'map',
	        value: function map(items, method) {
	            // $FlowFixMe
	            return ZalgoPromise.all(items.map(method));
	        }
	    }, {
	        key: 'onPossiblyUnhandledException',
	        value: function onPossiblyUnhandledException(handler) {
	            return (0, _exceptions.onPossiblyUnhandledException)(handler);
	        }
	    }, {
	        key: 'try',
	        value: function _try(method, context, args) {

	            if (method && typeof method !== 'function' && !method.call) {
	                throw new Error('Promise.try expected a function');
	            }

	            var result = void 0;

	            (0, _flush.startActive)();

	            try {
	                // $FlowFixMe
	                result = method.apply(context, args || []);
	            } catch (err) {
	                (0, _flush.endActive)();
	                return ZalgoPromise.reject(err);
	            }

	            (0, _flush.endActive)();

	            return ZalgoPromise.resolve(result);
	        }
	    }, {
	        key: 'delay',
	        value: function delay(_delay) {
	            return new ZalgoPromise(function (resolve) {
	                setTimeout(resolve, _delay);
	            });
	        }
	    }, {
	        key: 'isPromise',
	        value: function isPromise(value) {

	            if (value && value instanceof ZalgoPromise) {
	                return true;
	            }

	            return (0, _utils.isPromise)(value);
	        }
	    }, {
	        key: 'flush',
	        value: function flush() {
	            return (0, _flush.awaitActive)(ZalgoPromise);
	        }
	    }]);

	    return ZalgoPromise;
	}();

	exports.ZalgoPromise = ZalgoPromise;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.isPromise = isPromise;
	function isPromise(item) {
	    try {
	        if (!item) {
	            return false;
	        }

	        if (typeof Promise !== 'undefined' && item instanceof Promise) {
	            return true;
	        }

	        if (typeof window !== 'undefined' && window.Window && item instanceof window.Window) {
	            return false;
	        }

	        if (typeof window !== 'undefined' && window.constructor && item instanceof window.constructor) {
	            return false;
	        }

	        var _toString = {}.toString;

	        if (_toString) {
	            var name = _toString.call(item);

	            if (name === '[object Window]' || name === '[object global]' || name === '[object DOMWindow]') {
	                return false;
	            }
	        }

	        if (typeof item.then === 'function') {
	            return true;
	        }
	    } catch (err) {
	        return false;
	    }

	    return false;
	}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.dispatchPossiblyUnhandledError = dispatchPossiblyUnhandledError;
	exports.onPossiblyUnhandledException = onPossiblyUnhandledException;


	var dispatchedErrors = [];

	var possiblyUnhandledPromiseHandlers = [];

	function dispatchPossiblyUnhandledError(err, promise) {

	    if (dispatchedErrors.indexOf(err) !== -1) {
	        return;
	    }

	    dispatchedErrors.push(err);

	    setTimeout(function () {
	        if (false) {
	            // $FlowFixMe
	            throw new Error((err.stack || err.toString()) + '\n\nFrom promise:\n\n' + promise.stack);
	        }

	        throw err;
	    }, 1);

	    for (var j = 0; j < possiblyUnhandledPromiseHandlers.length; j++) {
	        // $FlowFixMe
	        possiblyUnhandledPromiseHandlers[j](err, promise);
	    }
	}

	function onPossiblyUnhandledException(handler) {
	    possiblyUnhandledPromiseHandlers.push(handler);

	    return {
	        cancel: function cancel() {
	            possiblyUnhandledPromiseHandlers.splice(possiblyUnhandledPromiseHandlers.indexOf(handler), 1);
	        }
	    };
	}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.startActive = startActive;
	exports.endActive = endActive;
	exports.awaitActive = awaitActive;


	var activeCount = 0;

	var flushPromise = void 0;

	function flushActive() {
	    if (!activeCount && flushPromise) {
	        var promise = flushPromise;
	        flushPromise = null;
	        promise.resolve();
	    }
	}

	function startActive() {
	    activeCount += 1;
	}

	function endActive() {
	    activeCount -= 1;
	    flushActive();
	}

	function awaitActive(Zalgo) {
	    // eslint-disable-line no-undef
	    var promise = flushPromise = flushPromise || new Zalgo();
	    flushActive();
	    return promise;
	}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

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

/***/ }),
/* 10 */
/***/ (function(module, exports) {

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

	    logLevel: 'warn',

	    autoLog: ['warn', 'error'],

	    logUnload: true,
	    logPerformance: true
	};

	var logLevels = exports.logLevels = ['error', 'warn', 'info', 'debug'];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;

	var _config = __webpack_require__(10);

	var _util = __webpack_require__(3);

	var _performance = __webpack_require__(12);

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
	        window.addEventListener('beforeunload', function () {
	            (0, _logger.info)('window_beforeunload');
	            (0, _logger.immediateFlush)({ fireAndForget: true });
	        });

	        window.addEventListener('unload', function () {
	            (0, _logger.info)('window_unload');
	            (0, _logger.immediateFlush)({ fireAndForget: true });
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

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.reqTimer = exports.clientTimer = undefined;
	exports.now = now;
	exports.reqStartElapsed = reqStartElapsed;
	exports.initHeartBeat = initHeartBeat;
	exports.initPerformance = initPerformance;

	var _config = __webpack_require__(10);

	var _logger = __webpack_require__(2);

	var _builders = __webpack_require__(9);

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

	    (0, _util.onWindowReady)().then(function () {

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

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.startTransition = startTransition;
	exports.endTransition = endTransition;
	exports.transition = transition;

	var _performance = __webpack_require__(12);

	var _logger = __webpack_require__(2);

	var _builders = __webpack_require__(9);

	var _util = __webpack_require__(3);

	var _config = __webpack_require__(10);

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

/***/ })
/******/ ])
});
;