export interface RecursiveArray<T> extends Array<T | RecursiveArray<T>> {}
export declare function flatten<T>(
  array: Array<T | RecursiveArray<T>>
): Array<T | RecursiveArray<T>>;
