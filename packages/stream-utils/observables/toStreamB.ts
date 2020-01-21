import { Readable } from 'stream';

import { Observable } from 'rxjs';

import { SubscriptionCache } from './utils';

import ReadableStream = NodeJS.ReadableStream;

// Observable => ReadableStream
export function toStreamB<T>(source: Observable<T>): ReadableStream {
  const subscriptionCache: SubscriptionCache<T> = new SubscriptionCache<T>(source, flush);

  let stopped = false;

  function read() {
    stopped = false;

    subscriptionCache.subscribe();

    flush();
  }

  function flush() {
    if (stopped) {
      return;
    }

    while (subscriptionCache.values.length !== 0) {
      stopped = !sink.push(subscriptionCache.values.shift());

      if (stopped) {
        return;
      }
    }

    if (subscriptionCache.error) {
      sink.emit('error', subscriptionCache.error);

      finish();
    } else if (subscriptionCache.complete) {
      sink.push(null);

      finish();
    }
  }

  function finish() {
    subscriptionCache.unsubscribe();

    stopped = true;
  }

  const sink = new Readable({ objectMode: true, read });

  return sink;
}
