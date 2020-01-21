import 'mocha';

import { Readable } from 'stream';

import util from 'util';

import { expect } from 'chai';

import { streamObservable } from '.';

const timeout = util.promisify(setTimeout);

const valueStream = (...values: Array<any>) => new Readable({
  objectMode: true,

  read(this: Readable) {
    while (values.length !== 0) {
      if (!this.push(values.shift())) {
        return;
      }
    }

    this.push(null);
  }
});

const errorStream = (error: Error) => new Readable({
  objectMode: true,

  read(this: Readable) {
    this.emit('error', error);
  }
});

const emptyStream = () => new Readable({
  objectMode: true,

  read(this: Readable) {
    this.push(null);
  }
});

context('@kjots/stream-observable', () => {
  describe('streamObservable()', () => {
    context('when the provided stream emits a value', () => {
      it('should cause the returned observable to emit the value', async () => {
        // Given
        const testStream = valueStream('Test Value');

        // When
        let result; streamObservable<string>(testStream).subscribe(value => result = value);

        await timeout(0);

        // Then
        expect(result).to.equal('Test Value');
      });
    });

    context('when the provided stream emits an error', () => {
      it('should cause the returned observable to emit the error', async () => {
        // Given
        const testError = new Error('Test Error');
        const testStream = errorStream(testError);

        // When
        let result; streamObservable(testStream).subscribe({ error: value => result = value });

        await timeout(0);

        // Then
        expect(result).to.equal(testError);
      });
    });

    context('when the provided stream ends', () => {
      it('should cause the returned observable to complete', async () => {
        // Given
        const testStream = emptyStream();

        // When
        let complete = false; streamObservable<string>(testStream).subscribe({ complete: () => complete = true });

        await timeout(0);

        // Then
        expect(complete).to.equal(true);
      });
    });
  });
});
