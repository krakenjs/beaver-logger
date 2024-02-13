/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import {
  isBrowser,
  promiseDebounce,
  noop,
  safeInterval,
  objFilter,
} from "@krakenjs/belter/src";

import {
  DEFAULT_LOG_LEVEL,
  LOG_LEVEL_PRIORITY,
  AUTO_FLUSH_LEVEL,
  FLUSH_INTERVAL,
} from "./config";
import { LOG_LEVEL, PROTOCOL } from "./constants";
import { extendIfDefined } from "./util";
import { type Transport, getHTTPTransport } from "./http";
import type {
  MetricPayload,
  Payload,
  MetricPayloadCounter,
  MetricPayloadGauge,
} from "./types";

export type LoggerOptions = {|
  url?: string,
  prefix?: string,
  metricNamespacePrefix?: string,
  logLevel?: $Values<typeof LOG_LEVEL>,
  transport?: Transport,
  flushInterval?: number,
  enableSendBeacon?: boolean,
|};

type ClientPayload = Payload;
type Log = (name: string, payload?: ClientPayload) => LoggerType; // eslint-disable-line no-use-before-define
type Track = (payload: ClientPayload) => LoggerType; // eslint-disable-line no-use-before-define
type LogMetric = (payload: MetricPayload) => LoggerType; // eslint-disable-line no-use-before-define
type LogEvent = {|
  level: $Values<typeof LOG_LEVEL>,
  event: string,
  payload: Payload,
|};

type Builder = (Payload) => ClientPayload;
type AddBuilder = (Builder) => LoggerType; // eslint-disable-line no-use-before-define

export type LoggerType = {|
  debug: Log,
  info: Log,
  warn: Log,
  error: Log,

  track: Track,
  metric: LogMetric,
  metricCounter: (payload: MetricPayloadCounter) => LoggerType,
  metricGauge: (payload: MetricPayloadGauge) => LoggerType,

  flush: () => ZalgoPromise<void>,
  immediateFlush: () => ZalgoPromise<void>,

  addPayloadBuilder: AddBuilder,
  addMetaBuilder: AddBuilder,
  addTrackingBuilder: AddBuilder,
  addMetricDimensionBuilder: AddBuilder,
  addHeaderBuilder: AddBuilder,

  setTransport: (Transport) => LoggerType,
  configure: (LoggerOptions) => LoggerType,

  __buffer__: {|
    get events(): $ReadOnlyArray<LogEvent>,
    get tracking(): $ReadOnlyArray<Payload>,
    get metrics(): $ReadOnlyArray<MetricPayload>,
  |},
|};

