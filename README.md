beaver-client
=============

Front-end log buffer, which periodically (or on demand) flushes logs to the server side.

Overview
---------------------

### `$logger.info(<event>, <payload>)`;

Queues a log. Options are `debug`, `info`, `warn`, `error`.

For example:

`$logger.error('something_went_wrong', { error: err.toString() })`

### `$logger.flush()`;

Flushes the logs to the server side. Best done on page transitions, but will happen automatically after a delay.
