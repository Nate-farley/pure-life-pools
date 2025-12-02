'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Import the pool data
import poolData from '../json/specs.json';

/* -------------------------------------------------
   Helper function to parse pool dimensions
   ------------------------------------------------- */
function parseDimension(dimStr: string): number {
  // Handle formats like "11′", "15′ 10″", etc.
  const feetMatch = dimStr.match(/(\d+)′/);
  const inchesMatch = dimStr.match(/(\d+)″/);

  let feet = feetMatch ? parseInt(feetMatch[1]) : 0;
  let inches = inchesMatch ? parseInt(inchesMatch[1]) : 0;

  return feet + inches / 12;
}

function parsePoolSize(sizeStr: string): { width: number; length: number } | null {
  // Format: "11′ x 22′" or "15′ 10″ x 40′ 2″"
  const parts = sizeStr.split('x').map(s => s.trim());
  if (parts.length !== 2) return null;

  return {
    width: parseDimension(parts[1]),
    length: parseDimension(parts[0]),
  };
}

/* -------------------------------------------------
   Generate pool presets from JSON data
   ------------------------------------------------- */
function generatePoolPresets() {
  const presets: Array<{ width: number; length: number; name: string }> = [];

  for (const [key, value] of Object.entries(poolData)) {
    if (value === null) continue;

    const poolInfo = value as { size: string; depth: string; gallons: string };
    const dimensions = parsePoolSize(poolInfo.size);

    if (dimensions) {
      // Convert kebab-case to Title Case for display
      const displayName = key
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      presets.push({
        width: dimensions.width,
        length: dimensions.length,
        name: displayName
      });
    }
  }

  // Sort by area (width * length) for better UX
  return presets.sort((a, b) => (a.width * a.length) - (b.width * b.length));
}

/* -------------------------------------------------
   GrassMaterial - Windy, Shadowed, Alpha-Tested Grass
   ------------------------------------------------- */
class GrassMaterial {
  material: THREE.MeshLambertMaterial;
  uniforms: { [key: string]: { value: any } } = {
    uTime: { value: 0 },
    uEnableShadows: { value: true },
    uShadowDarkness: { value: 0.5 },
    uGrassLightIntensity: { value: 1.0 },
    uNoiseScale: { value: 1.5 },
    baseColor: { value: new THREE.Color('#313f1b') },
    tipColor1: { value: new THREE.Color('#9bd38d') },
    tipColor2: { value: new THREE.Color('#1f352a') },
    noiseTexture: { value: new THREE.Texture() },
    grassAlphaTexture: { value: new THREE.Texture() },
  };

