# React code mirror, co presne dela

Výchozi extensiony:
* https://github.com/uiwjs/react-codemirror/blob/990500ad9ae72400272c873df3ae061860ff00c2/core/src/getDefaultExtensions.ts

```
export function useCodeMirror(props: UseCodeMirror) {
  const {
    value,
    selection,
    onChange,
    onStatistics,
    onCreateEditor,
    onUpdate,
    extensions = emptyExtensions,
    autoFocus,
    theme = 'light',
    height = null,
    minHeight = null,
    maxHeight = null,
    width = null,
    minWidth = null,
    maxWidth = null,
    placeholder: placeholderStr = '',
    editable = true,
    readOnly = false,
    indentWithTab: defaultIndentWithTab = true,
    basicSetup: defaultBasicSetup = true,
    root,
    initialState,
  } = props;
  const [container, setContainer] = useState<HTMLDivElement | null>();
  const [view, setView] = useState<EditorView>();
  const [state, setState] = useState<EditorState>();//takže v tomto příapdě je typ EditorState | undefined a původní hodnota je undefined
  const typingLatch = useState<{ current: TimeoutLatch | null }>(() => ({ current: null }))[0];//hack využivá useState, aby persistnul variablu přes více renderu
  const pendingUpdate = useState<{ current: (() => void) | null }>(() => ({ current: null }))[0];//stejný hack jako předchozí řádek
  const defaultThemeOption = getDimensionTheme(height, minHeight, maxHeight, width, minWidth, maxWidth);//vrati se 3 FacetProvidery
  const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
    if (
      vu.docChanged &&
      typeof onChange === 'function' &&
      // Fix echoing of the remote changes:
      // If transaction is market as remote we don't have to call `onChange` handler again
      !vu.transactions.some((tr) => tr.annotation(ExternalChange))
    ) {
      if (typingLatch.current) {
        typingLatch.current.reset();
      } else { // tady ten branch se asi malo, kdy vykoná
        typingLatch.current = new TimeoutLatch(() => {
          if (pendingUpdate.current) {
            const forceUpdate = pendingUpdate.current;
            pendingUpdate.current = null;
            forceUpdate();
          }
          typingLatch.current = null;
        }, TYPING_TIMOUT);
        getScheduler().add(typingLatch.current);
      }
      // obecně bych si tipnul, že to je hlavní logika která se vykoná a předchozí ify se asi moc často vykonávat nebudou
      const doc = vu.state.doc;
      const value = doc.toString();
      onChange(value, vu);//onChange callback dostane aktuální obsah editoru a VieuwUpdate, to mě asi nezajímá pro úpravu tooltipu
    }
    onStatistics && onStatistics(getStatistics(vu));//to mě asi taky nezajímá pro úpravu tooltipu
  });

  const defaultExtensions = getDefaultExtensions({
    theme,
    editable,
    readOnly,
    placeholder: placeholderStr,
    indentWithTab: defaultIndentWithTab,
    basicSetup: defaultBasicSetup,
  });//vratí Array<FacetProvider> asi i když to nazývají spíš Array<Extension>

  let getExtensions = [
    updateListener, // Facet.define<(update: ViewUpdate) => void>().of, takže facet provider
    ...(defaultThemeOption ? [defaultThemeOption] : []),
    scrollerTheme,
    ...defaultExtensions,
  ];

  if (onUpdate && typeof onUpdate === 'function') {
    getExtensions.push(EditorView.updateListener.of(onUpdate));
  }
  getExtensions = getExtensions.concat(extensions);//takže v podstatě +-, to je asi seznam FacetProviderů

  useLayoutEffect(() => {
    if (container && !state) {
      const config = {
        doc: value,
        selection,
        extensions: getExtensions,
      };
      const stateCurrent = initialState
        ? EditorState.fromJSON(initialState.json, config, initialState.fields)
        : EditorState.create(config);// spíš se v mojem případě stane nejdřív EditorState.create(config)
      setState(stateCurrent);
      if (!view) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container,
          root,
        });
        setView(viewCurrent);
        onCreateEditor && onCreateEditor(viewCurrent, stateCurrent);
      }
    }
    return () => {
      if (view) {
        setState(undefined);
        setView(undefined);
      }
    };
  }, [container, state]);// tenhle useLayoutEffect se volá před tím než se browser renderuje, takže udajně předchaází flickeringu, kdyby se po renderu něco updatnulo, tak to by mohlo změnit vzhled websity a působilo by to flickering

  useEffect(() => {
    if (props.container) {
      setContainer(props.container);
    }
  }, [props.container]);//nastaví container, nevim jestli je to k něčemu

  useEffect(
    () => () => {
      if (view) {
        view.destroy();
        setView(undefined);
      }
      if (typingLatch.current) {
        typingLatch.current.cancel();
        typingLatch.current = null;
      }
    },
    [view],
  );//cleanup useEffect, nevim proč ten přechozí, taky trochu dělá cleanup

  useEffect(() => {
    if (autoFocus && view) {
      view.focus();
    }
  }, [autoFocus, view]);//okey asi to zaostří na view

  useEffect(() => {
    if (view) {
      view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) });//
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme,
    extensions,
    height,
    minHeight,
    maxHeight,
    width,
    minWidth,
    maxWidth,
    placeholderStr,
    editable,
    readOnly,
    defaultIndentWithTab,
    defaultBasicSetup,
    onChange,
    onUpdate,
  ]);//

  useEffect(() => {
    if (value === undefined) {
      return;
    }
    const currentValue = view ? view.state.doc.toString() : '';
    if (view && value !== currentValue) {
      const isTyping = typingLatch.current && !typingLatch.current.isDone;

      const forceUpdate = () => {
        if (view && value !== view.state.doc.toString()) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.toString().length, insert: value || '' },
            annotations: [ExternalChange.of(true)],
          });
        }
      };

      if (!isTyping) {
        forceUpdate();
      } else {
        pendingUpdate.current = forceUpdate;
      }
    }
  }, [value, view]);//useEffect, který v přpadě změny "value" zmení obsah editoru, aby editor byl efektivní, tak value by se neměla měnit

  return { state, setState, view, setView, container, setContainer };
}
```

