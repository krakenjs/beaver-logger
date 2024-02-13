/* @flow */
/* eslint-disable eslint-comments/disable-enable-pair */

import { beforeEach, describe, expect, test, vi } from "vitest";

import { Logger, type LoggerOptions } from ".";

const XMLHttpRequestMock = vi.fn(() => ({
  open: vi.fn(),
  send: vi.fn(),
  setRequestHeader: vi.fn(),
}));

vi.stubGlobal("XMLHttpRequest", XMLHttpRequestMock);

let logger;
let logBuf;

const initLogger = ({
  url = "/test/api/log",
  metricNamespacePrefix,
}: $Shape<LoggerOptions> = {}) =>
  Logger({
    url,
    metricNamespacePrefix,
  });
const getLoggerBuffer = (testLogger) => testLogger.__buffer__;

const validMetricPayload = {
  metricNamespace: "namespace",
  metricEventName: "event",
  metricType: "counter",
  metricValue: 1,
};

describe("beaver exposes the Logger() function that returns a logger instance with the following methods... ", () => {
  beforeEach(() => {
    // create a new logger with a new buffer
    logger = Logger({
      url: "/test/api/log",
    });

    logBuf = logger.__buffer__;

    // verify empty (clean slate)
    expect(logger.__buffer__.events).toHaveLength(0);
    expect(logger.__buffer__.tracking).toHaveLength(0);
  });

  test(".info(evtName, payload?) sends an info event obj to the events[] buffer ready for logging", () => {
    const expected = {
      event: "testing",
      level: "info",
      payload: {
        // timestamp: "1677866574862"  -- dynamic so commenting out
      },
    };

    const expectedWithPayload = {
      event: "testingWithPayload",
      level: "info",
      payload: {
        country: "Mordor",
      },
    };

    // 1) Without payload
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);

    // 2) With payload
    logger.info("testingWithPayload", { country: "Mordor" });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });

  test(".warn(evtName, payload?) sends a warn event obj to the events[] buffer ready for logging", () => {
    const expected = {
      event: "testing",
      level: "warn",
      payload: {},
    };

    const expectedWithPayload = {
      event: "testingWithPayload",
      level: "warn",
      payload: {
        country: "France",
      },
    };

    // 1) without payload
    logger.warn("testing");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);

    // 2) with payload
    logger.warn("testingWithPayload", { country: "France" });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });

  test(".error(evtName, payload?) sends an error event obj to the events[] buffer ready for logging", () => {
    const expected = {
      event: "house is on fire!!!",
      level: "error",
      payload: {},
    };

    const expectedWithPayload = {
      event: "oh no",
      level: "error",
      payload: {
        country: "DE",
      },
    };

    // 1) without payload
    logger.error("house is on fire!!!");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);

    // 2) with payload
    logger.error("oh no", { country: "DE" });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });

  test(".debug(evtName, payload?) sends a debug event obj to the events[] buffer ready for logging", () => {
    const expected = {
      event: "gollum_personality_count",
      level: "debug",
      payload: {},
    };

    const expectedWithPayload = {
      event: "frodo_personality_count",
      level: "debug",
      payload: {
        how_many: 5,
      },
    };

    // 1) without payload
    logger.debug("gollum_personality_count");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);

    // 2) with payload
    logger.debug("frodo_personality_count", { how_many: 5 });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });

  test(".track(payload) sends general tracking info to the tracking[] buffer and will be sent with next flush", () => {
    const expected = {
      token: "12345",
      country: "FR",
      locale: {
        country: "FR",
        locale: "fr_FR",
      },
    };

    //
    logger.track(expected);
    expect(logBuf.tracking).toHaveLength(1);
    expect(logBuf.tracking[0]).toMatchObject(expected);
  });

  test(".metric(payload) sends general tracking info to the metrics[] buffer and will be sent with next flush", () => {
    const expected = {
      metricNamespace: "pp.xo.ui.lite.weasley.fallback-error",
      metricEventName: "event",
      metricValue: 5,
      dimensions: {
        country: "FR",
        locale: "fr_FR",
      },
    };

    // 1) Won't error on empty / missing payload props
    // $FlowIssue invalid metric payload
    logger.metric({});
    expect(logBuf.metrics).toHaveLength(1);
    expect(logBuf.metrics[0]).toMatchObject({});

    // 2) Normal expected payload shape for .metric()
    logger.metric(expected);
    expect(logBuf.metrics).toHaveLength(2);
    expect(logBuf.metrics[1]).toMatchObject(expected);
  });
});

describe("a beaver-logger instance exposes logger.__buffer__={} prop as a readonly object that...", () => {
  test("doesn't allow its immedate children props to be reassigned", () => {
    const loggerInstance = Logger({
      url: "/test/api/log",
    });

    // verify initial empty shape of buffer
    expect(loggerInstance.__buffer__).toStrictEqual({
      events: [],
      metrics: [],
      tracking: [],
    });

    // verify we disallow re-assigning __buffer__ or its arrays
    // $FlowIssue Invalid buffer
    expect(() => (loggerInstance.__buffer__ = {})).toThrow(
      "Cannot assign to read only property '__buffer__' of object '#<Object>'"
    );

    // $FlowIssue Invalid buffer
    expect(() => (loggerInstance.__buffer__.events = [])).toThrow(
      "Cannot set property events of #<Object> which has only a getter"
    );

    // but using the buffer array methods directly is still allowed
    // $FlowIssue Invalid buffer
    loggerInstance.__buffer__.metrics.push(1, 2, 3);
    // $FlowIssue Invalid buffer
    loggerInstance.__buffer__.events.push(2);
    // $FlowIssue Invalid buffer
    loggerInstance.__buffer__.tracking.push(3);

    expect(loggerInstance.__buffer__).toStrictEqual({
      events: [2],
      metrics: [1, 2, 3],
      tracking: [3],
    });
  });
});