  constructor() {
    this.material = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.5,
    });

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uTime: this.uniforms.uTime,
        uTipColor1: this.uniforms.tipColor1,
        uTipColor2: this.uniforms.tipColor2,
        uBaseColor: this.uniforms.baseColor,
        uEnableShadows: this.uniforms.uEnableShadows,
        uShadowDarkness: this.uniforms.uShadowDarkness,
        uGrassLightIntensity: this.uniforms.uGrassLightIntensity,
        uNoiseScale: this.uniforms.uNoiseScale,
        uNoiseTexture: this.uniforms.noiseTexture,
        uGrassAlphaTexture: this.uniforms.grassAlphaTexture,
      };

      shader.vertexShader = `
        #include <common>
        #include <fog_pars_vertex>
        #include <shadowmap_pars_vertex>

        uniform sampler2D uNoiseTexture;
        uniform float uNoiseScale;
        uniform float uTime;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec2 vGlobalUV;
        varying vec3 vViewPosition;

        void main() {
          #include <begin_vertex>
          #include <project_vertex>
          #include <fog_vertex>
          #include <beginnormal_vertex>
          #include <defaultnormal_vertex>
          #include <worldpos_vertex>
          #include <shadowmap_vertex>

          vec4 modelPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vGlobalUV = modelPos.xz * 0.01;

          // Wind
          vec2 windDir = normalize(vec2(1.0, 1.0));
          float amp = 0.12, freq = 45.0, speed = 1.0, noiseFactor = 5.5, noiseSpeed = 0.001;
          vec4 noise = texture2D(uNoiseTexture, vGlobalUV + uTime * noiseSpeed);
          float wave = sin(freq * dot(windDir, vGlobalUV) + uTime * speed) * amp * (1.0 - uv.y);
modelPos.x += wave;
modelPos.z += wave;
// Remove height variation or simplify
modelPos.y += texture2D(uNoiseTexture, vGlobalUV * uNoiseScale).r * 0.2 * (1.0 - uv.y);

          vec4 mvPos = viewMatrix * modelPos;
          gl_Position = projectionMatrix * mvPos;

          vUv = vec2(uv.x, 1.0 - uv.y);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = mvPos.xyz;
        }
      `;

      shader.fragmentShader = `
        #include <alphatest_pars_fragment>
        #include <fog_pars_fragment>
        #include <common>
        #include <packing>
        #include <lights_pars_begin>
        #include <shadowmap_pars_fragment>

        uniform vec3 uBaseColor;
        uniform vec3 uTipColor1;
        uniform vec3 uTipColor2;
        uniform sampler2D uGrassAlphaTexture;
        uniform sampler2D uNoiseTexture;
        uniform float uNoiseScale;
        uniform int uEnableShadows;
        uniform float uGrassLightIntensity;
        uniform float uShadowDarkness;

        varying vec2 vUv;
        varying vec2 vGlobalUV;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec4 alpha = texture2D(uGrassAlphaTexture, vUv);
          if (alpha.r < 0.1) discard;

          vec4 variation = texture2D(uNoiseTexture, vGlobalUV * uNoiseScale);
          vec3 tip = mix(uTipColor1, uTipColor2, variation.r);
          vec3 base = mix(uBaseColor, tip, vUv.y);
          vec3 col = base * uGrassLightIntensity;

          if (uEnableShadows == 1) {
            float shadow = 1.0;
            #if NUM_DIR_LIGHTS > 0
              #pragma unroll_loop_start
              for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
                vec3 lightDir = normalize(directionalLights[i].direction);
                float NdotL = max(dot(vNormal, lightDir), 0.0);
                float shadowVal = getShadow(
                  directionalShadowMap[i],
                  directionalLightShadows[i].shadowMapSize,
                  directionalLightShadows[i].shadowBias,
                  directionalLightShadows[i].shadowRadius,
                  vDirectionalShadowCoord[i]
                );
                shadow = min(shadow, shadowVal);
              }
              #pragma unroll_loop_end
            #endif
            col = mix(col, col * uShadowDarkness, 1.0 - shadow);
          }

          gl_FragColor = vec4(col, 1.0);
          #include <fog_fragment>
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `;
    };
  }

  update(time: number) {
    this.uniforms.uTime.value = time;
  }

  setupTextures(alpha: THREE.Texture, noise: THREE.Texture) {
    this.uniforms.grassAlphaTexture.value = alpha;
    this.uniforms.noiseTexture.value = noise;
  }
}

/* -------------------------------------------------
   PoolVisualizer Component
   ------------------------------------------------- */
