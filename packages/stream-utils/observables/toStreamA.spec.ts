import 'mocha';

import util from 'util';

import { Writable } from 'stream';

import { EMPTY, Observable, of, throwError } from 'rxjs';

import { expect } from 'chai';

import { toStreamA } from './toStreamA';

import WritableStream = NodeJS.WritableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // Observable => WritableStream
  describe('toStreamA()', () => {
    context('when the provided observable source emits a value', () => {
      it('should push the value to the provided writable stream sink', async () => {
        const values: Array<string> = [];

        // Given
        const source: Observable<string> = of('Test Value 1', 'Test Value 2', 'Test Value 3');
        const sink: WritableStream = new Writable({
          objectMode: true,

          write(this: Writable, value: string, encoding: string, callback: () => void) {
            values.push(value);

            callback();
          }
        });

        // When
        toStreamA<string>(source, sink);

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when the provided observable source emits an error', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should push the error to the provided writable stream sink', async () => {
        let error: any;

        // Given
        const source: Observable<never> = throwError(TEST_ERROR);
        const sink: WritableStream = new Writable({ objectMode: true });

        sink.on('error', err => error = err);

        // When
        toStreamA<never>(source, sink);

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the provided observable source completes', () => {
      it('should end the provided writable stream sink', async () => {
        let ended: boolean = false;

        // Given
        const source: Observable<never> = EMPTY;
        const sink: WritableStream = new Writable({ objectMode: true });

        sink.on('finish', () => ended = true);

        // When
        toStreamA<never>(source, sink);

        // Then
        await timeout(0);

        expect(ended).to.equal(true);
      });
    });
  });
});
