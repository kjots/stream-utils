import 'mocha';

import util from 'util';

import { EMPTY, Observable, of, throwError } from 'rxjs';

import { expect } from 'chai';

import { toStreamB } from './toStreamB';

import ReadableStream = NodeJS.ReadableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // Observable => ReadableStream
  describe('toStreamB()', () => {
    context('when the provided observable source emits a value', () => {
      it('should cause the returned readable stream sink to emit the value', async () => {
        const values: Array<string> = [];

        // Given
        const source: Observable<string> = of('Test Value 1', 'Test Value 2', 'Test Value 3');

        // When
        const sink: ReadableStream = toStreamB<string>(source);

        sink.on('data', value => values.push(value));

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when the provided observable source emits an error', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should cause the returned readable stream sink to emit the error', async () => {
        let error: any;

        // Given
        const source: Observable<never> = throwError(TEST_ERROR);

        // When
        const sink: ReadableStream = toStreamB<never>(source);

        sink.on('error', err => error = err).resume();

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the provided observable source completes', () => {
      it('should cause the returned readable stream sink to end', async () => {
        let ended: boolean = false;

        // Given
        const source: Observable<never> = EMPTY;

        // When
        const sink: ReadableStream = toStreamB<never>(source);

        sink.on('end', () => ended = true).resume();

        // Then
        await timeout(0);

        expect(ended).to.equal(true);
      });
    });
  });
});
