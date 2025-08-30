<script lang="ts">
  import { onMount } from 'svelte';
  import { SnakeGame } from './snek/game/snake-game.ts';
  import * as THREE from 'three';
  import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { Vector4 } from './snek/utils/utils.ts';
  import { DungeonGame } from './dungeon-game/lib/dungeon-game.ts';
  import type { BiimoGame } from './_base/biimo-game.ts';
  import {CameraMaxZ, getBiimoButton, KnownGames} from './_utils/game-utils.ts';
  import { ScreenTest } from './_screen-test/screen-test.ts';

  let gameToLoad: KnownGames = KnownGames.Snake;
  let loadedGame: BiimoGame;

  let gameCanvasShadow: HTMLDivElement;
  let canvas3: HTMLCanvasElement;
  let composer: EffectComposer;
  let cameraGroup: THREE.Group;
  let retroShaderPass: ShaderPass;

  let biimoParentDiv: HTMLDivElement;
  let biimoDiv: HTMLDivElement;
  let timeLastFrame: number;

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;

  const desiredBiimoSizeRatio = 0.61;

  onMount(async () => {
    await Initialize();
    Update();
  });

  async function Initialize() {
    await initializeThreeJs();
    loadedGame = loadGame(gameToLoad);
    loadedGame.init(scene, gameWidth(), gameHeight());
  }

  function loadGame(game: KnownGames): BiimoGame {
    switch (game) {
      case KnownGames.ScreenTest:
        return new ScreenTest(camera.right, camera.top);
      case KnownGames.Snake:
        return new SnakeGame(scene);
      case KnownGames.Dungeon:
        return new DungeonGame(scene);
      default:
        return new DungeonGame(scene); 
    }
  }

  async function initializeThreeJs() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ canvas: canvas3 });
    composer = new EffectComposer(renderer);

    camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, CameraMaxZ);
    camera.position.z = CameraMaxZ;

    cameraGroup = new THREE.Group();
    cameraGroup.add(camera);
    scene.add(cameraGroup);

    // this just helps us rotate the camera around the center of the scene e.g. for screen shake.
    camera.position.set(-0.5, -0.5, camera.position.z);
    cameraGroup.position.set(0.5, 0.5, 0);

    // add the shader passes
    await setUpRetroShader();
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(retroShaderPass);

    // default background for the games
    sceneAddBg(gameWidth(), gameHeight());
  }

  function gameWidth() {
    return camera.right;
  }

  function gameHeight() {
    return camera.top;
  }

  function sceneAddBg(width: number, height: number) {
    let bgCol = Vector4.FromHexColor(`#ffffff`);
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(bgCol.x, bgCol.y, bgCol.z) });
    const bg = new THREE.Mesh(geometry, material);
    bg.position.x = width / 2;
    bg.position.y = height / 2;
    bg.position.z = 0;
    scene.add(bg);
  }

  async function setUpRetroShader() {
    const vertexShader = /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = await (await fetch('/github-pages-test/biimo/shaders/biimo-retro-shader.frag')).text();

    const tintColor = Vector4.FromHexColor(`#b9fcc3`);
    const pixelationShader = {
      uniforms: {
        tDiffuse: { value: null },
        pixelSize: { value: 80 },
        tintColor: { value: tintColor },
        retroFilterStr: { value: 1 }, // original scene color vs greyscale * tint
        time: { value: -1 }, // set via the update method
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    };

    retroShaderPass = new ShaderPass(pixelationShader);
  }

  function Update(timestamp: number = 0) {
    if (!biimoParentDiv || !biimoDiv) return;
    window?.requestAnimationFrame((timestamp) => Update(timestamp));

    setBiimoCSSVars(timestamp);
    updateThreeJs(timestamp);
  }

  function getFrameDeltaSeconds(timestamp: number) {
    let timeDeltaMS = timestamp - timeLastFrame;
    timeLastFrame = timestamp;
    return timeDeltaMS / 1000;
  }

  function setBiimoCSSVars(timestamp: number) {
    const parentWidth = biimoParentDiv.scrollWidth;
    const parentHeight = biimoParentDiv.scrollHeight;
    const parentAspect = parentWidth / parentHeight;

    let widthPerc = 100;
    let heightPerc = 100;
    if (parentAspect > desiredBiimoSizeRatio) {
      let widthPixels = biimoDiv.scrollHeight * desiredBiimoSizeRatio;
      widthPerc = (widthPixels / parentWidth) * 100;
    } else {
      let heightPixels = biimoDiv.scrollWidth / desiredBiimoSizeRatio;
      heightPerc = (heightPixels / parentHeight) * 100;
    }
    biimoDiv.style.setProperty('--biimo-width', `${widthPerc}%`);
    biimoDiv.style.setProperty('--biimo-height', `${heightPerc}%`);

    const bigCornerAdjustment = 5;
    const smallCornerAdjustment = 50;
    biimoDiv.style.setProperty('--biimo-corner-small', `${biimoDiv.scrollHeight / smallCornerAdjustment}px`);
    biimoDiv.style.setProperty('--biimo-corner-big', `${biimoDiv.scrollHeight / bigCornerAdjustment}px`);

    const gameCanvasTop = 10;
    const gameCanvasLeft = 15;
    const gameCanvasWidth = 70;
    const gameCanvasHeight = 80;
    gameCanvasShadow.style.setProperty('--game-canvas-top', `${gameCanvasTop}%`);
    gameCanvasShadow.style.setProperty('--game-canvas-left', `${gameCanvasLeft}%`);
    gameCanvasShadow.style.setProperty('--game-canvas-width', `${gameCanvasWidth}%`);
    gameCanvasShadow.style.setProperty('--game-canvas-height', `${gameCanvasHeight}%`);

    setCanvasLayerAttributes(
      canvas3,
      gameCanvasShadow.offsetWidth,
      gameCanvasShadow.offsetHeight,
      gameCanvasTop,
      gameCanvasLeft
    );

    let rotMagnitude = 1; // passive sway amount
    let rotSpeed = 0.0005;
    let rot = Math.sin(timestamp * rotSpeed) * rotMagnitude;
    biimoDiv.style.setProperty('--biimo-rotation', `${rot}deg`);
  }

  function setCanvasLayerAttributes(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    top: number,
    left: number
  ) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.setProperty('--game-canvas-top', `${top}%`);
    canvas.style.setProperty('--game-canvas-left', `${left}%`);
  }

  function updateThreeJs(timestamp: number) {
    if (!scene) return;
    renderer.setSize(canvas3.width, canvas3.height); // TODO: only do this on window resize?
    let deltaTime = getFrameDeltaSeconds(timestamp);
    loadedGame.update(deltaTime);
    composer.render();
    retroShaderPass.uniforms.time.value = timestamp;
  }

  function setCanvasRotation(rot: number) {
    cameraGroup.rotation.z = rot;
  }

  function setPixelizationLevel(pixelSize: number) {
    retroShaderPass.uniforms.pixelSize.value = pixelSize;
  }
  
  function handleDPadClick(event: MouseEvent) {
    const buttonId = (event.currentTarget as HTMLElement).id;
    var buttonPressed = getBiimoButton(buttonId);
    if (!buttonPressed) return;
    loadedGame.handleBiimoInput(buttonPressed);
  }
