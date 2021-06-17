const kinesisListenerGenerator = (params) => {
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
    const records = Records.map((record) =>
      JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString())
    );
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

module.exports = kinesisListenerGenerator;
