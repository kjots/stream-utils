import 'mocha';

import util from 'util';

import { Readable } from 'stream';

import { Observer } from 'rxjs';

import { expect } from 'chai';

import { fromStreamA } from './fromStreamA';

import ReadableStream = NodeJS.ReadableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // ReadableStream => Observer
  describe('fromStreamA()', () => {
    context('when the provided readable stream source emits a value', () => {
      it('should push the value to the provided observer sink', async () => {
        const values: Array<string> = [];

        // Given
        const source: ReadableStream = Readable.from([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
        const sink: Observer<string> = {
          next: value => values.push(value),
          error: () => {},
          complete: () => {}
        };

        // When
        fromStreamA<string>(source, sink);

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when the provided readable stream source emits an error', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should push the error to the provided observer sink', async () => {
        let error: any;

        // Given
        const source: ReadableStream = new Readable({
          objectMode: true,

          read(this: Readable) {
            this.emit('error', TEST_ERROR);
          }
        });

        const sink: Observer<string> = {
          next: () => {},
          error: err => error = err,
          complete: () => {}
        };

        // When
        fromStreamA<string>(source, sink);

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the provided readable stream source ends', () => {
      it('should complete the provided observer sink', async () => {
        let complete: boolean = false;

        // Given
        const source: ReadableStream = Readable.from([]);
        const sink: Observer<string> = {
          next: () => {},
          error: () => {},
          complete: () => complete = true
        };

        // When
        fromStreamA<string>(source, sink);

        // Then
        await timeout(0);

        expect(complete).to.equal(true);
      });
    });
  });
});
