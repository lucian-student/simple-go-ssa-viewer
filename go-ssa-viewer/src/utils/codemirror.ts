import { ensureSyntaxTree, syntaxTree } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view';

export interface FunctionRange {
    from: number;
    to: number;
    name: string;
}

export function getFunctionRanges(state: EditorState): FunctionRange[] {
    const tree = ensureSyntaxTree(state, state.doc.length, 5000) ?? syntaxTree(state);
    const ranges: FunctionRange[] = [];
    tree.iterate({
        enter(node) {
            if (node.name == "FunctionDecl") {
                if (node.node.firstChild) {
                    let child: typeof node.node.firstChild | null = node.node.firstChild;
                    do {
                        if (child.name == "DefName") {
                            ranges.push({
                                name: state.sliceDoc(child.from, child.to),
                                from: node.from,
                                to: node.to
                            })
                            break
                        }
                    } while (child = child.nextSibling)
                }
            }
        }
    });
    return ranges;
}

export function getFunctionAtPosition(view: EditorView, coords: { x: number, y: number }): FunctionRange | null {

    const pos = view.posAtCoords({ ...coords })

    const functions = getFunctionRanges(view.state)
    console.log("pos: ", pos)
    console.log("ranges: ", functions)

    if (!pos)
        return null

    const func = functions.find((fn) => fn.from <= pos && pos <= fn.to)

    if (!func)
        return null

    return func
}