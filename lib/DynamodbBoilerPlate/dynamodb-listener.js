const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamodbListenerGenerator = (params) => {
  const {
    dataHandler,
    exceptionHandler,
    finishHandler,
    logInstantiator
  } = params;
  const handler = async (event, context) => {
    let logger;
    if (typeof logInstantiator === 'function') {
      logger = logInstantiator(context.functionName);
    } else {
      logger = console;
    }

    const { Records } = event;
    const records = Records.map((record) => {
      if (record.dynamodb && record.dynamodb.NewImage) {
        return unmarshall(record.dynamodb.NewImage);
      } else {
        return unmarshall(record.dynamodb.OldImage);
      }
    });

    try {
      await dataHandler(records, logger);
    } catch (err) {
      if (typeof exceptionHandler === 'function') {
        await exceptionHandler(err, logger, records);
      } else {
        logger.error(err);
        throw err;
      }
    } finally {
      if (typeof finishHandler === 'function') {
        await finishHandler(logger, records);
      } else {
        logger.log('done');
      }
    }
  };

  return handler;
};

module.exports = dynamodbListenerGenerator;
