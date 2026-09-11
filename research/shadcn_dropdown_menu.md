# Dropdown menu

Z výzkumu jsem zjistil, že shadcn, používá mui/base-ui jako primitva, takže veškerý komponenty jsou implementovaný zde:
* https://github.com/mui/base-ui/tree/master/packages/react/src/menu/root


Můj ukol je vytvořit dropdownmenu, které se spustí místo contenteditable default

## Dropdown Menu:

```
function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}
```

```
export type Instance = {
  didInitialize: boolean;
};

type HookType = {
  before: (instance: any) => void;
  after: (instance: any) => void;
};

const hooks: HookType[] = [];
let currentInstance: Instance | undefined = undefined;

export function fastComponent<P extends object, E extends HTMLElement, R extends React.ReactNode>(
  fn: (props: P) => R,
): typeof fn {
  const FastComponent = (props: P, forwardedRef: React.Ref<E>): R => {
    const instance = useRefWithInit(createInstance).current;

    let result;
    try {
      currentInstance = instance;

      for (const hook of hooks) {
        hook.before(instance);
      }

      result = (fn as any)(props, forwardedRef);

      for (const hook of hooks) {
        hook.after(instance);
      }

      instance.didInitialize = true;
    } finally {
      currentInstance = undefined;
    }

    return result;
  };
  FastComponent.displayName = (fn as any).displayName || fn.name;
  return FastComponent as unknown as typeof fn;
}
```
Basically nejak asi anotuje, komponent nevim jestli je to potřeba vědět.

