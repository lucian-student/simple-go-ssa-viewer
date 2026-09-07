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

Poznamka:
* Tato metoda se volá pouze v případě asi, když je provider asi Single/Multi, když není static
  * const enum Provider { Static, Single, Multi }
  * v příapdě, že je asi static, tak this.value není hodnota, kterou asi provider vrací, ale hodntoa, která se vy počítá z stavu Editoru

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