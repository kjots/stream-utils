import { Writable } from 'stream';

import { Observable, Observer } from 'rxjs';

import ReadableStream = NodeJS.ReadableStream;

export class ObserverWritable<T> extends Writable {
  private readonly observer: Observer<T>;

  constructor(observer: Observer<T>) {
    super({ objectMode: true });

    this.observer = observer;
  }

  public onError = (error: any) => this.observer.error(error);

  public _write(chunk: any, encoding: string, callback: () => void) {
    this.observer.next(chunk);

    callback();
  }

  public _final(callback: () => void) {
    this.observer.complete();

    callback();
  }
}

export class StreamObservable<T> extends Observable<T> {
  private observerWritable!: ObserverWritable<T>;

  constructor(stream: ReadableStream) {
    super((observer: Observer<T>) => {
      this.observerWritable = new ObserverWritable<T>(observer);

      stream.on('error', this.observerWritable.onError);
      stream.pipe(this.observerWritable);

      return () => {
        stream.unpipe(this.observerWritable);
        stream.off('error', this.observerWritable.onError);

        delete this.observerWritable;
      };
    });
  }
}

export function streamObservable<T>(stream: ReadableStream): Observable<T> {
  return new StreamObservable<T>(stream);
}
