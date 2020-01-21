import { Observer } from 'rxjs';

import WritableStream = NodeJS.WritableStream;

// Observer => WritableStream
export function toStreamC<T>(sink: WritableStream): Observer<T> {
  const values: Array<T> = [];
  let error: any = null;
  let complete: boolean = false;

  let stopped = false;

  function onDrain() {
    stopped = false;

    flush();
  }

  function flush() {
    if (stopped) {
      return;
    }

    while (values.length !== 0) {
      stopped = !sink.write(values.shift());

      if (stopped) {
        return;
      }
    }

    if (error) {
      sink.emit('error', error);

      finish();
    } else if (complete) {
      sink.end();

      finish();
    }
  }

  function finish() {
    sink.off('drain', onDrain);

    values.length = 0;
    error = null;
    complete = false;

    stopped = true;
  }

  sink.on('drain', onDrain);

  return {
    next(value: T) {
      values.push(value);

      flush();
    },

    error(err: any) {
      error = err;

      flush();
    },

    complete() {
      complete = true;

      flush();
    }
  };
}
