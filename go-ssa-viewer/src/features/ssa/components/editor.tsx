import CodeMirror, { ViewUpdate, type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { go } from '@codemirror/lang-go'
import { autocompletion } from "@codemirror/autocomplete";
import useDebounce from '@/utils/debounce';
import { useSSA } from '../api/ssa';
import useSSAStore from '../useSSAStore';
import { useRef } from 'react';
import useContextMenu from '../hooks/use-context-menu';


/*
Musím přidat logiku, která umožní vybrat funkci
*/
function Editor() {

    const { code, setCode } = useSSAStore()
    const debouncedCode = useDebounce(code)
    useSSA({ code: debouncedCode })

    const editorRef = useRef<ReactCodeMirrorRef | null>(null)

    const { isOpen, close, context_menu_handler } = useContextMenu()


    return (
        <>
            <CodeMirror ref={(refData) => {
                editorRef.current = refData
                if (refData && refData.view && refData.state) {
                    //console.log(refData.view.root)
                    //console.log(document)
                    //console.log(refData.state.doc)
                    //console.log(refData.view.state.wordAt())
                    //console.log(refData.state.)
                    //console.log(refData.view.dom)
                    //console.log(refData.view.dom.getBoundingClientRect())
                }

            }} value={code} extensions={[go(), autocompletion(), context_menu_handler]} onChange={(text: string, _: ViewUpdate) => {
                setCode(text)
            }} />
        </>
    )
}

export default Editor