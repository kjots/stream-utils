import { Observable, Subscription } from 'rxjs';

export class SubscriptionCache<T> {
  public readonly values: Array<T> = [];
  public error: any = null;
  public complete: boolean = false;

  private subscribing: boolean = false;
  private subscription?: Subscription;

  constructor(private readonly observable: Observable<T>,
              private readonly flush: () => void) {}

  public subscribe() {
    if (this.subscription === undefined) {
      this.subscribing = true;

      this.subscription = this.observable.subscribe({
        next: (value: T) => {
          this.values.push(value);

          this.flush();
        },

        error: (error: any) => {
          this.error = error;

          this.flush();
        },

        complete: () => {
          this.complete = true;

          this.flush();
        }
      });

      this.subscribing = false;
    }
  }

  public unsubscribe() {
    if (this.subscribing) {
      setTimeout(() => this.unsubscribe(), 0);

      return;
    }

    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();

      delete this.subscription;

      this.values.length = 0;
      this.error = null;
      this.complete = false;
    }
  }
}
