import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { go } from '@codemirror/lang-go'
import { autocompletion } from "@codemirror/autocomplete";
import useDebounce from '@/utils/debounce';
import { useSSA } from '../api/ssa';
import useSSAStore, { DEFAULT_CODE } from '../useSSAStore';



/*
Musím přidat logiku, která umožní vybrat funkci
*/
function Editor() {

    const { code, setCode } = useSSAStore()
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