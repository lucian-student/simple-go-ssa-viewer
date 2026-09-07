# interface EditorViewConfig

* state: Objekt se stavem editoru
* parent: html element, kde je apendnutej editor
* root: ve výchozím stavu je to hodnota globalní javascriptové proměnné: "document"
* scrollTo: (zatím jsem to neprozkoumal)
* dispatchTransactions: (zatím jsem neprozkoumal) (trs: readonly Transaction[], view: EditorView) => void
* dispatch: podle komentáře deprecated a má se ase použít dispatchTransactions

# export const enum UpdateState


# export class EditorView

properties:
1. dispatchTransactions: (trs: readonly Transaction[], view: EditorView) => void
2. _root: DocumentOrShadowRoot
3. readonly dom: HTMLElement
4. readonly scrollDOM: HTMLElement
5. readonly contentDOM: HTMLElement
6. private announceDOM: HTMLElement
7. declare inputState: InputState
8. public viewState: ViewState
9. public docView: DocView
10. private plugins: PluginInstance[] = []
11. private pluginMap: Map<ViewPlugin<any, any>, PluginInstance | null> = new Map
12. private editorAttrs: Attrs = {}
13. private contentAttrs: Attrs = {}
14. declare private styleModules: readonly StyleModule[]
15. private bidiCache: CachedOrder[] = []
16. private destroyed = false;
17. updateState: UpdateState = UpdateState.Updating
18. observer: DOMObserver
19. measureScheduled: number = -1
20. measureRequests: MeasureRequest<any>[] = []

## constructor

```
<div>
  <div class="cm-announced"></div>//asi je tam kvůli accesibilitě
  <div class="cm-scroller>//tady je asi editor
    <div class="cm-gutters"></div> // "gutter" je sekce nalevo od textu, obsahuje například číslo řádky
    <div contenteditable="true"></div>
    // z toho, co jsem pochopil, když jsem si to trochu vyzkoušel, tak to automaticky vytváří div pro řádku a pokud je prázdná, tak tam hodí <br/>
  </div>
</div>
```

## static domEventHandlers(handlers: DOMEventHandlers<any>): Extension

```
export interface DOMEventMap extends HTMLElementEventMap {
  [other: string]: any
}

export type DOMEventHandlers<This> = {
  [event in keyof DOMEventMap]?: (this: This, event: DOMEventMap[event], view: EditorView) => boolean | void
}

static domEventHandlers(handlers: DOMEventHandlers<any>): Extension {
    return ViewPlugin.define(() => ({}), {eventHandlers: handlers})
}
```

## theme

https://code.haverbeke.berlin/marijn/style-mod

```
export type StyleSpec = {
  [propOrSelector: string]: string | number | StyleSpec | null
}
```

```
export const theme = Facet.define<string, string>({combine: strs => strs.join(" ")})
```

```
export const styleModule = Facet.define<StyleModule>()
```

```
export class StyleModule {
  constructor(spec: {[selector: string]: StyleSpec}, options?: {
    finish?(sel: string): string
  })
  getRules(): string
  static mount(
    root: Document | ShadowRoot | DocumentOrShadowRoot,
    module: StyleModule | ReadonlyArray<StyleModule>,
    options?: {nonce?: string}
  ): void
  static newName(): string
}
```

```
export function buildTheme(main: string, spec: {[name: string]: StyleSpec}, scopes?: {[name: string]: string}) {
  return new StyleModule(spec, {
    finish(sel) { //zkontroluje jestli sel obsahuje "&" w=[a-zA-Z0-9_].
      return /&/.test(sel) ? sel.replace(/&\w*/, m => {
        if (m == "&") return main // když je to &, tak je to replaced s main
        if (!scopes || !scopes[m]) throw new RangeError(`Unsupported selector: ${m}`) //
        return scopes[m]
      }) : main + " " + sel
    }
  })
}
```

