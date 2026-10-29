// Alle productie-eenheden gebruiken dezelfde klasse.
class Building {
  constructor(id, name, baseCost, pointsPerSecond) {
    Object.assign(this, { id, name, baseCost, pointsPerSecond });
    this.amount = 0;
    this.multiplier = 1;
  }

  getCost() {
    return Math.floor(this.baseCost * 1.15 ** this.amount);
  }

  getTotalPps(globalMultiplier) {
    return this.amount * this.pointsPerSecond * this.multiplier * globalMultiplier;
  }

  buy(game) {
    const cost = this.getCost();
    if (game.points < cost) return false;
    game.points -= cost;
    this.amount++;
    return true;
  }
}

// Upgrade is de basisklasse; de drie subclasses geven elk een ander effect.
class Upgrade {
  constructor(id, name, cost, description, value) {
    Object.assign(this, { id, name, cost, description, value });
    this.purchased = false;
  }

  buy(game) {
    if (!this.canBuy(game)) return false;
    game.points -= this.cost;
    this.purchased = true;
    game.recalculateBonuses();
    return true;
  }

  canBuy(game) {
    return !this.purchased && game.points >= this.cost;
  }

  apply(game) {}
}

class ClickUpgrade extends Upgrade {
  apply(game) { game.clickMultiplier *= this.value; }
}

class BuildingUpgrade extends Upgrade {
  constructor(id, name, cost, description, target, value) {
    super(id, name, cost, description, value);
    this.target = target;
  }

  apply(game) {
    const building = game.buildings.find(item => item.id === this.target);
    if (building) building.multiplier *= this.value;
  }
}

class GlobalUpgrade extends Upgrade {
  apply(game) { game.globalPpsMultiplier *= this.value; }
}

// Bal-skins erven van Upgrade en worden stap voor stap vrijgespeeld.
class BallSkinUpgrade extends Upgrade {
  constructor(id, name, cost, description, image, previousSkin = null) {
    super(id, name, cost, description, 1);
    Object.assign(this, { image, previousSkin });
  }

  canBuy(game) {
    const previous = this.previousSkin && game.upgrades.find(item => item.id === this.previousSkin);
    return super.canBuy(game) && (!this.previousSkin || previous?.purchased);
  }

  apply(game) {
    game.elements.ballImage.src = this.image;
    game.elements.ballImage.alt = `Voetbal: ${this.name}`;
    game.elements.ballImage.classList.remove("skin-change");
    void game.elements.ballImage.offsetWidth;
    game.elements.ballImage.classList.add("skin-change");
  }
}

