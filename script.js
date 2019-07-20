
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

  move() {
    this.xStep -= this.speed;

    if ((this.xStep + this.size) < 0) {
      this.reset();
    }
  }
}

class Cloud extends RenderObject {
  draw() {
    const {height, width} = this.ctx.canvas;

    const x = (width / this.xMax) * this.xStep;
    const y = (height / this.yMax) * this.yStep;
    this.ctx.fillRect(x, y, this.size, this.size);
  }

  reset() {
    this.xStep = this.xMax + this.size;
  }
}

function animateClouds() {
  ctx.fillStyle = '#fff';
  clouds.forEach(cloud => cloud.move());
  clouds.forEach(cloud => cloud.draw());
}

function loop() {
  requestAnimationFrame(loop);
  ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
  animateClouds();
}

function initClouds(ctx, count) {
  while (count--) {
    const xMax = 100;
    const x = ~~(Math.random() * 20);

    const yMax = 100;
    const y = Math.random() * yMax/2;

    const size = 5 + Math.random() * 15;
    clouds.push(new Cloud(ctx, xMax + x, ~~y, xMax, yMax, ~~size, .5));
  }
}

function resizeCanvas(ctx, window) {
  const {innerHeight, innerWidth} = window;
  ctx.canvas.height = innerHeight;
  ctx.canvas.width = innerWidth;
}

let clouds = [];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function start() {
  resizeCanvas(ctx, window);
  initClouds(ctx, 5);

  requestAnimationFrame(loop);
}

start(window);
