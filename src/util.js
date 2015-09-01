'use strict';

import Promise from 'promise';

export function extend(dest, src) {
    dest = dest || {};
    src  = src  || {};

    for (var i in src) {
        if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
        }
    }

    return dest;
};

export function promiseDebounce(method, interval) {

    var debounce = {};

    return function() {
        var args = arguments;

        if (debounce.timeout) {
            clearTimeout(debounce.timeout);
            delete debounce.timeout;
        }

        debounce.timeout = setTimeout(function () {

            var resolver = debounce.resolver;

            delete debounce.promise;
            delete debounce.resolver;
            delete debounce.timeout;

            method.apply(null, args).then(resolver);

        }, interval);

        debounce.promise = debounce.promise || new Promise(function (resolver) {
            debounce.resolver = resolver;
        });

        return debounce.promise;
    }
}

export var windowReady = new Promise(function(resolve) {
    if (document.readyState === 'complete') {
        resolve();
    }

    window.addEventListener('load', resolve);
});