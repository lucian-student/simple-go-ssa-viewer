# Codemirror facet

Z komentářů:

```
/// A facet is a labeled value that is associated with an editor
/// state. It takes inputs from any number of extensions, and combines
/// those into a single output value.
```

## reader: metoda

Metoda, který vrací FacetReader, ale jelikož aktualně Facet implementuje facet reader, tak vrací this:

```
export type FacetReader<Output> = {
  /// @internal
  id: number
  /// @internal
  default: Output
  /// Dummy tag that makes sure TypeScript doesn't consider all object
  /// types as conforming to this type. Not actually present on the
  /// object.
  tag: Output
}
```

## define: statická metoda

kontruktor, který bere FacetConfig

## of: metoda

Vrací Facet Provider

## compute: metoda

## computeN: metoda

## from: metoda

# Adresy: getAddr

```
export function getAddr(state: EditorState, addr: number) {
  return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1]
}
```
1. Z toho, co chápu, tak adresa obsahuje jako první "bit" 1/0 podle toho jestli je to statická, nebo možná dynamická hodnota


# Adresy: ensureAddr