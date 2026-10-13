class Building {
  constructor(id, name, baseCost, pointsPerSecond) {
    this.id = id;
    this.name = name;
    this.baseCost = baseCost;
    this.pointsPerSecond = pointsPerSecond;

    this.amount = 0;
    this.multiplier = 1;
  }

  getCost() {
    return Math.floor(
      this.baseCost * Math.pow(1.15, this.amount)
    );
  }

  buy(game) {
    const cost = this.getCost();

    if (game.points >= cost) {
      game.points -= cost;
      this.amount++;

      return true;
    }

    return false;
  }

  getTotalPps(globalMultiplier) {
    return (
      this.amount *
      this.pointsPerSecond *
      this.multiplier *
      globalMultiplier
    );
  }
}


class Upgrade {
  constructor(
    id,
    name,
    cost,
    description,
    effectType,
    target,
    value
  ) {
    this.id = id;
    this.name = name;
    this.cost = cost;
    this.description = description;

    this.effectType = effectType;
    this.target = target;
    this.value = value;

    this.purchased = false;
  }

  buy(game) {
    if (this.purchased) {
      return false;
    }

    if (game.points >= this.cost) {
      game.points -= this.cost;
      this.purchased = true;

      game.recalculateBonuses();

      return true;
    }

    return false;
  }
}


class SoccerClickerGame {
  constructor() {
    this.points = 0;

    this.basePointsPerClick = 1;

    this.clickMultiplier = 1;
    this.globalPpsMultiplier = 1;


    this.buildings = [
      new Building(
        "ballboy",
        "Ballenjongen",
        15,
        1
      ),

      new Building(
        "trainer",
        "Trainer",
        60,
        4
      ),

      new Building(
        "ballrack",
        "Ballenrek",
        200,
        10
      ),

      new Building(
        "machine",
        "Ballenmachine",
        750,
        25
      ),

      new Building(
        "factory",
        "Voetbalfabriek",
        2500,
        75
      ),

      new Building(
        "academy",
        "Voetbal Academie",
        8000,
        200
      ),

      new Building(
        "stadium",
        "Stadion",
        25000,
        600
      ),

      new Building(
        "worldcup",
        "Wereldbeker Centrum",
        100000,
        1800
      )
    ];


    this.upgrades = [
      new Upgrade(
        "goldenBall",
        "Gouden Bal",
        100,
        "Verdubbelt je klikpunten",
        "clickMultiplier",
        null,
        2
      ),

      new Upgrade(
        "speedBoots",
        "Snelle Schoenen",
        500,
        "Verdubbelt je klikpunten opnieuw",
        "clickMultiplier",
        null,
        2
      ),

      new Upgrade(
        "superTrainer",
        "Super Trainer",
        1200,
        "Trainers geven 2x zoveel punten",
        "buildingMultiplier",
        "trainer",
        2
      ),

      new Upgrade(
        "machineUpgrade",
        "Snellere Ballenmachine",
        2500,
        "Ballenmachines geven 2x zoveel punten",
        "buildingMultiplier",
        "machine",
        2
      ),

      new Upgrade(
        "factoryUpgrade",
        "Moderne Fabriek",
        7000,
        "Fabrieken geven 2x zoveel punten",
        "buildingMultiplier",
        "factory",
        2
      ),

      new Upgrade(
        "sponsor",
        "Grote Sponsor",
        15000,
        "Alle gebouwen produceren 1.5x zoveel",
        "globalPpsMultiplier",
        null,
        1.5
      ),

      new Upgrade(
        "diamondBall",
        "Diamanten Bal",
        40000,
        "Klikpunten worden 3x zo sterk",
        "clickMultiplier",
        null,
        3
      ),

      new Upgrade(
        "stadiumUpgrade",
        "Stadion Upgrade",
        75000,
        "Stadions geven 2x zoveel punten",
        "buildingMultiplier",
        "stadium",
        2
      )
    ];


    // HTML ELEMENTEN

    this.pointsDisplay =
      document.getElementById("pointsDisplay");

    this.ppsDisplay =
      document.getElementById("ppsDisplay");

    this.clickButton =
      document.getElementById("clickButton");

    this.clickButtonValue =
      document.getElementById("clickButtonValue");

    this.shopList =
      document.getElementById("shopList");

    this.upgradeList =
      document.getElementById("upgradeList");

    this.resetButton =
      document.getElementById("resetButton");

    this.resetModal =
      document.getElementById("resetModal");

    this.cancelReset =
      document.getElementById("cancelReset");

    this.confirmReset =
      document.getElementById("confirmReset");

    this.floatingLayer =
      document.getElementById("floatingLayer");


    // GAME STARTEN

    this.load();

    this.recalculateBonuses();

    this.createShop();
    this.createUpgrades();

    this.addEvents();

    this.startGameLoop();

    this.updateDisplay();
    this.updateShop();
    this.updateUpgrades();
  }