export function Logger({
  url,
  prefix,
  metricNamespacePrefix,
  logLevel = DEFAULT_LOG_LEVEL,
  transport = getHTTPTransport(),
  flushInterval = FLUSH_INTERVAL,
  enableSendBeacon = false,
}: LoggerOptions): LoggerType {
  let events: Array<LogEvent> = [];
  let tracking: Array<Payload> = [];
  let metrics: Array<MetricPayload> = [];

  const payloadBuilders: Array<Builder> = [];
  const metaBuilders: Array<Builder> = [];
  const trackingBuilders: Array<Builder> = [];
  const metricDimensionBuilders: Array<Builder> = [];
  const headerBuilders: Array<Builder> = [];

  function print(
    level: $Values<typeof LOG_LEVEL>,
    event: string,
    payload: Payload
  ) {
    if (!isBrowser() || !window.console || !window.console.log) {
      return;
    }

    if (
      LOG_LEVEL_PRIORITY.indexOf(level) > LOG_LEVEL_PRIORITY.indexOf(logLevel)
    ) {
      return;
    }

    const args = [event];

    args.push(payload);

    if (payload.error || payload.warning) {
      args.push("\n\n", payload.error || payload.warning);
    }

    try {
      if (window.console[level] && window.console[level].apply) {
        window.console[level].apply(window.console, args);
      } else if (window.console.log && window.console.log.apply) {
        window.console.log.apply(window.console, args);
      }
    } catch (err) {
      // pass
    }
  }

  function immediateFlush(): ZalgoPromise<void> {
    return ZalgoPromise.try(() => {
      if (!isBrowser() || window.location.protocol === PROTOCOL.FILE) {
        return;
      }

      if (!events.length && !tracking.length && !metrics.length) {
        return;
      }

      const meta = {};
      for (const builder of metaBuilders) {
        extendIfDefined(meta, builder(meta));
      }

      const headers = {};
      for (const builder of headerBuilders) {
        extendIfDefined(headers, builder(headers));
      }

      let res;

      if (url) {
        res = transport({
          method: "POST",
          url,
          headers,
          json: {
            events,
            meta,
            tracking,
            metrics,
          },
          enableSendBeacon,
        }).catch(noop);
      }

      events = [];
      tracking = [];
      metrics = [];

      return ZalgoPromise.resolve(res).then(noop);
    });
  }

  const flush = promiseDebounce(immediateFlush);

  function enqueue(
    level: $Values<typeof LOG_LEVEL>,
    event: string,
    payload: Payload
  ) {
    events.push({
      level,
      event,
      payload,
    });

    if (AUTO_FLUSH_LEVEL.indexOf(level) !== -1) {
      flush();
    }
  }

  function log(
    level: $Values<typeof LOG_LEVEL>,
    event: string,
    payload = {}
  ): LoggerType {
    if (!isBrowser()) {
      return logger; // eslint-disable-line no-use-before-define
    }

    if (prefix) {
      event = `${prefix}_${event}`;
    }

    const logPayload: Payload = {
      ...objFilter(payload),
      timestamp: Date.now().toString(),
    };

    for (const builder of payloadBuilders) {
      extendIfDefined(logPayload, builder(logPayload));
    }

    enqueue(level, event, logPayload);
    print(level, event, logPayload);

    return logger; // eslint-disable-line no-use-before-define
  }

  function addBuilder(builders, builder): LoggerType {
    builders.push(builder);
    return logger; // eslint-disable-line no-use-before-define
  }

  function addPayloadBuilder(builder): LoggerType {
    return addBuilder(payloadBuilders, builder);
  }

  function addMetaBuilder(builder): LoggerType {
    return addBuilder(metaBuilders, builder);
  }

  function addTrackingBuilder(builder): LoggerType {
    return addBuilder(trackingBuilders, builder);
  }

  function addMetricDimensionBuilder(builder): LoggerType {
    return addBuilder(metricDimensionBuilders, builder);
  }

  function addHeaderBuilder(builder): LoggerType {
    return addBuilder(headerBuilders, builder);
  }

  function debug(event, payload): LoggerType {
    return log(LOG_LEVEL.DEBUG, event, payload);
  }

  function info(event, payload): LoggerType {
    return log(LOG_LEVEL.INFO, event, payload);
  }

  function warn(event, payload): LoggerType {
    return log(LOG_LEVEL.WARN, event, payload);
  }

  function error(event, payload): LoggerType {
    return log(LOG_LEVEL.ERROR, event, payload);
  }

  function track(payload = {}): LoggerType {
    if (!isBrowser()) {
      return logger; // eslint-disable-line no-use-before-define
    }

    const trackingPayload: Payload = objFilter(payload);

    for (const builder of trackingBuilders) {
      extendIfDefined(trackingPayload, builder(trackingPayload));
    }

    print(LOG_LEVEL.DEBUG, "track", trackingPayload);
    tracking.push(trackingPayload);

    return logger; // eslint-disable-line no-use-before-define
  }

  function metric(metricPayload: MetricPayload): LoggerType {
    if (!isBrowser()) {
      return logger; // eslint-disable-line no-use-before-define
    }

    if (metricNamespacePrefix) {
      metricPayload.metricNamespace = `${metricNamespacePrefix}.${metricPayload.metricNamespace}`;
    }

    if (metricDimensionBuilders.length > 0 && !metricPayload.dimensions) {
      metricPayload.dimensions = {};
    }

    for (const builder of metricDimensionBuilders) {
      extendIfDefined(
        metricPayload.dimensions || {},
        builder(metricPayload.dimensions || {})
      );
    }

    print(
      LOG_LEVEL.DEBUG,
      `metric.${metricPayload.metricNamespace}`,
      metricPayload.dimensions || {}
    );

    metrics.push(metricPayload);

    return logger; // eslint-disable-line no-use-before-define
  }

  function metricCounter(metricPayload: MetricPayloadCounter): LoggerType {
    return metric({
      metricNamespace: metricPayload.namespace,
      metricEventName: metricPayload.event,
      metricValue: metricPayload.value ?? 1,
      metricType: "counter",
      dimensions: metricPayload.dimensions,
    });
  }

  function metricGauge(metricPayload: MetricPayloadGauge): LoggerType {
    return metric({
      metricNamespace: metricPayload.namespace,
      metricEventName: metricPayload.event,
      metricValue: metricPayload.value,
      metricType: "gauge",
      dimensions: metricPayload.dimensions,
    });
  }

  function setTransport(newTransport: Transport): LoggerType {
    transport = newTransport;
    return logger; // eslint-disable-line no-use-before-define
  }

  function configure(opts: LoggerOptions): LoggerType {
    if (opts.url) {
      url = opts.url;
    }

    if (opts.prefix) {
      prefix = opts.prefix;
    }

    if (opts.logLevel) {
      logLevel = opts.logLevel;
    }

    if (opts.transport) {
      transport = opts.transport;
    }

    if (opts.flushInterval) {
      flushInterval = opts.flushInterval;
    }

    if (opts.enableSendBeacon) {
      enableSendBeacon = opts.enableSendBeacon;
    }

    return logger; // eslint-disable-line no-use-before-define
  }

  if (isBrowser()) {
    safeInterval(flush, flushInterval);
  }

  if (typeof window === "object") {
    window.addEventListener("beforeunload", () => {
      immediateFlush();
    });

    window.addEventListener("unload", () => {
      immediateFlush();
    });

    window.addEventListener("pagehide", () => {
      immediateFlush();
    });
  }

  const logger = {
    debug,
    info,
    warn,
    error,
    track,
    metric,
    metricCounter,
    metricGauge,
    flush,
    immediateFlush,
    addPayloadBuilder,
    addMetaBuilder,
    addMetricDimensionBuilder,
    addTrackingBuilder,
    addHeaderBuilder,
    setTransport,
    configure,

    // exposed primarily for testing
    // exposes these buffers as readonly getters only
    __buffer__: {
      get events(): $ReadOnlyArray<LogEvent> {
        return events;
      },
      get tracking(): $ReadOnlyArray<Payload> {
        return tracking;
      },
      get metrics(): $ReadOnlyArray<MetricPayload> {
        return metrics;
      },
    },
  };

  // mark the __buffer__ prop as readonly
  Object.defineProperty(logger, "__buffer__", { writable: false });

  return logger;
}
