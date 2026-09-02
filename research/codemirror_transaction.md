# Transaction

text:
* _doc: Text | null = null
* _state: EditorState | null = null
* readonly startState: EditorState,
* readonly changes: ChangeSet,
* readonly selection: EditorSelection | undefined,
* readonly effects: readonly StateEffect<any>[],
* readonly annotations: readonly Annotation<any>[],
* readonly scrollIntoView: boolean

# TransactionSpec

export interface TransactionSpec {
  /// The changes to the document made by this transaction.
  changes?: ChangeSpec
  /// When set, this transaction explicitly updates the selection.
  /// Offsets in this selection should refer to the document as it is
  /// _after_ the transaction.
  selection?: EditorSelection | {anchor: number, head?: number} | undefined,
  /// Attach [state effects](#state.StateEffect) to this transaction.
  /// Again, when they contain positions and this same spec makes
  /// changes, those positions should refer to positions in the
  /// updated document.
  effects?: StateEffect<any> | readonly StateEffect<any>[],
  /// Set [annotations](#state.Annotation) for this transaction.
  annotations?: Annotation<any> | readonly Annotation<any>[],
  /// Shorthand for `annotations:` [`Transaction.userEvent`](#state.Transaction^userEvent)`.of(...)`.
  userEvent?: string,
  /// When set to `true`, the transaction is marked as needing to
  /// scroll the current selection into view.
  scrollIntoView?: boolean,
  /// By default, transactions can be modified by [change
  /// filters](#state.EditorState^changeFilter) and [transaction
  /// filters](#state.EditorState^transactionFilter). You can set this
  /// to `false` to disable that. This can be necessary for
  /// transactions that, for example, include annotations that must be
  /// kept consistent with their changes.
  filter?: boolean,
  /// Normally, when multiple specs are combined (for example by
  /// [`EditorState.update`](#state.EditorState.update)), the
  /// positions in `changes` are taken to refer to the document
  /// positions in the initial document. When a spec has `sequental`
  /// set to true, its positions will be taken to refer to the
  /// document created by the specs before it instead.
  sequential?: boolean
}

## Examples


```
view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) });
```




```
export type ChangeSpec =
  {from: number, to?: number, insert?: string | Text} |
  ChangeSet |
  readonly ChangeSpec[]

view.dispatch({
    changes: { from: 0, to: view.state.doc.toString().length, insert: value || '' },
    annotations: [ExternalChange.of(true)],
});
```