class SoccerClickerGame {
  constructor() {
    this.points = 0;
    this.basePointsPerClick = 1;
    this.clickMultiplier = 1;
    this.globalPpsMultiplier = 1;
    this.buildings = [
      new Building("ballboy", "Ballenjongen", 15, 1),
      new Building("trainer", "Trainer", 60, 4),
      new Building("ballrack", "Ballenrek", 200, 10),
      new Building("machine", "Ballenmachine", 750, 25),
      new Building("factory", "Voetbalfabriek", 2500, 75),
      new Building("academy", "Voetbal Academie", 8000, 200),
      new Building("stadium", "Stadion", 25000, 600),
      new Building("worldcup", "Wereldbeker Centrum", 100000, 1800)
    ];
    this.upgrades = [
      new ClickUpgrade("goldenBall", "Gouden Bal", 100, "Verdubbelt je klikpunten", 2),
      new ClickUpgrade("speedBoots", "Snelle Schoenen", 500, "Verdubbelt je klikpunten opnieuw", 2),
      new BuildingUpgrade("superTrainer", "Super Trainer", 1200, "Trainers geven 2x zoveel punten", "trainer", 2),
      new BuildingUpgrade("machineUpgrade", "Snellere Ballenmachine", 2500, "Ballenmachines geven 2x zoveel punten", "machine", 2),
      new BuildingUpgrade("factoryUpgrade", "Moderne Fabriek", 7000, "Fabrieken geven 2x zoveel punten", "factory", 2),
      new GlobalUpgrade("sponsor", "Grote Sponsor", 15000, "Alle gebouwen produceren 1.5x zoveel", 1.5),
      new ClickUpgrade("diamondBall", "Diamanten Bal", 40000, "Klikpunten worden 3x zo sterk", 3),
      new BuildingUpgrade("stadiumUpgrade", "Stadion Upgrade", 75000, "Stadions geven 2x zoveel punten", "stadium", 2),
      new BallSkinUpgrade("goldSkin", "Gouden Voetbal", 750, "Speel de gouden bal vrij", "ball-gold.svg"),
      new BallSkinUpgrade("redSkin", "Rode Voetbal", 5000, "Speel de rode bal vrij", "ball-red.svg", "goldSkin"),
      new BallSkinUpgrade("multicolorSkin", "Regenboog Voetbal", 25000, "Speel de meerkleurige bal vrij", "ball-multicolor.svg", "redSkin"),
      new BallSkinUpgrade("blueSkin", "Blauwe Voetbal", 100000, "Speel de blauwe bal vrij", "ball-blue.svg", "multicolorSkin")
    ];

    this.elements = Object.fromEntries([
      "pointsDisplay", "ppsDisplay", "clickButton", "clickButtonValue", "ballImage",
      "shopList", "upgradeList", "resetButton", "resetModal",
      "cancelReset", "confirmReset", "floatingLayer"
    ].map(id => [id, document.getElementById(id)]));

    this.load();
    this.recalculateBonuses();
    this.createShop();
    this.createUpgrades();
    this.addEvents();
    this.update();
    this.startGameLoop();
  }

  getPointsPerClick() {
    return this.basePointsPerClick * this.clickMultiplier;
  }

  getPointsPerSecond() {
    return this.buildings.reduce(
      (total, building) => total + building.getTotalPps(this.globalPpsMultiplier), 0
    );
  }

  recalculateBonuses() {
    this.clickMultiplier = 1;
    this.globalPpsMultiplier = 1;
    this.buildings.forEach(building => building.multiplier = 1);
    this.elements.ballImage.src = "soccer-ball.png";
    this.elements.ballImage.alt = "Voetbal";
    this.upgrades.filter(upgrade => upgrade.purchased).forEach(upgrade => upgrade.apply(this));
  }

  addEvents() {
    this.elements.clickButton.addEventListener("click", () => this.click());
    this.elements.resetButton.addEventListener("click", () => this.openResetModal());
    this.elements.cancelReset.addEventListener("click", () => this.closeResetModal());
    this.elements.confirmReset.addEventListener("click", () => this.reset());
    this.elements.resetModal.addEventListener("click", event => {
      if (event.target === this.elements.resetModal) this.closeResetModal();
    });
  }

  createShop() {
    this.elements.shopList.innerHTML = this.buildings.map((building, index) => `
      <div class="shop-item">
        <div class="shop-info"><h3>${building.name}</h3>
          <p>+${building.pointsPerSecond} punten per seconde</p>
          <p>In bezit: <span id="amount-${index}">${building.amount}</span></p>
        </div>
        <button class="buy-button" id="buy-${index}" type="button">Koop - <span id="cost-${index}">${building.getCost()}</span></button>
      </div>`).join("");

    this.buildings.forEach((_, index) => {
      document.getElementById(`buy-${index}`).addEventListener("click", () => this.buyBuilding(index));
    });
  }

  createUpgrades() {
    this.elements.upgradeList.innerHTML = this.upgrades.map((upgrade, index) => `
      <div class="shop-item" id="upgrade-card-${index}">
        <div class="shop-info"><h3>${upgrade.name}</h3><p>${upgrade.description}</p></div>
        <button class="buy-button" id="upgrade-${index}" type="button">Koop - ${upgrade.cost}</button>
      </div>`).join("");

    this.upgrades.forEach((_, index) => {
      document.getElementById(`upgrade-${index}`).addEventListener("click", () => this.buyUpgrade(index));
    });
  }

