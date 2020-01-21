import { Readable } from 'stream';

import { Observer } from 'rxjs';

import ReadableStream = NodeJS.ReadableStream;

// Observer => ReadableStream
export function toStreamD<T>(): [ Observer<T>, ReadableStream ] {
  const values: Array<T> = [];
  let error: any = null;
  let complete: boolean = false;

  let stopped = false;

  function flush() {
    if (stopped) {
      return;
    }

    while (values.length !== 0) {
      stopped = !(sink as Readable).push(values.shift());

      if (stopped) {
        return;
      }
    }

    if (error) {
      sink.emit('error', error);

      finish();
    } else if (complete) {
      (sink as Readable).push(null);

      finish();
    }
  }

  function finish() {
    values.length = 0;
    error = null;
    complete = false;

    stopped = true;
  }

  const source: Observer<T> = {
    next: value => {
      values.push(value);

      flush();
    },

    error: err => {
      error = err;

      flush();
    },

    complete: () => {
      complete = true;

      flush();
    }
  };

  const sink: ReadableStream = new Readable({
    objectMode: true,

    read() {
      stopped = false;

      flush();
    }
  });

  return [ source, sink ];
}
