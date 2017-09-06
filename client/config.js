
export let config = {

    uri: '',
    prefix: '',

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
    heartbeatTooBusy: false,
    heartbeatTooBusyThreshold: 10000,

    logLevel: 'warn',

    autoLog: ['warn', 'error'],

    logUnload:      true,
    logPerformance: true
};

export let logLevels = [ 'error', 'warn', 'info', 'debug' ];
