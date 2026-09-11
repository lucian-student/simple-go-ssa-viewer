## Store<State> ukladá state data

Podle toho, co jsem přečetl, tak to používá subscriber,observer pattern.
* to znamená, že subscribeři mužou naslouchat na změny stavu a reagovat na ně

```
type Listener<T> = (state: T) => void;
```

properties:
* state: State;//
* private listeners: Set<Listener<State>>;//
* private updateTick: number;//

### subscribe

* vrací callback, který unsubscribne
* přidá metodu, která subscrubne

### getSNapshot - vrítí stav

### setState, upraví stav a zavolá listenery

Incremetuje, také updateTick

### update<const Key extends keyof State>(changes: Pick<State, Key>)

Částečný update.

### set<Key extends keyof State>(key: Key, value: State[Key])

Nataví specifický klíč na specifickou hodnotu.

### notifyAll

triggerne update stavu, bez změny stavu a tím se notifikují všichni listeneři

### use


## ReactStore

Narozdíl od Storu, tak má context a selectory:
1. context = Record<string, never> -> Record znamená, že mám objekt s klíčem "string" a hodnotou "never"
  * z toho, co jsem pochopil, tak je to "empty" object podle AI, jelikož není možné mít hodnotu never
  * okey takže Record aplikuje constraint jenom na typ klíč, který je specifikovaný: takže Record<string,never> povoluje symbol klíče
  * obecně typy v typescriptu specifikují minimum, co musí objekt splňovat, takže basically interface
2. selectors extends Record<string, SelectorFunction<State>> = Record<string, never>
  * type SelectorFunction<State> = (state: State, ...args: any[]) => any;
    * idk, co si pod tím představit
3. state: State extends object

### useSyncedValue<Key extends keyof State>(key: Key, value: State[Key]) - basically používá useLayoutEffect(před tím než se renderende)

vykonává synchronizaci stavu, hodnota s daným klíčem, pokud se změní, tak se updatne v stavu

### useSyncedValueWithCleanup<Key extends KeysAllowingUndefined<State>>

stejný jako useSyncedValue, až na to, že při unmountu komponentu, tak nastaví hodnotu na undefined

### useSyncedValues<const Key extends keyof State>(statePart: Pick<State, Key>)

asi stejný ale pro víc (klíč, hodnota) párů

### useControlledProp<Key extends keyof State>(key: Key, controlled: State[Key] | undefined): void 

něco jak useSynced, ale braní undefined hodnotě, takže hodnota asi nemůže být undefined

### select<Key extends keyof Selectors>,select(key: keyof Selectors, a1?: unknown, a2?: unknown, a3?: unknown)

