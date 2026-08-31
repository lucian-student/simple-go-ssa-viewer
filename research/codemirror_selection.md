# RangeFlag

const enum RangeFlag {
  BidiLevelMask = 7, 000 ... 0111
  AssocBefore = 8, 000 ... 1000
  AssocAfter = 16, 000 ... 0001 0000
  Inverted = 32, 000 ... 0010 0000
  Undirectional = 64, ... 0100 0000
}

# class SelectionRange

## anchor - začátek selecitonu

```
get anchor() { return this.flags & RangeFlag.Inverted ? this.to : this.from }
```
* anchor je konec selectionu, pokud je inverted
* from je anchror, pokud není inverted

## head - konec selectionu

```
get head() { return this.flags & RangeFlag.Inverted ? this.from : this.to }
```

## empty - vrací jestli selection je prázdný

## assoc

´´´
get assoc(): -1 | 0 | 1 { return this.flags & RangeFlag.AssocBefore ? -1 : this.flags & RangeFlag.AssocAfter ? 1 : 0 }
´´´
* ZAtím nevím, co je assoc, jenom vím, že má tři stavy

## undirectional

moc nevím, co je unidirectional seleciton.

## bidiLevel

## map

## extend

## eq

## fromJSON

## create

# class EditorSelection -> selection se skladá z 1 a více SelectionRangů

