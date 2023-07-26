import _extends from "@babel/runtime/helpers/esm/extends";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as belter from "@krakenjs/belter/src";
import * as crossDomainUtils from "@krakenjs/cross-domain-utils/src";
import { Logger, getHTTPTransport } from ".";
describe("beaver-logger custom transport tests", function () {
  beforeEach(function () {
    vi.spyOn(crossDomainUtils, "isSameDomain").mockReturnValue(true);
    vi.spyOn(crossDomainUtils, "assertSameDomain").mockImplementation(function (win) {
      return win;
    });
  });
  it("should log something using XMLHttpRequest and a custom transport", _asyncToGenerator(function* () {
    var XMLHttpRequest = vi.fn();
    var win = _extends({}, window, {
      XMLHttpRequest: XMLHttpRequest
    });
    var $logger = Logger({
      url: "/test/api/log",
      transport: getHTTPTransport(win)
    });
    $logger.info("hello_world", {
      foo: "bar",
      bar: true
    });
    yield $logger.flush();
    expect(XMLHttpRequest).toHaveBeenCalledOnce();
  }));
  it("should log something using sendBeacon and a custom transport", _asyncToGenerator(function* () {
    var sendBeacon = vi.fn().mockReturnValue(true);
    window.navigator.sendBeacon = function () {
      return true;
    };
    var win = _extends({}, window, {
      navigator: _extends({}, window.navigator, {
        sendBeacon: sendBeacon
      })
    });
    var $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true,
      transport: getHTTPTransport(win)
    });
    $logger.info("hello_world", {
      foo: "bar",
      bar: true
    });
    yield $logger.flush();
    expect(sendBeacon).toHaveBeenCalledOnce();
  }));
});
describe("beaver-logger default transport tests", function () {
  var requestSpy = vi.fn();
  beforeEach(function () {
    requestSpy = vi.spyOn(belter, "request").mockImplementation(function (data) {
      var url = data.url,
        method = data.method,
        json = data.json;
      if (url === "/test/api/log" && method === "POST") {
        return json.events.some(function (event) {
          return event.event === "hello_world" && event.level === "info";
        });
      }
      return false;
    });
  });
  it("should log something and flush it to the buffer", _asyncToGenerator(function* () {
    window.navigator.sendBeacon = undefined;
    var $logger = Logger({
      url: "/test/api/log"
    });
    $logger.info("hello_world", {
      foo: "bar",
      bar: true
    });
    yield $logger.flush();
    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toReturnWith(true);
  }));
  it("should log something and flush it to the buffer using sendBeacon", _asyncToGenerator(function* () {
    var $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true
    });
    $logger.info("hello_world", {
      foo: "bar",
      bar: true
    });
    var sendBeaconCalled = false;
    window.navigator.sendBeacon = function () {
      sendBeaconCalled = true;
    };
    yield $logger.flush();
    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toReturnWith(true);
    expect(sendBeaconCalled).toBeTruthy();
  }));
  it("should not log using sendBeacon if custom headers are passed", _asyncToGenerator(function* () {
    var $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true
    });
    $logger.addHeaderBuilder(function () {
      return {
        "x-custom-header": "hunter2"
      };
    });
    $logger.info("hello_world", {
      foo: "bar",
      bar: true
    });
    var sendBeaconCalled = false;
    window.navigator.sendBeacon = function () {
      sendBeaconCalled = true;
    };
    yield $logger.flush();
    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toReturnWith(true);
    expect(sendBeaconCalled).toBeFalsy();
  }));
});