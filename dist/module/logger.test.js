import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from ".";
var XMLHttpRequestMock = vi.fn(function () {
  return {
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn()
  };
});
vi.stubGlobal("XMLHttpRequest", XMLHttpRequestMock);
var logger;
var logBuf;
describe("beaver exposes the Logger() function that returns a logger instance with the following methods... ", function () {
  beforeEach(function () {
    logger = Logger({
      url: "/test/api/log"
    });
    logBuf = logger.__buffer__;
    expect(logger.__buffer__.events).toHaveLength(0);
    expect(logger.__buffer__.tracking).toHaveLength(0);
  });
  it(".info(evtName, payload?) sends an info event obj to the events[] buffer ready for logging", function () {
    var expected = {
      event: "testing",
      level: "info",
      payload: {}
    };
    var expectedWithPayload = {
      event: "testingWithPayload",
      level: "info",
      payload: {
        country: "Mordor"
      }
    };
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);
    logger.info("testingWithPayload", {
      country: "Mordor"
    });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });
  it(".warn(evtName, payload?) sends a warn event obj to the events[] buffer ready for logging", function () {
    var expected = {
      event: "testing",
      level: "warn",
      payload: {}
    };
    var expectedWithPayload = {
      event: "testingWithPayload",
      level: "warn",
      payload: {
        country: "France"
      }
    };
    logger.warn("testing");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);
    logger.warn("testingWithPayload", {
      country: "France"
    });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });
  it(".error(evtName, payload?) sends an error event obj to the events[] buffer ready for logging", function () {
    var expected = {
      event: "house is on fire!!!",
      level: "error",
      payload: {}
    };
    var expectedWithPayload = {
      event: "oh no",
      level: "error",
      payload: {
        country: "DE"
      }
    };
    logger.error("house is on fire!!!");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);
    logger.error("oh no", {
      country: "DE"
    });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });
  it(".debug(evtName, payload?) sends a debug event obj to the events[] buffer ready for logging", function () {
    var expected = {
      event: "gollum_personality_count",
      level: "debug",
      payload: {}
    };
    var expectedWithPayload = {
      event: "frodo_personality_count",
      level: "debug",
      payload: {
        how_many: 5
      }
    };
    logger.debug("gollum_personality_count");
    expect(logBuf.events).toHaveLength(1);
    expect(logBuf.events[0]).toMatchObject(expected);
    logger.debug("frodo_personality_count", {
      how_many: 5
    });
    expect(logBuf.events).toHaveLength(2);
    expect(logBuf.events[1]).toMatchObject(expectedWithPayload);
  });
  it(".track(payload) sends general tracking info to the tracking[] buffer and will be sent with next flush", function () {
    var expected = {
      token: "12345",
      country: "FR",
      locale: {
        country: "FR",
        locale: "fr_FR"
      }
    };
    logger.track(expected);
    expect(logBuf.tracking).toHaveLength(1);
    expect(logBuf.tracking[0]).toMatchObject(expected);
  });
  it(".metric(payload) sends general tracking info to the metrics[] buffer and will be sent with next flush", function () {
    var expected = {
      name: "pp.xo.ui.lite.weasley.fallback-error",
      metricValue: 5,
      dimensions: {
        country: "FR",
        locale: "fr_FR"
      }
    };
    logger.metric({});
    expect(logBuf.metrics).toHaveLength(1);
    expect(logBuf.metrics[0]).toMatchObject({});
    logger.metric(expected);
    expect(logBuf.metrics).toHaveLength(2);
    expect(logBuf.metrics[1]).toMatchObject(expected);
  });
});
describe("a beaver-logger instance exposes logger.__buffer__={} prop as a readonly object that...", function () {
  it("doesn't allow its immedate children props to be reassigned", function () {
    var loggerInstance = Logger({
      url: "/test/api/log"
    });
    expect(loggerInstance.__buffer__).toStrictEqual({
      events: [],
      metrics: [],
      tracking: []
    });
    expect(function () {
      return loggerInstance.__buffer__ = {};
    }).toThrow("Cannot assign to read only property '__buffer__' of object '#<Object>'");
    expect(function () {
      return loggerInstance.__buffer__.events = [];
    }).toThrow("Cannot set property events of #<Object> which has only a getter");
    loggerInstance.__buffer__.metrics.push(1, 2, 3);
    loggerInstance.__buffer__.events.push(2);
    loggerInstance.__buffer__.tracking.push(3);
    expect(loggerInstance.__buffer__).toStrictEqual({
      events: [2],
      metrics: [1, 2, 3],
      tracking: [3]
    });
  });
});
describe("beaver logger provides flushing methods that send events to the server and clear the buffer ...", function () {
  beforeEach(function () {
    logger = Logger({
      url: "/test/api/log"
    });
    logBuf = logger.__buffer__;
    expect(logBuf.events).toHaveLength(0);
    expect(logBuf.tracking).toHaveLength(0);
    expect(logBuf.metrics).toHaveLength(0);
  });
  it(".flush() clears the buffers (after sending data to server))", _asyncToGenerator(function* () {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);
    yield logger.flush();
    expect(logBuf.events).toHaveLength(0);
  }));
  it(".immediateflush() clears the buffers (after sending data to server))", _asyncToGenerator(function* () {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);
    yield logger.immediateFlush();
    expect(logBuf.events).toHaveLength(0);
  }));
});