```
export const MenuRoot = fastComponent(function MenuRoot<Payload>(props: MenuRoot.Props<Payload>) {
  const {
    children,//klasicky React.children, nejaky jsx elementy asi(ale nevim jistě)
    open: openProp,//to je boolean, který říká jestli je menu open
    onOpenChange,//když se zavře/otevře
    onOpenChangeComplete,//něco když doběhne animace, nevim k čemu
    defaultOpen = false,//asi jestli ve váchozím stavu bude menu otevřený
    disabled: disabledProp = false,//asi jestli je disabled
    modal: modalProp,//jestli je to modal: jestli múžeš interagovat z okolím, nebo ne
    loopFocus = true,//jestli při loopovaní zkrz menu, se refocusne na první element
    orientation = 'vertical',//horizontalní/vertikální orientace
    actionsRef,//zatím nemám poněntí: jenom vim, že to jsou nějaký open,close metody v React referenci asi
    closeParentOnEsc = false,//jestli se to zavře na escape nevim
    handle,//nevim
    triggerId: triggerIdProp,//asi id triggeru
    defaultTriggerId: defaultTriggerIdProp = null,
    highlightItemOnHover = true,
  } = props;

  //nějaky contexty, basically jsou to wrappery myslím nad React.useContext, to znamená consumři contextu
  //hodntoy contextu, lze získat z React Devtools v browseru
  const contextMenuContext = useContextMenuRootContext(true);//ContextMenuRootContext.Provider, vypadá, že v mojem případě, taky není výchozí hodnota: undefined
  const parentMenuRootContext = useMenuRootContext(true);//MenuRootContext.Provider, v mojem případě v spodní MenuRootu je taky: undefined 
  const menubarContext = useMenubarContext(true); //MenubarContext.Provider: undefined
  const isSubmenu = useMenuSubmenuRootContext(); //budu muset zjisit, kde je provider, abych mohl vědět hodntou: undefined
  //z toho co vidím, tak Provider není v mojem případě, takže hodnota je výchozí: undefined

  const parentFromContext: MenuParent = React.useMemo(() => {

    if (isSubmenu && parentMenuRootContext) {//v mojem případě se nestane
      return {
        type: 'menu',
        store: parentMenuRootContext.store,
      };
    }

    if (menubarContext) {//vypadá, že v mojem případě, taky bude undefined
      return {
        type: 'menubar',
        context: menubarContext,
      };
    }

    // Ensure this is not a Menu nested inside ContextMenu.Trigger.
    // ContextMenu parentContext is always undefined as ContextMenu.Root is instantiated with
    // <MenuRootContext.Provider value={undefined}>
    if (contextMenuContext && !parentMenuRootContext) {
      return {
        type: 'context-menu',
        context: contextMenuContext,
      };
    }

    return {
      type: undefined,
    };
  }, [contextMenuContext, parentMenuRootContext, menubarContext, isSubmenu]);//useMemo, cachuje arbitrary hodnotu, narozdíl od useCallbacku, který cachuje funkci
  //takže v mojem přídaě: type: undefined

  const rootId = useId();//vytvoří id
  const floatingId = useId();//vytvoří id
  const floatingParentNodeIdFromContext = useFloatingParentNodeId();//možná taky vytvoří id

  const parentMenuStore = parentFromContext.type === 'menu' ? parentFromContext.store : undefined;//takže v mojem případě undefined
  // An initially open submenu should animate in only when the user watches it appear, i.e. when
  // its subtree mounts because the parent popup is playing its own enter transition. A parent
  // that was `defaultOpen` at page load never passes through `'starting'`, and under a
  // `keepMounted` parent these initializers run at page load while the parent's status is still
  // `undefined` — in both cases the submenu is page-load content that must not animate. Gated on
  // being open at mount so a closed submenu doesn't seed `instantType` it would never clear. Read
  // during the first render only — consumed exclusively by first-render initializers below
  // (`useState` and the store's initial state).
  const animateInitialOpen =(
    (openProp ?? defaultOpen) && 
    parentMenuStore?.state.transitionStatus === 'starting';//jelikož parentMenuStore=undefined, tak tady je false
  )// false

  // Mirror an instantly-opened parent (e.g. keyboard click) so `[data-instant]` styling
  // suppresses the enter transition on both popups or neither. Captured once —
  // `animateInitialOpen` is only meaningful during the first render.
  const seededInstantType = useRefWithInit(() =>
    animateInitialOpen ? parentMenuStore?.state.instantType : undefined,
  ).current;//undefined

  const store = useMenuRootStore<Payload>(
    {
      open: defaultOpen,
      openProp,
      activeTriggerId: defaultTriggerIdProp,
      triggerIdProp,
      parent: parentFromContext,
      disabled: disabledProp,
      highlightItemOnHover,
      modal: parentFromContext.type === undefined ? modalProp : undefined,
      rootId,
      instantType: seededInstantType,
    },
    floatingId,
    floatingParentNodeIdFromContext != null,
  );//jediný, co vim, tak slouží pro uložení MenuStore třídy, v useRefu, důvod, aby přežila třída rerendery

  store.useControlledProp('openProp', openProp);//basically říká, že nastavuju hodnotu "openProp" na proměnnou openProp a nepovoluje se undefined
  store.useControlledProp('triggerIdProp', triggerIdProp);////to stejné zde

  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);//přida funkci contextu

  const floatingTreeRoot = store.useState('floatingTreeRoot');//basically pozoruje danou hodnotu
  const floatingNodeIdFromContext = useFloatingNodeId(floatingTreeRoot);//nějaký id

  const open = store.useState('open');//pozoruje danou hodnotu
  const activeTriggerElement = store.useState('activeTriggerElement');
  const positionerElement = store.useState('positionerElement');
  const hoverEnabled = store.useState('hoverEnabled');
  const disabled = store.useState('disabled');
  const lastOpenChangeReason = store.useState('lastOpenChangeReason');
  const parent = store.useState('parent');

  const activeIndex = store.useState('activeIndex');
  const payload = store.useState('payload') as Payload | undefined;
  const floatingParentNodeId = store.useState('floatingParentNodeId');

  const openEventRef = React.useRef<Event | null>(null);
  const allowOutsidePressDismissalRef = React.useRef(parent.type !== 'context-menu');
  const allowOutsidePressDismissalTimeout = useTimeout();
  const allowTouchToCloseRef = React.useRef(true);
  const allowTouchToCloseTimeout = useTimeout();

  const nested = floatingParentNodeId != null;

  if (process.env.NODE_ENV !== 'production') {
    if (parent.type !== undefined && modalProp !== undefined) {
      console.warn(
        'Base UI: The `modal` prop is not supported on nested menus. It will be ignored.',
      );
    }
  }

  const { openMethod, triggerProps: interactionTypeProps } = useOpenInteractionType(open);

  store.useSyncedValues({
    disabled: disabledProp,
    highlightItemOnHover,
    modal: parent.type === undefined ? modalProp : undefined,
    openMethod,
    rootId,
  });

  useImplicitActiveTrigger(store);
  const { forceUnmount, transitionStatus } = useOpenStateTransitions(
    open,
    store,
    () => {
      store.set('allowMouseEnter', false);
    },
    animateInitialOpen,
  );

  const runOnceAnimationsFinish = useAnimationsFinished(store.context.popupRef);

  // An inherited `instantType` is only for the initial reveal. A later controlled `open` flip
  // bypasses `setOpen`, so nothing would reset it and `[data-instant]` would wrongly suppress
  // every subsequent transition. Clear it once the enter phase settles, unless an interactive
  // open change already replaced it.
  React.useEffect(() => {
    if (seededInstantType === undefined) {
      return undefined;
    }

    const clearSeededInstantType = () => {
      if (store.state.instantType === seededInstantType) {
        store.set('instantType', undefined);
      }
    };

    // A controlled close can interrupt the initial enter before the animations-finished cleanup
    // below fires (its abort cancels the pending callback, and a closed popup schedules no new
    // one). Nothing is left to protect once closing starts — the exit's suppression was already
    // decided at its trigger commit — so clear now or the next reopen renders a stale
    // `[data-instant]`.
    if (!open) {
      clearSeededInstantType();
      return undefined;
    }

    if (transitionStatus !== undefined) {
      return undefined;
    }

    // With no popup element (e.g. its subtree is suspended or waiting on data), there is no
    // enter transition to protect, and `useAnimationsFinished` would return without invoking the
    // callback — a ref assignment alone would never rerun this effect, leaving the seed stuck.
    // Clear immediately: a popup that appears after the reveal settles is page-load-like content.
    if (store.context.popupRef.current == null) {
      clearSeededInstantType();
      return undefined;
    }

    const abortController = new AbortController();
    runOnceAnimationsFinish(clearSeededInstantType, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [seededInstantType, open, transitionStatus, runOnceAnimationsFinish, store]);

  useIsoLayoutEffect(() => {
    if (contextMenuContext && !parentMenuRootContext) {
      // This is a context menu root.
      // It doesn't support detached triggers yet, so we have to sync the parent context manually.
      store.update({
        parent: {
          type: 'context-menu',
          context: contextMenuContext,
        },
        floatingNodeId: floatingNodeIdFromContext,
        floatingParentNodeId: floatingParentNodeIdFromContext,
      });
    } else if (parentMenuRootContext) {
      store.update({
        floatingNodeId: floatingNodeIdFromContext,
        floatingParentNodeId: floatingParentNodeIdFromContext,
      });
    }
  }, [
    contextMenuContext,
    parentMenuRootContext,
    floatingNodeIdFromContext,
    floatingParentNodeIdFromContext,
    store,
  ]);

  React.useEffect(() => {
    if (!open) {
      openEventRef.current = null;
    }

    if (parent.type !== 'context-menu') {
      return;
    }

    if (!open) {
      allowOutsidePressDismissalTimeout.clear();
      allowOutsidePressDismissalRef.current = false;
      return;
    }

    // With `mousedown` outside press events and long press touch input, there
    // needs to be a grace period after opening to ensure the dismissal event
    // doesn't fire immediately after open.
    allowOutsidePressDismissalTimeout.start(500, () => {
      allowOutsidePressDismissalRef.current = true;
    });
  }, [allowOutsidePressDismissalTimeout, open, parent.type]);

  useIsoLayoutEffect(() => {
    if (!open && !hoverEnabled) {
      store.set('hoverEnabled', true);
    }
  }, [open, hoverEnabled, store]);

  const setOpen = useStableCallback(
    (
      nextOpen: boolean,
      eventDetails: Omit<MenuRoot.ChangeEventDetails, 'preventUnmountOnClose'>,
    ) => {
      const reason = eventDetails.reason;

      // Read the store directly, as relayed tree events and stale hover timers can request
      // a close after the state changed but before this component re-rendered.
      if (!nextOpen && !store.select('open')) {
        return;
      }

      if (
        open === nextOpen &&
        eventDetails.trigger === activeTriggerElement &&
        lastOpenChangeReason === reason
      ) {
        return;
      }

      const shouldPreventUnmountOnClose = attachPreventUnmountOnClose(
        eventDetails as MenuRoot.ChangeEventDetails,
      );

      // Do not immediately reset the activeTriggerId to allow
      // exit animations to play and focus to be returned correctly.
      if (!nextOpen && eventDetails.trigger == null) {
        eventDetails.trigger = activeTriggerElement ?? undefined;
      }

      onOpenChange?.(nextOpen, eventDetails as MenuRoot.ChangeEventDetails);

      if (eventDetails.isCanceled) {
        return;
      }

      store.state.floatingRootContext.dispatchOpenChange(nextOpen, eventDetails);

      const nativeEvent = eventDetails.event as Event;
      if (
        nextOpen === false &&
        nativeEvent?.type === 'click' &&
        (nativeEvent as PointerEvent).pointerType === 'touch' &&
        !allowTouchToCloseRef.current
      ) {
        return;
      }

      // Prevent the menu from closing on mobile devices that have a delayed click event.
      // In some cases the menu, when tapped, will fire the focus event first and then the click event.
      // Without this guard, the menu will close immediately after opening.
      if (nextOpen && reason === REASONS.triggerFocus) {
        allowTouchToCloseRef.current = false;
        allowTouchToCloseTimeout.start(300, () => {
          allowTouchToCloseRef.current = true;
        });
      } else {
        allowTouchToCloseRef.current = true;
        allowTouchToCloseTimeout.clear();
      }

      // Keyboard and assistive-technology activations produce `detail === 0` clicks;
      // mouse-gesture clicks (including the synthesized drag-release click from
      // `useMenuItemCommonProps`) carry `detail >= 1`.
      const isKeyboardClick =
        (reason === REASONS.triggerPress || reason === REASONS.itemPress) &&
        (nativeEvent as MouseEvent).detail === 0;
      const isDismissClose = !nextOpen && (reason === REASONS.escapeKey || reason == null);

      openEventRef.current = eventDetails.event;

      const popupOpenState = createPopupOpenState(
        store.state,
        nextOpen,
        eventDetails.trigger,
        shouldPreventUnmountOnClose(),
      ) as ReturnType<typeof createPopupOpenState> & {
        openChangeReason: MenuRoot.ChangeEventReason;
        instantType: MenuStoreState<Payload>['instantType'];
      };

      popupOpenState.openChangeReason = reason;

      if (
        parent.type === 'menubar' &&
        (reason === REASONS.triggerFocus ||
          reason === REASONS.focusOut ||
          reason === REASONS.triggerHover ||
          reason === REASONS.listNavigation ||
          reason === REASONS.siblingOpen)
      ) {
        popupOpenState.instantType = 'group';
      } else if (isKeyboardClick || isDismissClose) {
        popupOpenState.instantType = isKeyboardClick ? 'click' : 'dismiss';
      } else {
        popupOpenState.instantType = undefined;
      }

      // `instantType` must land in the same update that mounts the popup subtree: in React 17
      // legacy mode this `update` can flush synchronously, and a separate `instantType` write
      // after it would come too late for an initially open submenu seeding its own store from
      // this one during that flush.
      store.update(popupOpenState);
    },
  );

  const floatingRootContext = useSyncedFloatingRootContext({
    popupStore: store,
    floatingRootContext: store.state.floatingRootContext,
    floatingId,
    nested: floatingParentNodeIdFromContext != null,
    onOpenChange: setOpen,
  });

  const floatingEvents = floatingRootContext.context.events;

  // Registered in a layout effect (not a passive one) so `setOpen` emits from imperative
  // `MenuHandle.open()` calls made in the same commit this root mounts — e.g. from another layout
  // effect during a route-transition handoff — are received instead of being silently dropped.
  useIsoLayoutEffect(() => {
    const handleSetOpenEvent = ({
      open: nextOpen,
      eventDetails,
    }: {
      open: boolean;
      eventDetails: MenuRoot.ChangeEventDetails;
    }) => setOpen(nextOpen, eventDetails);

    floatingEvents.on('setOpen', handleSetOpenEvent);

    return () => {
      floatingEvents?.off('setOpen', handleSetOpenEvent);
    };
  }, [floatingEvents, setOpen]);

  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
  }, [store]);

  React.useImperativeHandle(
    actionsRef,
    () => ({ unmount: forceUnmount, close: handleImperativeClose }),
    [forceUnmount, handleImperativeClose],
  );

  let ctx: ContextMenuRootContext | undefined;
  if (parent.type === 'context-menu') {
    ctx = parent.context;
  }

  React.useImperativeHandle<HTMLElement | null, HTMLElement | null>(
    ctx?.positionerRef,
    () => positionerElement,
    [positionerElement],
  );

  React.useImperativeHandle(ctx?.actionsRef, () => ({ setOpen }), [setOpen]);

  const dismiss = useDismiss(floatingRootContext, {
    enabled: !disabled,
    bubbles: { escapeKey: closeParentOnEsc && parent.type === 'menu' },
    outsidePress() {
      if (parent.type !== 'context-menu' || openEventRef.current?.type === 'contextmenu') {
        return true;
      }

      return allowOutsidePressDismissalRef.current;
    },
    externalTree: nested ? floatingTreeRoot : undefined,
  });

  const direction = useDirection();

  const setActiveIndex = React.useCallback(
    (index: number | null) => {
      if (store.select('activeIndex') === index) {
        return;
      }
      store.set('activeIndex', index);
    },
    [store],
  );

  const listNavigation = useListNavigation(floatingRootContext, {
    enabled: !disabled,
    listRef: store.context.itemDomElements,
    activeIndex,
    nested: parent.type !== undefined,
    loopFocus,
    orientation,
    parentOrientation: parent.type === 'menubar' ? parent.context.orientation : undefined,
    rtl: direction === 'rtl',
    disabledIndices: EMPTY_ARRAY,
    onNavigate: setActiveIndex,
    openOnArrowKeyDown: parent.type !== 'context-menu',
    externalTree: nested ? floatingTreeRoot : undefined,
    focusItemOnHover: highlightItemOnHover,
  });

  const onTyping = React.useCallback(
    (nextTyping: boolean) => {
      store.context.typingRef.current = nextTyping;
    },
    [store],
  );

  const typeahead = useTypeahead(floatingRootContext, {
    enabled: !disabled,
    listRef: store.context.itemLabels,
    elementsRef: store.context.itemDomElements,
    activeIndex,
    resetMs: TYPEAHEAD_RESET_MS,
    onMatch: (index) => {
      if (open && index !== activeIndex) {
        store.set('activeIndex', index);
      }
    },
    onTyping,
  });

  const activeTriggerProps = React.useMemo(() => {
    const mergedProps = mergeProps(
      typeahead.reference,
      listNavigation.reference,
      dismiss.reference,
      {
        onMouseMove() {
          store.set('allowMouseEnter', true);
        },
      },
      interactionTypeProps,
    );

    mergedProps['aria-haspopup'] = 'menu';
    mergedProps['aria-expanded'] = open;

    return mergedProps;
  }, [
    store,
    typeahead.reference,
    listNavigation.reference,
    dismiss.reference,
    interactionTypeProps,
    open,
  ]);

  const inactiveTriggerProps = React.useMemo(() => {
    const mergedProps = mergeProps(listNavigation.trigger, dismiss.trigger, interactionTypeProps);

    mergedProps['aria-haspopup'] = 'menu';
    mergedProps['aria-expanded'] = false;

    return mergedProps;
  }, [listNavigation.trigger, dismiss.trigger, interactionTypeProps]);

  // The initial render has no store subscribers yet. Seed these props before triggers render so
  // the synchronization effect below doesn't make every trigger render twice in the first commit.
  useRefWithInit(() => {
    store.update({ inactiveTriggerProps });
    return null;
  });

  const popupProps = React.useMemo(
    () =>
      mergeProps(
        FOCUSABLE_POPUP_PROPS,
        {
          id: floatingId,
          role: 'menu' as const,
          // `menu` is implicitly vertical, so only the non-default value needs to be rendered.
          'aria-orientation': orientation === 'horizontal' ? 'horizontal' : undefined,
          'aria-labelledby': activeTriggerElement?.id,
          onMouseMove() {
            store.set('allowMouseEnter', true);
            if (parent.type === 'menu') {
              store.set('hoverEnabled', false);
            }
          },
          onClick() {
            if (store.select('hoverEnabled')) {
              store.set('hoverEnabled', false);
            }
          },
          onKeyDown(event: React.KeyboardEvent) {
            // The Menubar's CompositeRoot captures keyboard events via
            // event delegation. This works well when Menu.Root is nested inside Menubar,
            // but with detached triggers we need to manually forward the event to the CompositeRoot.
            const relay = store.select('keyboardEventRelay');
            if (relay && !event.isPropagationStopped()) {
              relay(event);
            }
          },
        },
        typeahead.floating,
        listNavigation.floating,
        dismiss.floating,
      ),
    [
      activeTriggerElement,
      floatingId,
      orientation,
      parent.type,
      store,
      typeahead.floating,
      listNavigation.floating,
      dismiss.floating,
    ],
  );

  const itemProps = listNavigation.item ?? EMPTY_OBJECT;

  usePopupInteractionProps(store, {
    floatingRootContext,
    activeTriggerProps,
    inactiveTriggerProps,
    popupProps,
    itemProps,
  });

  const context: MenuRootContext<Payload> = React.useMemo(
    () => ({
      store,
      parent: parentFromContext,
    }),
    [store, parentFromContext],
  );

  const content = (
    <MenuRootContext.Provider value={context as MenuRootContext}>
      {handle && <PopupHandleAttachment handle={handle} store={store} />}
      {typeof children === 'function' ? children({ payload }) : children}
    </MenuRootContext.Provider>
  );

  if (parent.type === undefined || parent.type === 'context-menu') {
    // set up a FloatingTree to provide the context to nested menus
    return <FloatingTree externalTree={floatingTreeRoot}>{content}</FloatingTree>;
  }

  return content;
});
```

### export interface MenuRootProps<Payload = unknown> 

properties:
1. defaultOpen, asi jestli ve výchozí stavu je otevřený
2. loopFocus, asi zatim nedulezity
3. highlightItemOnHover, nedulezity
4. modal, 
5. onOpenChange
6. onOpenChangeComplete
7. open - důležitý kontroluje jestli menu je open
8. orientation
9. disabled
10. closeParentOnEsc
11. actionsRef
12. triggerId
13. defaultTriggerId
14. handle
15. children


## useContextMenuRootContext

pomocné odkazy:
1. definice: https://github.com/mui/base-ui/blob/master/packages/react/src/context-menu/root/ContextMenuRootContext.ts#L25
2. kde se využívá: https://github.com/mui/base-ui/blob/4d92faa1a4da6a5fe66a6194401470974fc2f8fe/packages/react/src/context-menu/root/ContextMenuRoot.tsx#L43-L51

## useMenuRootContext

## useMenubarContext

## useMenuSubmenuRootContext