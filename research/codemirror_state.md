# EditorStateConfig 

* doc -> výchozí text editoru
* selection: EditorSelection 

# EditorState

Extensions

## create - konstruktor

```
export interface EditorStateConfig {
  doc?: string | Text
  selection?: EditorSelection | {anchor: number, head?: number}
  extensions?: Extension
}
```

```
static create(config: EditorStateConfig = {}): EditorState {
    let configuration = Configuration.resolve(config.extensions || [], new Map)
    let doc: Text = config.doc instanceof Text ? config.doc
      : Text.of((config.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit))
    let selection = !config.selection ? EditorSelection.single(0)
      : config.selection instanceof EditorSelection ? config.selection
      : EditorSelection.single(config.selection.anchor, config.selection.head)
    checkSelection(selection, doc.length)
    if (!configuration.staticFacet(allowMultipleSelections)) selection = selection.asSingle()
    return new EditorState(configuration, doc, selection, configuration.dynamicSlots.map(() => null),
                           (state, slot) => slot.create(state), null)
  }
```