export default function PoolVisualizer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const waterSimRef = useRef<any>();
  const patioRef = useRef<THREE.Mesh | null>(null);
  const fenceGroupRef = useRef<THREE.Group | null>(null);
  const grassInstancedRef = useRef<THREE.InstancedMesh | null>(null);
  const chairsGroupRef = useRef<THREE.Group | null>(null);

  const [patioTop, setPatioTop] = useState(15);
  const [patioBottom, setPatioBottom] = useState(12.5);
  const [patioLeft, setPatioLeft] = useState(28.5);
  const [patioRight, setPatioRight] = useState(27);
  const [showFence, setShowFence] = useState(true);

  // Generate pool presets from JSON
  const poolPresets = generatePoolPresets();
  const [poolSize, setPoolSize] = useState(poolPresets[0] || { width: 10.4, length: 10.4, name: 'Standard Pool' });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0d8ff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 50, 70); // High up and slightly behind the pool, looking down

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, -40); // Look down at the area between pool and house
    controls.enableRotate = false;

    // ---------- LIGHTING ----------
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 4);
    sun.position.set(20, 40, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    scene.add(sun);

    // ---------- SKYBOX ----------
    const envMap = new THREE.CubeTextureLoader().load([
      'https://raw.githubusercontent.com/martinRenou/threejs-water/master/xpos.jpg',
      'https://raw.githubusercontent.com/martinRenou/threejs-water/master/xneg.jpg',
      'https://raw.githubusercontent.com/martinRenou/threejs-water/master/ypos.jpg',
      'https://raw.githubusercontent.com/martinRenou/threejs-water/master/ypos.jpg',
      'https://raw.githubusercontent.com/martinRenou/threejs-water/master/zpos.jpg',
      'https://raw.githubusercontent.com/martinRenou/threejs-water/master/zneg.jpg',
    ]);
    envMap.colorSpace = THREE.SRGBColorSpace;
    scene.environment = envMap;

    // ---------- POOL TILES ----------
    const tiles = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/martinRenou/threejs-water/master/tiles.jpg'
    );
    tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;

    // ---------- WATER SIMULATION ----------
    class WaterSimulation {
      size = 128;
      targetA = new THREE.WebGLRenderTarget(this.size, this.size, { type: THREE.HalfFloatType });
      targetB = new THREE.WebGLRenderTarget(this.size, this.size, { type: THREE.HalfFloatType });
      current = this.targetA;
      ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));

      dropMat = new THREE.ShaderMaterial({
        uniforms: {
          texture: { value: null },
          center: { value: new THREE.Vector2() },
          radius: { value: 0.05 },
          strength: { value: 0.08 }
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1);}`,
        fragmentShader: `
          precision highp float;
          uniform sampler2D texture;
          uniform vec2 center;
          uniform float radius;
          uniform float strength;
          varying vec2 vUv;
          void main(){
            vec4 info = texture2D(texture, vUv);
            float drop = max(0.0, 1.0 - length(vUv - center)/radius);
            drop = 0.5 - cos(drop * 3.14159) * 0.5;
            info.r += drop * strength;
            gl_FragColor = info;
          }
        `
      });

      updateMat = new THREE.ShaderMaterial({
        uniforms: {
          texture: { value: null },
          delta: { value: new THREE.Vector2(1 / 256, 1 / 256) }
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1);}`,
        fragmentShader: `
          precision highp float;
          uniform sampler2D texture;
          uniform vec2 delta;
          varying vec2 vUv;
          void main(){
            vec4 info = texture2D(texture, vUv);
            float avg = (
              texture2D(texture, vUv - vec2(delta.x,0)).r +
              texture2D(texture, vUv + vec2(delta.x,0)).r +
              texture2D(texture, vUv - vec2(0,delta.y)).r +
              texture2D(texture, vUv + vec2(0,delta.y)).r
            ) * 0.25;
            info.g += (avg - info.r) * 2.0;
            info.g *= 0.995;
            info.r += info.g;
            gl_FragColor = info;
          }
        `
      });

      addDrop(x: number, y: number) {
        this.dropMat.uniforms.texture.value = this.current.texture;
        this.dropMat.uniforms.center.value.set(x + 0.5, y + 0.5);
        const temp = this.current;
        this.current = this.current === this.targetA ? this.targetB : this.targetA;
        renderer.setRenderTarget(this.current);
        this.quad.material = this.dropMat;
        renderer.render(this.quad, this.ortho);
        renderer.setRenderTarget(null);
      }

      step() {
        this.updateMat.uniforms.texture.value = this.current.texture;
        const temp = this.current;
        this.current = this.current === this.targetA ? this.targetB : this.targetA;
        renderer.setRenderTarget(this.current);
        this.quad.material = this.updateMat;
        renderer.render(this.quad, this.ortho);
        renderer.setRenderTarget(null);
        return temp.texture;
      }
    }

    const waterSim = new WaterSimulation();
    waterSimRef.current = waterSim;

    // ---------- WATER SURFACE ----------
    const waterGeo = new THREE.PlaneGeometry(poolSize.width, poolSize.length, 64, 64);
    const waterMat = new THREE.ShaderMaterial({
      uniforms: {
        sky: { value: envMap },
        tiles: { value: tiles },
        heightMap: { value: null },
        time: { value: 0 }
      },
      vertexShader: `
        uniform sampler2D heightMap;
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          float height = texture2D(heightMap, uv).r * 0.3;
          vec3 pos = position + normal * height;
          vPos = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform samplerCube sky;
        uniform sampler2D tiles;
        uniform sampler2D heightMap;
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vec3 normal = normalize(cross(dFdx(vPos), dFdy(vPos)));
          vec3 viewDir = normalize(cameraPosition - vPos);
          vec3 refl = reflect(-viewDir, normal);
          vec4 skyColor = textureCube(sky, refl);
          vec4 tileColor = texture2D(tiles, vUv * 8.0);
          float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
          vec3 color = mix(tileColor.rgb * 0.8 + vec3(0.0,0.3,0.6), skyColor.rgb, fresnel);
          gl_FragColor = vec4(color, 0.95);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    });

    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.02;
    scene.add(water);

    // ---------- POOL BOTTOM ----------
    const bottom = new THREE.Mesh(
      new THREE.PlaneGeometry(poolSize.width, poolSize.length),
      new THREE.MeshStandardMaterial({ color: 0x001133, roughness: 0.7, metalness: 0.1 })
    );
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -0.5;
    bottom.receiveShadow = true;
    scene.add(bottom);

    // ---------- PATIO ----------
    const createPatio = () => {
  if (patioRef.current) {
    scene.remove(patioRef.current);
    patioRef.current.geometry.dispose();
    (patioRef.current.material as THREE.Material).dispose();
  }

  // Calculate patio dimensions
  const left = -(poolSize.width / 2) - patioLeft;
  const right = (poolSize.width / 2) + patioRight;
  const top = (poolSize.length / 2) + patioTop;
  const bottom = -(poolSize.length / 2) - patioBottom;

  const patioWidth = right - left;
  const patioLength = top - bottom;
  const patioCenterX = (left + right) / 2;
  const patioCenterZ = (top + bottom) / 2;

  // Create flat plane geometry
  const geo = new THREE.PlaneGeometry(patioWidth, patioLength);

  // Load your paver texture
  const textureLoader = new THREE.TextureLoader();
  const paverTexture = textureLoader.load(
    'https://plus.unsplash.com/premium_photo-1672737068965-391645bd6599?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  );

  paverTexture.wrapS = paverTexture.wrapT = THREE.RepeatWrapping;
  // Adjust repeat based on patio size for realistic paver scale
  // Assuming each paver in texture is ~2ft, adjust accordingly
  paverTexture.repeat.set(patioWidth / 4, patioLength / 4);
  paverTexture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.MeshStandardMaterial({
    map: paverTexture,
    roughness: 0.85,
    metalness: 0.0,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  mesh.position.set(patioCenterX, 0.01, patioCenterZ); // Just above ground
  mesh.receiveShadow = true;
  scene.add(mesh);
  patioRef.current = mesh;

  // Create pool cutout as a separate dark plane on top
  const poolCutout = new THREE.Mesh(
    new THREE.PlaneGeometry(poolSize.width, poolSize.length),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, // Dark color for pool area
      roughness: 1.0,
    })
  );
  poolCutout.rotation.x = -Math.PI / 2;
  poolCutout.position.y = 0.02; // Slightly above patio
  scene.add(poolCutout);
};

    createPatio();

    // ---------- POOL BORDER (COPING) - WHITE ----------
    const copingWidth = 0.3; // Border width
    const borderShape = new THREE.Shape();
    const outerW = poolSize.width / 2 + copingWidth;
    const outerL = poolSize.length / 2 + copingWidth;
    const innerW = poolSize.width / 2;
    const innerL = poolSize.length / 2;

    // Outer rectangle
    borderShape.moveTo(-outerW, -outerL);
    borderShape.lineTo(outerW, -outerL);
    borderShape.lineTo(outerW, outerL);
    borderShape.lineTo(-outerW, outerL);
    borderShape.closePath();

    // Inner rectangle (hole)
    const borderHole = new THREE.Path();
    borderHole.moveTo(-innerW, -innerL);
    borderHole.lineTo(innerW, -innerL);
    borderHole.lineTo(innerW, innerL);
    borderHole.lineTo(-innerW, innerL);
    borderHole.closePath();
    borderShape.holes.push(borderHole);

    const borderGeo = new THREE.ExtrudeGeometry(borderShape, { depth: 0.15, bevelEnabled: false });
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White border to distinguish from patio
      roughness: 0.7,
      metalness: 0.1
    });

    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.01; // On top of the patio surface
    border.receiveShadow = true;
    border.castShadow = true;
    scene.add(border);

    // ---------- VISIBLE GREEN GROUND ----------
    const visibleGround = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000), // Expanded from 500x500 to 1000x1000
      new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        roughness: 0.9,
        metalness: 0.0
      })
    );
    visibleGround.rotation.x = -Math.PI / 2;
    visibleGround.position.y = -0.51;
    visibleGround.receiveShadow = true;
    scene.add(visibleGround);

    // ---------- GRASS (INSTANCED) ----------
    const grassCount = 4_000;
    const grassGeo = new THREE.PlaneGeometry(0.08, 0.6, 1, 4);
    grassGeo.translate(0, 0.3, 0);

    const grassMaterial = new GrassMaterial();

    const loader = new THREE.TextureLoader();
    const grassAlpha = loader.load('https://i.imgur.com/5zR7z8B.png');
    const perlin = loader.load('https://i.imgur.com/9z5j9zQ.png');
    grassAlpha.wrapS = grassAlpha.wrapT = THREE.RepeatWrapping;
    perlin.wrapS = perlin.wrapT = THREE.RepeatWrapping;
    grassMaterial.setupTextures(grassAlpha, perlin);

    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000), // Expanded to match visible ground
      new THREE.MeshStandardMaterial({ visible: false })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.51;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const sampler = new MeshSurfaceSampler(groundMesh).build();
    const instanced = new THREE.InstancedMesh(grassGeo, grassMaterial.material, grassCount);
    instanced.receiveShadow = true;
    instanced.castShadow = true;
    instanced.frustumCulled = true;

    const dummy = new THREE.Object3D();
    const normal = new THREE.Vector3();
    const pos = new THREE.Vector3();

    for (let i = 0; i < grassCount; i++) {
      sampler.sample(pos, normal);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.8 + Math.random() * 0.6);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      dummy.rotateY(Math.random() * Math.PI);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    scene.add(instanced);
    grassInstancedRef.current = instanced;

    // ---------- LOAD HOUSE MODEL ----------
    const gltfLoader = new GLTFLoader();
    const modelUrl = '/models/suburban_house.glb';

   gltfLoader.load(
  modelUrl,
  (gltf) => {
    const house = gltf.scene;
    house.scale.setScalar(5);
house.position.set(35, -0.5, -45);
house.rotation.y = Math.PI;

    console.log('=== HOUSE DEBUG ===');

    house.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((material) => {
          if (material) {
            console.log(`Mesh: ${child.name}`);

            // Set colors based on material names
            if (child.name.includes('white')) {
              material.color.setHex(0xf5f5f5); // Off-white
            } else if (child.name.includes('roof')) {
              material.color.setHex(0x4a4a4a); // Dark gray roof
            } else if (child.name.includes('gray')) {
              material.color.setHex(0x808080); // Medium gray
            } else if (child.name.includes('glass')) {
              material.color.setHex(0x87ceeb); // Sky blue for glass
              material.transparent = true;
              material.opacity = 0.3;
              material.metalness = 0.9;
              material.roughness = 0.1;
            } else if (child.name.includes('floor')) {
              material.color.setHex(0x8b7355); // Brown floor
            }

            // General material improvements
            material.needsUpdate = true;

            // Don't use DoubleSide - it hurts performance
            material.side = THREE.FrontSide;
          }
        });
      }
    });

    scene.add(house);
    console.log('House model loaded and colored!');
  },
  (progress) => {
    const percent = (progress.loaded / progress.total * 100).toFixed(2);
    console.log(`Loading house: ${percent}%`);
  },
  (error) => {
    console.error('Error loading house model:', error);
  }
);

    // ---------- MOUSE RIPPLES ----------
    const mouse = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    const point = new THREE.Vector3();
    let lastRippleTime = 0;
    const rippleThrottle = 100;

    window.addEventListener('pointermove', (e) => {
      const now = Date.now();
      if (now - lastRippleTime < rippleThrottle) return;
      lastRippleTime = now;

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(plane, point)) {
        const d = point.length();
        if (d < 5.1) waterSim.addDrop(point.x / 10.4, point.z / 10.4);
      }
    });

    // ---------- ANIMATION ----------
    const clock = new THREE.Clock();
    let animId: number;
    let frameCounter = 0;
const animate = () => {
  animId = requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  frameCounter++;
  if (frameCounter % 2 === 0) {
    const heightMap = waterSim.step();
    waterMat.uniforms.heightMap.value = heightMap;
  }
  waterMat.uniforms.time.value = elapsed;
  grassMaterial.update(elapsed);
  controls.update();
  renderer.render(scene, camera);
};
    animate();

    // ---------- RESIZE ----------
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [poolSize]);

  // Rebuild patio, fence, and chairs on size change
  useEffect(() => {
    if (sceneRef.current) {
      const scene = sceneRef.current;

      const createPatio = () => {
        if (patioRef.current) {
          scene.remove(patioRef.current);
          patioRef.current.geometry.dispose();
          (patioRef.current.material as THREE.Material).dispose();
        }

        const shape = new THREE.Shape();

        // Calculate bounds based on pool position (centered at 0,0) and individual sides
        const left = -(poolSize.width / 2) - patioLeft;
        const right = (poolSize.width / 2) + patioRight;
        const top = (poolSize.length / 2) + patioTop;
        const bottom = -(poolSize.length / 2) - patioBottom;

        // Create patio shape
        shape.moveTo(left, bottom);
        shape.lineTo(right, bottom);
        shape.lineTo(right, top);
        shape.lineTo(left, top);
        shape.closePath();

        const hole = new THREE.Path();
        const halfWidth = poolSize.width / 2;
        const halfLength = poolSize.length / 2;
        hole.moveTo(-halfWidth, -halfLength);
        hole.lineTo(halfWidth, -halfLength);
        hole.lineTo(halfWidth, halfLength);
        hole.lineTo(-halfWidth, halfLength);
        hole.closePath();
        shape.holes.push(hole);

        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });

        // Load concrete texture
        const textureLoader = new THREE.TextureLoader();
        const concreteTexture = textureLoader.load('https://images.unsplash.com/photo-1625008668243-e10fa6121030?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
        concreteTexture.wrapS = concreteTexture.wrapT = THREE.RepeatWrapping;
        concreteTexture.repeat.set(2, 2); // Much larger pavers - only 2x2 repeat
        concreteTexture.colorSpace = THREE.SRGBColorSpace;

        const mat = new THREE.MeshStandardMaterial({
          map: concreteTexture,
          color: 0xffffff, // White color multiplier to avoid darkening
          roughness: 0.85,
          metalness: 0.0,
          normalScale: new THREE.Vector2(1.5, 1.5) // Enhance surface detail
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0.01; // Raised to be clearly visible
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add(mesh);
        patioRef.current = mesh;
      };
      createPatio();

      // ---------- CREATE FENCE ----------
      // Remove old fence
      if (fenceGroupRef.current) {
        scene.remove(fenceGroupRef.current);
        fenceGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          }
        });
        fenceGroupRef.current = null;
      }

      if (showFence) {
        const fenceGroup = new THREE.Group();

        // Fence parameters
        const fenceHeight = 4.5;
        const postRadius = 0.15;
        const railHeight = 0.1;
        const railWidth = 0.08;
        const postSpacing = 6;
        const fenceInset = 2;
        const gateWidth = 4;

        // Material for fence
        const fenceMaterial = new THREE.MeshStandardMaterial({
          color: 0x3d2817,
          roughness: 0.8,
          metalness: 0.1,
        });

        // Calculate fence bounds (inset from patio)
        const left = -(poolSize.width / 2) - patioLeft + fenceInset;
        const right = (poolSize.width / 2) + patioRight - fenceInset;
        const top = (poolSize.length / 2) + patioBottom - fenceInset;
        const bottom = -(poolSize.length / 2) - patioTop + fenceInset;

        // Helper function to create a post
        const createPost = (x: number, z: number) => {
          const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, fenceHeight, 8);
          const post = new THREE.Mesh(postGeo, fenceMaterial);
          post.position.set(x, fenceHeight / 2, z);
          post.castShadow = true;
          post.receiveShadow = true;
          return post;
        };

        // Helper function to create horizontal rails between two posts
        const createRails = (x1: number, z1: number, x2: number, z2: number) => {
          const distance = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
          const angle = Math.atan2(z2 - z1, x2 - x1);
          const midX = (x1 + x2) / 2;
          const midZ = (z1 + z2) / 2;

          // Top rail
          const topRailGeo = new THREE.BoxGeometry(distance, railHeight, railWidth);
          const topRail = new THREE.Mesh(topRailGeo, fenceMaterial);
          topRail.position.set(midX, fenceHeight - 0.5, midZ);
          topRail.rotation.y = angle;
          topRail.castShadow = true;
          topRail.receiveShadow = true;

          // Middle rail
          const midRail = new THREE.Mesh(topRailGeo.clone(), fenceMaterial);
          midRail.position.set(midX, fenceHeight / 2, midZ);
          midRail.rotation.y = angle;
          midRail.castShadow = true;
          midRail.receiveShadow = true;

          // Bottom rail
          const bottomRail = new THREE.Mesh(topRailGeo.clone(), fenceMaterial);
          bottomRail.position.set(midX, 0.5, midZ);
          bottomRail.rotation.y = angle;
          bottomRail.castShadow = true;
          bottomRail.receiveShadow = true;

          return [topRail, midRail, bottomRail];
        };

        // Build fence sides
        // Bottom side (with gate opening in middle)
        const bottomLength = right - left;
        const gateStart = left + (bottomLength / 2) - (gateWidth / 2);
        const gateEnd = gateStart + gateWidth;

        // Left section of bottom (before gate)
        for (let x = left; x < gateStart; x += postSpacing) {
          const post = createPost(x, bottom);
          fenceGroup.add(post);

          const nextX = Math.min(x + postSpacing, gateStart);
          if (nextX > x) {
            const rails = createRails(x, bottom, nextX, bottom);
            rails.forEach(rail => fenceGroup.add(rail));
          }
        }
        fenceGroup.add(createPost(gateStart, bottom));

        // Right section of bottom (after gate)
        fenceGroup.add(createPost(gateEnd, bottom));
        for (let x = gateEnd; x <= right; x += postSpacing) {
          const post = createPost(x, bottom);
          fenceGroup.add(post);

          if (x + postSpacing <= right) {
            const nextX = Math.min(x + postSpacing, right);
            const rails = createRails(x, bottom, nextX, bottom);
            rails.forEach(rail => fenceGroup.add(rail));
          }
        }
        if (right % postSpacing !== 0) {
          fenceGroup.add(createPost(right, bottom));
        }

        // Top side
        for (let x = left; x <= right; x += postSpacing) {
          const post = createPost(x, top);
          fenceGroup.add(post);

          if (x + postSpacing <= right) {
            const nextX = Math.min(x + postSpacing, right);
            const rails = createRails(x, top, nextX, top);
            rails.forEach(rail => fenceGroup.add(rail));
          }
        }
        if (right % postSpacing !== 0) {
          fenceGroup.add(createPost(right, top));
        }

        // Left side
        for (let z = bottom; z <= top; z += postSpacing) {
          if (z !== bottom && z !== top) {
            const post = createPost(left, z);
            fenceGroup.add(post);
          }

          if (z + postSpacing <= top) {
            const nextZ = Math.min(z + postSpacing, top);
            const rails = createRails(left, z, left, nextZ);
            rails.forEach(rail => fenceGroup.add(rail));
          }
        }

        // Right side
        for (let z = bottom; z <= top; z += postSpacing) {
          if (z !== bottom && z !== top) {
            const post = createPost(right, z);
            fenceGroup.add(post);
          }

          if (z + postSpacing <= top) {
            const nextZ = Math.min(z + postSpacing, top);
            const rails = createRails(right, z, right, nextZ);
            rails.forEach(rail => fenceGroup.add(rail));
          }
        }

        scene.add(fenceGroup);
        fenceGroupRef.current = fenceGroup;
      }

      // ---------- CREATE CHAIRS ----------
      // Remove old chairs
      if (chairsGroupRef.current) {
        scene.remove(chairsGroupRef.current);
        chairsGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          }
        });
        chairsGroupRef.current = null;
      }

      const gltfLoader = new GLTFLoader();
      const chairModelUrl = '/models/double_chaise_longue.glb';

      gltfLoader.load(
        chairModelUrl,
        (gltf) => {
          const chairsGroup = new THREE.Group();

          // Calculate positions for left and right chairs
          const leftChairX = -(poolSize.width / 2) - 10; // 3 feet from left edge of pool
          const rightChairX = (poolSize.width / 2) + 10; // 3 feet from right edge of pool
          const chairZ = 0; // Center along pool length

          // Left chair
          const leftChair = gltf.scene.clone();
          leftChair.scale.setScalar(2);
          leftChair.position.set(leftChairX, 3, chairZ);
          leftChair.rotation.y = 0; // Face right (toward pool)

          leftChair.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          chairsGroup.add(leftChair);

          // Right chair
          const rightChair = gltf.scene.clone();
          rightChair.scale.setScalar(2);
          rightChair.position.set(rightChairX, 3, chairZ);
          rightChair.rotation.y = Math.PI; // Face left (toward pool)

          rightChair.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          chairsGroup.add(rightChair);

          scene.add(chairsGroup);
          chairsGroupRef.current = chairsGroup;
          console.log('Chairs loaded and positioned!');
        },
        (progress) => {
          const percent = (progress.loaded / progress.total * 100).toFixed(2);
          console.log(`Loading chairs: ${percent}%`);
        },
        (error) => {
          console.error('Error loading chair model:', error);
        }
      );
    }
  }, [patioTop, patioBottom, patioLeft, patioRight, poolSize, showFence]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 to-sky-200">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Control Panel */}
      <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/30 rounded p-3 shadow-lg w-52 z-10">
        <h2 className="text-xs font-semibold text-white mb-2.5 tracking-wide">Controls</h2>

        {/* Pool Size Selector */}
        <div className="mb-3">
          <label className="block text-[10px] font-medium text-white/80 mb-1">
            Pool ({poolSize.width.toFixed(1)}' × {poolSize.length.toFixed(1)}')
          </label>
          <select
            value={poolSize.name}
            onChange={(e) => {
              const selected = poolPresets.find(p => p.name === e.target.value);
              if (selected) setPoolSize(selected);
            }}
            className="w-full bg-white/20 border border-white/30 text-white text-[10px] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white/50 backdrop-blur-sm"
          >
            {poolPresets.map((preset) => (
              <option key={preset.name} value={preset.name} className="bg-gray-800">
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fence Toggle */}
        <div className="mb-3 flex items-center justify-between">
          <label className="text-[10px] font-medium text-white/80">Show Fence</label>
          <button
            onClick={() => setShowFence(!showFence)}
            className={`w-12 h-6 rounded-full transition-colors ${
              showFence ? 'bg-green-500' : 'bg-gray-400'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                showFence ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Patio Sides - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-white/80 mb-0.5">Top: {patioTop}ft</label>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={patioTop}
              onChange={(e) => setPatioTop(+e.target.value)}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-white/80 mb-0.5">Bottom: {patioBottom}ft</label>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={patioBottom}
              onChange={(e) => setPatioBottom(+e.target.value)}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-white/80 mb-0.5">Left: {patioLeft}ft</label>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={patioLeft}
              onChange={(e) => setPatioLeft(+e.target.value)}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-white/80 mb-0.5">Right: {patioRight}ft</label>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={patioRight}
              onChange={(e) => setPatioRight(+e.target.value)}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