```
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

//třeba to asi vytvoří StyleModule s css:

."nejaky random id"{
  height: value;
  ....
}

static theme(spec: {[selector: string]: StyleSpec}, options?: {dark?: boolean}): Extension { //
    let prefix = StyleModule.newName() //vygeneruje náhodný prefix
    let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))]// dva FacetProvidery
    if (options && options.dark) result.push(darkTheme.of(true))  // přihodí se facet provider darkTheme
    return result // nakonec budu mít 2 facet providery, nebo 3 facet providery pokud je DarkMode enabled
}
```

```
export class StyleModule {
  constructor(spec, options) {
    this.rules = []
    let {finish} = options || {}

    function splitSelector(selector) {
      return /^@/.test(selector) ? [selector] : selector.split(/,\s*/)
    }//když začiná na "^@" asi kdyz zaciná @, tak to muze byt třeba @keyframes třenas string ",   " to znamena, že selectory jsou oddělené pomocí čarky
    //

    function render(selectors:string[], spec:StyleSpec, target: string[], isKeyframes:undefined|bool) {
      //selectors je asi Array<string>, 
      //spec {[selector: string]: StyleSpec}
      //
      let local = [] 
      let isAt = /^@(\w+)\b/.exec(selectors[0])
      let keyframes = isAt && isAt[1] == "keyframes" // jestli selector je keyframes, to znamená animace
      ///^@(\w+)\b/ regex ktery matchne @keyframes třeba slovo začinající na @
      if (isAt && spec == null) return target.push(selectors[0] + ";")// asi vratí třeba @keyframes; asi empty rule body
      for (let prop in spec) {
        let value = spec[prop]
        if (/&/.test(prop)) {
          render(
                 prop.split(/,\s*/) // rozdělí podle čárky .card, .nav -> čárka je jako "OR" v CSS
                 .map(part => selectors.map(sel => part.replace(/&/, sel)))//když part = "&:hover" a sel bude ".button", tak výsledek ".button:hover"
                 .reduce((a, b) => a.concat(b)), z Array<Array<string>> udela Array<string>
                 value, //hodnota dane property
                 target
                 )
        } else if (value && typeof value == "object") {
          if (!isAt) throw new RangeError("The value of a property (" + prop + ") should be a primitive value.")
          render(splitSelector(prop), value, local, keyframes)
        } else if (value != null) {
          local.push(
            prop.replace(/_.*/, "").replace(/[A-Z]/g, l => "-" + l.toLowerCase()) + ": " + value + ";"
          )
        }
      }
      if (local.length || keyframes) {
        target.push(
          (
          finish && 
          !isAt && 
          !isKeyframes ? selectors.map(finish) : selectors)
          .join(", ") + " {" + local.join(" ") + "}")
      }//vytvoří CSS blok pravidel s  selectory
    }

    for (let prop in spec) render(splitSelector(prop), spec[prop], this.rules)

    //asi css pravidla jelikož css pravidlo je množina deklarací 
  }
```

## export const updateListener = Facet.define<(update: ViewUpdate) => void>()



## dispatch - hlavní způsob asi jak se edituje stav editoru

```
dispatch(...input: (Transaction | readonly Transaction[] | TransactionSpec)[]) {
    let trs = input.length == 1 && input[0] instanceof Transaction ? input as readonly Transaction[]
      : input.length == 1 && Array.isArray(input[0]) ? input[0] as readonly Transaction[]
      : [this.state.update(...input as TransactionSpec[])]
    this.dispatchTransactions(trs, this)
}
```


## update

## setState

## updatePlugins

## measure(Neprozkoumáné aktuálně)

