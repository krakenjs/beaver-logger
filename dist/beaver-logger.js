!function(root, factory) {
    "object" == typeof exports && "object" == typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define("beaver", [], factory) : "object" == typeof exports ? exports.beaver = factory() : root.beaver = factory();
}("undefined" != typeof self ? self : this, function() {
    return function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                i: moduleId,
                l: !1,
                exports: {}
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.l = !0;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports, name, getter) {
            __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
                configurable: !1,
                enumerable: !0,
                get: getter
            });
        };
        __webpack_require__.n = function(module) {
            var getter = module && module.__esModule ? function() {
                return module.default;
            } : function() {
                return module;
            };
            __webpack_require__.d(getter, "a", getter);
            return getter;
        };
        __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = "./src/index.js");
    }({
        "./src/index.js": function(module, __webpack_exports__, __webpack_require__) {
            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", {
                value: !0
            });
            __webpack_require__.d({}, "WeakMap", function() {
                return weakmap_CrossDomainSafeWeakMap;
            });
            function utils_isPromise(item) {
                try {
                    if (!item) return !1;
                    if ("undefined" != typeof Promise && item instanceof Promise) return !0;
                    if ("undefined" != typeof window && window.Window && item instanceof window.Window) return !1;
                    if ("undefined" != typeof window && window.constructor && item instanceof window.constructor) return !1;
                    var _toString = {}.toString;
                    if (_toString) {
                        var name = _toString.call(item);
                        if ("[object Window]" === name || "[object global]" === name || "[object DOMWindow]" === name) return !1;
                    }
                    if ("function" == typeof item.then) return !0;
                } catch (err) {
                    return !1;
                }
                return !1;
            }
            var dispatchedErrors = [], possiblyUnhandledPromiseHandlers = [], activeCount = 0, flushPromise = void 0;
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
            var promise_ZalgoPromise = function() {
                function ZalgoPromise(handler) {
                    var _this = this;
                    !function(instance, Constructor) {
                        if (!(instance instanceof ZalgoPromise)) throw new TypeError("Cannot call a class as a function");
                    }(this);
                    this.resolved = !1;
                    this.rejected = !1;
                    this.errorHandled = !1;
                    this.handlers = [];
                    if (handler) {
                        var _result = void 0, _error = void 0, resolved = !1, rejected = !1, isAsync = !1;
                        startActive();
                        try {
                            handler(function(res) {
                                if (isAsync) _this.resolve(res); else {
                                    resolved = !0;
                                    _result = res;
                                }
                            }, function(err) {
                                if (isAsync) _this.reject(err); else {
                                    rejected = !0;
                                    _error = err;
                                }
                            });
                        } catch (err) {
                            endActive();
                            this.reject(err);
                            return;
                        }
                        endActive();
                        isAsync = !0;
                        resolved ? this.resolve(_result) : rejected && this.reject(_error);
                    }
                }
                ZalgoPromise.prototype.resolve = function(result) {
                    if (this.resolved || this.rejected) return this;
                    if (utils_isPromise(result)) throw new Error("Can not resolve promise with another promise");
                    this.resolved = !0;
                    this.value = result;
                    this.dispatch();
                    return this;
                };
                ZalgoPromise.prototype.reject = function(error) {
                    var _this2 = this;
                    if (this.resolved || this.rejected) return this;
                    if (utils_isPromise(error)) throw new Error("Can not reject promise with another promise");
                    if (!error) {
                        var _err = error && "function" == typeof error.toString ? error.toString() : Object.prototype.toString.call(error);
                        error = new Error("Expected reject to be called with Error, got " + _err);
                    }
                    this.rejected = !0;
                    this.error = error;
                    this.errorHandled || setTimeout(function() {
                        _this2.errorHandled || function(err, promise) {
                            if (-1 === dispatchedErrors.indexOf(err)) {
                                dispatchedErrors.push(err);
                                setTimeout(function() {
                                    throw err;
                                }, 1);
                                for (var j = 0; j < possiblyUnhandledPromiseHandlers.length; j++) possiblyUnhandledPromiseHandlers[j](err, promise);
                            }
                        }(error, _this2);
                    }, 1);
                    this.dispatch();
                    return this;
                };
                ZalgoPromise.prototype.asyncReject = function(error) {
                    this.errorHandled = !0;
                    this.reject(error);
                    return this;
                };
                ZalgoPromise.prototype.dispatch = function() {
                    var _this3 = this, dispatching = this.dispatching, resolved = this.resolved, rejected = this.rejected, handlers = this.handlers;
                    if (!dispatching && (resolved || rejected)) {
                        this.dispatching = !0;
                        startActive();
                        for (var _loop = function(i) {
                            var _handlers$i = handlers[i], onSuccess = _handlers$i.onSuccess, onError = _handlers$i.onError, promise = _handlers$i.promise, result = void 0;
                            if (resolved) try {
                                result = onSuccess ? onSuccess(_this3.value) : _this3.value;
                            } catch (err) {
                                promise.reject(err);
                                return "continue";
                            } else if (rejected) {
                                if (!onError) {
                                    promise.reject(_this3.error);
                                    return "continue";
                                }
                                try {
                                    result = onError(_this3.error);
                                } catch (err) {
                                    promise.reject(err);
                                    return "continue";
                                }
                            }
                            if (result instanceof ZalgoPromise && (result.resolved || result.rejected)) {
                                result.resolved ? promise.resolve(result.value) : promise.reject(result.error);
                                result.errorHandled = !0;
                            } else utils_isPromise(result) ? result instanceof ZalgoPromise && (result.resolved || result.rejected) ? result.resolved ? promise.resolve(result.value) : promise.reject(result.error) : result.then(function(res) {
                                promise.resolve(res);
                            }, function(err) {
                                promise.reject(err);
                            }) : promise.resolve(result);
                        }, i = 0; i < handlers.length; i++) _loop(i);
                        handlers.length = 0;
                        this.dispatching = !1;
                        endActive();
                    }
                };
                ZalgoPromise.prototype.then = function(onSuccess, onError) {
                    if (onSuccess && "function" != typeof onSuccess && !onSuccess.call) throw new Error("Promise.then expected a function for success handler");
                    if (onError && "function" != typeof onError && !onError.call) throw new Error("Promise.then expected a function for error handler");
                    var promise = new ZalgoPromise();
                    this.handlers.push({
                        promise: promise,
                        onSuccess: onSuccess,
                        onError: onError
                    });
                    this.errorHandled = !0;
                    this.dispatch();
                    return promise;
                };
                ZalgoPromise.prototype.catch = function(onError) {
                    return this.then(void 0, onError);
                };
                ZalgoPromise.prototype.finally = function(onFinally) {
                    if (onFinally && "function" != typeof onFinally && !onFinally.call) throw new Error("Promise.finally expected a function");
                    return this.then(function(result) {
                        return ZalgoPromise.try(onFinally).then(function() {
                            return result;
                        });
                    }, function(err) {
                        return ZalgoPromise.try(onFinally).then(function() {
                            throw err;
                        });
                    });
                };
                ZalgoPromise.prototype.timeout = function(time, err) {
                    var _this4 = this;
                    if (this.resolved || this.rejected) return this;
                    var timeout = setTimeout(function() {
                        _this4.resolved || _this4.rejected || _this4.reject(err || new Error("Promise timed out after " + time + "ms"));
                    }, time);
                    return this.then(function(result) {
                        clearTimeout(timeout);
                        return result;
                    });
                };
                ZalgoPromise.prototype.toPromise = function() {
                    if ("undefined" == typeof Promise) throw new TypeError("Could not find Promise");
                    return Promise.resolve(this);
                };
                ZalgoPromise.resolve = function(value) {
                    return value instanceof ZalgoPromise ? value : utils_isPromise(value) ? new ZalgoPromise(function(resolve, reject) {
                        return value.then(resolve, reject);
                    }) : new ZalgoPromise().resolve(value);
                };
                ZalgoPromise.reject = function(error) {
                    return new ZalgoPromise().reject(error);
                };
                ZalgoPromise.asyncReject = function(error) {
                    return new ZalgoPromise().asyncReject(error);
                };
                ZalgoPromise.all = function(promises) {
                    var promise = new ZalgoPromise(), count = promises.length, results = [];
                    if (!count) {
                        promise.resolve(results);
                        return promise;
                    }
                    for (var _loop2 = function(i) {
                        var prom = promises[i];
                        if (prom instanceof ZalgoPromise) {
                            if (prom.resolved) {
                                results[i] = prom.value;
                                count -= 1;
                                return "continue";
                            }
                        } else if (!utils_isPromise(prom)) {
                            results[i] = prom;
                            count -= 1;
                            return "continue";
                        }
                        ZalgoPromise.resolve(prom).then(function(result) {
                            results[i] = result;
                            0 == (count -= 1) && promise.resolve(results);
                        }, function(err) {
                            promise.reject(err);
                        });
                    }, i = 0; i < promises.length; i++) _loop2(i);
                    0 === count && promise.resolve(results);
                    return promise;
                };
                ZalgoPromise.hash = function(promises) {
                    var result = {};
                    return ZalgoPromise.all(Object.keys(promises).map(function(key) {
                        return ZalgoPromise.resolve(promises[key]).then(function(value) {
                            result[key] = value;
                        });
                    })).then(function() {
                        return result;
                    });
                };
                ZalgoPromise.map = function(items, method) {
                    return ZalgoPromise.all(items.map(method));
                };
                ZalgoPromise.onPossiblyUnhandledException = function(handler) {
                    return function(handler) {
                        possiblyUnhandledPromiseHandlers.push(handler);
                        return {
                            cancel: function() {
                                possiblyUnhandledPromiseHandlers.splice(possiblyUnhandledPromiseHandlers.indexOf(handler), 1);
                            }
                        };
                    }(handler);
                };
                ZalgoPromise.try = function(method, context, args) {
                    if (method && "function" != typeof method && !method.call) throw new Error("Promise.try expected a function");
                    var result = void 0;
                    startActive();
                    try {
                        result = method.apply(context, args || []);
                    } catch (err) {
                        endActive();
                        return ZalgoPromise.reject(err);
                    }
                    endActive();
                    return ZalgoPromise.resolve(result);
                };
                ZalgoPromise.delay = function(_delay) {
                    return new ZalgoPromise(function(resolve) {
                        setTimeout(resolve, _delay);
                    });
                };
                ZalgoPromise.isPromise = function(value) {
                    return !!(value && value instanceof ZalgoPromise) || utils_isPromise(value);
                };
                ZalgoPromise.flush = function() {
                    return function(Zalgo) {
                        var promise = flushPromise = flushPromise || new ZalgoPromise();
                        flushActive();
                        return promise;
                    }();
                };
                return ZalgoPromise;
            }(), PROTOCOL = {
                MOCK: "mock:",
                FILE: "file:",
                ABOUT: "about:"
            }, IE_WIN_ACCESS_ERROR = "Call was rejected by callee.\r\n";
            function isAboutProtocol() {
                return (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : window).location.protocol === PROTOCOL.ABOUT;
            }
            function canReadFromWindow(win) {
                try {
                    win && win.location && win.location.href;
                    return !0;
                } catch (err) {}
                return !1;
            }
            function getActualDomain(win) {
                var location = (win = win || window).location;
                if (!location) throw new Error("Can not read window location");
                var protocol = location.protocol;
                if (!protocol) throw new Error("Can not read window protocol");
                if (protocol === PROTOCOL.FILE) return PROTOCOL.FILE + "//";
                if (protocol === PROTOCOL.ABOUT) {
                    var parent = function(win) {
                        if (win) try {
                            if (win.parent && win.parent !== win) return win.parent;
                        } catch (err) {}
                    }(win);
                    return parent && canReadFromWindow(parent) ? getActualDomain(parent) : PROTOCOL.ABOUT + "//";
                }
                var host = location.host;
                if (!host) throw new Error("Can not read window host");
                return protocol + "//" + host;
            }
            function getDomain(win) {
                var domain = getActualDomain(win = win || window);
                return domain && win.mockDomain && 0 === win.mockDomain.indexOf(PROTOCOL.MOCK) ? win.mockDomain : domain;
            }
            var iframeWindows = [], iframeFrames = [];
            function isWindowClosed(win) {
                var allowMock = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                try {
                    if (win === window) return !1;
                } catch (err) {
                    return !0;
                }
                try {
                    if (!win) return !0;
                } catch (err) {
                    return !0;
                }
                try {
                    if (win.closed) return !0;
                } catch (err) {
                    return !err || err.message !== IE_WIN_ACCESS_ERROR;
                }
                if (allowMock && function(win) {
                    if (!function(win) {
                        try {
                            if (win === window) return !0;
                        } catch (err) {}
                        try {
                            var desc = Object.getOwnPropertyDescriptor(win, "location");
                            if (desc && !1 === desc.enumerable) return !1;
                        } catch (err) {}
                        try {
                            if (isAboutProtocol(win) && canReadFromWindow(win)) return !0;
                        } catch (err) {}
                        try {
                            if (getActualDomain(win) === getActualDomain(window)) return !0;
                        } catch (err) {}
                        return !1;
                    }(win)) return !1;
                    try {
                        if (win === window) return !0;
                        if (isAboutProtocol(win) && canReadFromWindow(win)) return !0;
                        if (getDomain(window) === getDomain(win)) return !0;
                    } catch (err) {}
                    return !1;
                }(win)) try {
                    if (win.mockclosed) return !0;
                } catch (err) {}
                try {
                    if (!win.parent || !win.top) return !0;
                } catch (err) {}
                var iframeIndex = function(collection, item) {
                    for (var i = 0; i < collection.length; i++) try {
                        if (collection[i] === item) return i;
                    } catch (err) {}
                    return -1;
                }(iframeWindows, win);
                if (-1 !== iframeIndex) {
                    var frame = iframeFrames[iframeIndex];
                    if (frame && function(frame) {
                        if (!frame.contentWindow) return !0;
                        if (!frame.parentNode) return !0;
                        var doc = frame.ownerDocument;
                        return !(!doc || !doc.documentElement || doc.documentElement.contains(frame));
                    }(frame)) return !0;
                }
                return !1;
            }
            function isWindow(obj) {
                try {
                    if (obj === window) return !0;
                } catch (err) {
                    if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
                }
                try {
                    if ("[object Window]" === Object.prototype.toString.call(obj)) return !0;
                } catch (err) {
                    if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
                }
                try {
                    if (window.Window && obj instanceof window.Window) return !0;
                } catch (err) {
                    if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
                }
                try {
                    if (obj && obj.self === obj) return !0;
                } catch (err) {
                    if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
                }
                try {
                    if (obj && obj.parent === obj) return !0;
                } catch (err) {
                    if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
                }
                try {
                    if (obj && obj.top === obj) return !0;
                } catch (err) {
                    if (err && err.message === IE_WIN_ACCESS_ERROR) return !0;
                }
                try {
                    obj && obj.__cross_domain_utils_window_check__;
                } catch (err) {
                    return !0;
                }
                return !1;
            }
            function util_safeIndexOf(collection, item) {
                for (var i = 0; i < collection.length; i++) try {
                    if (collection[i] === item) return i;
                } catch (err) {}
                return -1;
            }
            var defineProperty = Object.defineProperty, counter = Date.now() % 1e9, weakmap_CrossDomainSafeWeakMap = function() {
                function CrossDomainSafeWeakMap() {
                    !function(instance, Constructor) {
                        if (!(instance instanceof CrossDomainSafeWeakMap)) throw new TypeError("Cannot call a class as a function");
                    }(this);
                    counter += 1;
                    this.name = "__weakmap_" + (1e9 * Math.random() >>> 0) + "__" + counter;
                    if (function() {
                        if ("undefined" == typeof WeakMap) return !1;
                        if (void 0 === Object.freeze) return !1;
                        try {
                            var testWeakMap = new WeakMap(), testKey = {};
                            Object.freeze(testKey);
                            testWeakMap.set(testKey, "__testvalue__");
                            return "__testvalue__" === testWeakMap.get(testKey);
                        } catch (err) {
                            return !1;
                        }
                    }()) try {
                        this.weakmap = new WeakMap();
                    } catch (err) {}
                    this.keys = [];
                    this.values = [];
                }
                CrossDomainSafeWeakMap.prototype._cleanupClosedWindows = function() {
                    for (var weakmap = this.weakmap, keys = this.keys, i = 0; i < keys.length; i++) {
                        var value = keys[i];
                        if (isWindow(value) && isWindowClosed(value)) {
                            if (weakmap) try {
                                weakmap.delete(value);
                            } catch (err) {}
                            keys.splice(i, 1);
                            this.values.splice(i, 1);
                            i -= 1;
                        }
                    }
                };
                CrossDomainSafeWeakMap.prototype.isSafeToReadWrite = function(key) {
                    if (isWindow(key)) return !1;
                    try {
                        key && key.self;
                        key && key[this.name];
                    } catch (err) {
                        return !1;
                    }
                    return !0;
                };
                CrossDomainSafeWeakMap.prototype.set = function(key, value) {
                    if (!key) throw new Error("WeakMap expected key");
                    var weakmap = this.weakmap;
                    if (weakmap) try {
                        weakmap.set(key, value);
                    } catch (err) {
                        delete this.weakmap;
                    }
                    if (this.isSafeToReadWrite(key)) {
                        var name = this.name, entry = key[name];
                        entry && entry[0] === key ? entry[1] = value : defineProperty(key, name, {
                            value: [ key, value ],
                            writable: !0
                        });
                    } else {
                        this._cleanupClosedWindows();
                        var keys = this.keys, values = this.values, index = util_safeIndexOf(keys, key);
                        if (-1 === index) {
                            keys.push(key);
                            values.push(value);
                        } else values[index] = value;
                    }
                };
                CrossDomainSafeWeakMap.prototype.get = function(key) {
                    if (!key) throw new Error("WeakMap expected key");
                    var weakmap = this.weakmap;
                    if (weakmap) try {
                        if (weakmap.has(key)) return weakmap.get(key);
                    } catch (err) {
                        delete this.weakmap;
                    }
                    if (!this.isSafeToReadWrite(key)) {
                        this._cleanupClosedWindows();
                        var index = util_safeIndexOf(this.keys, key);
                        if (-1 === index) return;
                        return this.values[index];
                    }
                    var entry = key[this.name];
                    if (entry && entry[0] === key) return entry[1];
                };
                CrossDomainSafeWeakMap.prototype.delete = function(key) {
                    if (!key) throw new Error("WeakMap expected key");
                    var weakmap = this.weakmap;
                    if (weakmap) try {
                        weakmap.delete(key);
                    } catch (err) {
                        delete this.weakmap;
                    }
                    if (this.isSafeToReadWrite(key)) {
                        var entry = key[this.name];
                        entry && entry[0] === key && (entry[0] = entry[1] = void 0);
                    } else {
                        this._cleanupClosedWindows();
                        var keys = this.keys, index = util_safeIndexOf(keys, key);
                        if (-1 !== index) {
                            keys.splice(index, 1);
                            this.values.splice(index, 1);
                        }
                    }
                };
                CrossDomainSafeWeakMap.prototype.has = function(key) {
                    if (!key) throw new Error("WeakMap expected key");
                    var weakmap = this.weakmap;
                    if (weakmap) try {
                        if (weakmap.has(key)) return !0;
                    } catch (err) {
                        delete this.weakmap;
                    }
                    if (this.isSafeToReadWrite(key)) {
                        var entry = key[this.name];
                        return !(!entry || entry[0] !== key);
                    }
                    this._cleanupClosedWindows();
                    return -1 !== util_safeIndexOf(this.keys, key);
                };
                CrossDomainSafeWeakMap.prototype.getOrSet = function(key, getter) {
                    if (this.has(key)) return this.get(key);
                    var value = getter();
                    this.set(key, value);
                    return value;
                };
                return CrossDomainSafeWeakMap;
            }();
            "function" == typeof Symbol && Symbol.iterator;
            function src_util_noop() {}
            function objFilter(obj) {
                var filter = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Boolean, result = {};
                for (var key in obj) obj.hasOwnProperty(key) && filter(obj[key], key) && (result[key] = obj[key]);
                return result;
            }
            "function" == typeof Symbol && Symbol.iterator, Object.assign;
            function dom_isBrowser() {
                return "undefined" != typeof window;
            }
            Object.create(Error.prototype);
            var HEADERS = {
                CONTENT_TYPE: "content-type",
                ACCEPT: "accept"
            }, http_headerBuilders = [], LOG_LEVEL = {
                DEBUG: "debug",
                INFO: "info",
                WARN: "warn",
                ERROR: "error"
            }, constants_PROTOCOL = {
                FILE: "file:"
            }, AUTO_FLUSH_LEVEL = [ LOG_LEVEL.WARN, LOG_LEVEL.ERROR ], LOG_LEVEL_PRIORITY = [ LOG_LEVEL.ERROR, LOG_LEVEL.WARN, LOG_LEVEL.INFO, LOG_LEVEL.DEBUG ], FLUSH_INTERVAL = 6e4, DEFAULT_LOG_LEVEL = LOG_LEVEL.WARN, logger__extends = Object.assign || function(target) {
                for (var i = 1; i < arguments.length; i++) {
                    var source = arguments[i];
                    for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
                }
                return target;
            };
            function httpTransport(_ref) {
                return function(_ref) {
                    var url = _ref.url, _ref$method = _ref.method, method = void 0 === _ref$method ? "get" : _ref$method, _ref$headers = _ref.headers, headers = void 0 === _ref$headers ? {} : _ref$headers, json = _ref.json, data = _ref.data, body = _ref.body, _ref$win = _ref.win, win = void 0 === _ref$win ? window : _ref$win, _ref$timeout = _ref.timeout, timeout = void 0 === _ref$timeout ? 0 : _ref$timeout;
                    return new promise_ZalgoPromise(function(resolve, reject) {
                        if (json && data || json && body || data && json) throw new Error("Only options.json or options.data or options.body should be passed");
                        for (var normalizedHeaders = {}, _i4 = 0, _Object$keys2 = Object.keys(headers), _length4 = null == _Object$keys2 ? 0 : _Object$keys2.length; _i4 < _length4; _i4++) {
                            var _key2 = _Object$keys2[_i4];
                            normalizedHeaders[_key2.toLowerCase()] = headers[_key2];
                        }
                        json ? normalizedHeaders[HEADERS.CONTENT_TYPE] = normalizedHeaders[HEADERS.CONTENT_TYPE] || "application/json" : (data || body) && (normalizedHeaders[HEADERS.CONTENT_TYPE] = normalizedHeaders[HEADERS.CONTENT_TYPE] || "application/x-www-form-urlencoded; charset=utf-8");
                        normalizedHeaders[HEADERS.ACCEPT] = normalizedHeaders[HEADERS.ACCEPT] || "application/json";
                        for (var _i6 = 0, _length6 = null == http_headerBuilders ? 0 : http_headerBuilders.length; _i6 < _length6; _i6++) for (var builtHeaders = (0, 
                        http_headerBuilders[_i6])(), _i8 = 0, _Object$keys4 = Object.keys(builtHeaders), _length8 = null == _Object$keys4 ? 0 : _Object$keys4.length; _i8 < _length8; _i8++) {
                            var _key3 = _Object$keys4[_i8];
                            normalizedHeaders[_key3.toLowerCase()] = builtHeaders[_key3];
                        }
                        var xhr = new win.XMLHttpRequest();
                        xhr.addEventListener("load", function() {
                            var responseHeaders = function() {
                                for (var result = {}, _i2 = 0, _rawHeaders$trim$spli2 = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "").trim().split("\n"), _length2 = null == _rawHeaders$trim$spli2 ? 0 : _rawHeaders$trim$spli2.length; _i2 < _length2; _i2++) {
                                    var _line$split = _rawHeaders$trim$spli2[_i2].split(":"), _key = _line$split[0], values = _line$split.slice(1);
                                    result[_key.toLowerCase()] = values.join(":").trim();
                                }
                                return result;
                            }(this.getAllResponseHeaders());
                            if (!this.status) return reject(new Error("Request to " + method.toLowerCase() + " " + url + " failed: no response status code."));
                            var contentType = responseHeaders["content-type"], isJSON = contentType && (0 === contentType.indexOf("application/json") || 0 === contentType.indexOf("text/json")), responseBody = this.responseText;
                            try {
                                responseBody = JSON.parse(responseBody);
                            } catch (err) {
                                if (isJSON) return reject(new Error("Invalid json: " + this.responseText + "."));
                            }
                            var res = {
                                status: this.status,
                                headers: responseHeaders,
                                body: responseBody
                            };
                            return resolve(res);
                        }, !1);
                        xhr.addEventListener("error", function(evt) {
                            reject(new Error("Request to " + method.toLowerCase() + " " + url + " failed: " + evt.toString() + "."));
                        }, !1);
                        xhr.open(method, url, !0);
                        for (var _key4 in normalizedHeaders) normalizedHeaders.hasOwnProperty(_key4) && xhr.setRequestHeader(_key4, normalizedHeaders[_key4]);
                        json ? body = JSON.stringify(json) : data && (body = Object.keys(data).map(function(key) {
                            return encodeURIComponent(key) + "=" + (data ? encodeURIComponent(data[key]) : "");
                        }).join("&"));
                        xhr.timeout = timeout;
                        xhr.ontimeout = function() {
                            reject(new Error("Request to " + method.toLowerCase() + " " + url + " has timed out"));
                        };
                        xhr.send(body);
                    });
                }({
                    url: _ref.url,
                    method: _ref.method,
                    headers: _ref.headers,
                    json: _ref.json
                }).then(src_util_noop);
            }
            function extendIfDefined(target, source) {
                for (var key in source) source.hasOwnProperty(key) && source[key] && (target[key] = source[key]);
            }
            function Logger(_ref2) {
                var url = _ref2.url, prefix = _ref2.prefix, _ref2$logLevel = _ref2.logLevel, logLevel = void 0 === _ref2$logLevel ? DEFAULT_LOG_LEVEL : _ref2$logLevel, _ref2$transport = _ref2.transport, transport = void 0 === _ref2$transport ? httpTransport : _ref2$transport, _ref2$flushInterval = _ref2.flushInterval, flushInterval = void 0 === _ref2$flushInterval ? FLUSH_INTERVAL : _ref2$flushInterval, events = [], tracking = [], payloadBuilders = [], metaBuilders = [], trackingBuilders = [], headerBuilders = [];
                function print(level, event, payload) {
                    if (dom_isBrowser() && window.console && window.console.log && window.location.protocol !== constants_PROTOCOL.FILE) {
                        var consoleLogLevel = logLevel;
                        window.LOG_LEVEL && -1 !== LOG_LEVEL_PRIORITY.indexOf(window.LOG_LEVEL) && (consoleLogLevel = window.LOG_LEVEL);
                        if (!(LOG_LEVEL_PRIORITY.indexOf(level) > LOG_LEVEL_PRIORITY.indexOf(consoleLogLevel))) {
                            var args = [ event ];
                            args.push(payload);
                            (payload.error || payload.warning) && args.push("\n\n", payload.error || payload.warning);
                            try {
                                window.console[level] && window.console[level].apply ? window.console[level].apply(window.console, args) : window.console.log && window.console.log.apply && window.console.log.apply(window.console, args);
                            } catch (err) {}
                        }
                    }
                }
                function immediateFlush() {
                    return promise_ZalgoPromise.try(function() {
                        if (dom_isBrowser() && (events.length || tracking.length)) {
                            for (var meta = {}, _i2 = 0, _length2 = null == metaBuilders ? 0 : metaBuilders.length; _i2 < _length2; _i2++) extendIfDefined(meta, (0, 
                            metaBuilders[_i2])(meta));
                            for (var headers = {}, _i4 = 0, _length4 = null == headerBuilders ? 0 : headerBuilders.length; _i4 < _length4; _i4++) extendIfDefined(headers, (0, 
                            headerBuilders[_i4])(headers));
                            var req = transport({
                                method: "POST",
                                url: url,
                                headers: headers,
                                json: {
                                    events: events,
                                    meta: meta,
                                    tracking: tracking
                                }
                            });
                            events = [];
                            tracking = [];
                            return req.then(src_util_noop);
                        }
                    });
                }
                var method, time, flush = function(method) {
                    var delay = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 50, promise = void 0, timeout = void 0;
                    return function() {
                        timeout && clearTimeout(timeout);
                        var localPromise = promise = promise || new promise_ZalgoPromise();
                        timeout = setTimeout(function() {
                            promise = null;
                            timeout = null;
                            promise_ZalgoPromise.try(method).then(function(result) {
                                localPromise.resolve(result);
                            }, function(err) {
                                localPromise.reject(err);
                            });
                        }, delay);
                        return localPromise;
                    };
                }(immediateFlush);
                function log(level, event) {
                    var payload = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                    if (!dom_isBrowser()) return logger;
                    prefix && (event = prefix + "_" + event);
                    for (var logPayload = logger__extends({}, objFilter(payload), {
                        timestamp: Date.now().toString()
                    }), _i6 = 0, _length6 = null == payloadBuilders ? 0 : payloadBuilders.length; _i6 < _length6; _i6++) extendIfDefined(logPayload, (0, 
                    payloadBuilders[_i6])(logPayload));
                    !function(level, event, payload) {
                        events.push({
                            level: level,
                            event: event,
                            payload: payload
                        });
                        -1 !== AUTO_FLUSH_LEVEL.indexOf(level) && flush();
                    }(level, event, logPayload);
                    print(level, event, logPayload);
                    return logger;
                }
                function addBuilder(builders, builder) {
                    builders.push(builder);
                    return logger;
                }
                dom_isBrowser() && (method = flush, time = flushInterval, function loop() {
                    setTimeout(function() {
                        method();
                        loop();
                    }, time);
                }());
                var logger = {
                    debug: function(event, payload) {
                        return log(LOG_LEVEL.DEBUG, event, payload);
                    },
                    info: function(event, payload) {
                        return log(LOG_LEVEL.INFO, event, payload);
                    },
                    warn: function(event, payload) {
                        return log(LOG_LEVEL.WARN, event, payload);
                    },
                    error: function(event, payload) {
                        return log(LOG_LEVEL.ERROR, event, payload);
                    },
                    track: function() {
                        var payload = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                        if (!dom_isBrowser()) return logger;
                        for (var trackingPayload = objFilter(payload), _i8 = 0, _length8 = null == trackingBuilders ? 0 : trackingBuilders.length; _i8 < _length8; _i8++) extendIfDefined(trackingPayload, (0, 
                        trackingBuilders[_i8])(trackingPayload));
                        print(LOG_LEVEL.DEBUG, "track", trackingPayload);
                        tracking.push(trackingPayload);
                        return logger;
                    },
                    flush: flush,
                    immediateFlush: immediateFlush,
                    addPayloadBuilder: function(builder) {
                        return addBuilder(payloadBuilders, builder);
                    },
                    addMetaBuilder: function(builder) {
                        return addBuilder(metaBuilders, builder);
                    },
                    addTrackingBuilder: function(builder) {
                        return addBuilder(trackingBuilders, builder);
                    },
                    addHeaderBuilder: function(builder) {
                        return addBuilder(headerBuilders, builder);
                    },
                    setTransport: function(newTransport) {
                        transport = newTransport;
                        return logger;
                    }
                };
                return logger;
            }
            __webpack_require__.d(__webpack_exports__, "Logger", function() {
                return Logger;
            });
            __webpack_require__.d(__webpack_exports__, "LOG_LEVEL", function() {
                return LOG_LEVEL;
            });
            __webpack_require__.d(__webpack_exports__, "PROTOCOL", function() {
                return constants_PROTOCOL;
            });
        }
    });
});
//# sourceMappingURL=beaver-logger.js.map