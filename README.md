xo-beaver-component
===================

A ui logging component for Hermes

Overview
---------------------

This module was written to support logging from browser for checkout angular app.

## Current support:

1. Registers these objects `$LogData`, `$logLevel`, `$logCache` under `logger` module. So if you add `logger`
module as angular dependency then, you can access these.
2. `$logCache` provides a interface to add `$LogData` instance.


    $logCache.push(new $LogData())

## Log Flushing:

`logCache` flushes data to api server

    1. Every 10sec.
    2. window.onbeforeunload

It makes a POST on the following api end point for now: `webapps/helios/api/log`