  click() {
    const earned = this.getPointsPerClick();
    this.points += earned;
    this.createFloatingText(`+${earned}`);
    this.update();
    this.save();
  }

  buyBuilding(index) {
    if (!this.buildings[index].buy(this)) return;
    this.update();
    this.save();
  }

  buyUpgrade(index) {
    if (!this.upgrades[index].buy(this)) return;
    this.update();
    this.save();
  }

  update() {
    this.elements.pointsDisplay.textContent = Math.floor(this.points).toLocaleString("nl-NL");
    this.elements.ppsDisplay.textContent = this.getPointsPerSecond().toFixed(1);
    this.elements.clickButtonValue.textContent = `+${this.getPointsPerClick()}`;

    this.buildings.forEach((building, index) => {
      document.getElementById(`amount-${index}`).textContent = building.amount;
      document.getElementById(`cost-${index}`).textContent = building.getCost().toLocaleString("nl-NL");
      document.getElementById(`buy-${index}`).disabled = this.points < building.getCost();
    });

    this.upgrades.forEach((upgrade, index) => {
      const button = document.getElementById(`upgrade-${index}`);
      const unlocked = upgrade.canBuy(this);
      const waitingForPreviousBall = upgrade instanceof BallSkinUpgrade &&
        upgrade.previousSkin &&
        !this.upgrades.find(item => item.id === upgrade.previousSkin)?.purchased;
      button.textContent = upgrade.purchased ? "Gekocht" :
        waitingForPreviousBall ? "Eerst vorige bal" : `Koop - ${upgrade.cost.toLocaleString("nl-NL")}`;
      button.disabled = !unlocked;
      document.getElementById(`upgrade-card-${index}`).style.opacity = upgrade.purchased ? "0.5" : "1";
    });
  }

  startGameLoop() {
    setInterval(() => {
      this.points += this.getPointsPerSecond() / 10;
      this.update();
    }, 100);
    setInterval(() => this.save(), 5000);
  }

  save() {
    const data = {
      points: this.points,
      buildings: this.buildings.map(({ id, amount }) => ({ id, amount })),
      upgrades: this.upgrades.map(({ id, purchased }) => ({ id, purchased }))
    };
    localStorage.setItem("soccerClickerSave", JSON.stringify(data));
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem("soccerClickerSave"));
      if (!data) return;
      this.points = Number.isFinite(data.points) ? data.points : 0;
      data.buildings?.forEach(saved => {
        const building = this.buildings.find(item => item.id === saved.id);
        if (building) building.amount = Math.max(0, Number(saved.amount) || 0);
      });
      data.upgrades?.forEach(saved => {
        const upgrade = this.upgrades.find(item => item.id === saved.id);
        if (upgrade) upgrade.purchased = Boolean(saved.purchased);
      });
    } catch {
      console.log("Save kon niet geladen worden.");
    }
  }

  createFloatingText(text) {
    const element = document.createElement("div");
    element.className = "floating-text";
    element.textContent = text;
    element.style.left = `${Math.random() * 20 + 40}%`;
    element.style.top = "50%";
    this.elements.floatingLayer.appendChild(element);
    setTimeout(() => element.remove(), 1000);
  }

  openResetModal() { this.elements.resetModal.classList.remove("hidden"); }
  closeResetModal() { this.elements.resetModal.classList.add("hidden"); }

  reset() {
    this.points = 0;
    this.buildings.forEach(building => building.amount = 0);
    this.upgrades.forEach(upgrade => upgrade.purchased = false);
    this.recalculateBonuses();
    this.closeResetModal();
    this.update();
    this.save();
  }
}

new SoccerClickerGame();
