import 'mocha';

import util from 'util';

import { Readable } from 'stream';

import { Observable } from 'rxjs';

import { expect } from 'chai';

import { fromStreamD } from './fromStreamD';

import WritableStream = NodeJS.WritableStream;

const timeout = util.promisify(setTimeout);

context('@kjots/stream-utils/observables', () => {
  // WritableStream => Observable
  describe('fromStreamD()', () => {
    context('when a value is pushed to the returned writable stream source', () => {
      it('should cause the returned observable sink to emit the value', async () => {
        const values: Array<string> = [];

        // Given

        // When
        const [ source, sink ]: [ WritableStream, Observable<string> ] = fromStreamD<string>();

        sink.subscribe({ next: value => values.push(value) });

        Readable.from([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]).pipe(source);

        // Then
        await timeout(0);

        expect(values).to.eql([ 'Test Value 1', 'Test Value 2', 'Test Value 3' ]);
      });
    });

    context('when an error is pushed to the returned writable stream source', () => {
      const TEST_ERROR = new Error('Test Error');

      it('should cause the returned observable sink to emit the error', async () => {
        let error: any;

        // Given

        // When
        const [ source, sink ]: [ WritableStream, Observable<never> ] = fromStreamD<never>();

        sink.subscribe({ error: err => error = err });

        source.emit('error', TEST_ERROR);

        // Then
        await timeout(0);

        expect(error).to.equal(TEST_ERROR);
      });
    });

    context('when the returned writable stream source is ended', () => {
      it('should cause the returned observable sink to complete', async () => {
        let complete: boolean = false;

        // Given

        // When
        const [ source, sink ]: [ WritableStream, Observable<never> ] = fromStreamD<never>();

        sink.subscribe({ complete: () => complete = true });

        Readable.from([]).pipe(source);

        // Then
        await timeout(0);

        expect(complete).to.equal(true);
      });
    });
  });
});
