const { nanoid } = require('nanoid');

const kinesisWrap = (record) => ({
  PartitionKey: nanoid(),
  Data: JSON.stringify(record)
});

module.exports = kinesisWrap;
