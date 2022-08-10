import type { SameDomainWindowType } from "@krakenjs/cross-domain-utils";
import type { Payload } from "./types";
declare type CanUseBeaconOptions = {
    headers: Record<string, unknown>;
    enableSendBeacon: boolean;
};
declare const canUseSendBeacon: ({ headers, enableSendBeacon, }: CanUseBeaconOptions) => boolean;
declare const isAmplitude: (url: string) => boolean;
declare type SendBeaconOptions = {
    win: SameDomainWindowType;
    url: string;
    data: JSON;
    useBlob: boolean;
};
declare const sendBeacon: ({ win, url, data, useBlob, }: SendBeaconOptions) => boolean;
declare const extendIfDefined: (target: Payload, source: Payload) => void;
export { canUseSendBeacon, extendIfDefined, isAmplitude, sendBeacon };
