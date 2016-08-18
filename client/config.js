
export let config = {

    uri: '',
    
    initial_state_name: 'init',

    flushInterval:    10 * 60 * 1000,
    debounceInterval: 10,

    sizeLimit: 300,

    // Supress `console.log`s when `true`
    // Recommended for production usage
    silent: false,

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
