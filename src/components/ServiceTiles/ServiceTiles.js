// This file is deprecated - code has been moved directly into ServiceTiles.astro
// Keep this file to prevent 404 errors if any references still exist

import * as THREE from 'three';

export class ServiceTiles {
  constructor() {
    console.log('ServiceTiles constructor running...');
    this.serviceCards = null;
    this.scenes = [];
    this.renderers = [];
    this.cameras = [];
    this.cubes = [];
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.isMouseOver = [];
    this.clock = new THREE.Clock();
    this.rafId = null;
    this.animationFrameIds = [];
    this.textureLoader = new THREE.TextureLoader();
    this.defaultTexture = this.createDefaultTexture();
    this.colors = [
        '#4f46e5', // Indigo
        '#2563eb', // Blue
        '#0ea5e9', // Sky blue
        '#10b981', // Emerald
        '#6366f1', // Violet
        '#8b5cf6'  // Purple
      ];
  }

  createDefaultTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = '#555';
    context.fillRect(0, 0, 64, 64);
    context.fillStyle = '#aaa';
    context.font = '10px Arial';
    context.textAlign = 'center';
    context.fillText('Loading...', 32, 38);
    return new THREE.CanvasTexture(canvas);
  }

  init() {
    console.log('ServiceTiles init executing...');
    this.serviceCards = document.querySelectorAll('.service-card-rebuild');
    console.log(`Found ${this.serviceCards.length} service cards`);
    if (!this.serviceCards || this.serviceCards.length === 0) {
      console.warn('No service cards found for ServiceTiles.');
      return;
    }

    this.isMouseOver = new Array(this.serviceCards.length).fill(false);
    this.animationFrameIds = new Array(this.serviceCards.length).fill(null);

    this.serviceCards.forEach((card, index) => {
      console.log(`Setting up tile for card ${index}`);
      const canvasContainer = card.querySelector('.service-card-canvas-container');
      if (!canvasContainer) {
        console.error(`Canvas container not found for card ${index}`);
        return;
      }

      if (canvasContainer.querySelector('canvas')) {
          console.warn(`Canvas already exists for card ${index}, skipping scene creation.`);
          return;
      }

      this.createScene(canvasContainer, index);

      card.addEventListener('mouseenter', () => this.onMouseEnter(card, index));
      card.addEventListener('mouseleave', () => this.onMouseLeave(card, index));
    });

    console.log(`ServiceTiles setup complete for ${this.serviceCards.length} cards.`);
    this.checkVisibility();
    this.setupEventListeners();
  }

  createScene(container, index) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 3;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);

    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const color = this.colors[index % this.colors.length];
    const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        shininess: 60,
        side: THREE.DoubleSide
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    this.scenes[index] = scene;
    this.cameras[index] = camera;
    this.renderers[index] = renderer;
    this.cubes[index] = cube;
  }

  onMouseEnter(card, index) {
    this.isMouseOver[index] = true;
    if (this.cubes[index]) {
    }
  }

  onMouseLeave(card, index) {
    this.isMouseOver[index] = false;
    if (this.cubes[index]) {
    }
  }

  animateTile(index) {
    if (!this.scenes[index] || !this.cameras[index] || !this.renderers[index] || !this.cubes[index]) return;

    this.animationFrameIds[index] = requestAnimationFrame(() => this.animateTile(index));

    const cube = this.cubes[index];
    const delta = this.clock.getDelta();

    const targetRotation = this.isMouseOver[index] ? 0.02 : 0.005;
    cube.rotation.x += targetRotation * delta * 60;
    cube.rotation.y += targetRotation * 0.8 * delta * 60;

    this.renderers[index].render(this.scenes[index], this.cameras[index]);
  }

  stopAnimatingTile(index) {
    if (this.animationFrameIds[index]) {
      cancelAnimationFrame(this.animationFrameIds[index]);
      this.animationFrameIds[index] = null;
    }
  }

  checkVisibility() {
    if (!this.serviceCards) return;
    this.serviceCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const isVisible = (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
      );

      if (isVisible && !this.animationFrameIds[index]) {
        console.log(`Tile ${index} became visible, starting animation.`);
        this.animateTile(index);
      } else if (!isVisible && this.animationFrameIds[index]) {
        console.log(`Tile ${index} not visible, stopping animation.`);
        this.stopAnimatingTile(index);
      }
    });
  }

  setupEventListeners() {
      let resizeTimeout;
      window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
              if (!this.serviceCards) return;
              console.log("Handling resize for ServiceTiles");
              this.serviceCards.forEach((card, index) => {
                  if (this.renderers[index] && this.cameras[index]) {
                      const container = card.querySelector('.service-card-canvas-container');
                      if (container) {
                          this.cameras[index].aspect = container.offsetWidth / container.offsetHeight;
                          this.cameras[index].updateProjectionMatrix();
                          this.renderers[index].setSize(container.offsetWidth, container.offsetHeight);
                      }
                  }
              });
              this.checkVisibility();
          }, 250);
      });

      window.addEventListener('scroll', () => this.checkVisibility(), { passive: true });
  }

  dispose() {
    console.log("Disposing ServiceTiles resources...");
    this.animationFrameIds.forEach((id, index) => {
      this.stopAnimatingTile(index);
    });

    this.scenes.forEach((scene, index) => {
        if (this.cubes[index]) {
            if (this.cubes[index].geometry) this.cubes[index].geometry.dispose();
            if (this.cubes[index].material) {
                if (Array.isArray(this.cubes[index].material)) {
                    this.cubes[index].material.forEach(m => m.dispose());
                } else {
                    this.cubes[index].material.dispose();
                }
            }
             scene.remove(this.cubes[index]);
        }
    });

    this.renderers.forEach(renderer => {
        renderer.dispose();
        if(renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    });

    this.scenes = [];
    this.cameras = [];
    this.renderers = [];
    this.cubes = [];
    this.isMouseOver = [];
    this.animationFrameIds = [];
    this.serviceCards = null;
    console.log("ServiceTiles disposed.");
  }
}
