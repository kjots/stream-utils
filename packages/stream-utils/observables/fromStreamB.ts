import { Observable, Observer } from 'rxjs';

import ReadableStream = NodeJS.ReadableStream;

// ReadableStream => Observable
export function fromStreamB<T>(source: ReadableStream): Observable<T> {
  return new Observable<T>((observer: Observer<T>) => {
    const onData = (value: T) => observer.next(value);
    const onError = (error: any) => observer.error(error);
    const onEnd = () => observer.complete();

    source.on('data', onData);
    source.on('error', onError);
    source.on('end', onEnd);

    return () => {
      source.off('data', onData);
      source.off('error', onError);
      source.off('end', onEnd);
    };
  });
}
