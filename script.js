
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
  render(ctx) {
    ctx.lineWidth = this.size;

    const x = this.x;
    const y = this.y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18, y);

    ctx.moveTo(x + 5, y - this.size/2);
    ctx.lineTo(x + 9, y - this.size/2);
    ctx.stroke();
  }

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
  renderBuildingSide(ctx, buildingBase, buildingWidth) {
    const x = this.x;

    ctx.beginPath();
    ctx.fillRect(x, buildingBase, buildingWidth, this.size * -1);

    // top
    ctx.fillRect(x + 2.5, buildingBase - this.size, buildingWidth -5, -3);

    // tippy top
    ctx.fillRect(x + 5, buildingBase - this.size, buildingWidth -10, -6);

    ctx.arc(x + buildingWidth/2, buildingBase - this.size - 5, 5, 0, Math.PI * 2);
    if (this.size > 100) {
      ctx.fillRect(x + buildingWidth/2 - 2, buildingBase - this.size, 4, -15);
    } else if (this.size > 50) {
      ctx.arc(x + buildingWidth/2, buildingBase - this.size - 5, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderBuildingWindows(ctx, buildingBase, buildingWidth, width) {
    ctx.fillStyle = '#fff';
    const x = this.x;

    // skyscrapers windows
    if (this.size > 100) {
      for (let i = 0; i < this.size/5 - 1; i ++) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x, buildingBase - 2.5 - (i * 5), buildingWidth, -2.5);
      }
      if (this.size > 150) {
        ctx.fillStyle = '#1b96ff';
        ctx.fillRect(x + 2.5, buildingBase - this.size + 5, 10, 10);
        ctx.fillRect(x + 17.5, buildingBase - this.size + 5, 3, 10);
      }
      return;
    }

    const seed = this.seed;
    for (let i = 0; i < this.size/5 - 1; i ++) {
      ctx.fillStyle = (i+1)%seed === 0 ? 'transparent' : '#FFE9F0';
      ctx.fillRect(x + 2.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
      ctx.fillStyle = (i + 2)%seed === 0 ? 'transparent' : '#FFE9F0';
      ctx.fillRect(x + 7.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
      ctx.fillStyle = (i + 3)%seed === 0 ? 'transparent' : '#FFE9F0';
      ctx.fillRect(x + 12.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
      ctx.fillStyle = (i + 4)%seed === 0 ? 'transparent' : '#FFE9F0';
      ctx.fillRect(x + 17.5, buildingBase - 2.5 - (i * 5), 2.5, -2.5);
    }
  }

  render(ctx, width, height) {
    const x = this.x;
    const buildingBase = height / 3;
    const buildingWidth = 22.5;

    ctx.fillStyle = '#999';

    // Draw the entire building structure
    this.renderBuildingSide(ctx, buildingBase, buildingWidth, width);

    ctx.save();

    // Section off the right side of the building
    ctx.beginPath();
    ctx.rect(x + buildingWidth * 2/3, buildingBase, buildingWidth, this.size * -2);
    ctx.clip();
    ctx.fillStyle = '#666';

    // Draw the entire building structure
    this.renderBuildingSide(ctx, buildingBase, buildingWidth, width);
    ctx.restore();

    this.renderBuildingWindows(ctx, buildingBase, buildingWidth, width);
  }

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
  render(ctx, width, height) {
    ctx.fillStyle = this.getColor();
    ctx.beginPath();
    ctx.fillRect(0, 0, width, height / 3);
  }
}

class Lake extends RenderObject {
  render(ctx, width, height, tempCtx) {
    tempCtx.drawImage(ctx.canvas, 0, 0, width, height);
    ctx.save();

    ctx.scale(1, -1);
    ctx.translate(0, -height * 2/3);
    ctx.drawImage(tempCtx.canvas, 0, 0, width, height);
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,255,.4)';

    var gradient = ctx.createLinearGradient(0, height / 3, 0, height /2);

    gradient.addColorStop(0, 'rgba(0,0,255,.4)');
    gradient.addColorStop(.5, 'rgba(200,200,255,.8)');
    gradient.addColorStop(.7, 'rgba(200,200,255,.8)');
    gradient.addColorStop(1, 'rgba(200,200,255,1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, height /3, width, height);

  }
}

class Ground extends RenderObject {
  render(ctx, width, height) {
    ctx.fillStyle = '#2d7229';
    ctx.beginPath();
    ctx.fillRect(0, height/3, width, 10);
    ctx.fillRect(0, height/2, width, -20);
  }
}

Building.MAX_SEED = 35;

class Renderer {
  constructor(ctx, tempCtx) {
    this.ctx = ctx;
    this.tempCtx = tempCtx;
    this.height = 0;
    this.width = 0;
  }

  clear() {
    this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.tempCtx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawBuildings(buildings) {
    this.ctx.fillStyle = '#666';
    let width = this.width;
    let height = this.height;
    buildings.forEach((building) => {
      building.update();
      building.render(this.ctx, width, height);
    });
  }

  drawClouds(clouds) {
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineCap = 'round';
    clouds.forEach(cloud => {
      cloud.update();
      cloud.render(this.ctx);
    });
  }

  draw(buildings, clouds, sky, lake, ground) {
    this.clear();

    sky.update();
    sky.render(this.ctx, this.width, this.height);

    this.drawClouds(clouds);
    this.drawBuildings(buildings);
    lake.render(this.ctx, this.width, this.height, this.tempCtx);
    ground.render(this.ctx, this.width, this.height);
  }

  setDimensions(height, width, devicePixelRatio) {

    this.height = height;
    this.width = width;

    this.ctx.canvas.height = innerHeight * devicePixelRatio;
    this.ctx.canvas.width = innerWidth * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    this.tempCtx.canvas.height = innerHeight * devicePixelRatio;
    this.tempCtx.canvas.width = innerWidth * devicePixelRatio;
    this.tempCtx.scale(devicePixelRatio, devicePixelRatio);
  }
}

class App {
  constructor(window, renderer, clouds, buildings, sky, lake, ground) {
    this.window = window;
    this.renderer = renderer;
    this.clouds = clouds;
    this.buildings = buildings;
    this.sky = sky;
    this.lake = lake;
    this.ground = ground;

    this.height = 0;
    this.width = 0;
  }

  draw() {
    this.renderer.draw(this.buildings, this.clouds, this.sky, this.lake, this.ground);
  }

  renderLoop() {
    this.window.requestAnimationFrame(() => this.renderLoop());
    this.draw();
  }

  resize() {
    const {innerHeight, innerWidth, devicePixelRatio} = this.window;
    this.renderer.setDimensions(innerHeight, innerWidth, devicePixelRatio);
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
const ground = new Ground();
const lake = new Lake();

const renderr = new Renderer(ctx, tempCtx);

// Create our "app"
const app = new App(window, renderr, clouds, buildings, sky, lake, ground);

// Start the render loop
app.start();
