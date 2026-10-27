# Ball Clicker

Een voetbal-idle-clicker gemaakt met HTML, CSS en JavaScript. Het spel gebruikt geen PHP-backend; voortgang wordt lokaal in de browser opgeslagen.

Open `index.html` in een browser om te spelen. `style.css` bevat de voetbalstijl, `script.js` de OOP-gamecode en [FLOWCHARTS.md](FLOWCHARTS.md) de vier gevraagde flowcharts.

## Userstories en acceptatiecriteria

| Prioriteit | Userstory | Acceptatiecriteria |
|---|---|---|
| Must | Als speler wil ik op de voetbal klikken om punten te verdienen. | Elke klik verhoogt punten volgens de huidige klikbonus; punten en klikwaarde worden getoond. |
| Must | Als speler wil ik gebouwen kopen die automatisch punten produceren. | Er zijn minimaal 8 gebouwsoorten; kopen kan alleen met genoeg punten; de prijs stijgt per aankoop; productie telt mee per seconde. |
| Must | Als speler wil ik upgrades kopen om sneller vooruit te komen. | Er zijn minimaal 5 unieke upgrades; upgrades kunnen één keer gekocht worden; klik-, gebouw- en globale bonussen worden toegepast. |
| Must | Als speler wil ik mijn voortgang en gekochte items kunnen zien. | Gebouwaantallen en gekochte upgrades zijn zichtbaar; voortgang wordt in `localStorage` bewaard en na herladen teruggezet. |
| Must | Als speler wil ik feedback bij klikken en kopen. | De klik toont een zwevende puntenanimatie; knoppen zijn uitgeschakeld als iets niet betaalbaar of al gekocht is. |
| Should | Als speler wil ik mijn voortgang kunnen resetten. | Na bevestigen worden punten, gebouwen en upgrades gewist; annuleren behoudt de voortgang. |
| Could | Als speler wil ik extra events en vrij te spelen thema's. | Golden-ball event, extra skins en unlocks kunnen als latere uitbreiding worden toegevoegd. |

## OOP-opzet

- `Building` bevat de gegevens en het koop- en productiegedrag van ieder gebouw.
- `Upgrade` bevat gedeelde upgradegegevens en koopgedrag.
- `ClickUpgrade`, `BuildingUpgrade` en `GlobalUpgrade` erven van `Upgrade` en passen elk een ander bonussoort toe.
- `SoccerClickerGame` beheert de spelstatus, interface, opslag en game-loop.

## Backlog / sprintindeling

1. **Sprint 1 — Must:** klikpunten, puntentelling, één gebouw en stijgende prijzen.
2. **Sprint 2 — Must:** herbruikbare `Building`-class, alle 8 gebouwen, automatische productie en overzicht.
3. **Sprint 3 — Must:** upgradeclass en subclasses, minimaal 5 upgrades, effecten en voortgang opslaan.
4. **Sprint 4 — Should/Could:** visuele afwerking, reset, events, thema's en extra unlocks.

Flowcharts voor klikken, gebouw kopen, upgrade kopen en PPS-berekening staan in [FLOWCHARTS.md](FLOWCHARTS.md).
