import "rxjs";
import * as assert from "power-assert";
import { Actions } from "../src/actions";
import { Dispatcher } from "../src/dispatcher";
import { Store } from "../src/store";
describe("Integration", () => {
  describe("Sync", () => {
    class TestActions extends Actions {
      addToA(n) {
        return st => {
          return {
            a: st.a + n
          };
        };
      }
      addToB(n) {
        return st => {
          return {
            b: st.b + n
          };
        };
      }
      causeError() {
        return st => {
          throw new Error("Dummy error");
        };
      }
    }
    const actions = new TestActions();
    class TestDispatcher extends Dispatcher {}
    const initState = {
      a: 1,
      b: 1
    };
    class TestStore extends Store {
      constructor(dispatcher) {
        super(initState, dispatcher);
      }
    }
    it("correctly emit() to work", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      const value = 1;
      let i = 0;
      store.observable.subscribe(st => {
        if (i === 1) {
          assert(st.a === initState.a + value);
          assert(st.b === initState.b);
          done();
        }
        i++;
      });
      dispatcher.emit(actions.addToA(value));
    });
    it("correctly emitAll() to work", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      let i = 0;
      store.observable.subscribe(st => {
        if (i === 1) {
          assert(st.a === 5);
          assert(st.b === 4);
          done();
        }
        i++;
      });
      dispatcher.emitAll([
        actions.addToA(2),
        actions.addToB(3),
        actions.addToA(2)
      ]);
    });
    it("correctly continuous emit() to work", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      let i = 0;
      store.observable.subscribe(st => {
        if (i === 0) {
          assert(st.a === 1);
        }
        if (i === 1) {
          assert(st.a === 2);
        }
        if (i === 2) {
          assert(st.a === 4);
        }
        if (i === 3) {
          assert(st.a === 7);
          done();
        }
        i++;
      });
      setTimeout(() => dispatcher.emit(actions.addToA(1)), 1);
      setTimeout(() => dispatcher.emit(actions.addToA(2)), 2);
      setTimeout(() => dispatcher.emit(actions.addToA(3)), 3);
    });
    it("correctly continuous emitAll() to work", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      let i = 0;
      store.observable.subscribe(st => {
        if (i === 0) {
          assert(st.a === 1);
        }
        if (i === 1) {
          assert(st.a === 4);
        }
        if (i === 2) {
          assert(st.a === 11);
        }
        if (i === 3) {
          assert(st.a === 22);
          done();
        }
        i++;
      });
      setTimeout(
        () => dispatcher.emitAll([actions.addToA(1), actions.addToA(2)]),
        1
      );
      setTimeout(
        () => dispatcher.emitAll([actions.addToA(3), actions.addToA(4)]),
        2
      );
      setTimeout(
        () => dispatcher.emitAll([actions.addToA(5), actions.addToA(6)]),
        3
      );
    });
    it("correctly continuous emit() and calculate to multiple properties to work", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      let i = 0;
      store.observable.subscribe(st => {
        if (i === 0) {
          assert(st.a === 1);
          assert(st.b === 1);
        }
        if (i === 1) {
          assert(st.a === 2);
          assert(st.b === 1);
        }
        if (i === 2) {
          assert(st.a === 2);
          assert(st.b === 3);
        }
        if (i === 3) {
          assert(st.a === 5);
          assert(st.b === 3);
          done();
        }
        i++;
      });
      setTimeout(() => dispatcher.emit(actions.addToA(1)), 1);
      setTimeout(() => dispatcher.emit(actions.addToB(2)), 2);
      setTimeout(() => dispatcher.emit(actions.addToA(3)), 3);
    });
    it("correctly continuous emitAll() and calculate to multiple properties to work", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      let i = 0;
      store.observable.subscribe(st => {
        if (i === 0) {
          assert(st.a === 1);
          assert(st.b === 1);
        }
        if (i === 1) {
          assert(st.a === 2);
          assert(st.b === 3);
        }
        if (i === 2) {
          assert(st.a === 5);
          assert(st.b === 7);
        }
        if (i === 3) {
          assert(st.a === 10);
          assert(st.b === 13);
          done();
        }
        i++;
      });
      setTimeout(
        () => dispatcher.emitAll([actions.addToA(1), actions.addToB(2)]),
        1
      );
      setTimeout(
        () => dispatcher.emitAll([actions.addToA(3), actions.addToB(4)]),
        2
      );
      setTimeout(
        () => dispatcher.emitAll([actions.addToA(5), actions.addToB(6)]),
        3
      );
    });
    it("can catch an error", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      store.observable.subscribe(
        () => {},
        err => {
          assert(err.message === "Dummy error");
          done();
        }
      );
      dispatcher.emit(actions.causeError());
    });
  });
  describe("Delayed", () => {
    class TestActions extends Actions {
      delayedAddToA(n) {
        return st => {
          return this.delayed(apply => {
            apply(this.addToA(n));
          });
        };
      }
      addToA(n) {
        return st => {
          return {
            a: st.a + n
          };
        };
      }
      causeError() {
        return st => {
          return this.delayed(apply => {
            throw new Error("Dummy error");
          });
        };
      }
      causeErrorAfterApply() {
        return st => {
          return this.delayed(apply => {
            apply(st => {
              throw new Error("Dummy error inner apply");
            });
          });
        };
      }
      causeErrorNested() {
        return st => {
          return this.delayed(apply => {
            apply(this.causeError());
          });
        };
      }
    }
    const actions = new TestActions();
    class TestDispatcher extends Dispatcher {}
    const initState = {
      a: 1,
      b: 1
    };
    class TestStore extends Store {
      constructor(dispatcher) {
        super(initState, dispatcher);
      }
    }
    it("correctly emit() to work", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      const value = 1;
      let i = 0;
      store.observable.subscribe(st => {
        if (i === 1) {
          assert(st.a === initState.a + value);
          assert(st.b === initState.b);
          done();
        }
        i++;
      });
      dispatcher.emit(actions.delayedAddToA(value));
    });
    it("can catch an error", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      store.observable.subscribe(
        () => {},
        err => {
          assert(err.message === "Dummy error");
          done();
        }
      );
      dispatcher.emit(actions.causeError());
    });
    it("can catch an error when caused from inner apply()", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      store.observable.subscribe(
        () => {},
        err => {
          assert(err.message === "Dummy error inner apply");
          done();
        }
      );
      dispatcher.emit(actions.causeErrorAfterApply());
    });
    it("can catch an error when caused in nested actions", done => {
      const dispatcher = new TestDispatcher();
      const store = new TestStore(dispatcher);
      store.observable.subscribe(
        () => {},
        err => {
          assert(err.message === "Dummy error");
          done();
        }
      );
      dispatcher.emit(actions.causeErrorNested());
    });
  });
});
describe("Nested emitAll", () => {
  class TestActions extends Actions {
    addToA(n) {
      return st => {
        return {
          a: st.a + n
        };
      };
    }
    addToB(n) {
      return st => {
        return {
          b: st.b + n
        };
      };
    }
    useCombine(n) {
      return this.combine([
        st => {
          return {
            a: st.a + n
          };
        },
        st => {
          return {
            b: st.b + n
          };
        },
        this.addToA(n * 2),
        this.addToB(n * 2)
      ]);
    }
    useCombineNested(n) {
      return this.combine([
        st => {
          return {
            a: st.a + n
          };
        },
        this.addToA(1),
        this.useCombine(1)
      ]);
    }
  }
  const actions = new TestActions();
  class TestDispatcher extends Dispatcher {}
  const initState = {
    a: 1,
    b: 1
  };
  class TestStore extends Store {
    constructor(dispatcher) {
      super(initState, dispatcher);
    }
  }
  it("correctly emitAll() to work with combine", done => {
    const dispatcher = new TestDispatcher();
    const store = new TestStore(dispatcher);
    let i = 0;
    store.observable.subscribe(st => {
      if (i === 1) {
        assert(st.a === 8);
        assert(st.b === 7);
        done();
      }
      i++;
    });
    dispatcher.emitAll([actions.addToA(1), actions.useCombine(2)]);
  });
  it("correctly emitAll() to work with nested combine", done => {
    const dispatcher = new TestDispatcher();
    const store = new TestStore(dispatcher);
    let i = 0;
    store.observable.subscribe(st => {
      if (i === 1) {
        assert(st.a === 10);
        assert(st.b === 7);
        done();
      }
      i++;
    });
    dispatcher.emitAll([actions.useCombine(1), actions.useCombineNested(2)]);
  });
});
describe("Nested state", () => {
  class TestActions extends Actions {
    addToA21NotConsider(n) {
      return st => {
        return {
          a: {
            a2: {
              a21: st.a.a2.a21 + n
            }
          }
        };
      };
    }
    addToA21(n) {
      return st => {
        st.a.a2.a21 = st.a.a2.a21 + n;
        return st;
      };
    }
  }
  const actions = new TestActions();
  class TestDispatcher extends Dispatcher {}
  const initState = {
    a: {
      a1: 1,
      a2: {
        a21: 1,
        a22: 1
      }
    },
    b: 1
  };
  class TestStore extends Store {
    constructor(dispatcher) {
      super(initState, dispatcher);
    }
  }
  it("all values are cleared when that does not consider the rewriting of nested objects", done => {
    const dispatcher = new TestDispatcher();
    const store = new TestStore(dispatcher);
    const value = 1;
    let i = 0;
    store.observable.subscribe(st => {
      if (i === 1) {
        assert(st.a.a2.a21 === initState.a.a2.a21 + value);
        assert(st.a.a2.a22 === void 0);
        assert(st.b === initState.b);
        done();
      }
      i++;
    });
    dispatcher.emit(actions.addToA21NotConsider(value));
  });
  it("is performed property rewriting of nested objects correctly, the value is maintained", done => {
    const dispatcher = new TestDispatcher();
    const store = new TestStore(dispatcher);
    const value = 1;
    let i = 0;
    store.observable.subscribe(st => {
      if (i === 1) {
        assert.deepEqual(st, initState);
        done();
      }
      i++;
    });
    dispatcher.emit(actions.addToA21(value));
  });
});