# Code mirror facet provider

```
type Slot<T> = FacetReader<T> | StateField<T> | "doc" | "selection"
```

## dependencies: readonly Slot<any>[] -> argument

## facet: Facet<input,any> -> argument

## type: Provider -> argument

const enum Provider { Static, Single, Multi }

## value: 

```
((state: EditorState) => Input) | 
((state: EditorState) => readonly Input[]) | 
Input 
```


## dynamicSlot -> metoda

interface DynamicSlot {
  create(state: EditorState): SlotStatus
  update(state: EditorState, tr: Transaction): SlotStatus
  reconfigure(state: EditorState, oldState: EditorState): SlotStatus
}

export const enum SlotStatus {
  Unresolved = 0,
  Changed = 1,
  Computed = 2,
  Computing = 4
}

1. getter se nastaví na this.value(což je slightly sus, jelikož getter má být funkce a this.value může být Input, což asi nemusí být funkce)
  * proto se to castuje na any, podle AI je to tradeof
  * metoda se má udajně volat pouze na provider, který není static
2. 

## 