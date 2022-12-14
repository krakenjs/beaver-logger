/* @flow */

export type Payload = { [string]: string | boolean | null | void };

export type Metric = {|
  name: string,
  dimensions: Payload,
|};
