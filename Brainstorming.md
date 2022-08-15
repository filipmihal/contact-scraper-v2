### Slovník

contact unit = nejaká kontaktová informácia napríklad company@gmail.com, +421907298456, alebo link

contact unit type = typ kontaktovej informácie email, telefón, twitter ...

contact entity = kontaktový celok. Zoskupenie contact units, ktoré patria jednému človeku alebo firme.

## Kroky algoritmu

1. Regexom nájdeme všetky contact units
2. získame vstupné parametre (lokácia na stránke, contact unit type, HTML kontext)
3. použijeme vstupné parametre na vytvorenie contact entities

### Krok č. 2

- lokácia kontaktu na vyrenderovanej stránke
  - budeme uchovávať iba relatívne vzdialenosti všetkých dvojíc
  - pomocou puppeteera získame info o lokácií elementu
  - jeden contact unit sa môže vyskytovať na viacerých miestach
    - V takom prípade vrátime iba minimálnu vzdialenosť od daného unitu k ostatgným unitom.
  - Pomocou puppeteeru a prístupom do DOMu
- contact unit type
- počet unikátnych prvkov v danom contact unit type.
- HTML kontext
- semantický kontext

### Krok č. 3

- clustering
  - K-Means
- custom algoritmus s dopredu nastavenymi váhami
  - nejaká forma decision trees
  - 2 odlišné contact units toho istého typu väčšinou indukujú dve odlišné contact entities.
    - Výnimka: sú relatívne blízko seba alebo medzi nimi nieje žiaden semantický kontexts
  - viac odlišných contact unit types vo väčšine prípadov spájame do jednej contact entity bez ohľadu na ich vzdialenosť. Ak máme na výber viac contact entít tak vyberieme ktorá je bližšie.
  - každá vytvorená entita musí mať nejaké skóre ktoré podľa ktorého rozhodujeme, kotrú entitu použijeme vo výslednom objekte.

## Clustering

### Input parametre

- vzdialenosti
  - vizualne
  - DOM tree
  - v čiston texte

<!-- Hladanie HTML kontextu... -->

### Greedy approach

1. nájdi všetky koncové divs
2. tie tvoria skupiny
3. vyhľadaj kontakty v nich
4. vyhľadaj Headings
5. konštruuj objekt

<b> Puppeteer snippet </b>

```javascript
console.log("starting search");
const pageFrame = page.mainFrame();
const htmlMain = await pageFrame.$("html");

console.log(htmlMain.asElement());

const children = await htmlMain.$$(":scope > *");

for (let child of children) {
  child.evaluate(() =>
    Array.from(document.querySelectorAll("a"), (element) => {
      return { a: element.getBoundingClientRect(), b: element.outerHTML };
    })
  );
}

const text = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a"), (element) => {
    return {
      a: element.getBoundingClientRect(),
      b: element.outerHTML,
      c: element.childNodes,
    };
  })
);
console.log(text);
for (let child in text[text.length - 2].c) {
  const a = text[text.length - 2].c[child];
  console.log(a);
}
```

### Smart greedy

1. pre každý div nájdi všetky kontakty
2. spočítaj duplikáty a zanechaj si počet duplikátov
3. vytvor váhový index pomocou duplikátov
4. použi niečo pri konfliktoch
5. inak sa snaž čo najviac špecializovať

## Ultimate greedy algorithm

1. pre každý div nájdi všetky kontakty. Potom sa každého opýtaj či je to niekoho superset.
2. Ak áno, skontroluj či obsahuje nejaké unikátne kontakty, ktoré sa nikde inde nevyskytujú.
3. ak neobsahuje žiadne unikátne kontakty, vymaž ho
4. ak áno, pridaj kontakt čo najviac podobnému subsetu
5. Zostavajúce objekty reprezentujú finálne dáta

6. mám viac možností... Buď to pridám iba jednému objektu... no je ťažké rozhodnúť ktorému. Preto podľa DIV pravidiel by som mal daný kontakt pridať každému podobjektu.

<br/>

- urob analyzu bodu cislo 4. Je to vobec potrebne riesit?
- samotny output moze byt tricky

- Výsledky dát ukazujú, že bod 4 sa vyskytuje celkom často.

### Potrebné metódy pre Smart Ultimate

1. daj zoznam subsetov
2. urob zoznam unikatnych contact units
3. podla zoznamu v 2. zisti ci sa jedna o unikatny a pridaj ho medzi vsetky subsety
4. nezabudaj na eliminaciu kontroly sameho seba

> Problem ktory nastal v aktualnej implementacii je, ze ju nedokazeme skalovat. Niektore objekty chceme grupovat, pretoze obsahuju odlisny typ kontaktov. Preto potrebujeme stromovu strukturu celej stranky...

[] mozno pridat aj P tagy
[] hlavne TD

[ ] Pridaj address tag
[ ] pridaj P tag ale iba ak obsahuje viac ako jeden kontakt, to iste pre LI

[ ] cannot parse this phone number: +49-211-4174320
[ ] vytvor trash objekt alebo sa rozhodni co s ostatnymi...
[ ] out of scope is final grouping... it can be determine by the actual distance of objects or by html distance...
[ ] think about BFS...
[ ] phones uncertain only if we could find names (dont be so drastic when deleting them)
