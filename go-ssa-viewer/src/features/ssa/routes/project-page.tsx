function ProjectPage() {

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        //potom potř
        console.log({ x: e.clientX, y: e.clientY })


        /*
        Ale na nakonec jsem se rozhodnul, že asi bude lepší to udělat jinak: podle mě lepší bude:
        1. uživatel klikne na text v editoru:
            * to detekuje v jaké funkci se klik nacházel, vůbec jestli pokud ano, tak
            * tu funkci to zobrazí jako SSA golangu
        */
    };

    return (
        <>
            <div onContextMenu={handleContextMenu} contentEditable="true"></div>
        </>
    )
}

export default ProjectPage