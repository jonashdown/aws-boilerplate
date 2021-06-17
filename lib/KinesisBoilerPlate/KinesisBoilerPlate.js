const kinesisWrap = require('./kinesis-wrap');
const putRecordsGenerator = require('./put-records');
const kinesisListenerGenerator = require('./kinesis-listener');

module.exports = {
  kinesisWrap,
  putRecordsGenerator,
  kinesisListenerGenerator
};