  getPointsPerClick() {
    return (
      this.basePointsPerClick *
      this.clickMultiplier
    );
  }


  addEvents() {
    this.clickButton.addEventListener(
      "click",
      () => {
        this.click();
      }
    );


    // RESET MODAL OPENEN

    this.resetButton.addEventListener(
      "click",
      () => {
        this.openResetModal();
      }
    );


    // RESET ANNULEREN

    this.cancelReset.addEventListener(
      "click",
      () => {
        this.closeResetModal();
      }
    );


    // RESET BEVESTIGEN

    this.confirmReset.addEventListener(
      "click",
      () => {
        this.reset();
      }
    );


    // Klik naast modal = sluiten

    this.resetModal.addEventListener(
      "click",
      event => {

        if (event.target === this.resetModal) {
          this.closeResetModal();
        }

      }
    );
  }


  openResetModal() {
    this.resetModal.classList.remove("hidden");
  }


  closeResetModal() {
    this.resetModal.classList.add("hidden");
  }


  click() {
    const amount =
      this.getPointsPerClick();

    this.points += amount;

    this.createFloatingText(
      "+" + amount
    );

    this.updateDisplay();
    this.updateShop();
    this.updateUpgrades();

    this.save();
  }


  getPointsPerSecond() {
    let total = 0;

    this.buildings.forEach(building => {

      total += building.getTotalPps(
        this.globalPpsMultiplier
      );

    });

    return total;
  }


  createShop() {
    this.shopList.innerHTML = "";

    this.buildings.forEach(
      (building, index) => {

        const item =
          document.createElement("div");

        item.classList.add("shop-item");


        item.innerHTML = `
          <div class="shop-info">

            <h3>
              ${building.name}
            </h3>

            <p>
              +${building.pointsPerSecond}
              punten per seconde
            </p>

            <p>
              In bezit:
              <span id="amount-${index}">
                ${building.amount}
              </span>
            </p>

          </div>


          <button
            class="buy-button"
            id="buy-${index}"
          >

            Koop -

            <span id="cost-${index}">
              ${building.getCost()}
            </span>

          </button>
        `;


        this.shopList.appendChild(item);


        const button =
          document.getElementById(
            `buy-${index}`
          );


        button.addEventListener(
          "click",
          () => {

            this.buyBuilding(index);

          }
        );

      }
    );
  }


  buyBuilding(index) {
    const building =
      this.buildings[index];


    const bought =
      building.buy(this);


    if (bought) {

      this.updateDisplay();
      this.updateShop();
      this.updateUpgrades();

      this.save();

    }
  }


  createUpgrades() {
    this.upgradeList.innerHTML = "";


    this.upgrades.forEach(
      (upgrade, index) => {

        const item =
          document.createElement("div");


        item.classList.add("shop-item");

        item.id =
          `upgrade-card-${index}`;


        item.innerHTML = `
          <div class="shop-info">

            <h3>
              ${upgrade.name}
            </h3>

            <p>
              ${upgrade.description}
            </p>

          </div>


          <button
            class="buy-button"
            id="upgrade-${index}"
          >

            Koop -
            ${upgrade.cost}

          </button>
        `;


        this.upgradeList.appendChild(item);


        const button =
          document.getElementById(
            `upgrade-${index}`
          );


        button.addEventListener(
          "click",
          () => {

            this.buyUpgrade(index);

          }
        );

      }
    );
  }


  buyUpgrade(index) {
    const upgrade =
      this.upgrades[index];


    const bought =
      upgrade.buy(this);


    if (bought) {

      this.updateDisplay();
      this.updateShop();
      this.updateUpgrades();

      this.save();

    }
  }


  recalculateBonuses() {
    this.clickMultiplier = 1;

    this.globalPpsMultiplier = 1;


    this.buildings.forEach(
      building => {

        building.multiplier = 1;

      }
    );


    this.upgrades.forEach(
      upgrade => {

        if (!upgrade.purchased) {
          return;
        }


        if (
          upgrade.effectType ===
          "clickMultiplier"
        ) {

          this.clickMultiplier *=
            upgrade.value;

        }


        if (
          upgrade.effectType ===
          "globalPpsMultiplier"
        ) {

          this.globalPpsMultiplier *=
            upgrade.value;

        }


        if (
          upgrade.effectType ===
          "buildingMultiplier"
        ) {

          const building =
            this.buildings.find(
              building =>
                building.id ===
                upgrade.target
            );


          if (building) {

            building.multiplier *=
              upgrade.value;

          }
        }

      }
    );
  }


