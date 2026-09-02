import CodeMirror, { ViewUpdate, type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { go } from '@codemirror/lang-go'
import { autocompletion } from "@codemirror/autocomplete";
import useDebounce from '@/utils/debounce';
import { useSSA } from '../api/ssa';
import useSSAStore, { DEFAULT_CODE } from '../useSSAStore';
import { useRef } from 'react';



/*
Musím přidat logiku, která umožní vybrat funkci
*/
function Editor() {

    const { code, setCode } = useSSAStore()
    const debouncedCode = useDebounce(code)
    useSSA({ code: debouncedCode })

    const editorRef = useRef<ReactCodeMirrorRef | null>(null)


    

    return (
        <>
            <CodeMirror ref={(refData) => {
                editorRef.current = refData
                if(refData && refData.view && refData.state){
                    //console.log(refData.view.root)
                    //console.log(document)
                    console.log(refData.state.doc)
                }

            }} value={code} extensions={[go(), autocompletion()]} onChange={(text: string, _: ViewUpdate) => {
                setCode(text)
            }} />
        </>
    )
}

export default Editor