/* @flow */
/* eslint no-console: 0 */

import url from 'url';

import { LOG_LEVEL, HTTP_HEADER, HTTP_METHOD, WILDCARD } from './constants';

type ExpressRequest = express$Request; // eslint-disable-line no-undef
type ExpressResponse = express$Response; // eslint-disable-line no-undef

type Logger = {|
    log : (req : ExpressRequest, level : $Values<typeof LOG_LEVEL>, name : string, payload : { [string] : string }) => void,
    track : (req : ExpressRequest, payload : { [string] : string }) => void,
    meta : (req : ExpressRequest, meta : { [string] : string }) => void
|};

type Event = {|
    event : string,
    payload : { [string] : string },
    level : $Values<typeof LOG_LEVEL>
|};

type Tracking = { [string] : string };

type Meta = { [string] : string };

export const defaultLogger : Logger = {
    log(req, level, name, payload) {
        const date = payload.timestamp
            ? new Date(payload.timestamp).toString()
            : new Date().toString();

        const str = [
            name,
            '\t[ ',
            date,
            ' ]\n',
            Object.keys(payload)
                .map((key) => {
                    return `\t${  key  }: ${  payload[key] }`;
                })
                .join('\n'),
            '\n'
        ].join('');

        console[level](str);
    },

    track(req, tracking) {
        console.log(
            '[track]\n',
            Object.keys(tracking)
                .map((key) => {
                    return `\t${  key  }: ${  tracking[key] }`;
                })
                .join('\n'),
            '\n'
        );
    },

    meta(req, meta) {
        console.log(
            '[meta]\n',
            Object.keys(meta)
                .map((key) => {
                    return `\t${  key  }: ${  meta[key] }`;
                })
                .join('\n'),
            '\n'
        );
    }
};

export function log(req : ExpressRequest, logger : Logger, logs : {| events : $ReadOnlyArray<Event>, tracking? : $ReadOnlyArray<Tracking>, meta? : Meta |}) {

    const events   = logs.events   || [];
    const tracking = logs.tracking || [];
    const meta     = logs.meta     || {};

    if (logger.log) {
        events.forEach((event) => {
            if (!event.event) {
                return;
            }

            const name = event.event.replace(/_*[^a-zA-Z0-9_]+_*/g, '_');
            const level = event.level || LOG_LEVEL.INFO;
            const payload = event.payload || {};

            return logger.log(req, level, name, payload);
        });
    }

    if (logger.meta) {
        logger.meta(req, meta);
    }

    if (logger.track) {
        tracking.forEach(track => {
            logger.track(req, track);
        });
    }
}

type Query = {
    event : string,
    level? : $Values<typeof LOG_LEVEL>,
    [string] : string
};

type Body = {|
    events : $ReadOnlyArray<Event>,
    tracking? : $ReadOnlyArray<Tracking>,
    meta : Meta
|};

export function handleRequest(req : ExpressRequest, logger : Logger) {

    // $FlowFixMe
    const method : $Values<typeof HTTP_METHOD> = req.method || HTTP_METHOD.GET;

    // $FlowFixMe
    const query : Query = req.query;

    // $FlowFixMe
    const body : Body = req.body || {};

    if (method.toLowerCase() === 'post') {
        const { events, tracking, meta } = body;
        log(req, logger, { events, tracking, meta });
    } else {
        const { event, level = LOG_LEVEL.INFO, ...payload } = query;

        log(req, logger, {
            events: [
                {
                    level,
                    event,
                    payload
                }
            ]
        });
    }
}

type ExpressEndpointOptions = {|
    uri? : string,
    logger? : Logger,
    enableCors? : boolean
|};

function sendCorsHeaders(req : ExpressRequest, res : ExpressResponse) {
    const origin = req.get(HTTP_HEADER.ORIGIN);

    if (origin) {
        const parsedUrl = url.parse(origin) || {};

        if (!parsedUrl.protocol || !parsedUrl.host) {
            res.header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_ORIGIN, WILDCARD);
        } else {
            res.header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_ORIGIN, `${ parsedUrl.protocol }//${ parsedUrl.host }`);
        }

    } else {
        res.header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_ORIGIN, WILDCARD);
    }

    const corsRequestHeaders = req.headers[HTTP_HEADER.ACCESS_CONTROL_REQUEST_HEADERS];

    if (corsRequestHeaders) {
        res.header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_HEADERS, corsRequestHeaders);
    }

    const corsRequestMethod = req.headers[HTTP_HEADER.ACCESS_CONTROL_REQUEST_METHOD];

    if (corsRequestMethod) {
        res.header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_METHODS, corsRequestMethod);
    }

    res.header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_CREDENTIALS, 'true');
}

export function expressEndpoint({ uri = '/', logger = defaultLogger, enableCors = false } : ExpressEndpointOptions = {}) : mixed {

    // $FlowFixMe
    const app = require('express')();

    app.on('mount', parent => {
        // $FlowFixMe
        app.settings = Object.create(parent.settings);
        // $FlowFixMe
        app.kraken = parent.kraken || parent.config;
    });

    app.all(uri, (req : ExpressRequest, res : ExpressResponse) => {
        if (enableCors) {
            sendCorsHeaders(req, res);
        }

        if (req.method.toLowerCase() === HTTP_METHOD.OPTIONS) {
            return res.status(200)
                .header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_CREDENTIALS, 'true')
                .send();
        }

        try {
            handleRequest(req, logger);
            res.status(200)
                .header(HTTP_HEADER.ACCESS_CONTROL_ALLOW_CREDENTIALS, 'true')
                .json({});
        } catch (err) {
            console.error(err.stack || err.toString());
            res.status(500)
                .header(HTTP_HEADER.CONTENT_TYPE, 'application/json')
                .json({});
        }
    });

    return app;
}
