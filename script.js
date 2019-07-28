
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

  update(renderConfig) {
    this.tick++;
    if (this.tick >= this.getMaxTick()) this.tick = 0;
  }

  preRender({ctx, width, height}) {}

  /** @abstract */
  render({ctx}) {}

  /** @abstract */
  reset(width, height) {}

  setRandomSeed(max = 15) {
    this.seed = ~~(Math.random() * max) + 1;
  }

  setTick(tick) {
    this.tick = tick;
  }

  /** @abstract */
  static generate() {}
}

class Cloud extends RenderObject {
  preRender({ctx, width, height}) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
  }

  render({ctx}) {
    const x = this.x;
    const y = this.y;
    ctx.lineWidth = this.size;

    ctx.save(x, y - this.size/2, 20, -this.size);

    ctx.rect(x - 10, y, 40, -this.size);
    ctx.clip();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18, y);

    ctx.moveTo(x + 5, y - this.size/3);
    ctx.lineTo(x + 9, y - this.size/3);
    ctx.stroke();


    ctx.restore();
  }

  reset({ctx, width, height}) {
    this.x = width + this.size;
  }

  update(renderConfig) {
    this.x -= this.speed;

    if ((this.x + this.size + 18) < 0) {
      this.reset(renderConfig);
    }
    super.update(renderConfig);
  }

  static generate(width, height) {
    const xMax = width;
    const x = ~~(Math.random() * xMax);

    const y = Math.random() * height / 3;

    const size = 10 + Math.random() * 10;
    const speed = 1 + ~~(Math.random() * 2);
    return new Cloud(~~(x), ~~y, ~~size, speed/4);
  }
}

class Building extends RenderObject {
  preRender({ctx}) {
    ctx.fillStyle = '#666';
  }

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

    const openWindow = '#FFE9F0';
    const seed = this.seed;
    for (let row = 0; row < this.size/5 - 1; row ++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = (row + col + 1)%seed === 0 ? 'transparent' : openWindow;
        ctx.fillRect(x + 2.5 + (col * 5), buildingBase - 2.5 - (row * 5), 2.5, -2.5);
      }
    }
  }

  render({ctx, width, height, skyline}) {
    const x = this.x;
    const buildingBase = skyline;
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

  static generate(index) {
    const x = this.BUILDING_SPACE * index;

    const yMax = 100;
    const y = Math.random() * yMax/2;

    const size = 10 + ~~(Math.random() * 150);
    return new Building(~~(x), ~~y, ~~size, 0);
  }
}
Building.BUILDING_WIDTH = 22.5;
Building.BUILDING_SPACE = Building.BUILDING_WIDTH - 1;
Building.MAX_SEED = 35;

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
  render({ctx, width, height, skyline}) {
    ctx.fillStyle = this.getColor();
    ctx.beginPath();
    ctx.fillRect(0, 0, width, skyline);
  }
}

class Lake extends RenderObject {
  render({ctx, width, height, tempCtx, skyline}) {
    tempCtx.drawImage(ctx.canvas, 0, 0, width, skyline);
    ctx.save();

    ctx.scale(1, -1);
    ctx.translate(0, -height);
    ctx.drawImage(tempCtx.canvas, 0, 0, width, skyline);
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,255,.4)';

    var gradient = ctx.createLinearGradient(0, skyline, 0, height);

    gradient.addColorStop(0, 'rgba(0,0,255,.4)');
    gradient.addColorStop(.5, 'rgba(200,200,255,.8)');
    gradient.addColorStop(.7, 'rgba(200,200,255,.8)');
    gradient.addColorStop(1, 'rgba(200,200,255,1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, skyline, width, height);
  }
}

class Ground extends RenderObject {
  render({ctx, width, height, skyline}) {
    ctx.fillStyle = '#2d7229';
    ctx.beginPath();
    ctx.fillRect(0, skyline, width, 30);
    ctx.fillRect(0, height, width, -30);
  }
}

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

  draw(assets) {
    this.clear();

    const height = this.height;
    const skyline = this.height * 2/ 3;
    const width = this.width;
    const {ctx, tempCtx} = this;
    const renderOptions = {height, width, skyline, ctx, tempCtx};
    assets.forEach((asset) => {
      asset.update(renderOptions);
      asset.preRender(renderOptions);
      asset.render(renderOptions);
    });
  }

  setDimensions(height, width, devicePixelRatio = 1) {

    this.height = height;
    this.width = width;

    this.ctx.canvas.style.height = (innerHeight) + 'px';
    this.ctx.canvas.style.width = (innerWidth) + 'px';
    this.ctx.canvas.height = innerHeight * devicePixelRatio;
    this.ctx.canvas.width = innerWidth * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    this.tempCtx.canvas.style.height = (innerHeight) + 'px';
    this.tempCtx.canvas.style.width = (innerWidth) + 'px';
    this.tempCtx.canvas.height = innerHeight * devicePixelRatio;
    this.tempCtx.canvas.width = innerWidth * devicePixelRatio;
    this.tempCtx.scale(devicePixelRatio, devicePixelRatio);
  }
}

class App {
  constructor(window, renderer) {
    this.window = window;
    this.renderer = renderer;
    this.assets = [];

    this.height = 0;
    this.width = 0;
  }

  draw() {
    this.renderer.draw(this.assets);
  }

  renderLoop() {
    this.window.requestAnimationFrame(() => this.renderLoop());
    this.draw();
  }

  resize() {
    const {innerHeight, innerWidth, devicePixelRatio} = this.window;
    this.height = innerHeight;
    this.width = innerWidth;
    this.renderer.setDimensions(innerHeight, innerWidth, devicePixelRatio);
  }

  setDefaultAssets() {

    const clouds = initClouds(10, ctx);
    const buildings = initBuildings(window.innerWidth);
    const sky = new Sky();
    const ground = new Ground();
    const lake = new Lake();

    // Forcefully set the time to 8am (otherwise it starts at midnight, too dark)
    sky.setTick(800);

    const assets = [sky, ...clouds, ...buildings, lake, ground];
    this.assets = assets;
  }

  start() {
    this.resize();
    this.window.addEventListener('resize', () => this.resize());
    this.setDefaultAssets();
    this.renderLoop();
  }
}

function initClouds(count, ctx) {
  const clouds = [];
  while (count--) {
    clouds.push(Cloud.generate(ctx.canvas.width, ctx.canvas.height));
  }
  return clouds;
}

function initBuildings(totalWidth) {
  const buildings = [];
  const count = ~~(totalWidth / Building.BUILDING_SPACE);
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
const renderr = new Renderer(ctx, tempCtx);

// Create our "app"
const app = new App(window, renderr);

// Start the render loop
app.start();
