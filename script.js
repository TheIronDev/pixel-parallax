
class RenderObject {
  /**
   * @param {number} xStep
   * @param {number} yStep
   * @param {number} xMax
   * @param {number} yMax
   * @param {number} size
   * @param {number} speed
   */
  constructor(xStep, yStep, xMax, yMax, size, speed) {
    this.xStep = xStep;
    this.yStep = yStep;
    this.xMax = xMax;
    this.yMax = yMax;
    this.size = size;
    this.speed = speed;
  }

  /** @abstract */
  reset() {}

  /** @abstract */
  move() {}

  /** @abstract */
  static generate() {}
}

class Cloud extends RenderObject {
  move() {
    this.xStep -= this.speed;

    if ((this.xStep + this.size) < 0) {
      this.reset();
    }
  }

  reset() {
    this.xStep = this.xMax + this.size;
  }

  static generate() {
    const xMax = 1000;
    const x = ~~(Math.random() * xMax);

    const yMax = 100;
    const y = Math.random() * yMax / 2;

    const size = 10 + Math.random() * 10;
    const speed = Math.random() * 2;
    return new Cloud(xMax + ~~(x /2), ~~y, xMax, yMax, ~~size, speed/3);
  }
}

class Building extends RenderObject {
  move() {
    this.xStep -= this.speed;

    if ((this.xStep + 20) < 0) {
      this.reset();
    }
  }

  reset() {
    this.xStep = this.xMax;
  }

  setRandomSeed() {
    this.seed = ~~(Math.random() * 15) + 20;
  }

  static generate(index) {
    const xMax = 1000;
    const x = 50 * index;

    const yMax = 100;
    const y = Math.random() * yMax/2;

    const size = 10 + ~~(Math.random() * 150);
    const building = new Building(xMax + ~~(x /2), ~~y, xMax, yMax, ~~size, 1/4);
    building.setRandomSeed();
    return building;
  }
}

Building.MAX_SEED = 35;

