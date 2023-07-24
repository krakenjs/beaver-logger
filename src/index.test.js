// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-namespace */
/* @flow */
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as belter from "@krakenjs/belter/src";
import * as crossDomainUtils from "@krakenjs/cross-domain-utils/src";

import { Logger, getHTTPTransport } from ".";

describe("beaver-logger custom transport tests", () => {
  // TODO: this test suite isn't so great with what we need to mock.
  // Consider making an integration test suite instead given all the reliance on mocking window

  beforeEach(() => {
    // because we are mucking about window we need to ensure same domain checks pass
    vi.spyOn(crossDomainUtils, "isSameDomain").mockReturnValue(true);
    vi.spyOn(crossDomainUtils, "assertSameDomain").mockImplementation(
      (win) => win
    );
  });

  it("should log something using XMLHttpRequest and a custom transport", async () => {
    const XMLHttpRequest = vi.fn();

    const win = {
      ...window,
      XMLHttpRequest,
    };

    const $logger = Logger({
      url: "/test/api/log",
      transport: getHTTPTransport(win),
    });

    $logger.info("hello_world", {
      foo: "bar",
      bar: true,
    });

    await $logger.flush();
    expect(XMLHttpRequest).toHaveBeenCalledOnce();
  });

  it("should log something using sendBeacon and a custom transport", async () => {
    // must return something truthy see `http.js` for the short-circuit
    const sendBeacon = vi.fn().mockReturnValue(true);

    // need to do this since `sendBeacon` is using window.navigator not the supplied window to transport, which we might need to update later after more investigation
    // this use to pass in karma given it was a real browser but now in jsdom thats not provided
    window.navigator.sendBeacon = () => true;

    const win = {
      ...window,
      navigator: {
        ...window.navigator,
        sendBeacon,
      },
    };

    const $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true,
      transport: getHTTPTransport(win),
    });

    $logger.info("hello_world", {
      foo: "bar",
      bar: true,
    });

    await $logger.flush();
    expect(sendBeacon).toHaveBeenCalledOnce();
  });
});

describe("beaver-logger default transport tests", () => {
  let requestSpy = vi.fn();

  beforeEach(() => {
    requestSpy = vi.spyOn(belter, "request").mockImplementation((data) => {
      const { url, method, json } = data;
      if (url === "/test/api/log" && method === "POST") {
        return json.events.some(
          (event) => event.event === "hello_world" && event.level === "info"
        );
      }

      return false;
    });
  });

  it("should log something and flush it to the buffer", async () => {
    window.navigator.sendBeacon = undefined; // simulate IE 11 scenario

    const $logger = Logger({
      url: "/test/api/log",
    });

    $logger.info("hello_world", {
      foo: "bar",
      bar: true,
    });

    await $logger.flush();
    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toReturnWith(true);
  });

  it("should log something and flush it to the buffer using sendBeacon", async () => {
    const $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true,
    });

    $logger.info("hello_world", {
      foo: "bar",
      bar: true,
    });

    let sendBeaconCalled = false;
    window.navigator.sendBeacon = () => {
      sendBeaconCalled = true;
    };

    await $logger.flush();

    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toReturnWith(true);
    expect(sendBeaconCalled).toBeTruthy();
  });

  it("should not log using sendBeacon if custom headers are passed", async () => {
    const $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true,
    });

    $logger.addHeaderBuilder(() => {
      return {
        "x-custom-header": "hunter2",
      };
    });

    $logger.info("hello_world", {
      foo: "bar",
      bar: true,
    });

    let sendBeaconCalled = false;
    window.navigator.sendBeacon = () => {
      sendBeaconCalled = true;
    };

    await $logger.flush();

    expect(requestSpy).toHaveBeenCalled();
    expect(requestSpy).toReturnWith(true);
    expect(sendBeaconCalled).toBeFalsy();
  });
});
