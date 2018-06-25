import { State } from "./store";
export declare type Delayed<ST extends State> = Promise<
  Action<ST> | Action<ST>[]
>;
export declare type SyncAction<ST extends State> = (state: ST) => ST;
export declare type DelayedAction<ST extends State> = (
  state: ST
) => Delayed<ST>;
export declare type Action<ST extends State> =
  | SyncAction<ST>
  | DelayedAction<ST>;
export declare type Executor<ST extends State> = (
  apply: (
    actionOrActions:
      | Action<ST>
      | Action<ST>[]
      | PromiseLike<Action<ST> | Action<ST>[]>
  ) => void,
  reject: (reason?: any) => void
) => void;
export declare class Actions<ST extends State> {
  protected combine(actions: (Action<ST> | Action<ST>[])[]): Action<ST>[];
  protected delayed(executor: Executor<ST>): Delayed<ST>;
}
