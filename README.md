xo-beaver-component
===================

A ui logging component for Hermes

Overview
---------------------

This module was written to support logging from browser for checkout angular app.

## Current support:

1. Registers these objects `$Logger`, `$logLevel`, `$LoggerApi` under `beaver` module. So if you add `beaver`
module as angular dependency then, you can access these.

2. `$logger` provides interface:

    $logger.error('event_name', {
        payload_prop: 'payload value'
    })


## Log Flushing:

`$logger.flush()` flushes data to api server

    1. Every 10sec.
    2. window.onbeforeunload

It makes a POST on the following api end point for now: `{baseUrl}/api/log`

