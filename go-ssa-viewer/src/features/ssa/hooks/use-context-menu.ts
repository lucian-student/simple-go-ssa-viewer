import { useState } from 'react'
import { EditorView } from '@codemirror/view';
import { getFunctionAtPosition } from '@/utils/codemirror'


function useContextMenu() {

    const [fn, setFn] = useState<string | null>(null);

    const isOpen = () => {
        return fn != null
    }

    const close = () => {
        setFn(null)
    }

    const context_menu_handler = EditorView.domEventHandlers({
        contextmenu(event, view) {
            event.preventDefault()
            
            const func = getFunctionAtPosition(view, { x: event.clientX, y: event.clientY })

            if (!func)
                return true

            setFn(func.name)
            
            return true
        }
    })

    return {
        fn, isOpen, close, context_menu_handler
    }
}

export default useContextMenu