  updateDisplay() {
    this.pointsDisplay.textContent =
      Math.floor(
        this.points
      ).toLocaleString("nl-NL");


    this.ppsDisplay.textContent =
      this.getPointsPerSecond()
        .toFixed(1);


    this.clickButtonValue.textContent =
      "+" +
      this.getPointsPerClick();
  }


  updateShop() {
    this.buildings.forEach(
      (building, index) => {

        const amount =
          document.getElementById(
            `amount-${index}`
          );


        const cost =
          document.getElementById(
            `cost-${index}`
          );


        const button =
          document.getElementById(
            `buy-${index}`
          );


        amount.textContent =
          building.amount;


        cost.textContent =
          building.getCost();


        button.disabled =
          this.points <
          building.getCost();

      }
    );
  }


  updateUpgrades() {
    this.upgrades.forEach(
      (upgrade, index) => {

        const button =
          document.getElementById(
            `upgrade-${index}`
          );


        const card =
          document.getElementById(
            `upgrade-card-${index}`
          );


        if (upgrade.purchased) {

          button.textContent =
            "Gekocht";

          button.disabled = true;

          card.style.opacity =
            "0.5";

        } else {

          button.textContent =
            "Koop - " +
            upgrade.cost;


          button.disabled =
            this.points <
            upgrade.cost;


          card.style.opacity =
            "1";

        }

      }
    );
  }


  startGameLoop() {
    setInterval(() => {

      const pps =
        this.getPointsPerSecond();


      this.points +=
        pps / 10;


      this.updateDisplay();
      this.updateShop();
      this.updateUpgrades();

    }, 100);


    // Autosave iedere 5 seconden

    setInterval(() => {

      this.save();

    }, 5000);
  }


  save() {
    const saveData = {

      points:
        this.points,


      buildings:
        this.buildings.map(
          building => {

            return {
              id: building.id,
              amount: building.amount
            };

          }
        ),


      upgrades:
        this.upgrades.map(
          upgrade => {

            return {
              id: upgrade.id,
              purchased:
                upgrade.purchased
            };

          }
        )

    };


    localStorage.setItem(
      "soccerClickerSave",
      JSON.stringify(saveData)
    );
  }


  load() {
    const savedGame =
      localStorage.getItem(
        "soccerClickerSave"
      );


    if (savedGame === null) {
      return;
    }


    try {

      const data =
        JSON.parse(savedGame);


      this.points =
        data.points ?? 0;


      if (data.buildings) {

        data.buildings.forEach(
          savedBuilding => {

            const building =
              this.buildings.find(
                building =>
                  building.id ===
                  savedBuilding.id
              );


            if (building) {

              building.amount =
                savedBuilding.amount ?? 0;

            }

          }
        );

      }


      if (data.upgrades) {

        data.upgrades.forEach(
          savedUpgrade => {

            const upgrade =
              this.upgrades.find(
                upgrade =>
                  upgrade.id ===
                  savedUpgrade.id
              );


            if (upgrade) {

              upgrade.purchased =
                savedUpgrade.purchased ??
                false;

            }

          }
        );

      }

    } catch (error) {

      console.log(
        "Save kon niet geladen worden."
      );

    }
  }


  createFloatingText(text) {
    const floatingText =
      document.createElement("div");


    floatingText.classList.add(
      "floating-text"
    );


    floatingText.textContent =
      text;


    floatingText.style.left =
      `${Math.random() * 20 + 40}%`;


    floatingText.style.top =
      "50%";


    this.floatingLayer.appendChild(
      floatingText
    );


    setTimeout(() => {

      floatingText.remove();

    }, 1000);
  }


  reset() {

    localStorage.removeItem(
      "soccerClickerSave"
    );


    this.points = 0;


    this.buildings.forEach(
      building => {

        building.amount = 0;
        building.multiplier = 1;

      }
    );


    this.upgrades.forEach(
      upgrade => {

        upgrade.purchased = false;

      }
    );


    this.recalculateBonuses();


    this.closeResetModal();


    this.updateDisplay();
    this.updateShop();
    this.updateUpgrades();


    this.save();
  }
}


const game =
  new SoccerClickerGame();