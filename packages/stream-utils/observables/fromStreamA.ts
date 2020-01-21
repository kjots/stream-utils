import { Observer } from 'rxjs';

import ReadableStream = NodeJS.ReadableStream;

// ReadableStream => Observer
export function fromStreamA<T>(source: ReadableStream, sink: Observer<T>): () => void {
  const onData = (value: T) => sink.next(value);
  const onError = (error: any) => sink.error(error);
  const onEnd = () => sink.complete();

  source.on('data', onData);
  source.on('error', onError);
  source.on('end', onEnd);

  return () => {
    source.off('data', onData);
    source.off('error', onError);
    source.off('end', onEnd);
  };
}
