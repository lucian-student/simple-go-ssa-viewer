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
    finish(sel) {
      return /&/.test(sel) ? sel.replace(/&\w*/, m => {
        if (m == "&") return main
        if (!scopes || !scopes[m]) throw new RangeError(`Unsupported selector: ${m}`)
        return scopes[m]
      }) : main + " " + sel
    }
  })
}
```

```
static theme(spec: {[selector: string]: StyleSpec}, options?: {dark?: boolean}): Extension { //
    let prefix = StyleModule.newName() //vygeneruje náhodný prefix
    let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))]// dva FacetProvidery
    if (options && options.dark) result.push(darkTheme.of(true))  // přihodí se facet provider darkTheme
    return result // nakonec budu mít 2 facet providery, nebo 3 facet providery pokud je DarkMode enabled
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

## measure

## themeClasses

## updateAttrs

## mountStyles

## readMeasured

## plugin

## 