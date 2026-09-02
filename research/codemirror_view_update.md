# ViewUpdate 

properties:
1. changes: ChangeSet
2. startState: EditorState
3. flags
4. changedRanges: readonly ChangedRange[]
5. state: EditorState//nový stav editoru
6. view: EitorView//view s kterým je asociovaný update
7. transactions: Transactions[] // nějaká sada změn stavu, která bude asi vykonaná v tomto updatu
