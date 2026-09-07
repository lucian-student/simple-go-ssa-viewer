# class ViewState

properties:
1. scaler = IdScaler

## blockAt


## elementAtHeight

```
type YScaler = {
  toDOM(n: number): number
  fromDOM(n: number): number
  scale: number,
  eq(other: YScaler): boolean
}

// Don't scale when the document height is within the range of what
// the DOM can handle.
const IdScaler: YScaler = {
  toDOM(n: number) { return n },
  fromDOM(n: number) { return n },
  scale: 1,
  eq(other: YScaler) { return other == this }
}

function scaleBlock(block: BlockInfo, scaler: YScaler): BlockInfo {
  if (scaler.scale == 1) return block //co jsem se dival v browseru, tak výchozí scale je 1, takže teorteticky to můžu zatím ignorovat
  let bTop = scaler.toDOM(block.top)
  let bBottom = scaler.toDOM(block.bottom)
  return new BlockInfo(block.from, block.length, bTop, bBottom - bTop,
                       Array.isArray(block._content) ? block._content.map(b => scaleBlock(b, scaler)) : block._content)
}
```

```
elementAtHeight(height: number): BlockInfo {
    return scaleBlock(
        this.heightMap.blockAt(this.scaler.fromDOM(height),this.heightOracle, 0, 0),
        this.scaler
    )
}
```