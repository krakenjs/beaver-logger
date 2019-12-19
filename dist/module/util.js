"use strict";

exports.__esModule = true;
exports.simpleRequest = simpleRequest;

function simpleRequest({
  method = 'GET',
  url,
  headers,
  json
}) {
  const req = new XMLHttpRequest();
  req.open(method, url);

  for (const header of Object.keys(headers)) {
    req.setRequestHeader(header, headers[header]);
  }

  req.send(JSON.stringify(json));
}