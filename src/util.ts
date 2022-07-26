// @ts-ignore
import type { SameDomainWindowType } from "@krakenjs/cross-domain-utils";

import { AMPLITUDE_URL } from "./config";
import type { Payload } from "./types";

type CanUseBeaconOptions = {
  headers: Record<string, unknown>;
  enableSendBeacon: boolean;
};

const canUseSendBeacon = ({
  headers,
  enableSendBeacon,
}: CanUseBeaconOptions): boolean => {
  const hasHeaders = headers && Object.keys(headers).length;

  if (
    window &&
    // @ts-ignore
    window.navigator.sendBeacon &&
    !hasHeaders &&
    enableSendBeacon &&
    window.Blob
  ) {
    return true;
  }

  return false;
};

const isAmplitude = (url: string): boolean => {
  if (url === AMPLITUDE_URL) {
    return true;
  }

  return false;
};

type SendBeaconOptions = {
  win: SameDomainWindowType;
  url: string;
  data: JSON;
  useBlob: boolean;
};

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
      const blob = new Blob([json], {
        type: "application/json",
      });
      return win.navigator.sendBeacon(url, blob);
    }

    return win.navigator.sendBeacon(url, json);
  } catch (e) {
    return false;
  }
};

const extendIfDefined = (target: Payload, source: Payload): void => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      // @ts-ignore
      target[key] = source[key];
    }
  }
};

export { canUseSendBeacon, extendIfDefined, isAmplitude, sendBeacon };
