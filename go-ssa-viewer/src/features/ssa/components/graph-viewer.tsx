import { useSSAData } from "../api/ssa"


function GraphViewer() {

    const { data } = useSSAData()

    if (!data) {
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
                        {block.instructions.map((instr,index) => {
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