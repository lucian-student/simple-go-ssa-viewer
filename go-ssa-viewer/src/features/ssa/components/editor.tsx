import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { go } from '@codemirror/lang-go'
import { autocompletion } from "@codemirror/autocomplete";
import useDebounce from '@/utils/debounce';
import { useState } from 'react';
import { useSSA } from '../api/ssa';

const DEFAULT_CODE = [
    "package main",
    "",
    "import \"fmt\"",
    "",
    "func add(a,b int) int{",
    "   return a + b",
    "}",
    "",
    "func main(){",
    "   fmt.Printf(\"Hello world\")",
    "}",
].join("\n")

function Editor() {
    const [code, setCode] = useState(DEFAULT_CODE)
    const debouncedCode = useDebounce(code)
    useSSA({ code: debouncedCode })

    return (
        <>
            <CodeMirror value={DEFAULT_CODE} extensions={[go(), autocompletion()]} onChange={(text: string, _: ViewUpdate) => {
                setCode(text)
            }} />
        </>
    )
}

export default Editor