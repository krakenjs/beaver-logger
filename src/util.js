/* @flow */

type SimpleRequest = {|
    method? : string,
    url : string,
    headers : { [string] : string },
    json : Object
|};

export function simpleRequest({ method = 'GET', url, headers, json } : SimpleRequest) {
    const req = new XMLHttpRequest();
    req.open(method, url);
    for (const header of Object.keys(headers)) {
        req.setRequestHeader(header, headers[header]);
    }
    req.send(JSON.stringify(json));
}
