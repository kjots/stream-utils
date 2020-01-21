import { Writable } from 'stream';

import { Observer } from 'rxjs';

import WritableStream = NodeJS.WritableStream;

// WritableStream => Observer
export function fromStreamC<T>(sink: Observer<T>): WritableStream {
  function write(value: T, encoding: string, callback: () => void) {
    sink.next(value);

    callback();
  }

  function final(callback: () => void) {
    sink.complete();

    callback();
  }

  const source = new Writable({ objectMode: true, write, final });

  source.on('error', error => sink.error(error));

  return source;
}
