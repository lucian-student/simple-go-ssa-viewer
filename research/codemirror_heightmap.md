# class HeightOracle

# abstract class HeightMap

# class HeightMapBlock extends HeightMap

vlastnosti:
* spaceAbove = 0, nevim, co je space above a zajimalo by mě to
* length: number
* height: number
* readonly deco: PointDecoration | null



## blockAt

```
examples usage:

let yOffset = y - docTop, pozice bez paddingu
* taže v tomto případě height, je y - docTop, což je i guess pozice v objektu bez paddingu

this.heightMap.blockAt(this.scaler.fromDOM(height), this.heightOracle, 0, 0)
//tady myslím, že scaler ve vychozím stavu vrátí identitu

blockAt(height: number, _oracle: HeightOracle, top: number, offset: number) {
    //například, co by se stalo, kdyby jako v tomto příkaldu top,offset=0
    return (
        this.spaceAbove && 
        height < top + this.spaceAbove
        ) ? 
      new BlockInfo(offset, 0, top, this.spaceAbove, SpaceDeco) :
      this.mainBlock(top, offset)
}
//tady dokonce se ignoruje oracle
```



# class HeightMapGap extends HeightMap

# class HeightMapBranch extends HeightMap

# class BlockInfo

# class MeasuredHeights(ve stavu prozkoumání)

vlastnosti:
* public index = 0
* readonly from: number
* readonly heights: number[]


Investigation:
1. například: metoda HeightMapBlock.setMeasuredHeight, používa tuto třídu, takže by bylo dobré se podívat, kde se metoda používá
2. tuto metodu používá metoda HeightMapBlock.updateHeight
3. V kodu se používá metoda v EditorState.measure
4. 


## more(Query Method - získavá informace)

```
get more() { 
    return this.index < this.heights.length 
}
```
