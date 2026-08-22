import { useSSA } from "../api/ssa"
import useSSAStore from "../useSSAStore"


function GraphViewer() {
    const { code } = useSSAStore()
    const { data, error, isPending } = useSSA({ code })

    if (isPending) {
        return <>Wait</>
    }

    if (error) {
        return <>No data</>
    }

    if (!data.packages) {
        return <>No package</>
    }

    const firstPackage = data.packages[0]

    if (!firstPackage.functions) {
        return <>No function</>
    }

    const firstFunction = firstPackage.functions[0]

    return (
        <>
            {firstFunction.blocks.map(block => {
                return (
                    <ul key={block.index}>
                        {block.instructions.map((instr, index) => {
                            return (
                                <li key={index}>{instr.text}</li>
                            )
                        })}
                    </ul>
                )
            })}
        </>
    )
}

export default GraphViewer