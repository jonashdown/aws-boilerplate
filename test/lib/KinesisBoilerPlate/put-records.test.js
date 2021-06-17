const chai = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const putRecordsGenerator = rewire(
  `../../../lib/KinesisBoilerPlate/put-records.js`
);

let reverts = [];

const mockKinesis = {
  putRecords: sinon.stub()
};

const MockKinesis = sinon.stub().returns(mockKinesis);

const mockLogger = {
  log: sinon.stub(),
  error: sinon.stub()
};

describe('putRecords', () => {
  beforeEach(() => {});

  afterEach(() => {
    reverts.forEach((revert) => {
      revert();
    });
  });

  it('does not call the kinesis client if given an empty array', async () => {
    reverts.push(putRecordsGenerator.__set__('KinesisClient', MockKinesis));
    const putRecords = putRecordsGenerator('Testing', mockLogger);
    await putRecords([]);
    return expect(mockKinesis.putRecords).to.not.be.called;
  });

  it('returns ok when there are no records to retry', async () => {
    const mockRecords = [
      {
        Key: 'one'
      },
      {
        Key: 'two'
      },
      {
        Key: 'three'
      }
    ];
    const mockResponse = {
      Records: [
        {
          Key: 'two'
        },
        {
          Key: 'three'
        }
      ]
    };

    const mockPutRecords = sinon.stub().returns(mockResponse);
    const mockKinesis = {
      putRecords: mockPutRecords
    };
    const MockKinesis = sinon.stub().returns(mockKinesis);
    reverts.push(putRecordsGenerator.__set__('KinesisClient', MockKinesis));

    const putRecords = putRecordsGenerator('Testing', mockLogger);

    const result = await putRecords(mockRecords);

    expect(mockKinesis.putRecords).to.be.calledWith({
      Records: mockRecords,
      StreamName: 'Testing'
    });
    expect(result).to.equal('ok');
  });

  it('calls putRecords with the records to retry when some are unsuccessful', async () => {
    const mockRecords = [
      {
        Key: 'one'
      },
      {
        Key: 'two'
      },
      {
        Key: 'three'
      }
    ];

    const mockResponse = {
      Records: [
        {
          Key: 'two'
        },
        {
          Key: 'three'
        }
      ]
    };

    const mockResponseWithErrors = {
      Records: [
        {
          Key: 'one'
        },
        {
          Key: 'two',
          ErrorCode: 404,
          ErrorMessage: 'Does not exist'
        },
        {
          Key: 'three',
          ErrorCode: 404,
          ErrorMessage: 'Does not exist'
        }
      ]
    };

    const mockPutRecords = sinon.stub();
    mockPutRecords.onCall(0).returns(mockResponseWithErrors);
    mockPutRecords.onCall(1).returns(mockResponse);
    const mockKinesis = {
      putRecords: mockPutRecords
    };
    const MockKinesis = sinon.stub().returns(mockKinesis);
    reverts.push(putRecordsGenerator.__set__('KinesisClient', MockKinesis));

    const putRecords = putRecordsGenerator('Testing', mockLogger);

    await putRecords(mockRecords);

    expect(mockKinesis.putRecords).to.be.calledWith({
      Records: mockRecords,
      StreamName: 'Testing'
    });
    expect(mockKinesis.putRecords).to.be.calledWith({
      Records: mockRecords.slice(1),
      StreamName: 'Testing'
    });
  });
});
