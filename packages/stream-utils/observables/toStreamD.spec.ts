import 'mocha';

import util from 'util';

import { EMPTY, Observer, of, throwError } from 'rxjs';

import { expect } from 'chai';

import { toStreamD } from './toStreamD';

import ReadableStream = NodeJS.ReadableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // Observer => ReadableStream
  describe('toStreamD()', () => {
    context('when a value is pushed to the returned observer source', () => {
      it('should cause the returned readable stream sink to emit the value', async () => {
        const values: Array<string> = [];

        // Given

        // When
        const [ source, sink ]: [ Observer<string>, ReadableStream ] = toStreamD<string>();

        sink.on('data', value => values.push(value));

        of('Test Value 1', 'Test Value 2', 'Test Value 3').subscribe(source);

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when an error is pushed to the returned observer source', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should cause the returned readable stream sink to emit the error', async () => {
        let error: any;

        // Given

        // When
        const [ source, sink ]: [ Observer<never>, ReadableStream ] = toStreamD<never>();

        sink.on('error', err => error = err).resume();

        throwError(TEST_ERROR).subscribe(source);

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the returned observer source is completed', () => {
      it('should cause the returned readable stream sink to end', async () => {
        let ended: boolean = false;

        // Given

        // When
        const [ source, sink ]: [ Observer<never>, ReadableStream ] = toStreamD<never>();

        sink.on('end', () => ended = true).resume();

        EMPTY.subscribe(source);

        // Then
        await timeout(0);

        expect(ended).to.equal(true);
      });
    });
  });
});
