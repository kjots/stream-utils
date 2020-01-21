import { Writable } from 'stream';

import { Observable, Observer } from 'rxjs';

import WritableStream = NodeJS.WritableStream;

// WritableStream => Observable
export function fromStreamD<T>(): [ WritableStream, Observable<T> ] {
  let observer: Observer<T> | undefined;

  const values: Array<T> = [];
  let error: any = null;
  let complete: boolean = false;

  function flush() {
    if (observer !== undefined) {
      while (values.length !== 0) {
        observer.next(values.shift() as T);
      }

      if (error) {
        observer.error(error);

        finish();
      } else if (complete) {
        observer.complete();

        finish();
      }
    }
  }

  function finish() {
    values.length = 0;
    error = null;
    complete = false;

    observer = undefined;
  }

  const source = new Writable({
    objectMode: true,

    write(value: T, encoding: string, callback: () => void) {
      values.push(value);

      flush();

      callback();
    },

    final(callback: () => void) {
      complete = true;

      flush();

      callback();
    }
  });

  source.on('error', err => {
    error = err;

    flush();
  });

  const sink = new Observable<T>((obs: Observer<T>) => {
    observer = obs;

    flush();

    return finish;
  });

  return [ source, sink ];
}
