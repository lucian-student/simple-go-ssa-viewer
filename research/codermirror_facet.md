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