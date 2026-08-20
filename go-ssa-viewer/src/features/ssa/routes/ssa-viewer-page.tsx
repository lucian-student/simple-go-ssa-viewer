import Editor from '@/features/ssa/components/editor'
import GraphViewer from '../components/graph-viewer'

function SSAViewerPage() {

    return (
        <div className="w-full h-full flex">
            <div className="flex-1 overflow-y-auto">
                <Editor />
            </div>
            <div className="flex-1">
                <GraphViewer />
            </div>
        </div>
    )
}

export default SSAViewerPage