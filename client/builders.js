
export let payloadBuilders = [];
export let metaBuilders = [];
export let trackingBuilders = [];
export let headerBuilders = [];

export function addPayloadBuilder(builder) {
    payloadBuilders.push(builder);
}

export function addMetaBuilder(builder) {
    metaBuilders.push(builder);
}

export function addTrackingBuilder(builder) {
    trackingBuilders.push(builder);
}

export function addHeaderBuilder(builder) {
    headerBuilders.push(builder);
}