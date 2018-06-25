import { Subject } from "rxjs";
import { isPromise as rxIsPromise } from "rxjs/internal-compatibility";
import { flatten } from "./utils";
function finish(resolve, complete$) {
  return {
    next: st => {
      resolve(st);
      if (complete$) {
        complete$.next(st);
      }
    }
  };
}
function isAction(v) {
  return typeof v === "function";
}
function isActions(v) {
  return Array.isArray(v);
}
function isDelayed(v) {
  return rxIsPromise(v);
}
export class Dispatcher {
  constructor() {
    this.begin$ = new Subject();
    this.continue$ = new Subject();
    this.complete$ = new Subject();
  }
  emit(action) {
    this._emit(action, this.complete$);
  }
  emitAll(actions) {
    this._emitAll(actions, this.complete$);
  }
  subscribeBegin(observer) {
    this.begin$.subscribe(queue => observer(queue));
  }
  subscribeContinue(observer) {
    this.continue$.subscribe(chunk => observer(chunk));
  }
  subscribeComplete(observer, errorHandler) {
    this.complete$.subscribe(
      result => observer(result),
      err => errorHandler(err)
    );
  }
  _emit(action, complete$) {
    if (isActions(action)) {
      return this._emitAll(action, complete$);
    }
    return this._emitAll([action], complete$);
  }
  _emitAll(_actions, complete$) {
    const actions = flatten(_actions);
    const promise = new Promise(resolve => {
      const queues = actions.map(_ => new Subject());
      queues.forEach((queue, i) => {
        const action = actions[i];
        const nextQueue = queues[i + 1]
          ? queues[i + 1]
          : finish(resolve, complete$);
        queue.subscribe(state => {
          const syncOrDelayedAction = action;
          let stateOrDelayed;
          try {
            stateOrDelayed = syncOrDelayedAction(state);
          } catch (e) {
            this.complete$.error(e);
          }
          if (isDelayed(stateOrDelayed)) {
            this.whenDelayed(stateOrDelayed, nextQueue, err =>
              this.complete$.error(err)
            );
            return;
          }
          this.continueNext(stateOrDelayed, nextQueue);
        });
      });
      this.begin$.next(queues[0]);
    });
    return promise;
  }
  whenDelayed(result, nextQueue, errorHandler) {
    result
      .then(value => {
        if (isAction(value)) {
          return this._emit(value).then(v => this.continueNext(v, nextQueue));
        }
        if (isActions(value)) {
          return this._emitAll(value).then(v =>
            this.continueNext(v, nextQueue)
          );
        }
      })
      .catch(err => errorHandler(err));
  }
  continueNext(result, queue) {
    this.continue$.next({ result, queue });
  }
}
