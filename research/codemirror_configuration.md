# Codemirror configuration

parametry:
1. readonly statusTemplate: SlotStatus[] = []
      * [SlotStatus](./codemirror_facet_provider.md#dynamicslot---metoda)
2. readonly compartments: Map<Compartment, Extension>
3. readonly dynamicSlots: DynamicSlot[]
      * [DynamicSlot](./codemirror_facet_provider.md#dynamicslot---metoda)
4. readonly address: {[id: number]: number}
      * adresy, kde jsou uložený Outputy FacetProviderů/Facet
5. readonly staticValues: readonly any[]
6. readonly facets: {[id: number]: readonly FacetProvider<any>[]}

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

## (KONSTRUKTOR) static resolve(base: Extension, compartments: Map<Compartment, Extension>, oldState?: EditorState), metoda

example:
```
Configuration.resolve(config.extensions || [], new Map)
```
kde například, confi.extensions je asi pole FacetProviderů

```
static resolve(base: Extension, compartments: Map<Compartment, Extension>, oldState?: EditorState) {
    let fields: StateField<any>[] = []
    let facets: {[id: number]: FacetProvider<any>[]} = Object.create(null)
    let newCompartments = new Map<Compartment, Extension>()

    for (let ext of flatten(base, compartments, newCompartments)) {
      if (ext instanceof StateField) fields.push(ext)
      else (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext)
    }

    let address: {[id: number]: number} = Object.create(null)
    let staticValues: any[] = []
    let dynamicSlots: ((address: {[id: number]: number}) => DynamicSlot)[] = []

    for (let field of fields) {
      address[field.id] = dynamicSlots.length << 1
      dynamicSlots.push(a => field.slot(a))
    }

    let oldFacets = oldState?.config.facets
    for (let id in facets) {
      let providers = facets[id], facet = providers[0].facet
      let oldProviders = oldFacets && oldFacets[id] || []
      if (providers.every(p => p.type == Provider.Static)) {
        address[facet.id] = (staticValues.length << 1) | 1
        if (sameArray(oldProviders, providers)) {
          staticValues.push(oldState!.facet(facet))
        } else {
          let value = facet.combine(providers.map(p => p.value))
          staticValues.push(oldState && facet.compare(value, oldState.facet(facet)) ? oldState.facet(facet) : value)
        }
      } else {
        for (let p of providers) {
          if (p.type == Provider.Static) {
            address[p.id] = (staticValues.length << 1) | 1
            staticValues.push(p.value)
          } else {
            address[p.id] = dynamicSlots.length << 1
            dynamicSlots.push(a => p.dynamicSlot(a))
          }
        }
        address[facet.id] = dynamicSlots.length << 1
        dynamicSlots.push(a => dynamicFacetSlot(a, facet, providers))
      }
    }

    let dynamic = dynamicSlots.map(f => f(address))
    return new Configuration(base, newCompartments, dynamic, address, staticValues, facets)
  }
```

# Compartment

```
export class Compartment {
  of(ext: Extension): Extension { return new CompartmentInstance(this, ext) } //

  reconfigure(content: Extension): StateEffect<unknown> {
    return Compartment.reconfigure.of({compartment: this, extension: content})
  } //

  get(state: EditorState): Extension | undefined {
    return state.config.compartments.get(this)
  } //

  static reconfigure: StateEffectType<{compartment: Compartment, extension: Extension}> //
}
```

# CompartmentInstance


```
class CompartmentInstance {
  constructor(readonly compartment: Compartment, readonly inner: Extension) {}
  get extension(): Extension { return this }
}
```