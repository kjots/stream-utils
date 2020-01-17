import 'mocha';

import { Transform, TransformCallback } from 'stream';

import util from 'util';

import { EMPTY, of, throwError } from 'rxjs';

import { expect } from 'chai';

import { observableStream, through } from '.';

const timeout = util.promisify(setTimeout);

const transformStream = (transform: (chunk: any, encoding: string, callback: TransformCallback) => void) => new Transform({
  objectMode: true,

  transform
});

context('@kjots/observable-stream', () => {
  describe('observableStream()', () => {
    context('when the provided observable emits a value', () => {
      it('should cause the returned stream to emit the value', async () => {
        // Given
        const testObservable = of('Test Value');

        // When
        let result; observableStream(testObservable).on('data', value => result = value);

        await timeout(0);

        // Then
        expect(result).to.equal('Test Value');
      });
    });

    context('when the provided observable emits an error', () => {
      it('should cause the returned stream to emit the error', async () => {
        // Given
        const testError = new Error('Test Error');
        const testObservable = throwError(testError);

        // When
        let result; observableStream(testObservable).on('error', value => result = value).resume();

        await timeout(0);

        // Then
        expect(result).to.equal(testError);
      });
    });

    context('when the provided observable completes', () => {
      it('should cause the returned stream to end', async () => {
        // Given
        const testObservable = EMPTY;

        // When
        let ended = false; observableStream(testObservable).on('end', () => ended = true).resume();

        await timeout(0);

        // Then
        expect(ended).to.equal(true);
      });
    });
  });

  describe('through()', () => {
    it('should pipe the provided observable through the provided transforms', async () => {
      // Given
      const testObservable = of('Test Value 1', 'Test Value 2', 'Test Value 3');

      const testTransform = (x: string) => transformStream((chunk, encoding, callback) => callback(undefined, `${ chunk }.${ x }`));

      // When
      const results: Array<string> = [];

      testObservable
        .pipe(
          through<string>(
            testTransform('A'),
            testTransform('B'),
            testTransform('C')
          )
        )
        .subscribe(value => results.push(value));

      await timeout(0);

      // Then
      expect(results).to.eql([ 'Test Value 1.A.B.C', 'Test Value 2.A.B.C', 'Test Value 3.A.B.C' ]);
    });

    context('when the provided observable emits an error', () => {
      it('should cause the returned observable to emit the error', async () => {
        // Given
        const testError = new Error('Test Error');
        const testObservable = throwError(testError);

        const testTransform = (x: string) => transformStream((chunk, encoding, callback) => callback(undefined, `${ chunk }.${ x }`));

        // When
        let error;

        testObservable
          .pipe(
            through<string>(
              testTransform('A'),
              testTransform('B'),
              testTransform('C')
            )
          )
          .subscribe({ error: e => error = e });

        await timeout(0);

        // Then
        expect(error).to.equal(testError);
      });
    });

    context('when the provided observable completes', () => {
      it('should cause the returned observable to complete', async () => {
        // Given
        const testObservable = EMPTY;

        const testTransform = (x: string) => transformStream((chunk, encoding, callback) => callback(undefined, `${ chunk }.${ x }`));

        // When
        let complete = false;

        testObservable
          .pipe(
            through<string>(
              testTransform('A'),
              testTransform('B'),
              testTransform('C')
            )
          )
          .subscribe({ complete: () => complete = true });

        await timeout(0);

        // Then
        expect(complete).to.equal(true);
      });
    });

    context('when a provided transform emits an error', () => {
      it('should cause the returned observable to emit the error', async () => {
        // Given
        const testError = new Error('Test Error');
        const testObservable = of('Test Value 1', 'Test Value 2', 'Test Value 3');

        const testTransform = (x: string) => transformStream((chunk, encoding, callback) => x === 'B' ? callback(testError) : callback(undefined, `${ chunk }.${ x }`));

        // When
        let error: any;

        testObservable
          .pipe(
            through<string>(
              testTransform('A'),
              testTransform('B'),
              testTransform('C')
            )
          )
          .subscribe({ error: e => error = e });

        await timeout(0);

        // Then
        expect(error).to.equal(testError);
      });
    });
  });
});
