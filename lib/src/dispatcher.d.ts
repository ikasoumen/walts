import { Subject } from "rxjs";
import { Action } from "./actions";
import { State } from "./store";
export interface SubjectLike<ST> {
  next: (st: ST) => void;
}
export interface ResultChunk<ST> {
  result: ST;
  queue: SubjectLike<ST>;
}
export declare class Dispatcher<ST extends State> {
  private begin$;
  private continue$;
  private complete$;
  emit(action: Action<ST> | Action<ST>[]): void;
  emitAll(actions: (Action<ST> | Action<ST>[])[]): void;
  subscribeBegin(observer: (queue: Subject<ST>) => void): void;
  subscribeContinue(observer: (chunk: ResultChunk<ST>) => void): void;
  subscribeComplete(
    observer: (result: ST) => void,
    errorHandler: (error: any) => void
  ): void;
  private _emit(action, complete$?);
  private _emitAll(_actions, complete$?);
  private whenDelayed(result, nextQueue, errorHandler);
  private continueNext(result, queue);
}