</script>

<div id="background"></div>
<div id="biimo-parent">
  <div bind:this={biimoParentDiv} id="biimo-container">
    <div bind:this={biimoDiv} id="biimo">
      <div id="biimo-side"></div>
      <div id="biimo-side-2"></div>
      <div id="biimo-front-face">
        <div id="screen-plate">
          <canvas bind:this={canvas3} id="canvas-webgl"></canvas>
          <div bind:this={gameCanvasShadow} id="canvas-shadow"></div>
        </div>
        <div id="d-pad">
          <div id="d-pad-shadow">
            <div class="d-pad-drop-shadow" id="d-pad-vertical"></div>
            <div class="d-pad-drop-shadow" id="d-pad-horizontal"></div>
          </div>
          <div id="d-pad-main">
            <div class="d-pad-left-highlight" id="d-pad-vertical">
                <div id="d-pad-up-button" class="d-pad-arrow-button" on:click={handleDPadClick}>
                  <div class="d-pad-arrow-button-icon"></div>
                </div>
                <div id="d-pad-down-button" class="d-pad-arrow-button" on:click={handleDPadClick}>
                  <div class="d-pad-arrow-button-icon"></div>
                </div>
            </div>
            <div class="d-pad-left-highlight" id="d-pad-horizontal">
                <div id="d-pad-left-button" class="d-pad-arrow-button" on:click={handleDPadClick}>
                  <div class="d-pad-arrow-button-icon"></div>
                </div>
                <div id="d-pad-right-button" class="d-pad-arrow-button" on:click={handleDPadClick}>
                  <div class="d-pad-arrow-button-icon"></div>
                </div>
            </div>
          </div>
        </div>
        <div id="abButtons">
          <div id="aButton">
            <div class="abButton">
              <div class="abButtonShine"></div>
            </div>
          </div>
          <div id="bButton">
            <div class="abButton">
              <div class="abButtonShine"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  #background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /*Dungeon*/
    background-color: #dfdbe5;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3E%3Cg fill='%239C92AC' fill-opacity='0.25'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' opacity='.5'%3E%3C/path%3E%3Cpath d='M15 15h50l-5 5H20v40l-5 5V15zm0 50h50V15L80 0v80H0l15-15zm32.07-32.07l3.54-3.54A15 15 0 0 1 29.4 50.6l3.53-3.53a10 10 0 1 0 14.14-14.14zM32.93 47.07a10 10 0 1 1 14.14-14.14L32.93 47.07z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
  }

  #biimo-parent {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 5% 5% 5% 10%;
  }

  #biimo-container {
    position: relative;
    padding: 0;
    flex-grow: 1;
  }

  #biimo {
    position: relative;

    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(var(--biimo-rotation));
    width: var(--biimo-width);
    height: var(--biimo-height);
  }

  #biimo-side {
    position: absolute;
    top: 1%;
    left: calc(-1 * (var(--biimo-width) / 19));
    width: 100%;
    height: 98%;
    background: #bccfd2;

    border-radius: var(--biimo-corner-small) var(--biimo-corner-small) var(--biimo-corner-big) var(--biimo-corner-small);
    box-shadow: 0 30px 100px rgba(46, 42, 79, 0.51);

    z-index: -2;
  }

  #biimo-side-2 {
    position: absolute;
    top: 0.5%;
    left: calc(-1 * (var(--biimo-width) / 40));
    width: 100%;
    height: 99%;
    background: #bccfd2;

    border-radius: var(--biimo-corner-small) var(--biimo-corner-small) var(--biimo-corner-big) var(--biimo-corner-small);

    z-index: -1;
  }

  #biimo-front-face {
    width: 100%;
    height: 100%;

    background: #c7d9dc;

    /*gradient from the top right*/
    background: linear-gradient(235deg, #cedbde 0%, #bccfd2 80%);

    border-radius: var(--biimo-corner-small) var(--biimo-corner-small) var(--biimo-corner-big) var(--biimo-corner-small);
    border-left: 5px solid rgb(216, 228, 231);

    overflow: hidden;
  }

  #screen-plate {
    position: absolute;
    top: 8%;
    left: 5%;
    width: 90%;
    height: 45%;

    background-color: #6c7581;
    box-shadow: -3px -3px 3px rgb(38, 49, 101);

    border-right: 2px solid rgb(220, 232, 234);
    border-bottom: 2px solid rgb(220, 232, 234);
    border-radius: var(--biimo-corner-small) var(--biimo-corner-small) calc(var(--biimo-corner-big) / 2)
      var(--biimo-corner-small);
  }

  #canvas-webgl {
    position: absolute;
    top: var(--game-canvas-top);
    left: var(--game-canvas-left);
    width: var(--game-canvas-width);
    height: var(--game-canvas-height);
    border-radius: calc(var(--biimo-corner-small) / 2);

    background-color: rgb(173, 182, 154, 1);
  }

  #canvas-shadow {
    position: absolute;
    top: var(--game-canvas-top);
    left: var(--game-canvas-left);
    width: var(--game-canvas-width);
    height: var(--game-canvas-height);
    border-radius: calc(var(--biimo-corner-small) / 2);

    box-shadow: inset 5px 4px 6px rgb(58, 66, 48);
  }

  #d-pad {
    position: absolute;
    top: 60%;
    left: 5%;
    width: 33%;
    height: 20%;
    border-radius: 1000px;

    box-shadow: inset 13px 13px 30px rgb(177, 192, 204);

    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
  }

  #d-pad-shadow {
    position: absolute;
    top: 2%;
    left: -1%;
    width: 100%;
    height: 96%;
  }

  .d-pad-drop-shadow {
    background-color: #2f3031;
    border-radius: 10px;
    box-shadow: 3px 3px 5px rgb(23, 23, 23);
  }

  .d-pad-left-highlight {
    border-left: #4f4f4f 2px solid;
  }

  #d-pad-main {
    position: absolute;
    top: 0;
    left: 1%;
    width: 100%;
    height: 100%;
  }

  #d-pad-vertical {
    position: absolute;
    top: 5%;
    left: 35%;
    width: 30%;
    height: 90%;
    background-color: #2f3031;

    border-radius: 10px;
      
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  #d-pad-horizontal {
    position: absolute;
    top: 35%;
    left: 5%;
    width: 90%;
    height: 30%;

    background-color: #2f3031;

    border-radius: 10px;
      
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .d-pad-arrow-button { 
      aspect-ratio: 1;
      background-color: #2f3031;
      border-radius: 10px; 
  }
  
  .d-pad-arrow-button-icon { 
      aspect-ratio: 1;
      background-color: #2f3031;
      border-radius: 110px; 
      margin: 15px;
  }

  #abButtons {
    position: absolute;
    top: 63%;
    left: 55%;
    width: 40%;
    height: 13%;
    border-radius: 1000px;

    box-shadow: inset 13px 13px 30px rgb(177, 192, 204);

    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;

    transform: rotate(-30deg);
  }

  #aButton {
    flex-grow: 1;
    margin: 5%;
  }

  #bButton {
    flex-grow: 1;
    margin: 5%;
  }

  .abButton {
    aspect-ratio: 1;
    background-color: #a41a8b;
    border-radius: 50%;
    box-shadow: 2px 2px 1px rgb(101, 9, 85);
  }

  .abButtonShine {
    position: relative;
    top: 1%;
    left: 2%;
    width: 95%;
    height: 95%;
    border-radius: 1000px;
    box-shadow: inset 3px 3px 2px rgb(190, 121, 197);
  }
</style>
