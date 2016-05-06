
export let payloadBuilders = [];
export let metaBuilders = [];

export function addPayloadBuilder(builder) {
    payloadBuilders.push(builder);
}

export function addMetaBuilder(builder) {
    metaBuilders.push(builder);
}