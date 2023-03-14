/* eslint-disable flowtype/require-valid-file-annotation, eslint-comments/disable-enable-pair */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { Logger } from ".";

const XMLHttpRequestMock = vi.fn(() => ({
  open: vi.fn(),
  send: vi.fn(),
  setRequestHeader: vi.fn(),
}));

vi.stubGlobal("XMLHttpRequest", XMLHttpRequestMock);

let logger;
let logBuf;

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

  it(".info(evtName, payload?) sends an info event obj to the events[] buffer ready for logging", () => {
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

  it(".warn(evtName, payload?) sends a warn event obj to the events[] buffer ready for logging", () => {
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

  it(".error(evtName, payload?) sends an error event obj to the events[] buffer ready for logging", () => {
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

  it(".debug(evtName, payload?) sends a debug event obj to the events[] buffer ready for logging", () => {
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

  it(".track(payload) sends general tracking info to the tracking[] buffer and will be sent with next flush", () => {
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

  it(".metric(payload) sends general tracking info to the metrics[] buffer and will be sent with next flush", () => {
    const expected = {
      name: "pp.xo.ui.lite.weasley.fallback-error",
      metricValue: 5,
      dimensions: {
        country: "FR",
        locale: "fr_FR",
      },
    };

    // 1) Won't error on empty / missing payload props
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
  it("doesn't allow its immedate children props to be reassigned", () => {
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
    expect(() => (loggerInstance.__buffer__ = {})).toThrow(
      "Cannot assign to read only property '__buffer__' of object '#<Object>'"
    );

    expect(() => (loggerInstance.__buffer__.events = [])).toThrow(
      "Cannot set property events of #<Object> which has only a getter"
    );

    // but using the buffer array methods directly is still allowed
    loggerInstance.__buffer__.metrics.push(1, 2, 3);
    loggerInstance.__buffer__.events.push(2);
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

  it(".flush() clears the buffers (after sending data to server))", async () => {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);

    await logger.flush();
    expect(logBuf.events).toHaveLength(0);
  });

  // it(".flush() debounces then calls immediateFlush()) ", async () => {
  // TODO:  need to test the promiseDebounce. Was unable to figure out how to do that. (zalgo...)
  // });

  it(".immediateflush() clears the buffers (after sending data to server))", async () => {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);

    await logger.immediateFlush();
    expect(logBuf.events).toHaveLength(0);
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
