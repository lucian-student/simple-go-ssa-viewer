# useStore

Z toho, co jsem pochopil, tak se to chová asi jako:
1. useSyncExternalStore z Reactu (https://legacy.reactjs.org/docs/hooks-reference.html#usesyncexternalstore)
    * kde metoda je store.subscribe, která kontroluje změný
    * v podstatě, subscribe tady kontroluje rerendery, takže kdykoliv se hodnota asi vybraná selektorem změní, tak se rerenderne ztránka
```
useState(key: keyof Selectors, a1?: unknown, a2?: unknown, a3?: unknown) {
    React.useDebugValue(key);
    return useStore(this, this.selectors![key], a1, a2, a3);
  }
```

```
function useStoreR19(
  store: ReadonlyStore<unknown>,
  selector: Function,
  a1?: unknown,
  a2?: unknown,
  a3?: unknown,
): unknown {
  const getSelection = React.useCallback(
    () => selector(store.getSnapshot(), a1, a2, a3),
    [store, selector, a1, a2, a3],
  );

  return useSyncExternalStore(store.subscribe, getSelection, getSelection);
}
```


```
const useStoreImplementation = canUseRawUseSyncExternalStore ? useStoreFast : useStoreLegacy;
```

```
function useStoreFast(
  store: ReadonlyStore<unknown>,
  selector: Function,
  a1?: unknown,
  a2?: unknown,
  a3?: unknown,
): unknown {
  const instance = getInstance() as StoreInstance | undefined;
  if (!instance) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useStoreR19(store, selector, a1, a2, a3);
  }

  const index = instance.syncIndex;
  instance.syncIndex += 1;

  let hook;
  if (!instance.didInitialize) {
    hook = {
      store,
      selector,
      a1,
      a2,
      a3,
      value: selector(store.getSnapshot(), a1, a2, a3),
    };
    instance.syncHooks.push(hook);
  } else {
    hook = instance.syncHooks[index];
    if (
      hook.store !== store ||
      hook.selector !== selector ||
      !Object.is(hook.a1, a1) ||
      !Object.is(hook.a2, a2) ||
      !Object.is(hook.a3, a3)
    ) {
      if (hook.store !== store) {
        instance.didChangeStore = true;
      }
      hook.store = store;
      hook.selector = selector;
      hook.a1 = a1;
      hook.a2 = a2;
      hook.a3 = a3;
      hook.value = selector(store.getSnapshot(), a1, a2, a3);
    }
  }

  return hook.value;
}
```






### helpers

```
export type Instance = {
  didInitialize: boolean;
};

let currentInstance: Instance | undefined = undefined;

export function getInstance() {
  return currentInstance;
}
```