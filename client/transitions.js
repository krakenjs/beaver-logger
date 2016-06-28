
import { reqStartElapsed, now } from './performance';
import { info, immediateFlush, track } from './logger';
import { addMetaBuilder, addPayloadBuilder } from './builders';
import { uniqueID } from './util';
import { config } from './config';

let windowID = uniqueID();
let pageID = uniqueID();

let currentState = config.initial_state_name;
let startTime;

export function startTransition() {
    startTime = now();
}

export function endTransition(toState) {
    startTime = startTime || reqStartElapsed();

    let currentTime = now();
    let elapsedTime;

    if (startTime !== undefined) {
        elapsedTime = parseInt(currentTime - startTime, 0);
    }

    let transitionName = `transition_${currentState}_to_${toState}`;

    info(transitionName, {
        duration: elapsedTime
    });

    track({
        transition: transitionName,
        transition_time: elapsedTime
    });

    immediateFlush();

    startTime = currentTime;
    currentState = toState;
    pageID = uniqueID();
}

export function transition(toState) {
    startTransition();
    endTransition(toState);
}

addPayloadBuilder(() => {
    return {
        windowID,
        pageID
    }
});

addMetaBuilder(() => {
    return {
        state: `ui_${currentState}`
    };
});
