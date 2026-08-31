# MapMode

export enum MapMode {
  /// Map a position to a valid new position, even when its context
  /// was deleted.
  Simple,
  /// Return null if deletion happens across the position.
  TrackDel,
  /// Return null if the character _before_ the position is deleted.
  TrackBefore,
  /// Return null if the character _after_ the position is deleted.
  TrackAfter
}

# CHangeDesc


protected constructor(
    /// @internal
    readonly sections: readonly number[]
  ) {}

sections:
1. sekce je dvojice čísel:
    1. číslo říká původní velikost sekce
    2. druhé číslo říká novou velikost sekce, pokud není sekce změněněna, tak je tam -1

Přidání obsahu (0,10)
Smazaní obsahu (10,0)
Zaměna obsahu (20,20) když jsou oba obsahy stejně velké
Obsah zustane stejný (20,-1)

## length() - delka původního osbahu

## newLength() - délka nového obsahu

## empty() - vrací jestly nejsou žádné změny

## iterGaps() - volá callback předaný jako argument, nad sekcemi, které nebyly změněné - f: (posA: number, posB: number, length: number) => void

```
for (let i = 0, posA = 0, posB = 0; i < this.sections.length;) {
    let len = this.sections[i++], ins = this.sections[i++]
    if (ins < 0) {
        f(posA, posB, len)
        posB += len
    } else {
        posB += ins
    }
    posA += len
}
```
* funkce bere: počáteční pozici úseku v nezmeněném dokumentu(posA)
* funkce bere: počáteční pozici úseku v změněném dokumentu(posB)
* len je délka úseku

## iterChangedRanges

## invertedDesc

## composeDesc(other: ChangeDesc) -> kombinuje dvě ChangeSety(zatím jsem neprozkoumal, ale asi to nějak je zkombinuje)

jsou tři případy:
1. v "A" mažu sekci
2. v "B" vytvářím sekci
3. třetí případ

důležitá funkce:
```
function addSection(sections: number[], len: number, ins: number, forceJoin = false) {
  if (len == 0 && ins <= 0) return //ignorujeme sekci velikosti 0, která se nezmění
  let last = sections.length - 2
  if (last >= 0 && ins <= 0 && ins == sections[last + 1]) sections[last] += len //jestli (mažeme ins=0, nebo se nezmění sekce ins = -1) a ins je stejný jako v předchozi sekci, tak zvětšíme len, jednoduše pokdu: mám dvě sekce (20,0), (30,0) to znamená, že obě vymažu, tak je můžu mergnout, pokud mám dvě sekce (20,-1),(30,-1) ani jedna se nezmění, tak je můžu mergnout
  else if (last >= 0 && len == 0 && sections[last] == 0) sections[last + 1] += ins //pokdud předchozí dvě sekce byly insert (0,10) (0,20) tak je mergnu
  else if (forceJoin) { sections[last] += len; sections[last + 1] += ins } //vnucený sjednocení
  else sections.push(len, ins) //jinak obecně sekci přidám
}
```

```
let len = Math.min(a.len2, b.len)//vezmu minimum z (delky po aplikovaní změny v "a",delky pred aplikovaní změny v "b")
let sectionLen = sections.length
if (a.ins == -1) {//když "a" neudělalo změnu
    let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins//(moc zatím nevim, jelikož nevim význam offsetu)
    addSection(sections, len, insB, open)//
    if (insert && insB) addInsert(insert, sections, b.text)
} else if (b.ins == -1) {
    addSection(sections, a.off ? 0 : a.len, len, open)
    if (insert) addInsert(insert, sections, a.textBit(len))
} else {
    addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open)
    if (insert && !b.off) addInsert(insert, sections, b.text)
}
open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen)
a.forward2(len)
b.forward(len)
```

## mapDesc(other: ChangeDesc, before = false): ChangeDesc -> (pouze odhad, nečetl jsem kód) podle mě to kombinuje 2 ChangeDesc do jedné 

## mapPos(pos: number, assoc = -1, mode: MapMode = MapMode.Simple) -> mapuje pozice ze starého dokumentu do nového dokumentu

* pos - pozice ve starém dokumentu
* assoc
* mode

Dva případy:
1. sekce ve které se pozice změnila/nezměnila
    1. když se nezměnila, tak se zachová pozice v dané sekci
2. když se sekce změnila, tak zaleží na MapModu(bohužel moc nevím k čemu to je)
    1. MapMode: 

## touchesRange(from: number, to = from): boolean | "cover" - kontroluje jestli rozsah se nepřekrývá s dotazem

* redundantní podmínka: https://code.haverbeke.berlin/codemirror/state/src/commit/2e23df419b6781c847bc18848e36f1dca58015b8/src/change.ts#L147


## toString(asi mě nezajímá)

## toJSON(asi mě nezajímá)

## fromJSON(asi mě nezajímá)

## static create - konstruktor funkce


# SectionIter 

Důležité properties:

i = 0 // index do pole sections ChangeDesc
declare len: number //delka staré sekce
declare off: number // 
declare ins: number //delka nové sekce


## done -> this.ins==-2

## len2 -> delka aktuální sekce potom, co se aplikuje změna

## text -> vyžaduje aby to nebyl ChangeDesc, ale ChangeSet, jelikož change set má text

```
let {inserted} = this.set as ChangeSet, index = (this.i - 2) >> 1
```
1. insterted - 
2. index, jelikož se pohybuju po dvojicích, tak to říká poslední vybranou položku

## textBit(len?: number) taky metoda pro changeSet

## forward(len: number) -> ne nejsem schopný odvodit cíl teto funkce

```
forward(len: number) {
    if (len == this.len) this.next()
    else { this.len -= len; this.off += len }
}
```

## forward2(len: number) -> 

```
forward2(len: number) {
    if (this.ins == -1) this.forward(len)
    else if (len == this.ins) this.next()
    else { this.ins -= len; this.off += len }
}
```