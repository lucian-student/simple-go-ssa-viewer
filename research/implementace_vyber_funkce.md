# Implementace vyber funkce:

Při zobrazovaní SSA, bych rad implementoval vyber funkce, takto:
1. klikne se na editor, right clickem zobrazí se dvě možnosti:
    * buď vygenerovat call graph
    * nebo zobrazit SSA

## contenteditable contextmenu

takže codemirror6 použivá contentEditable="true" div, ten má contextmenu "event", který otevře výchozí popup menu, to je potřeba overridnout.
* aby se nezobrazilo výchozí menu, ale aby se zobrazilo menu, které zobrazuje moje dvě vlasnosti


Bez mojeho přičinění AI mi poradila, že EditorView má metodu: "domEventHandlers", která vytvoří Extension pro event handler, tu by chtělo prozkoumat.


Musim somehow zjistit, v jaké funkci se nachází můj cursor:
