/* @flow */

export const LOG_LEVEL = {
    DEBUG: ('debug' : 'debug'),
    INFO:  ('info' : 'info'),
    WARN:  ('warn' : 'warn'),
    ERROR: ('error' : 'error')
};

export const HTTP_HEADER = {
    ORIGIN:                             ('origin' : 'origin'),
    ACCESS_CONTROL_ALLOW_ORIGIN:        ('access-control-allow-origin' : 'access-control-allow-origin'),
    ACCESS_CONTROL_ALLOW_HEADERS:       ('access-control-allow-headers' : 'access-control-allow-headers'),
    ACCESS_CONTROL_ALLOW_METHODS:       ('access-control-allow-methods' : 'access-control-allow-methods'),
    ACCESS_CONTROL_ALLOW_CREDENTIALS:   ('access-control-allow-credentials' : 'access-control-allow-credentials'),
    ACCESS_CONTROL_REQUEST_HEADERS:     ('access-control-request-headers' : 'access-control-request-headers'),
    ACCESS_CONTROL_REQUEST_METHOD:      ('access-control-request-method' : 'access-control-request-method')
};

export const HTTP_METHOD = {
    GET:     ('get' : 'get'),
    POST:    ('post' : 'post'),
    OPTIONS: ('options' : 'options')
};

export const WILDCARD = '*';
