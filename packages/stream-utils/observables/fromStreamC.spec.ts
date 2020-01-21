import 'mocha';

import util from 'util';

import { Readable } from 'stream';

import { Observer } from 'rxjs';

import { expect } from 'chai';

import { fromStreamC } from './fromStreamC';

import WritableStream = NodeJS.WritableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // WritableStream => Observer
  describe('fromStreamC()', () => {
    context('when a value is pushed to the returned writable stream source', () => {
      it('should push the value to the provided observer sink', async () => {
        const values: Array<string> = [];

        // Given
        const sink: Observer<string> = {
          next: value => values.push(value),
          error: () => {},
          complete: () => {}
        };

        // When
        const source: WritableStream = fromStreamC<string>(sink);

        Readable.from([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]).pipe(source);

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when an error is pushed to the returned writable stream source', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should push the error to the provided observer sink', async () => {
        let error: any;

        // Given
        const sink: Observer<string> = {
          next: () => {},
          error: err => error = err,
          complete: () => {}
        };

        // When
        const source: WritableStream = fromStreamC<never>(sink);

        source.emit('error', TEST_ERROR);

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the returned writable stream source is ended', () => {
      it('should complete the provided observer sink', async () => {
        let complete: boolean = false;

        // Given
        const sink: Observer<string> = {
          next: () => {},
          error: () => {},
          complete: () => complete = true
        };

        // When
        const source: WritableStream = fromStreamC<never>(sink);

        Readable.from([]).pipe(source);

        // Then
        await timeout(0);

        expect(complete).to.equal(true);
      });
    });
  });
});
