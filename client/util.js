
import { Promise } from 'es6-promise-min';

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

export function isSameDomain(url) {
    let match = url.match(/https?:\/\/[^/]+/);

    if (!match) {
        return true;
    }

    return match[0] === `${window.location.protocol}//${window.location.host}`;
}

export function ajax(method, url, data, async=true) {

    return new Promise(resolve => {
        let XRequest = window.XMLHttpRequest || window.ActiveXObject;

        if (window.XDomainRequest && !isSameDomain(url)) {
            XRequest = window.XDomainRequest;
        }

        let req = new XRequest('MSXML2.XMLHTTP.3.0');
        req.open(method.toUpperCase(), url, async);
        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        req.setRequestHeader('Content-type', 'application/json');
        req.onreadystatechange = () => {
            if (req.readyState > 3) {
                resolve();
            }
        };
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

            delete debounce.promise;
            delete debounce.resolver;
            delete debounce.timeout;
            
            return Promise.resolve().then(() => {
                return method.apply(null, args);
            }).then(resolver);

        }, interval);

        debounce.promise = debounce.promise || new Promise(resolver => {
            debounce.resolver = resolver;
        });

        return debounce.promise;
    };
}

export let windowReady = new Promise(resolve => {
    if (document.readyState === 'complete') {
        resolve();
    }

    window.addEventListener('load', resolve);
});

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