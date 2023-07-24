/* @flow */

import { type SameDomainWindowType } from "@krakenjs/cross-domain-utils/src";

import type { Payload } from "./types";

type CanUseBeaconOptions = {|
  headers: { [string]: string },
  enableSendBeacon: boolean,
|};

const canUseSendBeacon = ({
  headers,
  enableSendBeacon,
}: CanUseBeaconOptions): boolean => {
  const hasHeaders = headers && Object.keys(headers).length;
  if (
    window &&
    window.navigator.sendBeacon &&
    !hasHeaders &&
    enableSendBeacon &&
    window.Blob
  ) {
    return true;
  }

  return false;
};

type SendBeaconOptions = {|
  win: SameDomainWindowType,
  url: string,
  data: JSON,
  useBlob: boolean,
|};

const sendBeacon = ({
  win = window,
  url,
  data,
  useBlob = true,
}: SendBeaconOptions): boolean => {
  try {
    const json = JSON.stringify(data);

    if (!win.navigator.sendBeacon) {
      throw new Error(`No sendBeacon available`);
    }

    if (useBlob) {
      const blob = new Blob([json], { type: "application/json" });
      return win.navigator.sendBeacon(url, blob);
    }

    return win.navigator.sendBeacon(url, json);
  } catch (e) {
    return false;
  }
};

const extendIfDefined = (target: Payload, source: Payload) => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
};

export { canUseSendBeacon, extendIfDefined, sendBeacon };
