import { Observable } from 'rxjs';

import { SubscriptionCache } from './utils';

import WritableStream = NodeJS.WritableStream;

// Observable => WritableStream
export function toStreamA<T>(source: Observable<T>, sink: WritableStream): () => void {
  const subscriptionCache: SubscriptionCache<T> = new SubscriptionCache<T>(source, flush);

  let stopped = false;

  function onDrain() {
    stopped = false;

    flush();
  }

  function flush() {
    if (stopped) {
      return;
    }

    while (subscriptionCache.values.length !== 0) {
      stopped = !sink.write(subscriptionCache.values.shift());

      if (stopped) {
        return;
      }
    }

    if (subscriptionCache.error) {
      sink.emit('error', subscriptionCache.error);

      finish();
    } else if (subscriptionCache.complete) {
      sink.end();

      finish();
    }
  }

  function finish() {
    subscriptionCache.unsubscribe();

    sink.off('drain', onDrain);

    stopped = true;
  }

  sink.on('drain', onDrain);

  subscriptionCache.subscribe();

  return finish;
}
