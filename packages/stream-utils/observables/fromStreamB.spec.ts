import 'mocha';

import util from 'util';

import { Readable } from 'stream';

import { Observable } from 'rxjs';

import { expect } from 'chai';

import { fromStreamB } from './fromStreamB';

import ReadableStream = NodeJS.ReadableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // ReadableStream => Observable
  describe('fromStreamB()', () => {
    context('when the provided readable stream source emits a value', () => {
      it('should cause the returned observable sink to emit the value', async () => {
        const values: Array<string> = [];

        // Given
        const source: ReadableStream = Readable.from([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);

        // When
        const sink: Observable<string> = fromStreamB<string>(source);

        sink.subscribe({ next: value => values.push(value) });

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when the provided readable stream source emits an error', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should cause the returned observable sink to emit the error', async () => {
        let error: any;

        // Given
        const source: ReadableStream = new Readable({
          objectMode: true,

          read(this: Readable) {
            this.emit('error', TEST_ERROR);
          }
        });

        // When
        const sink: Observable<never> = fromStreamB<never>(source);

        sink.subscribe({ error: err => error = err });

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the provided readable stream source ends', () => {
      it('should cause the returned observable sink to complete', async () => {
        let complete: boolean = false;

        // Given
        const source: ReadableStream = Readable.from([]);

        // When
        const sink: Observable<never> = fromStreamB<never>(source);

        sink.subscribe({ complete: () => complete = true });

        // Then
        await timeout(0);

        expect(complete).to.equal(true);
      });
    });
  });
});
