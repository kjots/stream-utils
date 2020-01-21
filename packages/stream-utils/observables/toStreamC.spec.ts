import 'mocha';

import util from 'util';

import { Writable } from 'stream';

import { EMPTY, Observer, of, throwError } from 'rxjs';

import { expect } from 'chai';

import { toStreamC } from './toStreamC';

import WritableStream = NodeJS.WritableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // Observer => WritableStream
  describe('toStreamC()', () => {
    context('when a value is pushed to the returned observer source', () => {
      it('should push the value to the provided writable stream sink', async () => {
        const values: Array<string> = [];

        // Given
        const sink: WritableStream = new Writable({
          objectMode: true,

          write(this: Writable, value: string, encoding: string, callback: () => void) {
            values.push(value);

            callback();
          }
        });

        // When
        const source: Observer<string> = toStreamC<string>(sink);

        of('Test Value 1', 'Test Value 2', 'Test Value 3').subscribe(source);

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when an error is pushed to the returned observer source', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should push the error to the provided writable stream sink', async () => {
        let error: any;

        // Given
        const sink: WritableStream = new Writable({ objectMode: true });

        sink.on('error', err => error = err);

        // When
        const source: Observer<never> = toStreamC<never>(sink);

        throwError(TEST_ERROR).subscribe(source);

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the returned observer source is completed', () => {
      it('should end the provided writable stream sink', async () => {
        let ended: boolean = false;

        // Given
        const sink: WritableStream = new Writable({ objectMode: true });

        sink.on('finish', () => ended = true);

        // When
        const source: Observer<never> = toStreamC<never>(sink);

        EMPTY.subscribe(source);

        // Then
        await timeout(0);

        expect(ended).to.equal(true);
      });
    });
  });
});
