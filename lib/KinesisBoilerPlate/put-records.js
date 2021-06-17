const { KinesisClient } = require('@aws-sdk/client-kinesis');

let logger;
let StreamName;

const putRecords = async (inputRecords) => {
  const kinesisClient = new KinesisClient();

  if (!inputRecords.length) {
    return;
  }
  let currentIteration = 0;
  let toRetry = [];
  try {
    do {
      logger.log(`putting records to ${StreamName}`, {
        number: toRetry.length || inputRecords.length,
        currentIteration,
        StreamName
      });
      const response = await kinesisClient.putRecords({
        Records: toRetry.length ? toRetry : inputRecords,
        StreamName
      });
      const records = response.Records;
      toRetry = [];
      for (let i = 0; i < records.length; i += 1) {
        if (records[i].ErrorCode && records[i].ErrorMessage) {
          toRetry.push(inputRecords[i]);
        }
      }
      currentIteration += 1;
      setTimeout(() => {}, currentIteration * 100);
    } while (toRetry.length !== 0);
    logger.log(`wrote ${inputRecords.length} to ${StreamName}`);
    return 'ok';
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

const putRecordsGenerator = (stream, instantiatedLogger) => {
  StreamName = stream;
  logger = instantiatedLogger;

  return putRecords;
};

module.exports = putRecordsGenerator;
