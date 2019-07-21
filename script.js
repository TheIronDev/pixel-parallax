
class RenderObject {
  /**
   * @param {!HTMLCanvasElement} ctx
   * @param {number} xStep
   * @param {number} yStep
   * @param {number} xMax
   * @param {number} yMax
   * @param {number} size
   * @param {number} speed
   */
  constructor(ctx, xStep, yStep, xMax, yMax, size, speed) {
    this.ctx = ctx;
    this.xStep = xStep;
    this.yStep = yStep;
    this.xMax = xMax;
    this.yMax = yMax;
    this.size = size;
    this.speed = speed;
  }

  /** @abstract */
  draw() {}

  /** @abstract */
  reset() {}

  /** @abstract */
  move() {}
}

class Cloud extends RenderObject {
  draw(width, height) {
    this.ctx.lineWidth = this.size;

    height = height/2;
    width = width/2;

    const x = (width / this.xMax) * this.xStep;
    const y = (height / this.yMax) * this.yStep;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + 18 * (width / this.xMax), y);

    this.ctx.moveTo(x + 5 * (width / this.xMax), y - (height / this.yMax));
    this.ctx.lineTo(x + 9 * (width / this.xMax), y - (height / this.yMax));
    this.ctx.stroke();
  }

  move() {
    this.xStep -= this.speed;

    if ((this.xStep + this.size) < 0) {
      this.reset();
    }
  }

  reset() {
    this.xStep = this.xMax + this.size;
  }
}

class Building extends RenderObject {
  draw(width, height) {
    width = width/2;

    const x = (width / this.xMax) * this.xStep;
    const buildingBase = height / 3;
    this.ctx.fillStyle = '#555';
    this.ctx.beginPath();
    this.ctx.fillRect(x, buildingBase, 20, this.size * -1);
    this.ctx.fillStyle = '#fff';
    for (let i = 0; i < this.size/10 - 1; i ++) {
      this.ctx.fillRect(x + 2.5, buildingBase - 2.5 - (i * 10), 5, -5);
      this.ctx.fillRect(x + 12.5, buildingBase - 2.5 - (i * 10), 5, -5);
    }
  }

  move() {
    this.xStep -= this.speed;

    if ((this.xStep + 20) < 0) {
      this.reset();
    }
  }

  reset() {
    this.xStep = this.xMax;
  }
}

class App {
  constructor(window, ctx, clouds, buildings) {
    this.window = window;
    this.ctx = ctx;
    this.clouds = clouds;
    this.buildings = buildings;

    this.height = 0;
    this.width = 0;
  }

  drawBuildings_() {
    this.ctx.fillStyle = '#666';
    this.buildings.forEach(building => {
      building.move();
      building.draw(this.width, this.height);
    });
  }

  drawClouds_() {
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineCap = 'round';
    this.clouds.forEach(cloud => {
      cloud.move();
      cloud.draw(this.width, this.height);
    });
  }

  drawGround_() {
    this.ctx.fillStyle = '#2d7229';
    this.ctx.beginPath();
    this.ctx.fillRect(0, this.height / 3, this.width, this.height);
  }

  clearCtx() {
    this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  draw() {
    this.clearCtx();
    this.drawClouds_();
    this.drawBuildings_();
    this.drawGround_();
  }

  renderLoop() {
    this.window.requestAnimationFrame(() => this.renderLoop());
    this.draw();
  }

  resize() {
    const {innerHeight, innerWidth, devicePixelRatio} = this.window;
    this.height = innerHeight;
    this.width = innerWidth;

    this.ctx.canvas.height = innerHeight * devicePixelRatio;
    this.ctx.canvas.width = innerWidth * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
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
    const xMax = 1000;
    const x = ~~(Math.random() * xMax);

    const yMax = 100;
    const y = Math.random() * yMax/2;

    const size = 10 + Math.random() * 10;
    const speed = Math.random() * 2;
    clouds.push(new Cloud(ctx, xMax + ~~(x /2), ~~y, xMax, yMax, ~~size, ~~speed + 1));
  }
  return clouds;
}

function initBuildings(ctx, count) {
  const buildings = [];
  while (count--) {
    const xMax = 1000;
    const x = count * 100;

    const yMax = 100;
    const y = Math.random() * yMax/2;

    const size = 50 + ~~(Math.random() * 100);
    buildings.push(new Building(ctx, xMax + ~~(x /2), ~~y, xMax, yMax, ~~size, 1));
  }
  return buildings;
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clouds = initClouds(ctx, 10);
const buildings = initBuildings(ctx, 10);

// Create our "app"
const app = new App(window, ctx, clouds, buildings);

// Start the render loop
app.start();