Konkreétní případ selectorů, z toho, co jsem pochopil, tak to jsou gettery v podstatě, takže select veme a zavolá getter.
```
const selectors = {
  ...popupStoreSelectors,
  disabled: (state: State<unknown>) =>
    state.parent.type === 'menubar'
      ? state.parent.context.disabled || state.disabled
      : state.disabled,
  modal: (state: State<unknown>) =>
    (state.parent.type === undefined || state.parent.type === 'context-menu') &&
    (state.modal ?? true),
  openMethod: (state: State<unknown>) => state.openMethod,

  allowMouseEnter: (state: State<unknown>) => state.allowMouseEnter,
  highlightItemOnHover: (state: State<unknown>) => state.highlightItemOnHover,
  parent: (state: State<unknown>) => state.parent,
  rootId: (state: State<unknown>): string | undefined => {
    if (state.parent.type === 'menu') {
      return state.parent.store.select('rootId');
    }

    return state.parent.type !== undefined ? state.parent.context.rootId : state.rootId;
  },
  activeIndex: (state: State<unknown>) => state.activeIndex,
  isActive: (state: State<unknown>, itemIndex: number) => state.activeIndex === itemIndex,
  hoverEnabled: (state: State<unknown>) => state.hoverEnabled,
  instantType: (state: State<unknown>) => state.instantType,
  lastOpenChangeReason: (state: State<unknown>) => state.openChangeReason,
  floatingTreeRoot: (state: State<unknown>): FloatingTreeStore => {
    if (state.parent.type === 'menu') {
      return state.parent.store.select('floatingTreeRoot');
    }

    return state.floatingTreeRoot;
  },
  floatingNodeId: (state: State<unknown>) => state.floatingNodeId,
  floatingParentNodeId: (state: State<unknown>) => state.floatingParentNodeId,
  itemProps: (state: State<unknown>) => state.itemProps,
  closeDelay: (state: State<unknown>) => state.closeDelay,
  adaptiveOrigin: (state: State<unknown>): AdaptiveOriginMiddleware | undefined =>
    state.adaptiveOrigin,
  keyboardEventRelay: (state: State<unknown>): React.KeyboardEventHandler<any> | undefined => {
    if (state.keyboardEventRelay) {
      return state.keyboardEventRelay;
    }

    if (state.parent.type === 'menu') {
      return state.parent.store.select('keyboardEventRelay');
    }

    return undefined;
  },
};

//Příklad funkce, která vytvoří context
function createInitialContext(triggerElements: PopupTriggerMap): Context {
  return {
    positionerRef: React.createRef<HTMLElement | null>(),
    popupRef: React.createRef<HTMLElement | null>(),
    typingRef: { current: false },
    itemDomElements: { current: [] },
    itemLabels: { current: [] },
    allowMouseUpTriggerRef: { current: false },
    triggerFocusTargetRef: React.createRef<HTMLElement>(),
    beforeContentFocusGuardRef: React.createRef<HTMLElement>(),
    onOpenChangeComplete: undefined,
    triggerElements,
  };
}
```

### useState<Key extends keyof Selectors> využívá useSyncExternalStore


### useContextCallback<Key extends ContextFunctionKeys<Context>>



### useStateSetter<const Key extends keyof State>(key: Key) 

### observe(selector: keyof Selectors | ObserveSelector<State>,listener: (newValue: any, oldValue: any, store: this) => void)


## MenuStore

```
export class MenuStore<Payload> extends ReactStore<Readonly<State<Payload>>, Context, Selectors> {
  constructor(
    initialState?: Partial<State<Payload>>,
    floatingId?: string | undefined,
    nested = false,
  ) {
    const triggerElements = new PopupTriggerMap();
    const state = createInitialState<Payload>(triggerElements, floatingId, nested, initialState);

    super(state, createInitialContext(triggerElements), selectors);

    // Set up propagation of state from parent menu if applicable.
    this.unsubscribeParentListener = this.observe('parent', (parent) => {
      this.unsubscribeParentListener?.();

      if (parent.type === 'menu') {
        let rootId = parent.store.select('rootId');
        let floatingTreeRoot = parent.store.select('floatingTreeRoot');
        let keyboardEventRelay = parent.store.select('keyboardEventRelay');

        this.unsubscribeParentListener = parent.store.subscribe(() => {
          const nextRootId = parent.store.select('rootId');
          const nextFloatingTreeRoot = parent.store.select('floatingTreeRoot');
          const nextKeyboardEventRelay = parent.store.select('keyboardEventRelay');

          if (
            rootId === nextRootId &&
            floatingTreeRoot === nextFloatingTreeRoot &&
            keyboardEventRelay === nextKeyboardEventRelay
          ) {
            return;
          }

          rootId = nextRootId;
          floatingTreeRoot = nextFloatingTreeRoot;
          keyboardEventRelay = nextKeyboardEventRelay;
          this.notifyAll();
        });

        this.context.allowMouseUpTriggerRef = parent.store.context.allowMouseUpTriggerRef;
        return;
      }

      if (parent.type !== undefined) {
        this.context.allowMouseUpTriggerRef = parent.context.allowMouseUpTriggerRef;
      }

      this.unsubscribeParentListener = null;
    });
  }

  setOpen(open: boolean, eventDetails: Omit<MenuRoot.ChangeEventDetails, 'preventUnmountOnClose'>) {
    this.state.floatingRootContext.context.events.emit('setOpen', { open, eventDetails });
  }

  private unsubscribeParentListener: (() => void) | null = null;
}
```