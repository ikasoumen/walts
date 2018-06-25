import { Observable } from "rxjs";
import { Dispatcher } from "./dispatcher";
export abstract class State {}
export declare class Store<ST extends State> {
  protected dispatcher: Dispatcher<ST>;
  private _observable;
  private stateRef;
  constructor(initState: ST, dispatcher: Dispatcher<ST>);
  readonly observable: Observable<ST>;
}
