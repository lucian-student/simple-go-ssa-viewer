# posAtCoords

```
export function posAtCoords(view: EditorView, coords: {x: number, y: number}, precise: boolean, scanY?: 1 | -1): PosAssoc | null {
  let content = view.contentDOM.getBoundingClientRect()//vratí top,bottom,left,right od viewportu(což je asi browser window)
  let docTop = content.top + view.viewState.paddingTop//padding
  let {x, y} = coords
  let yOffset = y - docTop, pozice bez paddingu
  let block


  // First find the block at the given Y position, if any. If scanY is
  // given (used for vertical cursor motion), try to skip widgets and
  // line padding.
  for (;;) {
    if (yOffset < 0) return new PosAssoc(0, 1)// asi když to je nad dokumentem
    if (yOffset > view.viewState.docHeight) return new PosAssoc(view.state.doc.length, -1) //asi když je pod dokumentem
    block = view.elementAtHeight(yOffset)//
    if (scanY == null) break
    if (block.type == BlockType.Text) {
      if (scanY < 0 ? block.to < view.viewport.from : block.from > view.viewport.to) break
      // Check whether we aren't landing on the top/bottom padding of the line
      let rect = view.docView.coordsAt(scanY < 0 ? block.from : block.to, scanY > 0 ? -1 : 1)
      if (rect && (scanY < 0 ? rect.top <= yOffset + docTop : rect.bottom >= yOffset + docTop)) break
    }
    let halfLine = view.viewState.heightOracle.textHeight / 2
    yOffset = scanY > 0 ? block.bottom + halfLine : block.top - halfLine
  }
  // If outside the viewport, return null if precise==true, an
  // estimate otherwise.
  if (view.viewport.from >= block.to || view.viewport.to <= block.from) {
    if (precise) return null
    if (block.type == BlockType.Text) {
      let pos = posAtCoordsImprecise(view, content, block, x, y)
      return new PosAssoc(pos, pos == block.from ? 1 : -1)
    }
  }
  if (block.type != BlockType.Text)
    return yOffset < (block.top + block.bottom) / 2 ? new PosAssoc(block.from, 1) : new PosAssoc(block.to, -1)

  // Here we know we're in a line, so run the logic for inline layout
  let line = view.docView.lineAt(block.from, 2)
  if (!line || line.length != block.length) line = view.docView.lineAt(block.from, -2)!
  return new InlineCoordsScan(view, x, y, view.textDirectionAt(block.from)).scanTile(line, block.from)
}
```