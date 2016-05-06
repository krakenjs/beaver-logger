
export let config = {

    uri: '/api/log',
    
    initial_state_name: 'init',

    flushInterval:    10 * 60 * 1000,
    debounceInterval: 10,

    sizeLimit: 300,

    heartbeat: true,
    heartbeatConsoleLog: true,
    heartbeatInterval:    5000,
    hearbeatMaxThreshold: 50,
    heartbeatTooBusyThreshold: 10000,

    autoLog: ['warn', 'error'],

    logUnload:      true,
    logUnloadSync:  false,
    logPerformance: true
};