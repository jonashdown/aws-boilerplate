const chai = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const { imageBuilder } = require('../../fixtures/dynamo-builder');
chai.use(sinonChai);

const dynamodbListenerGenerator = rewire(
  '../../../lib/DynamodbBoilerPlate/dynamodb-listener'
);

describe('dynamodbListenerGenerator()', function () {
  it('handler() calls the supplied data handler with NewImage data', async function () {
    const dataHandler = sinon.stub();
    const dynamodb = {
      NewImage: imageBuilder()
        .withId('97fabad7-f1e6-4a01-8ef7-ac308a380684')
        .withKeyValue('a', 1)
        .withKeyValue('b', 'two')
        .getData(),
      OldImage: imageBuilder()
        .withId('97fabad7-f1e6-4a01-8ef7-ac308a380684')
        .withKeyValue('a', 2)
        .withKeyValue('b', 'one')
        .getData()
    };

    const expected = {
      id: '97fabad7-f1e6-4a01-8ef7-ac308a380684',
      a: 1,
      b: 'two'
    };

    const Records = [
      {
        dynamodb
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({ dataHandler });

    await handler(event);

    const data = { something: 'intersting' };
    return expect(dataHandler).to.be.calledOnceWith([expected]);
  });

  it('handler() calls the supplied data handler with OldImage data', async function () {
    const dataHandler = sinon.stub();
    const dynamodb = {
      OldImage: imageBuilder()
        .withId('97fabad7-f1e6-4a01-8ef7-ac308a380684')
        .withKeyValue('a', 2)
        .withKeyValue('b', 'one')
        .getData()
    };

    const expected = {
      id: '97fabad7-f1e6-4a01-8ef7-ac308a380684',
      a: 2,
      b: 'one'
    };

    const Records = [
      {
        dynamodb
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({ dataHandler });

    await handler(event);

    return expect(dataHandler).to.be.calledOnceWith([expected]);
  });

  it('handler() handles general errors', async function () {
    const dataHandler = sinon.stub();
    dataHandler.throws(new Error('Something bad happened!'));
    const dynamodb = {
      OldImage: imageBuilder()
        .withId('97fabad7-f1e6-4a01-8ef7-ac308a380684')
        .withKeyValue('a', 2)
        .withKeyValue('b', 'one')
        .getData()
    };

    const Records = [
      {
        dynamodb
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({ dataHandler });
    try {
      await handler(event);
    } catch (err) {
      return expect(err.message).to.equal('Something bad happened!');
    }
  });

  it('handler() calls the supplied exceptionHandler on error', async function () {
    const error = new Error('2020: MAGA Unicorn');
    const dataHandler = sinon.stub();
    dataHandler.throws(error);

    const exceptionHandler = sinon.stub();

    const dynamodb = {
      OldImage: imageBuilder()
        .withId('97fabad7-f1e6-4a01-8ef7-ac308a380684')
        .withKeyValue('a', 2)
        .withKeyValue('b', 'one')
        .getData()
    };

    const Records = [
      {
        dynamodb
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({
      dataHandler,
      exceptionHandler
    });
    await handler(event);

    return expect(exceptionHandler).to.be.calledOnceWith(error);
  });

  it('handler() does not call the supplied exceptionHandler when no error occurs', async function () {
    const dataHandler = sinon.stub();

    const exceptionHandler = sinon.stub();
    // exceptionHandler.resolves(true)

    const dynamodb = {
      OldImage: imageBuilder()
        .withId('97fabad7-f1e6-4a01-8ef7-ac308a380684')
        .withKeyValue('a', 2)
        .withKeyValue('b', 'one')
        .getData()
    };

    const Records = [
      {
        dynamodb
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({
      dataHandler,
      exceptionHandler
    });
    await handler(event);

    return expect(exceptionHandler).to.not.be.called;
  });

  it('handler() calls the supplied finishHandler', async function () {
    const dataHandler = sinon.stub();

    const errorHandler = sinon.stub();
    const finishHandler = sinon.stub();

    const dynamodb = {
      OldImage: imageBuilder()
        .withId('97fabad7-f1e6-4a01-8ef7-ac308a380684')
        .withKeyValue('a', 2)
        .withKeyValue('b', 'one')
        .getData()
    };

    const Records = [
      {
        dynamodb
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({
      dataHandler,
      errorHandler,
      finishHandler
    });
    await handler(event);
    return expect(finishHandler).to.have.been.called;
  });

  it('handler() calls the supplied finishHandler on error', async function () {
    const dataHandler = sinon.stub();
    dataHandler.throws(new Error('2015: Skip to 2021'));

    const exceptionHandler = sinon.stub();
    const finishHandler = sinon.stub();

    const dynamodb = {
      OldImage: imageBuilder()
        .withId('d826f9a9-2570-45f3-9b81-17ad5736c2d1')
        .withKeyValue('a', 'two')
        .withKeyValue('b', 'one')
        .getData()
    };

    const Records = [
      {
        dynamodb
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({
      dataHandler,
      exceptionHandler,
      finishHandler
    });
    await handler(event);

    return expect(finishHandler).to.have.been.called;
  });

  it('handler() instantiates and calls a logger', function () {
    const log = sinon.stub();
    const error = sinon.stub();
    const err = new Error('2015: Skip to 2021');

    const loggerGenerator = () => {
      log, error;
    };

    const dataHandler = sinon.stub();
    dataHandler.throws(err);

    const errorHandler = sinon.stub();
    const finishHandler = sinon.stub();

    const data = { something: 'red' };
    const Records = [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(data), 'utf-8')
        }
      }
    ];

    const event = { Records };

    const handler = dynamodbListenerGenerator({
      dataHandler,
      errorHandler,
      finishHandler,
      loggerGenerator
    });
    handler(event).then(function () {
      expect(error).to.be.calledWith(err);
      expect(log).to.be.calledWith('done');
    });
  });
});