class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.height = 0;
    this.width = 0;
    this.devicePixelRatio = 1;
  }

  clear() {
    this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawBuildings(buildings) {
    this.ctx.fillStyle = '#666';
    buildings.forEach((building, index) => {
      building.move();
      this.drawBuilding(building, index);
    });
  }

  drawBuildingSide(building, buildingBase, buildingWidth, width) {
    const x = (width / building.xMax) * building.xStep;

    this.ctx.beginPath();
    this.ctx.fillRect(x, buildingBase, buildingWidth, building.size * -1);

    // top
    this.ctx.fillRect(x + 2.5, buildingBase - building.size, buildingWidth -5, -3);

    // tippy top
    this.ctx.fillRect(x + 5, buildingBase - building.size, buildingWidth -10, -6);

    this.ctx.arc(x + buildingWidth/2, buildingBase - building.size - 5, 5, 0, Math.PI * 2);
    if (building.size > 100) {
      this.ctx.fillRect(x + buildingWidth/2 - 2, buildingBase - building.size, 4, -15);
    } else if (building.size > 50) {
      this.ctx.arc(x + buildingWidth/2, buildingBase - building.size - 5, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawBuildingWindows(building, buildingBase, buildingWidth, width) {
    this.ctx.fillStyle = '#fff';
    const x = (width / building.xMax) * building.xStep;

    // skyscrapers windows
    if (building.size > 100) {
      for (let i = 0; i < building.size/5 - 1; i ++) {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, buildingBase - 2.5 - (i * 5), buildingWidth, -2.5);
      }
      if ( building.size > 150) {
        this.ctx.fillStyle = '#1b96ff';
        this.ctx.fillRect(x + 2.5, buildingBase - building.size + 5, 10, 10);
        this.ctx.fillRect(x + 17.5, buildingBase - building.size + 5, 3, 10);
      }
      return;
    }

    const seed = building.seed;
    for (let i = 0; i < building.size/5 - 1; i ++) {
      this.ctx.fillStyle = (i+1)%seed === 0 ? 'transparent' : '#FFE9F0';
      this.ctx.fillRect(x + 2.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
      this.ctx.fillStyle = (i + 2)%seed === 0 ? 'transparent' : '#FFE9F0';
      this.ctx.fillRect(x + 7.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
      this.ctx.fillStyle = (i + 3)%seed === 0 ? 'transparent' : '#FFE9F0';
      this.ctx.fillRect(x + 12.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
      this.ctx.fillStyle = (i + 4)%seed === 0 ? 'transparent' : '#FFE9F0';
      this.ctx.fillRect(x + 17.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
    }
  }

  drawBuilding(building) {
    let width = this.width/this.devicePixelRatio;

    const x = (width / building.xMax) * building.xStep;
    const buildingBase = this.height / 3;
    const buildingWidth = 22.5;

    this.ctx.fillStyle = '#999';

    // Draw the entire building structure
    this.drawBuildingSide(building, buildingBase, buildingWidth, width);

    this.ctx.save();

    // Section off the right side of the building
    this.ctx.beginPath();
    this.ctx.rect(x + buildingWidth * 2/3, buildingBase, buildingWidth, building.size * -2);
    this.ctx.clip();
    this.ctx.fillStyle = '#666';

    // Draw the entire building structure
    this.drawBuildingSide(building, buildingBase, buildingWidth, width);
    this.ctx.restore();

    this.drawBuildingWindows(building, buildingBase, buildingWidth, width);
  }

  drawClouds(clouds) {
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineCap = 'round';
    clouds.forEach(cloud => {
      cloud.move();
      this.drawCloud(cloud);
    });
  }

  drawCloud(cloud) {
    this.ctx.lineWidth = cloud.size;

    let height = this.height/this.devicePixelRatio;
    let width = this.width/this.devicePixelRatio;

    const x = (width / cloud.xMax) * cloud.xStep;
    const y = (height / cloud.yMax) * cloud.yStep;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + 18 * (width / cloud.xMax), y);

    this.ctx.moveTo(x + 5 * (width / cloud.xMax), y - (height / cloud.yMax));
    this.ctx.lineTo(x + 9 * (width / cloud.xMax), y - (height / cloud.yMax));
    this.ctx.stroke();
  }

  drawGround() {
    this.ctx.fillStyle = '#2d7229';
    this.ctx.beginPath();
    this.ctx.fillRect(0, this.height / 3, this.width, this.height);
  }

  draw(buildings, clouds) {
    this.clear();
    this.drawClouds(clouds);
    this.drawBuildings(buildings);
    this.drawGround();
  }

  setDimentions(height, width, devicePixelRatio) {

    this.height = height;
    this.width = width;
    this.devicePixelRatio = devicePixelRatio;

    this.ctx.canvas.height = innerHeight * devicePixelRatio;
    this.ctx.canvas.width = innerWidth * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }
}

class App {
  constructor(window, renderer, clouds, buildings) {
    this.window = window;
    this.renderer = renderer;
    this.clouds = clouds;
    this.buildings = buildings;

    this.height = 0;
    this.width = 0;
  }

  draw() {
    this.renderer.draw(this.buildings, this.clouds);
  }

  renderLoop() {
    this.window.requestAnimationFrame(() => this.renderLoop());
    this.draw();
  }

  resize() {
    const {innerHeight, innerWidth, devicePixelRatio} = this.window;
    this.renderer.setDimentions(innerHeight, innerWidth, devicePixelRatio);
  }

  start() {
    this.resize();
    this.window.addEventListener('resize', () => this.resize());
    this.renderLoop();
  }
}

function initClouds(ctx, count) {
  const clouds = [];
  while (count--) {
    clouds.push(Cloud.generate());
  }
  return clouds;
}

function initBuildings(ctx, count) {
  const buildings = [];
  let i = 0;
  for (let i = 0; i <= count/2; i++) {
    buildings.push(Building.generate(i));
    if (i !== count -i) buildings.push(Building.generate(count - i));
  }
  return buildings;
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clouds = initClouds(ctx, 10);
const buildings = initBuildings(ctx, 10);

const renderr = new Renderer(ctx);

// Create our "app"
const app = new App(window, renderr, clouds, buildings);

// Start the render loop
app.start();
