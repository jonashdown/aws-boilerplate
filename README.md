# aws-boilerplate

Provides the following utilities:

## KinesisBoilerPlate
### `PutRecordsGenerator(streamName, instantiatedLogger)`
returns a function `putRecords(records)` that writes to the kinesis stream.

### `kinesisWrap(record)`
wraps an arbitary json blob in the format expected by kinesis.
### `kinesisListenerGenerator({dataHandler, exceptionHandler, finishHandler, logInstantiator})`
returns a `handler(event, context)` function for AWS lambda.
  - `async dataHandler(records, logger)` - handles business logic for the data
  - `async exceptionHandler(error, logger, records)`, - handles errors, `logger` is an instance of an instantiated logger, `records` is the data read from the stream.
  - `async finishHandler(logger, records)`, - called in the `finish` block. `logger` is an instance of an instantiated logger, `records` is the data read from the stream.
  - `logInstantiator` - returns an object that writes to standard logging streams

returns a `handler(event, context)` function for AWS lambdawhich base64 decodes and applies the defaultHandler to records coming from the event stream. Any exceptions are handled by the optional exceptionHandler. The finishHandler will always run if supplied. The logInstantiator function must be able to take `context.functionName` as its argument and return a logger that provides standard log streams. The logger is supplied as the second argument to defaultHandler & exceptionHandler, and the first argument for the finishHandler.

## DynamodbBoilerPlate
### `dynamodbListenerGenerator({dataHandler, exceptionHandler, finishHandler, logInstantiator})`
returns a `handler(event, context)` function for AWS lambda
  - `async dataHandler(records, logger)` - handles business logic for the data
  - `async exceptionHandler(error, logger, records)`, - handles errors. `logger` is an instance of an instantiated logger, `records` is the data read from the dynamodb event.
  - `async finishHandler(logger, records)`, - called in the `finish` block. `logger` is an instance of an instantiated logger, `records` is the data read from the dynamodb event.
  - `logInstantiator` - returns an object that writes to standard logging streams

returns a `handler(event, context)` function for AWS lambda, which unmarshalls and applies the defaultHandler to records coming from the event stream. Any exceptions are handled by the optional exceptionHandler. The finishHandler will always run if supplied. The logInstantiator function must be able to take `context.functionName` as its argument and return a logger that provides standard log streams. The logger is supplied as the second argument to defaultHandler & exceptionHandler, and the first argument for the finishHandler.
