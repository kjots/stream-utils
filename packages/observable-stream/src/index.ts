import { streamObservable } from '@kjots/stream-observable';

import { Readable } from 'stream';

import { merge, Observable, Subject } from 'rxjs';

import ReadableStream = NodeJS.ReadableStream;
import ReadWriteStream = NodeJS.ReadWriteStream;

export class ObservableStream<T> extends Readable {
  private readonly observable: Observable<T>;

  private values!: Array<T>;
  private error!: any;
  private complete!: boolean;

  private stopped!: boolean;

  constructor(observable: Observable<T>) {
    super({ objectMode: true });

    this.observable = observable;
  }

  public _read() {
    this.stopped = false;

    if (this.values === undefined) {
      this._subscribe();
    }

    this._flush();
  }

  private _subscribe() {
    this.values = [];

    this.observable.subscribe({
      next: (value: T) => {
        this.values.push(value);

        this._flush();
      },

      error: (error: any) => {
        this.error = error;

        this._flush();
      },

      complete: () => {
        this.complete = true;

        this._flush();
      }
    });
  }

  private _flush() {
    if (this.stopped) {
      return;
    }

    while (this.values.length !== 0) {
      this.stopped = !this.push(this.values.shift());

      if (this.stopped) {
        return;
      }
    }

    if (this.error) {
      this.emit('error', this.error);

      this._close();
    } else if (this.complete) {
      this.push(null);

      this._close();
    }
  }

  private _close() {
    delete this.values;
    delete this.error;
    delete this.complete;

    this.stopped = true;
  }
}

export function observableStream<T>(observable: Observable<T>): ReadableStream {
  return new ObservableStream(observable);
}

export function through<T, R = T>(...transforms: Array<ReadWriteStream>): (observable: Observable<T>) => Observable<R> {
  return (observable: Observable<T>) => {
    const errorSubject = new Subject<any>();

    return merge(errorSubject, streamObservable(
      transforms
        .reduce((stream, transform) =>
          stream
            .on('error', error => errorSubject.error(error))
            .pipe(transform), observableStream(observable)
        )
        .on('end', () => errorSubject.complete())
    ));
  };
}
