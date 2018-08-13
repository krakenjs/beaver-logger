
import { ZalgoPromise } from 'zalgo-promise/src';

export function extend(dest, src, over=true) {
    dest = dest || {};
    src  = src  || {};

    for (let i in src) {
        if (src.hasOwnProperty(i)) {
            if (over || !dest.hasOwnProperty(i)) {
                dest[i] = src[i];
            }
        }
    }

    return dest;
}

export function isSameProtocol(url) {
    return window.location.protocol === url.split('/')[0];
}

export function isSameDomain(url) {
    let match = url.match(/https?:\/\/[^/]+/);

    if (!match) {
        return true;
    }

    return match[0] === `${window.location.protocol}//${window.location.host}`;
}

export function ajax(method, url, headers={}, data={}, { fireAndForget = false } = {}) {

    return new ZalgoPromise(resolve => {
        let XRequest = window.XMLHttpRequest || window.ActiveXObject;

        if (window.XDomainRequest && !isSameDomain(url)) {

            if (!isSameProtocol(url)) {
                return resolve();
            }

            XRequest = window.XDomainRequest;
        }

        let req = new XRequest('MSXML2.XMLHTTP.3.0');
        req.open(method.toUpperCase(), url, true);

        if (typeof req.setRequestHeader === 'function') {
            req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            req.setRequestHeader('Content-type', 'application/json');

            for (let headerName in headers) {
                if (headers.hasOwnProperty(headerName)) {
                    req.setRequestHeader(headerName, headers[headerName]);
                }
            }
        }

        if (fireAndForget) {
            resolve();
        } else {
            req.onreadystatechange = () => {
                if (req.readyState > 3) {
                    resolve();
                }
            };
        }

        req.send(JSON.stringify(data).replace(/&/g, '%26'));
    });
}

export function promiseDebounce(method, interval) {

    let debounce = {};

    return function() {
        let args = arguments;

        if (debounce.timeout) {
            clearTimeout(debounce.timeout);
            delete debounce.timeout;
        }

        debounce.timeout = setTimeout(() => {

            let resolver = debounce.resolver;
            let rejector = debounce.rejector;

            delete debounce.promise;
            delete debounce.resolver;
            delete debounce.rejector;
            delete debounce.timeout;

            return ZalgoPromise.resolve().then(() => {
                return method.apply(null, args);
            }).then(resolver, rejector);

        }, interval);

        debounce.promise = debounce.promise || new ZalgoPromise((resolver, rejector) => {
            debounce.resolver = resolver;
            debounce.rejector = rejector;
        });

        return debounce.promise;
    };
}

export function onWindowReady() : ZalgoPromise<void> {
    return new ZalgoPromise(resolve => {
        if (typeof document !== 'undefined' && document.readyState === 'complete') {
            resolve();
        }

        window.addEventListener('load', resolve);
    });
}

export function safeInterval(method, time) {

    let timeout;

    function loop() {
        timeout = setTimeout(() => {
            method();
            loop();
        }, time);
    }

    loop();

    return {
        cancel() {
            clearTimeout(timeout);
        }
    };
}

export function uniqueID() {
    let chars = '0123456789abcdef';

    return 'xxxxxxxxxx'.replace(/./g, () => {
        return chars.charAt(Math.floor(Math.random() * chars.length));
    });
}

export function isIE() {
    return Boolean(window.document.documentMode);
}