```
measure(flush = true) {
    if (this.destroyed) return
    if (this.measureScheduled > -1) this.win.cancelAnimationFrame(this.measureScheduled) //nevim, co to dělá
    if (this.observer.delayedAndroidKey) {
      this.measureScheduled = -1
      this.requestMeasure()
      return
    }
    this.measureScheduled = 0 // Prevent requestMeasure calls from scheduling another animation frame

    if (flush) this.observer.forceFlush()

    let updated: ViewUpdate | null = null

    let scroll = this.viewState.scrollParent
    let scrollOffset = this.viewState.getScrollOffset()
    let {scrollAnchorPos, scrollAnchorHeight, scaleY: scrollScale} = this.viewState
    if (Math.abs(scrollOffset - this.viewState.scrollOffset) > 1) scrollAnchorHeight = -1
    this.viewState.scrollAnchorHeight = -1

    try {
      for (let i = 0;; i++) {
        if (scrollAnchorHeight < 0) {
          if (isScrolledToBottom(scroll || this.win)) {
            scrollAnchorPos = -1
            scrollAnchorHeight = this.viewState.heightMap.height / this.viewState.scaleY
          } else {
            let block = this.viewState.scrollAnchorAt(scrollOffset)
            scrollAnchorPos = block.from
            scrollAnchorHeight = block.top
          }
          scrollScale = this.viewState.scaleY
        }
        this.updateState = UpdateState.Measuring
        let changed = this.viewState.measure()
        if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null) break
        if (i > 5) {
          console.warn(this.measureRequests.length
            ? "Measure loop restarted more than 5 times"
            : "Viewport failed to stabilize")
          break
        }
        let measuring: MeasureRequest<any>[] = []
        // Only run measure requests in this cycle when the viewport didn't change
        if (!(changed & UpdateFlag.Viewport))
          [this.measureRequests, measuring] = [measuring, this.measureRequests]
        let measured = measuring.map(m => {
          try { return m.read(this) }
          catch(e) { logException(this.state, e); return BadMeasure }
        })
        let update = ViewUpdate.create(this, this.state, []), redrawn = false
        update.flags |= changed
        if (!updated) updated = update
        else updated.flags |= changed
        this.updateState = UpdateState.Updating
        if (!update.empty) {
          this.updatePlugins(update)
          this.inputState.update(update)
          this.updateAttrs()
          redrawn = this.docView.update(update)
          if (redrawn) this.docViewUpdate()
        }
        for (let i = 0; i < measuring.length; i++) if (measured[i] != BadMeasure) {
          try {
            let m = measuring[i]
            if (m.write) m.write(measured[i], this)
          } catch(e) { logException(this.state, e) }
        }
        if (redrawn) this.docView.updateSelection(true)
        if (!update.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight) {
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget)
              this.viewState.scrollTarget = null
              scrollAnchorHeight = -1
              continue
            } else {
              let newAnchorHeight = scrollAnchorPos < 0 ? this.viewState.heightMap.height :
                this.viewState.lineBlockAt(scrollAnchorPos).top
              let diff = (newAnchorHeight / this.viewState.scaleY) - (scrollAnchorHeight / scrollScale)
              if ((diff > 1 || diff < -1) &&
                  !(browser.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) &&
                  (scroll == this.scrollDOM || this.hasFocus ||
                   Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                scrollOffset = scrollOffset + diff
                if (!scroll) this.win.scrollBy(0, diff)
                else if (scrollAnchorPos < 0) scroll.scrollTop = scroll.scrollHeight
                else scroll.scrollTop += diff
                scrollAnchorHeight = -1
                continue
              }
            }
          }
          break
        }
      }
    } finally {
      this.updateState = UpdateState.Idle
      this.measureScheduled = -1
    }
}
```

## themeClasses

## updateAttrs

## mountStyles

## readMeasured

```
private readMeasured() {
    if (this.updateState == UpdateState.Updating)
      throw new Error("Reading the editor layout isn't allowed during an update")
    if (this.updateState == UpdateState.Idle && this.measureScheduled > -1) this.measure(false)
}
```

## plugin

## posAtCoords

```
posAtCoords(coords: {x: number, y: number}, precise = true): number | null {
    this.readMeasured()
    let found = posAtCoords(this, coords, precise)
    return found && found.pos
  }
```

# elementAtHeight

```
elementAtHeight(height: number) {
    this.readMeasured()
    return this.viewState.elementAtHeight(height)
}
```