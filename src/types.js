/* @flow */

export type Payload = { [string]: string | boolean | null | void };

export type MetricPayload = {|
  metricNamespace: string, // the name of the metric that's used for charting / finding in signalFx
  metricEventName: string, // assigned to event_name dimension in signalFx
  metricValue?: number, // in most cases this will be 1 if we want to count 1 instance of an event happening.
  metricType?: "counter" | "gauge", // We support these types of metrics. Defaults to counter.
  /**
   * For proper usage & best practices guidance around dimensions please read: -------------------->
   * - https://engineering.paypalcorp.com/confluence/pages/viewpage.action?pageId=981633893
   * - https://engineering.paypalcorp.com/confluence/display/Checkout/Checkout+Observability+Overview
   */
  dimensions?: { [string]: string },
|};
