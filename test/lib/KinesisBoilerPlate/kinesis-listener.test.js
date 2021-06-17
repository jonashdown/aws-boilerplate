const chai = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const kinesisListenerGenerator = rewire(
  '../../../lib/KinesisBoilerPlate/kinesis-listener'
);

describe('kinesisListenerGenerator()', function () {
  it('handler() calls the supplied data handler', async function () {
    const dataHandler = sinon.stub();
    const data = { something: 'intersting' };
    const Records = [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(data), 'utf-8')
        }
      }
    ];

    const event = { Records };

    const handler = kinesisListenerGenerator({ dataHandler });

    await handler(event);

    return expect(dataHandler).to.be.calledOnceWith([
      { something: 'intersting' }
    ]);
  });

  it('handler() handles errors', async function () {
    const dataHandler = sinon.stub();
    dataHandler.throws(new Error('Something broke'));
    const data = { something: 'intersting' };
    const Records = [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(data), 'utf-8')
        }
      }
    ];

    const event = { Records };

    const handler = kinesisListenerGenerator({ dataHandler });
    try {
      await handler(event);
    } catch (err) {
      return expect(err.message).to.equal('Something broke');
    }
  });

  it('handler() calls the supplied exceptionHandler on error', async function () {
    const error = new Error('2020: Reboot and reset to 2015');
    const dataHandler = sinon.stub();
    dataHandler.throws(error);

    const exceptionHandler = sinon.stub();

    const data = { something: 'else' };
    const Records = [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(data), 'utf-8')
        }
      }
    ];

    const event = { Records };

    const handler = kinesisListenerGenerator({ dataHandler, exceptionHandler });
    await handler(event);

    return expect(exceptionHandler).to.be.calledOnceWith(error);
  });

  it('handler() does not call the supplied exceptionHandler when no error occurs', async function () {
    const dataHandler = sinon.stub();

    const exceptionHandler = sinon.stub();

    const data = { something: 'else' };
    const Records = [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(data), 'utf-8')
        }
      }
    ];

    const event = { Records };

    const handler = kinesisListenerGenerator({ dataHandler, exceptionHandler });
    await handler(event);

    return expect(exceptionHandler).to.not.be.called;
  });

  it('handler() calls the supplied finishHandler', async function () {
    const dataHandler = sinon.stub();

    const exceptionHandler = sinon.stub();
    const finishHandler = sinon.stub();

    const data = { something: 'blue' };
    const Records = [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(data), 'utf-8')
        }
      }
    ];

    const event = { Records };

    const handler = kinesisListenerGenerator({
      dataHandler,
      exceptionHandler,
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

    const data = { something: 'green' };
    const Records = [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(data), 'utf-8')
        }
      }
    ];

    const event = { Records };

    const handler = kinesisListenerGenerator({
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

    const exceptionHandler = sinon.stub();
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

    const handler = kinesisListenerGenerator({
      dataHandler,
      exceptionHandler,
      finishHandler,
      loggerGenerator
    });
    handler(event).then(function () {
      expect(error).to.be.calledWith(err);
      expect(log).to.be.calledWith('done');
    });
  });
});
