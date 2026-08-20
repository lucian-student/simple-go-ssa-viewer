# Configuration


## Theme

```
static theme(spec: {[selector: string]: StyleSpec}, options?: {dark?: boolean}): Extension {
    let prefix = StyleModule.newName()
    let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))]
    if (options && options.dark) result.push(darkTheme.of(true))
    return result
  }
```


### buildTheme

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

Vytvoří: https://github.com/marijnh/style-mod/blob/b81da5faab1717c362e57749752a4f8084ff2201/src/style-mod.js#L15





### styleModule = Facet.define<StyleModule>()



### theme.of, Facet.of

```
of(value: Input): Extension {
    return new FacetProvider<Input>([], this, Provider.Static, value)
  }
```
* jako value se předal  css prefix, nějaký náhodný css prefix

```
class FacetProvider<Input> {
  readonly id = nextID++
  declare extension: Extension // Kludge to convince the type system these count as extensions

constructor(readonly dependencies: readonly Slot<any>[],
              readonly facet: Facet<Input, any>,
              readonly type: Provider,
              readonly value: ((state: EditorState) => Input) | ((state: EditorState) => readonly Input[]) | Input) {}
```


Provider = enum Provider { Static,Single,Multi}


### Facet.define

https://github.com/codemirror/state/blob/9c801279cb83011e6f92af778f4443406e8f1200/src/facet.ts#L43


```
export class Facet<Input, Output = readonly Input[]> implements FacetReader<Output> {
  /// @internal
  readonly id = nextID++
  /// @internal
  readonly default: Output
  /// @internal
  readonly extensions: Extension | undefined

  private constructor(
    /// @internal
    readonly combine: (values: readonly Input[]) => Output,
    /// @internal
    readonly compareInput: (a: Input, b: Input) => boolean,
    /// @internal
    readonly compare: (a: Output, b: Output) => boolean,
    private isStatic: boolean,
    enables: Extension | undefined | ((self: Facet<Input, Output>) => Extension)
  ) {
    this.default = combine([])
    this.extensions = typeof enables == "function" ? enables(this) : enables
  }
```


```

export const theme = Facet.define<string, string>({combine: strs => strs.join(" ")})

static define<Input, Output = readonly Input[]>(config: FacetConfig<Input, Output> = {}) {
    return new Facet<Input, Output>(config.combine || ((a: any) => a) as any,
                                    config.compareInput || ((a, b) => a === b),
                                    config.compare || (!config.combine ? sameArray as any : (a, b) => a === b),
                                    !!config.static,
                                    config.enables)
  }
```

co bude vysledek

```
new Facet(
     strs => strs.join(" "),
     ((a, b) => a === b),
    (a, b) => a === b),
     false,
     undefined
)
```


