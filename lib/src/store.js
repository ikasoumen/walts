import { BehaviorSubject } from "rxjs";
export class Store {
  constructor(initState, dispatcher) {
    this.dispatcher = dispatcher;
    this.stateRef = Object.assign({}, initState);
    this._observable = new BehaviorSubject(this.stateRef);
    this.dispatcher.subscribeBegin(queue => {
      queue.next(this.stateRef);
    });
    this.dispatcher.subscribeContinue(chunk => {
      this.stateRef = Object.assign({}, this.stateRef, chunk.result);
      chunk.queue.next(this.stateRef);
    });
    this.dispatcher.subscribeComplete(
      result => {
        this.stateRef = Object.assign({}, this.stateRef, result);
        this._observable.next(this.stateRef);
      },
      err => {
        this._observable.error(err);
      }
    );
  }
  get observable() {
    return this._observable;
  }
}
