// @ts-ignore
import { ZalgoPromise } from "@krakenjs/zalgo-promise";
import {
  isBrowser,
  promiseDebounce,
  noop,
  safeInterval,
  objFilter,
  // @ts-ignore
} from "@krakenjs/belter";
import type { $Values } from "utility-types";

import {
  DEFAULT_LOG_LEVEL,
  LOG_LEVEL_PRIORITY,
  AUTO_FLUSH_LEVEL,
  FLUSH_INTERVAL,
  AMPLITUDE_URL,
} from "./config";
import { LOG_LEVEL, PROTOCOL } from "./constants";
import { extendIfDefined } from "./util";
import type { Transport } from "./http";
import { getHTTPTransport } from "./http";
import type { Payload } from "./types";

type LoggerOptions = {
  url?: string;
  prefix?: string;
  logLevel?: string;
  transport?: Transport;
  flushInterval?: number;
  enableSendBeacon?: boolean;
  amplitudeApiKey?: string;
};
type ClientPayload = Payload;
type Log = (name: string, payload?: ClientPayload) => LoggerType;

type Track = (payload: ClientPayload) => LoggerType;

type Builder = (arg0: Payload) => ClientPayload;
type AddBuilder = (arg0: Builder) => LoggerType;

export type LoggerType = {
  debug: Log;
  info: Log;
  warn: Log;
  error: Log;
  track: Track;
  flush: () => ZalgoPromise<void>;
  immediateFlush: () => ZalgoPromise<void>;
  addPayloadBuilder: AddBuilder;
  addMetaBuilder: AddBuilder;
  addTrackingBuilder: AddBuilder;
  addHeaderBuilder: AddBuilder;
  setTransport: (arg0: Transport) => LoggerType;
  configure: (arg0: LoggerOptions) => LoggerType;
};
export function Logger({
  url,
  prefix,
  logLevel = DEFAULT_LOG_LEVEL,
  transport = getHTTPTransport(),
  amplitudeApiKey,
  flushInterval = FLUSH_INTERVAL,
  enableSendBeacon = false,
}: LoggerOptions): LoggerType {
  let events: Array<{
    level: $Values<typeof LOG_LEVEL>;
    event: string;
    payload: Payload;
  }> = [];
  let tracking: Array<Payload> = [];
  const payloadBuilders: Array<Builder> = [];
  const metaBuilders: Array<Builder> = [];
  const trackingBuilders: Array<Builder> = [];
  const headerBuilders: Array<Builder> = [];

  function print(
    level: $Values<typeof LOG_LEVEL>,
    event: string,
    payload: Payload
  ): void {
    if (!isBrowser() || !window.console || !window.console.log) {
      return;
    }

    if (
      LOG_LEVEL_PRIORITY.indexOf(level) >
      LOG_LEVEL_PRIORITY.indexOf(logLevel as $Values<typeof LOG_LEVEL>)
    ) {
      return;
    }

    const args: Array<string | unknown> = [event as Payload];
    args.push(payload);

    if (payload.error || payload.warning) {
      args.push("\n\n", payload.error || payload.warning);
    }

    try {
      // @ts-ignore
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

      if (!events.length && !tracking.length) {
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
          },
          enableSendBeacon,
        }).catch(noop);
      }

      if (amplitudeApiKey) {
        transport({
          method: "POST",
          url: AMPLITUDE_URL,
          headers: {},
          json: {
            api_key: amplitudeApiKey,
            events: tracking.map((payload: Payload) => {
              // $FlowFixMe
              return {
                event_type: payload.transitionName || "event",
                event_properties: payload,
                ...payload,
              };
            }),
          },
          enableSendBeacon,
        }).catch(noop);
      }

      events = [];
      tracking = [];
      return ZalgoPromise.resolve(res).then(noop);
    });
  }

  const flush = promiseDebounce(immediateFlush);

  function enqueue(
    level: $Values<typeof LOG_LEVEL>,
    event: string,
    payload: Payload
  ): void {
    events.push({
      level,
      event,
      payload,
    });
    // @ts-ignore
    if (AUTO_FLUSH_LEVEL.indexOf(level) !== -1) {
      flush();
    }
  }

  function debug(event: string, payload: Payload): LoggerType {
    return log(LOG_LEVEL.DEBUG, event, payload);
  }

  function info(event: string, payload: Payload): LoggerType {
    return log(LOG_LEVEL.INFO, event, payload);
  }

  function warn(event: string, payload: Payload): LoggerType {
    return log(LOG_LEVEL.WARN, event, payload);
  }

  function error(event: string, payload: Payload): LoggerType {
    return log(LOG_LEVEL.ERROR, event, payload);
  }

  const logger = {
    debug,
    info,
    warn,
    error,
    track,
    flush,
    immediateFlush,
    addPayloadBuilder,
    addMetaBuilder,
    addTrackingBuilder,
    addHeaderBuilder,
    setTransport,
    configure,
  } as LoggerType;

  function log(
    level: $Values<typeof LOG_LEVEL>,
    event: string,
    payload: Payload
  ): LoggerType {
    if (!isBrowser()) {
      return logger;
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

    return logger;
  }

  function addBuilder(builders: Array<unknown>, builder: unknown): LoggerType {
    builders.push(builder);
    return logger;
  }

  function addPayloadBuilder(builder: unknown): LoggerType {
    return addBuilder(payloadBuilders, builder);
  }

  function addMetaBuilder(builder: unknown): LoggerType {
    return addBuilder(metaBuilders, builder);
  }

  function addTrackingBuilder(builder: unknown): LoggerType {
    return addBuilder(trackingBuilders, builder);
  }

  function addHeaderBuilder(builder: unknown): LoggerType {
    return addBuilder(headerBuilders, builder);
  }

  function track(payload = {}): LoggerType {
    if (!isBrowser()) {
      return logger;
    }

    const trackingPayload: Payload = objFilter(payload);

    for (const builder of trackingBuilders) {
      extendIfDefined(trackingPayload, builder(trackingPayload));
    }

    print(LOG_LEVEL.DEBUG, "track", trackingPayload);
    tracking.push(trackingPayload);

    return logger;
  }

  function setTransport(newTransport: Transport): LoggerType {
    transport = newTransport;
    return logger;
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

    if (opts.amplitudeApiKey) {
      amplitudeApiKey = opts.amplitudeApiKey;
    }

    if (opts.flushInterval) {
      flushInterval = opts.flushInterval;
    }

    if (opts.enableSendBeacon) {
      enableSendBeacon = opts.enableSendBeacon;
    }

    return logger;
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

  return logger;
}
