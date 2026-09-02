# StateField

parametry:
* public provides: Extension | undefined = undefined
* readonly id: number
* private createF: (state: EditorState) => Value
* private updateF: (value: Value, tr: Transaction) => Value 
    * updatovací hodnota pro dynmaickou hodnotu
* private compareF: (a: Value, b: Value) => boolean
* readonly spec: StateFieldSpec<Value>

poznamky:
* je Extension, jelikož má getter, tak splňuje ten interface
* 

## define 

static define<Value>(config: StateFieldSpec<Value>): StateField<Value>

## create

create(state: EditorState)

## slot

slot(addresses: {[id: number]: number}): DynamicSlot

zajímavé odkazy:
* [Trochu pochopeni adresy statická vs dynamická](./codermirror_facet.md#adresy-getaddr)

Example dynamic slotu:
```
slot(addresses: {[id: number]: number}): DynamicSlot {
    let idx = addresses[this.id] >> 1 // jelikož se to dělí dvěma, tak si myslím, že to bude index do pole dvojic
    //takže adresa je index do nějakýho pole asi???
    //takže addresses obsahuje indexy do pole state.values!!!
    return {
      create: (state:EditorState) => {
        state.values[idx] = this.create(state)//to asi vytváří dynamickou hodnotu
        return SlotStatus.Changed
      },
      update: (state, tr) => {
        let oldVal = state.values[idx]
        let value = this.updateF(oldVal, tr)
        if (this.compareF(oldVal, value)) return 0
        state.values[idx] = value
        return SlotStatus.Changed
      },
      reconfigure: (state, oldState) => {
        let init = state.facet(initField), oldInit = oldState.facet(initField), reInit
        if ((reInit = init.find(i => i.field == this)) && reInit != oldInit.find(i => i.field == this)) {
          state.values[idx] = reInit.create(state)
          return SlotStatus.Changed
        }
        if (oldState.config.address[this.id] != null) {
          state.values[idx] = oldState.field(this)
          return 0
        }
        state.values[idx] = this.create(state)
        return SlotStatus.Changed
      }
    }
  }
```

## init

init(create: (state: EditorState) => Value): Extension

## extension

get extension(): Extension