describe("beaver logger provides flushing methods that send events to the server and clear the buffer ...", () => {
  beforeEach(() => {
    // create a new logger with a new buffer
    logger = Logger({
      url: "/test/api/log",
    });

    logBuf = logger.__buffer__;

    // verify empty (clean slate)
    expect(logBuf.events).toHaveLength(0);
    expect(logBuf.tracking).toHaveLength(0);
    expect(logBuf.metrics).toHaveLength(0);
  });

  test(".flush() clears the buffers (after sending data to server))", async () => {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);

    await logger.flush();
    expect(logBuf.events).toHaveLength(0);
  });

  // test(".flush() debounces then calls immediateFlush()) ", async () => {
  // TODO:  need to test the promiseDebounce. Was unable to figure out how to do that. (zalgo...)
  // });

  test(".immediateflush() clears the buffers (after sending data to server))", async () => {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);

    await logger.immediateFlush();
    expect(logBuf.events).toHaveLength(0);
  });
});

describe("metricCounter", () => {
  test("adds metrics of counter type", () => {
    const testLogger = initLogger();

    testLogger.metricCounter({
      namespace: "namespace",
      event: "no_value",
      dimensions: {
        one: "1",
      },
    });

    testLogger.metricCounter({
      namespace: "namespace",
      event: "value",
      value: 3,
      dimensions: {
        one: "1",
      },
    });

    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual({
      metricNamespace: "namespace",
      metricEventName: "no_value",
      metricValue: 1,
      metricType: "counter",
      dimensions: {
        one: "1",
      },
    });

    expect(getLoggerBuffer(testLogger).metrics[1]).toEqual({
      metricNamespace: "namespace",
      metricEventName: "value",
      metricValue: 3,
      metricType: "counter",
      dimensions: {
        one: "1",
      },
    });
  });

  test("uses metric namespace prefix", () => {
    const testLogger = initLogger({
      metricNamespacePrefix: "prefix",
    });

    testLogger.metricCounter({
      namespace: "namespace",
      event: "no_value",
    });

    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(
      expect.objectContaining({
        metricNamespace: "prefix.namespace",
      })
    );
  });
});

describe("metricGauge", () => {
  test("adds metrics of gauge type", () => {
    const testLogger = initLogger();

    testLogger.metricGauge({
      namespace: "namespace",
      event: "load",
      value: 100,
      dimensions: {
        one: "1",
      },
    });

    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual({
      metricNamespace: "namespace",
      metricEventName: "load",
      metricValue: 100,
      metricType: "gauge",
      dimensions: {
        one: "1",
      },
    });
  });

  test("uses metric namespace prefix", () => {
    const testLogger = initLogger({
      metricNamespacePrefix: "prefix",
    });

    testLogger.metricGauge({
      namespace: "namespace",
      event: "load",
      value: 100,
    });

    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(
      expect.objectContaining({
        metricNamespace: "prefix.namespace",
      })
    );
  });
});

describe("addMetricDimensionBuilder", () => {
  test("adds dimensions from builder", () => {
    const testLogger = initLogger();

    testLogger.addMetricDimensionBuilder(() => ({
      dimension1: "1",
      dimension2: "2",
      dimension3: "3",
    }));

    testLogger.metric(validMetricPayload);

    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(
      expect.objectContaining({
        dimensions: {
          dimension1: "1",
          dimension2: "2",
          dimension3: "3",
        },
      })
    );
  });

  test("overwrites existing dimensions", () => {
    const testLogger = initLogger();

    testLogger.addMetricDimensionBuilder(() => ({
      dimension1: "overwrite1",
      dimension2: "overwrite2",
      dimension3: "overwrite3",
    }));

    testLogger.metric({
      ...validMetricPayload,
      dimensions: {
        dimension1: "1",
        dimension2: "2",
        dimension3: "3",
      },
    });

    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(
      expect.objectContaining({
        dimensions: {
          dimension1: "overwrite1",
          dimension2: "overwrite2",
          dimension3: "overwrite3",
        },
      })
    );
  });

  test("merges dimensions", () => {
    const testLogger = initLogger();

    testLogger.addMetricDimensionBuilder(() => ({
      dimension1: "1",
      dimension3: "3",
    }));

    testLogger.metric({
      ...validMetricPayload,
      dimensions: {
        dimension2: "2",
      },
    });

    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(
      expect.objectContaining({
        dimensions: {
          dimension1: "1",
          dimension2: "2",
          dimension3: "3",
        },
      })
    );
  });
});

/*
 TODO: Need to write unit tests for these exposed methods:
 addPayloadBuilder,
 addMetaBuilder,
 addTrackingBuilder,
 addHeaderBuilder,
 setTransport,
 configure,
 
 describe(' ', () => {
 
});
*/
