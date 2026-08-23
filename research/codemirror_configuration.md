# Codemirror configuration


## readonly statusTemplate: SlotStatus[] = []

```
 while (this.statusTemplate.length < dynamicSlots.length)
      this.statusTemplate.push(SlotStatus.Unresolved)
```

## readonly base: Extension

## readonly compartments: Map<Compartment, Extension>

## readonly dynamicSlots: DynamicSlot[]

## readonly address: {[id: number]: number}

## readonly staticValues: readonly any[]

## readonly facets: {[id: number]: readonly FacetProvider<any>[]}

## staticFacet<Output>(facet: Facet<any, Output>) , metoda

## static resolve(base: Extension, compartments: Map<Compartment, Extension>, oldState?: EditorState), metoda