## TimeoutLatch

```
export class TimeoutLatch {
  private timeLeftMS: number;
  private timeoutMS: number;
  private isCancelled = false;
  private isTimeExhausted = false;
  private callbacks: Function[] = [];

  constructor(callback: Function, timeoutMS: number) {
    this.timeLeftMS = timeoutMS;
    this.timeoutMS = timeoutMS;
    this.callbacks.push(callback);
  }

  tick(): void {
    if (!this.isCancelled && !this.isTimeExhausted) {
      this.timeLeftMS--;
      if (this.timeLeftMS <= 0) {
        this.isTimeExhausted = true;
        const callbacks = this.callbacks.slice();
        this.callbacks.length = 0;
        callbacks.forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error('TimeoutLatch callback error:', error);
          }
        });
      }
    }
  }

  cancel(): void {
    this.isCancelled = true;
    this.callbacks.length = 0;
  }

  reset(): void {
    this.timeLeftMS = this.timeoutMS;
    this.isCancelled = false;
    this.isTimeExhausted = false;
  }

  get isDone(): boolean {
    return this.isCancelled || this.isTimeExhausted;
  }
}


class Scheduler {
  private interval: NodeJS.Timeout | null = null;
  private latches = new Set<TimeoutLatch>();

  add(latch: TimeoutLatch): void {
    this.latches.add(latch);
    this.start();
  }

  remove(latch: TimeoutLatch): void {
    this.latches.delete(latch);
    if (this.latches.size === 0) {
      this.stop();
    }
  }

  private start(): void {
    if (this.interval === null) {
      this.interval = setInterval(() => {
        this.latches.forEach((latch) => {
          latch.tick();
          if (latch.isDone) {
            this.remove(latch);
          }
        });
      }, 1);//asi dost brutalně neefektivní, když se volá tenhle callback každou milisekundu[Neefektivní]
    }
  }

  private stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

let globalScheduler: Scheduler | null = null;

export const getScheduler = (): Scheduler => {
  if (typeof window === 'undefined') {
    return new Scheduler();
  }
  if (!globalScheduler) {
    globalScheduler = new Scheduler();
  }
  return globalScheduler;
};fdfddsdsdsdfesdsdsds
```

## getDimensionTheme



```
export const scrollerTheme = EditorView.theme({
  '& .cm-scroller': {
    height: '100% !important',
  },
});

let lastDimensionKey: string | null = null;
let lastDimensionTheme: Extension | null = null;

export function getDimensionTheme(
  height: string | null, // 
  minHeight: string | null, //
  maxHeight: string | null, //
  width: string | null, //
  minWidth: string | null, //
  maxWidth: string | null, //
): Extension | null {
  if (!height && !minHeight && !maxHeight && !width && !minWidth && !maxWidth) { // ve výchozím stavu editoru, tak to vrací null, jelikož všechny parametry jsou null
    return null;
  }

  const cacheKey = JSON.stringify({ height, minHeight, maxHeight, width, minWidth, maxWidth });
  if (cacheKey === lastDimensionKey) {
    return lastDimensionTheme;
  }

  lastDimensionKey = cacheKey;
  lastDimensionTheme = EditorView.theme({
    '&': {
      height,
      minHeight,
      maxHeight,
      width,
      minWidth,
      maxWidth,
    },
  });
  //export type Extension = {extension: Extension} | readonly Extension[], takže asi z jevně FacetProvider má na sobě property extension
  return lastDimensionTheme; // vrátí 2-3 facet providery v Array, z nějakého důvodu se to považuje za typ Extension
}
```

###

```
export const getDefaultExtensions = (optios: DefaultExtensionsOptions = {}): Extension[] => {
  const {
    indentWithTab: defaultIndentWithTab = true,
    editable = true,
    readOnly = false,
    theme = 'light',
    placeholder: placeholderStr = '',
    basicSetup: defaultBasicSetup = true,
  } = optios;
  const getExtensions: Extension[] = [];
  if (defaultIndentWithTab) {
    getExtensions.unshift(keymap.of([indentWithTab]));//export const keymap = Facet.define<readonly KeyBinding[]>({enables: handleKeyEvents})
  }
  if (defaultBasicSetup) {
    if (typeof defaultBasicSetup === 'boolean') {
      getExtensions.unshift(basicSetup());
    } else {
      getExtensions.unshift(basicSetup(defaultBasicSetup));
    }
  }
  if (placeholderStr) {
    getExtensions.unshift(placeholder(placeholderStr));
  }
  switch (theme) {
    case 'light':
      getExtensions.push(defaultLightThemeOption);
      break;
    case 'dark':
      getExtensions.push(oneDark);
      break;
    case 'none':
      break;
    default:
      getExtensions.push(theme);
      break;
  }
  if (editable === false) {
    getExtensions.push(EditorView.editable.of(false));
  }
  if (readOnly) {
    getExtensions.push(EditorState.readOnly.of(true));
  }

  return [...getExtensions];//vracíto asi FacetProvidery
};
```