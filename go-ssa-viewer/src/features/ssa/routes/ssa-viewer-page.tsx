import CodeMirror from '@uiw/react-codemirror';

function SSAViewerPage() {

    return (
        <div className="w-full h-full flex">
            <div className="flex-1">
                <CodeMirror/>
            </div>
            <div className="flex-1">
                Graph Viewer
            </div>
        </div>
    )
}

export default SSAViewerPage