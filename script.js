
class RenderObject {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} size
   * @param {number} speed
   */
  constructor(x = 0, y = 0, size = 1, speed = 1) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.tick = 0;

    this.setRandomSeed();
  }

  getMaxTick() {
    return 100;
  }

  update() {
    this.tick++;
    if (this.tick >= this.getMaxTick()) this.tick = 0;
  }

  /** @abstract */
  render(ctx) {}

  /** @abstract */
  reset() {}

  setRandomSeed() {
    this.seed = ~~(Math.random() * 15) + 1;
  }

  /** @abstract */
  static generate() {}
}

class Cloud extends RenderObject {

  reset() {
    this.xStep = this.xMax + this.size;
  }

  update() {
    this.x -= this.speed;

    if ((this.x + this.size) < 0) {
      this.reset();
    }
    super.update();
  }

  static generate() {
    const xMax = 1000;
    const x = ~~(Math.random() * xMax);

    const yMax = 200;
    const y = Math.random() * yMax / 2;

    const size = 10 + Math.random() * 10;
    const speed = Math.random() * 2;
    return new Cloud(~~(x), ~~y, ~~size, speed/3);
  }
}

class Building extends RenderObject {
  setRandomSeed() {
    this.seed = ~~(Math.random() * 15) + 20;
  }

  static generate(index, width) {
    const x = this.BUILDING_WIDTH * index;

    const yMax = 100;
    const y = Math.random() * yMax/2;

    const size = 10 + ~~(Math.random() * 150);
    return new Building(~~(x), ~~y, ~~size, 0);
  }
}
Building.BUILDING_WIDTH = 22.5;

class Sky extends RenderObject {
  getColor() {
    const time = this.getTime();
    const tick = this.getTick();
    if (time < 6) {
      return `rgb(50, 50, 50)`;
    }
    if (time < 8) {
      const diff = ((tick - 600)/200);
      const r = diff * (92 - 50) + 50;
      const g = diff * (203 - 50) + 50;
      const b = diff * (255 - 50) + 50;
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (time < 18) {
      return `rgb(92, 203, 255)`;
    }

    // 92, 1800... 92 - 0
    // 50, 2400... 92 - 42 * 1
    const diff = ((tick-1800)/600);
    const r = 92 - diff * (92 - 50);
    const g = 203 - diff * (203 - 50);
    const b = 255 - diff * (255 - 50);
    return `rgb(${r}, ${g}, ${b})`;
  }

  getMaxTick() {
    return 2400;
  }
  getTick() {
    return this.tick % 2400;
  }
  getTime() {
    return ~~(this.getTick() / 100);
  }
}

Building.MAX_SEED = 35;

class Renderer {
  constructor(ctx, tempCtx) {
    this.ctx = ctx;
    this.tempCtx = tempCtx;
    this.height = 0;
    this.width = 0;
    this.devicePixelRatio = 1;
  }

  clear() {
    this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.tempCtx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawBuildings(buildings) {
    this.ctx.fillStyle = '#666';
    buildings.forEach((building, index) => {
      building.update();
      this.drawBuilding(building, index);
    });
  }

  drawBuildingSide(building, buildingBase, buildingWidth) {
    const x = building.x;

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
    const x = building.x;

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

    const x = building.x;
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
      cloud.update();
      this.drawCloud(cloud);
    });
  }

  drawCloud(cloud) {
    this.ctx.lineWidth = cloud.size;

    const x = cloud.x;
    const y = cloud.y;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + 18, y);

    this.ctx.moveTo(x + 5, y - cloud.size/2);
    this.ctx.lineTo(x + 9, y - cloud.size/2);
    this.ctx.stroke();
  }

  drawGround() {
    this.ctx.fillStyle = '#2d7229';
    this.ctx.beginPath();
    this.ctx.fillRect(0, this.height/3, this.width, 10);
    this.ctx.fillRect(0, this.height/2, this.width, -20);
  }

  drawReflectiveWater() {
    this.tempCtx.drawImage(this.ctx.canvas, 0, 0, this.width, this.height);
    this.ctx.save();

    this.ctx.scale(1, -1);
    this.ctx.translate(0, -this.height * 2/3);
    this.ctx.drawImage(this.tempCtx.canvas, 0, 0, this.width, this.height);
    this.ctx.restore();

    this.ctx.fillStyle = 'rgba(0,0,255,.4)';

    var gradient = ctx.createLinearGradient(0, this.height / 3, 0, this.height /2);

    gradient.addColorStop(0, 'rgba(0,0,255,.4)');
    gradient.addColorStop(.5, 'rgba(200,200,255,.8)');
    gradient.addColorStop(.7, 'rgba(200,200,255,.8)');
    gradient.addColorStop(1, 'rgba(200,200,255,1)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, this.height /3, this.width, this.height);
  }

  drawSky(sky) {
    sky.update();
    this.ctx.fillStyle = sky.getColor();
    this.ctx.beginPath();
    this.ctx.fillRect(0, 0, this.width, this.height / 3);
  }

  draw(buildings, clouds, sky) {
    this.clear();
    this.drawSky(sky);
    this.drawClouds(clouds);
    this.drawBuildings(buildings);
    this.drawReflectiveWater();
    this.drawGround();
  }

  setDimentions(height, width, devicePixelRatio) {

    this.height = height;
    this.width = width;
    this.devicePixelRatio = devicePixelRatio;

    this.ctx.canvas.height = innerHeight * devicePixelRatio;
    this.ctx.canvas.width = innerWidth * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    this.tempCtx.canvas.height = innerHeight * devicePixelRatio;
    this.tempCtx.canvas.width = innerWidth * devicePixelRatio;
    this.tempCtx.scale(devicePixelRatio, devicePixelRatio);
  }
}

class App {
  constructor(window, renderer, clouds, buildings, sky) {
    this.window = window;
    this.renderer = renderer;
    this.clouds = clouds;
    this.buildings = buildings;
    this.sky = sky;

    this.height = 0;
    this.width = 0;
  }

  draw() {
    this.renderer.draw(this.buildings, this.clouds, this.sky);
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

function initClouds(count) {
  const clouds = [];
  while (count--) {
    clouds.push(Cloud.generate());
  }
  return clouds;
}

function initBuildings(count, ctx) {
  const buildings = [];
  for (let i = 0; i <= count/2; i++) {
    buildings.push(Building.generate(i));
    if (i !== count -i) buildings.push(Building.generate(count - i, ctx.canvas.width));
  }
  return buildings;
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tempCanvas = document.getElementById('tempCanvas');
const tempCtx = tempCanvas.getContext('2d');
const clouds = initClouds(10);
const buildings = initBuildings(10, ctx);
const sky = new Sky();

const renderr = new Renderer(ctx, tempCtx);

// Create our "app"
const app = new App(window, renderr, clouds, buildings, sky);

// Start the render loop
app.start();
