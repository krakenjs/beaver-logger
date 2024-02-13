import _extends from "@babel/runtime/helpers/esm/extends";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { beforeEach, describe, expect, test, vi } from "vitest";
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
var initLogger = function initLogger(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
    _ref$url = _ref.url,
    url = _ref$url === void 0 ? "/test/api/log" : _ref$url,
    metricNamespacePrefix = _ref.metricNamespacePrefix;
  return Logger({
    url: url,
    metricNamespacePrefix: metricNamespacePrefix
  });
};
var getLoggerBuffer = function getLoggerBuffer(testLogger) {
  return testLogger.__buffer__;
};
var validMetricPayload = {
  metricNamespace: "namespace",
  metricEventName: "event",
  metricType: "counter",
  metricValue: 1
};
describe("beaver exposes the Logger() function that returns a logger instance with the following methods... ", function () {
  beforeEach(function () {
    logger = Logger({
      url: "/test/api/log"
    });
    logBuf = logger.__buffer__;
    expect(logger.__buffer__.events).toHaveLength(0);
    expect(logger.__buffer__.tracking).toHaveLength(0);
  });
  test(".info(evtName, payload?) sends an info event obj to the events[] buffer ready for logging", function () {
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
  test(".warn(evtName, payload?) sends a warn event obj to the events[] buffer ready for logging", function () {
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
  test(".error(evtName, payload?) sends an error event obj to the events[] buffer ready for logging", function () {
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
  test(".debug(evtName, payload?) sends a debug event obj to the events[] buffer ready for logging", function () {
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
  test(".track(payload) sends general tracking info to the tracking[] buffer and will be sent with next flush", function () {
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
  test(".metric(payload) sends general tracking info to the metrics[] buffer and will be sent with next flush", function () {
    var expected = {
      metricNamespace: "pp.xo.ui.lite.weasley.fallback-error",
      metricEventName: "event",
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
  test("doesn't allow its immedate children props to be reassigned", function () {
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
  test(".flush() clears the buffers (after sending data to server))", _asyncToGenerator(function* () {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);
    yield logger.flush();
    expect(logBuf.events).toHaveLength(0);
  }));
  test(".immediateflush() clears the buffers (after sending data to server))", _asyncToGenerator(function* () {
    logger.info("testing");
    expect(logBuf.events).toHaveLength(1);
    yield logger.immediateFlush();
    expect(logBuf.events).toHaveLength(0);
  }));
});
describe("metricCounter", function () {
  test("adds metrics of counter type", function () {
    var testLogger = initLogger();
    testLogger.metricCounter({
      namespace: "namespace",
      event: "no_value",
      dimensions: {
        one: "1"
      }
    });
    testLogger.metricCounter({
      namespace: "namespace",
      event: "value",
      value: 3,
      dimensions: {
        one: "1"
      }
    });
    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual({
      metricNamespace: "namespace",
      metricEventName: "no_value",
      metricValue: 1,
      metricType: "counter",
      dimensions: {
        one: "1"
      }
    });
    expect(getLoggerBuffer(testLogger).metrics[1]).toEqual({
      metricNamespace: "namespace",
      metricEventName: "value",
      metricValue: 3,
      metricType: "counter",
      dimensions: {
        one: "1"
      }
    });
  });
  test("uses metric namespace prefix", function () {
    var testLogger = initLogger({
      metricNamespacePrefix: "prefix"
    });
    testLogger.metricCounter({
      namespace: "namespace",
      event: "no_value"
    });
    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(expect.objectContaining({
      metricNamespace: "prefix.namespace"
    }));
  });
});
describe("metricGauge", function () {
  test("adds metrics of gauge type", function () {
    var testLogger = initLogger();
    testLogger.metricGauge({
      namespace: "namespace",
      event: "load",
      value: 100,
      dimensions: {
        one: "1"
      }
    });
    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual({
      metricNamespace: "namespace",
      metricEventName: "load",
      metricValue: 100,
      metricType: "gauge",
      dimensions: {
        one: "1"
      }
    });
  });
  test("uses metric namespace prefix", function () {
    var testLogger = initLogger({
      metricNamespacePrefix: "prefix"
    });
    testLogger.metricGauge({
      namespace: "namespace",
      event: "load",
      value: 100
    });
    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(expect.objectContaining({
      metricNamespace: "prefix.namespace"
    }));
  });
});
describe("addMetricDimensionBuilder", function () {
  test("adds dimensions from builder", function () {
    var testLogger = initLogger();
    testLogger.addMetricDimensionBuilder(function () {
      return {
        dimension1: "1",
        dimension2: "2",
        dimension3: "3"
      };
    });
    testLogger.metric(validMetricPayload);
    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(expect.objectContaining({
      dimensions: {
        dimension1: "1",
        dimension2: "2",
        dimension3: "3"
      }
    }));
  });
  test("overwrites existing dimensions", function () {
    var testLogger = initLogger();
    testLogger.addMetricDimensionBuilder(function () {
      return {
        dimension1: "overwrite1",
        dimension2: "overwrite2",
        dimension3: "overwrite3"
      };
    });
    testLogger.metric(_extends({}, validMetricPayload, {
      dimensions: {
        dimension1: "1",
        dimension2: "2",
        dimension3: "3"
      }
    }));
    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(expect.objectContaining({
      dimensions: {
        dimension1: "overwrite1",
        dimension2: "overwrite2",
        dimension3: "overwrite3"
      }
    }));
  });
  test("merges dimensions", function () {
    var testLogger = initLogger();
    testLogger.addMetricDimensionBuilder(function () {
      return {
        dimension1: "1",
        dimension3: "3"
      };
    });
    testLogger.metric(_extends({}, validMetricPayload, {
      dimensions: {
        dimension2: "2"
      }
    }));
    expect(getLoggerBuffer(testLogger).metrics[0]).toEqual(expect.objectContaining({
      dimensions: {
        dimension1: "1",
        dimension2: "2",
        dimension3: "3"
      }
    }));
  });
});