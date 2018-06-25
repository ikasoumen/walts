import { flatten } from "./utils";
export class Actions {
  combine(actions) {
    return flatten(actions);
  }
  delayed(executor) {
    return new Promise(executor);
  }
}
