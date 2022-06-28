### Slovník

contact unit = nejaká kontaktová informácia napríklad company@gmail.com, +421907298456, alebo link

contact unit type = typ kontaktovej informácie email, telefón, twitter ...

contact entity = kontaktový celok. Zoskupenie contact units, ktoré patria jednému človeku alebo firme.


## Kroky algoritmu
1. Regexom nájdeme všetky contact units
2. získame vstupné parametre
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






