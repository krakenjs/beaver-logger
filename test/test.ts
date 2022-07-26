import {
  $mockEndpoint,
  patchXmlHttpRequest,
  // @ts-ignore
} from "@krakenjs/sync-browser-mocks/dist/sync-browser-mocks";
import { describe, it } from "vitest";

import { Logger, getHTTPTransport } from "../src";
import type { Payload } from "../src/types";

patchXmlHttpRequest();
describe("beaver-logger tests", () => {
  it("should log something and flush it to the buffer", () => {
    // @ts-ignore
    window.navigator.sendBeacon = undefined; // simulate IE 11 scenario

    const $logger = Logger({
      url: "/test/api/log",
    });
    $logger.info("hello_world", {
      transitionName: "bar",
      error: "true",
    });
    const logEndpoint = $mockEndpoint.register({
      method: "POST",
      uri: "/test/api/log",
      // @ts-ignore
      handler: (req) => {
        const hasLog = req.data.events.some(
          // @ts-ignore
          (event) => event.event === "hello_world" && event.level === "info"
        );

        if (!hasLog) {
          throw new Error("Expected posted payload to contain logged log");
        }

        return {};
      },
    });
    logEndpoint.expectCalls();
    return $logger.flush().then(() => {
      logEndpoint.done();
    });
  });
  it("should log something and flush it to the buffer using sendBeacon", () => {
    const $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true,
    });
    $logger.info("hello_world", {
      transitionName: "bar",
      error: "true",
    });
    const logEndpoint = $mockEndpoint.register({
      method: "POST",
      uri: "/test/api/log",
      // @ts-ignore
      handler: (req) => {
        const hasLog = req.data.events.some(
          // @ts-ignore
          (event) => event.event === "hello_world" && event.level === "info"
        );

        if (!hasLog) {
          throw new Error("Expected posted payload to contain logged log");
        }

        return {};
      },
    });
    let sendBeaconCalled = false;

    window.navigator.sendBeacon = () => {
      sendBeaconCalled = true;
      return sendBeaconCalled;
    };

    return $logger.flush().then(() => {
      if (sendBeaconCalled) {
        logEndpoint.done();
      } else {
        throw new Error(
          "Result from calling sendBeacon() should have been false."
        );
      }
    });
  });
  it("should not log using sendBeacon if custom headers are passed", () => {
    const $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true,
    });
    $logger.addHeaderBuilder(() => {
      return {
        "x-custom-header": "hunter2",
      } as Payload;
    });
    $logger.info("hello_world", {
      transitionName: "bar",
      error: "true",
    });
    const logEndpoint = $mockEndpoint.register({
      method: "POST",
      uri: "/test/api/log",
      // @ts-ignore
      handler: (req) => {
        const hasLog = req.data.events.some(
          // @ts-ignore
          (event) => event.event === "hello_world" && event.level === "info"
        );

        if (!hasLog) {
          throw new Error("Expected posted payload to contain logged log");
        }

        return {};
      },
    });
    let sendBeaconCalled = false;

    window.navigator.sendBeacon = () => {
      sendBeaconCalled = true;
      return sendBeaconCalled;
    };

    logEndpoint.expectCalls();
    return $logger.flush().then(() => {
      if (sendBeaconCalled) {
        throw new Error(
          "Result from calling sendBeacon() should have been false."
        );
      } else {
        logEndpoint.done();
      }
    });
  });
  it("should log something using XMLHttpRequest and a custom transport", () => {
    const XMLHttpRequestCalled = false;
    // const win = {
    //   ...window,
    //   XMLHttpRequest: () => {
    //     XMLHttpRequestCalled = true;
    //   },
    // };
    const $logger = Logger({
      url: "/test/api/log",
      transport: getHTTPTransport(), // defaults to window
    });
    $logger.info("hello_world", {
      transitionName: "bar",
      error: "true",
    });
    return $logger.flush().then(() => {
      if (!XMLHttpRequestCalled) {
        throw new Error(
          "Expected XMLHttpRequest on custom window to be called."
        );
      }
    });
  });
  it("should log something using sendBeacon and a custom transport", () => {
    const sendBeaconCalled = false;
    // const win = {
    //   ...window,
    //   navigator: {
    //     ...window.navigator,
    //     sendBeacon: () => {
    //       sendBeaconCalled = true;
    //     },
    //   },
    // };
    const $logger = Logger({
      url: "/test/api/log",
      enableSendBeacon: true,
      transport: getHTTPTransport(), // defaults to window
    });
    $logger.info("hello_world", {
      transitionName: "bar",
      error: "true",
    });
    return $logger.flush().then(() => {
      if (!sendBeaconCalled) {
        throw new Error("Expected sendBeacon on custom window to be called.");
      }
    });
  });
  describe("Amplitude", () => {
    it("should log something and flush it to the buffer using sendBeacon if Amplitude API key is present", () => {
      const $logger = Logger({
        url: "https://api2.amplitude.com/2/httpapi",
        amplitudeApiKey: "test_key",
        enableSendBeacon: true,
      });
      $logger.track({
        transitionName: "bar",
        error: "true",
        userId: "abc123",
      });
      const logEndpoint = $mockEndpoint.register({
        method: "POST",
        uri: "https://api2.amplitude.com/2/httpapi",
        // @ts-ignore
        handler: (req) => {
          const hasLog = req.data.events.some(
            // @ts-ignore
            (event) => event.foo === "bar" && event.user_id === "abc123"
          );

          if (!hasLog) {
            throw new Error("Expected posted payload to contain logged log");
          }

          return {};
        },
      });
      let sendBeaconCalled = false;

      window.navigator.sendBeacon = () => {
        sendBeaconCalled = true;
        return sendBeaconCalled;
      };

      return $logger.flush().then(() => {
        if (sendBeaconCalled) {
          logEndpoint.done();
        } else {
          throw new Error(
            "Result from calling sendBeacon() should have been false."
          );
        }
      });
    });
  });
});
