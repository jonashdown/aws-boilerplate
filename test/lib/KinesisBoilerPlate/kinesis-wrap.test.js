const chai = require('chai');
const rewire = require('rewire');
const expect = chai.expect;

const kinesisWrap = rewire('../../../lib/KinesisBoilerPlate/kinesis-wrap');

describe('kinesisWrap()', function () {
  const MockNanoid = () => 'AfiMjILzIWPGpkw9ivDoR';
  const reverts = [];
  beforeEach(function () {
    reverts.push(kinesisWrap.__set__('nanoid', MockNanoid));
  });

  afterEach(function () {
    reverts.forEach((revert) => {
      revert();
    });
  });

  it('Wraps data as a kinesis object', function () {
    const theData = {
      a: 'test',
      b: true,
      c: 2
    };

    const result = kinesisWrap(theData);

    expect(result).to.deep.equal({
      PartitionKey: 'AfiMjILzIWPGpkw9ivDoR',
      Data: '{"a":"test","b":true,"c":2}'
    });
  });
});
