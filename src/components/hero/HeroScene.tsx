"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { BrandKey } from "@/lib/brands";
import { heroState } from "./heroState";
import {
  chatPanelTexture,
  glowTexture,
  logoTexture,
  nodeTexture,
  workflowPanelTexture,
  type NodeSpec,
} from "./textures";

const ORBIT: BrandKey[] = ["n8n", "openai", "gemini", "claude", "whatsapp", "supabase", "telegram", "make", "zapier"];

const NODES: (NodeSpec & { pos: [number, number, number] })[] = [
  { label: "Webhook", sub: "trigger · POST", color: "#22D3EE", glyph: "⚡", pos: [-2.9, 1.55, 0.4] },
  { label: "AI Agent", sub: "tools · memory", color: "#EA4B71", brand: "n8n", pos: [2.7, 1.9, -0.3] },
  { label: "Chat Model", sub: "reasoning", color: "#A78BFA", brand: "openai", pos: [3.15, -0.35, 0.8] },
  { label: "Vector Store", sub: "rag · embeddings", color: "#3FCF8E", brand: "supabase", pos: [-3.25, -0.6, -0.4] },
  { label: "Send Reply", sub: "whatsapp cloud", color: "#25D366", brand: "whatsapp", pos: [1.7, -2.15, 0.2] },
  { label: "Route", sub: "if · switch", color: "#3B82F6", glyph: "⑂", pos: [-1.7, -2.25, 0.9] },
];
// node → node chain (the "workflow" itself)
const CHAIN: [number, number][] = [[0, 1], [1, 2], [3, 1], [1, 5], [5, 4]];

/* ───────── shaders ───────── */
const coreVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.);
    vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position;
    gl_Position = projectionMatrix * mv;
  }`;
const coreFrag = /* glsl */ `
  uniform float uTime; uniform float uEnergy;
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main(){
    float f = pow(1. - max(dot(vN, vV), 0.), 2.2);
    float bands = sin(vP.y * 9. + uTime * 1.6) * sin(vP.x * 7. - uTime * 1.1) * 0.5 + 0.5;
    vec3 deep = vec3(0.16, 0.07, 0.42);
    vec3 violet = vec3(0.55, 0.36, 0.96);
    vec3 cyan = vec3(0.13, 0.83, 0.93);
    vec3 col = mix(deep, violet, bands * 0.6 + 0.2);
    col = mix(col, cyan, f);
    col += vec3(0.9, 0.85, 1.) * pow(f, 4.) * 0.8;
    col *= 0.85 + uEnergy * 0.5;
    gl_FragColor = vec4(col, 0.92);
  }`;
const lineVert = /* glsl */ `
  attribute float aT; varying float vT;
  void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;
const lineFrag = /* glsl */ `
  uniform float uTime; uniform float uDraw; uniform float uPhase; uniform vec3 uColA; uniform vec3 uColB; uniform float uSpeed;
  varying float vT;
  void main(){
    if (vT > uDraw) discard;
    float head = fract(uTime * uSpeed + uPhase);
    float d = abs(vT - head);
    float pulse = smoothstep(0.12, 0., d);
    vec3 col = mix(uColA, uColB, vT);
    float a = 0.22 + pulse * 0.9;
    gl_FragColor = vec4(col * (0.7 + pulse * 1.6), a);
  }`;

const SEG = 48;
function makeLine(colA: THREE.Color, colB: THREE.Color, phase: number, speed: number) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((SEG + 1) * 3), 3));
  const t = new Float32Array(SEG + 1);
  for (let i = 0; i <= SEG; i++) t[i] = i / SEG;
  geo.setAttribute("aT", new THREE.BufferAttribute(t, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: lineVert,
    fragmentShader: lineFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uDraw: { value: 0 },
      uPhase: { value: phase },
      uSpeed: { value: speed },
      uColA: { value: colA },
      uColB: { value: colB },
    },
  });
  return new THREE.Line(geo, mat);
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _p = new THREE.Vector3();
function setCurve(line: THREE.Line, from: THREE.Vector3, to: THREE.Vector3, lift: number) {
  const pos = line.geometry.getAttribute("position") as THREE.BufferAttribute;
  _a.copy(from);
  _b.copy(to);
  _c.addVectors(_a, _b).multiplyScalar(0.5);
  _c.y += lift;
  _c.z += lift * 0.6;
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG, u = 1 - t;
    _p.set(
      u * u * _a.x + 2 * u * t * _c.x + t * t * _b.x,
      u * u * _a.y + 2 * u * t * _c.y + t * t * _b.y,
      u * u * _a.z + 2 * u * t * _c.z + t * t * _b.z
    );
    pos.setXYZ(i, _p.x, _p.y, _p.z);
  }
  pos.needsUpdate = true;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function World() {
  const { camera, size } = useThree();
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const intro = useRef(heroState.reduced ? 1 : 0);

  const built = useMemo(() => {
    /* core */
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: coreVert,
      fragmentShader: coreFrag,
      transparent: true,
      uniforms: { uTime: { value: 0 }, uEnergy: { value: 0 } },
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.82, 96, 96), coreMat);

    const ico = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.22, 1)),
      new THREE.LineBasicMaterial({ color: "#a78bfa", transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const vertsGeo = new THREE.IcosahedronGeometry(1.22, 1);
    const verts = new THREE.Points(
      vertsGeo,
      new THREE.PointsMaterial({ color: "#e0f2fe", size: 0.06, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const ringMat = (c: string, o: number) =>
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
    const rings = [
      new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.008, 8, 160), ringMat("#22d3ee", 0.7)),
      new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.006, 8, 160), ringMat("#8b5cf6", 0.55)),
      new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.004, 8, 160), ringMat("#3b82f6", 0.4)),
    ];
    rings[0].rotation.set(1.2, 0.2, 0);
    rings[1].rotation.set(0.4, 1.1, 0.3);
    rings[2].rotation.set(1.9, -0.5, 0.6);

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    halo.scale.setScalar(6.5);

    /* workflow nodes */
    const nodes = NODES.map((n) => {
      const tex = nodeTexture(n);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1.86, 0.61),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
      );
      m.userData.base = new THREE.Vector3(...n.pos);
      return m;
    });

    /* energy lines: core → node, plus node chain */
    const violet = new THREE.Color("#8b5cf6"), cyan = new THREE.Color("#22d3ee"), blue = new THREE.Color("#3b82f6");
    const coreLines = nodes.map((_, i) => makeLine(violet, i % 2 ? cyan : blue, i * 0.17, 0.45));
    const chainLines = CHAIN.map((_, i) => makeLine(cyan, violet, i * 0.29, 0.6));

    /* orbiting brand logos */
    const logos = ORBIT.map((b, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: logoTexture(b), transparent: true, depthWrite: false }));
      s.userData.phase = (i / ORBIT.length) * Math.PI * 2;
      s.userData.lane = i % 2;
      return s;
    });

    /* holographic panels */
    const panelMat = (t: THREE.Texture) =>
      new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const panelA = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2), panelMat(workflowPanelTexture()));
    panelA.position.set(-4.2, 1.3, -3.2);
    panelA.rotation.y = 0.5;
    const panelB = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2), panelMat(chatPanelTexture()));
    panelB.position.set(3.4, -1.5, -2.6);
    panelB.rotation.y = -0.5;

    /* particles */
    const N = 1600;
    const pp = new Float32Array(N * 3), pc = new Float32Array(N * 3);
    const palette = [new THREE.Color("#8b5cf6"), new THREE.Color("#3b82f6"), new THREE.Color("#22d3ee"), new THREE.Color("#f8fafc")];
    for (let i = 0; i < N; i++) {
      const r = 4 + Math.pow(Math.random(), 0.7) * 11;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pp.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th) - 2], i * 3);
      const c = palette[(Math.random() * palette.length) | 0];
      pc.set([c.r, c.g, c.b], i * 3);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pc, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })
    );

    return { core, coreMat, ico, verts, rings, halo, nodes, coreLines, chainLines, logos, panelA, panelB, particles };
  }, []);

  // dispose GPU resources on unmount
  useEffect(() => {
    const b = built;
    return () => {
      const all: THREE.Object3D[] = [b.core, b.ico, b.verts, b.halo, b.panelA, b.panelB, b.particles, ...b.rings, ...b.nodes, ...b.coreLines, ...b.chainLines, ...b.logos];
      all.forEach((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material & { map?: THREE.Texture };
        mat?.map?.dispose();
        mat?.dispose();
      });
    };
  }, [built]);

  const coreGroup = useRef<THREE.Group>(null);
  const tmpNode = useMemo(() => new THREE.Vector3(), []);
  const origin = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const speed = heroState.reduced ? 0.15 : 1;
    const t = state.clock.elapsedTime * speed;
    const p = heroState.progress;

    // load-in
    if (intro.current < 1) intro.current = Math.min(1, intro.current + dt / 2.6);
    const ii = 1 - Math.pow(1 - intro.current, 3);

    const portrait = size.width / size.height < 1;
    const spread = 1 + smooth(0.15, 0.8, p) * 0.85; // nodes separate
    const expand = 1 + smooth(0.1, 0.75, p) * 0.75; // core grows
    const energy = smooth(0.0, 0.7, p);

    // layout: scene to the right of the copy on wide screens, centring as you scroll
    const offsetX = heroState.wide ? 3.2 * (1 - smooth(0.2, 0.55, p)) : 0;
    const offsetY = heroState.wide ? 0 : 1.2 * (1 - smooth(0.2, 0.55, p));
    if (root.current) {
      root.current.position.x += (offsetX - root.current.position.x) * 0.08;
      root.current.position.y += (offsetY - root.current.position.y) * 0.08;
      const s = (portrait ? 0.62 : 1) * (0.55 + 0.45 * ii);
      root.current.scale.setScalar(s);
    }
    // pointer parallax
    if (tilt.current) {
      tilt.current.rotation.y += (heroState.mx * 0.28 + p * 0.6 - tilt.current.rotation.y) * 0.05;
      tilt.current.rotation.x += (-heroState.my * 0.16 + p * 0.12 - tilt.current.rotation.x) * 0.05;
    }
    // camera dolly
    const camZ = (portrait ? 12.5 : 10) - smooth(0.1, 0.9, p) * 1.8;
    camera.position.z += (camZ - camera.position.z) * 0.08;
    camera.lookAt(0, 0, 0);

    // core
    const b = built;
    b.coreMat.uniforms.uTime.value = t;
    b.coreMat.uniforms.uEnergy.value = energy;
    if (coreGroup.current) {
      const breathe = 1 + Math.sin(t * 1.4) * 0.025;
      coreGroup.current.scale.setScalar(expand * breathe);
    }
    b.ico.rotation.y = t * 0.18;
    b.ico.rotation.x = t * 0.09;
    b.verts.rotation.copy(b.ico.rotation);
    b.rings[0].rotation.z = t * 0.35;
    b.rings[1].rotation.z = -t * 0.25;
    b.rings[2].rotation.z = t * 0.15;
    (b.halo.material as THREE.SpriteMaterial).opacity = (0.55 + energy * 0.45) * ii;
    b.halo.scale.setScalar(6.5 * expand);

    // nodes
    b.nodes.forEach((n, i) => {
      const base = n.userData.base as THREE.Vector3;
      n.position.copy(base).multiplyScalar(spread * ii);
      n.position.y += Math.sin(t * 0.9 + i * 1.3) * 0.08;
      n.quaternion.copy(camera.quaternion); // billboard
      (n.material as THREE.MeshBasicMaterial).opacity = smooth(0.15 + i * 0.08, 0.6 + i * 0.08, intro.current);
    });
    b.coreLines.forEach((l, i) => {
      tmpNode.copy(b.nodes[i].position);
      setCurve(l, origin, tmpNode, 0.6 + (i % 3) * 0.25);
      const u = (l.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value = t;
      u.uDraw.value = smooth(0.1, 0.85, intro.current);
      u.uSpeed.value = 0.45 + energy * 0.6;
    });
    b.chainLines.forEach((l, i) => {
      const [a, c] = CHAIN[i];
      setCurve(l, b.nodes[a].position, b.nodes[c].position, -0.35);
      const u = (l.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value = t;
      u.uDraw.value = smooth(0.5, 1, intro.current) * (0.35 + smooth(0.05, 0.6, p) * 0.65);
      u.uSpeed.value = 0.6 + energy * 0.8;
    });

    // orbiting logos
    const R = (3.9 + smooth(0.1, 0.8, p) * 1.6) * (0.6 + 0.4 * ii);
    b.logos.forEach((s) => {
      const lane = s.userData.lane as number;
      const a = s.userData.phase + t * (0.16 + energy * 0.22) * (lane ? -1 : 1);
      const r = R * (lane ? 1.18 : 1);
      s.position.set(Math.cos(a) * r, Math.sin(a) * r * (lane ? 0.34 : -0.22) + (lane ? 0.2 : -0.1), Math.sin(a) * r * 0.75);
      const depth = (s.position.z / r + 1) / 2; // 0 back → 1 front
      s.scale.setScalar(0.62 + depth * 0.22);
      (s.material as THREE.SpriteMaterial).opacity = (0.45 + depth * 0.55) * ii;
    });

    // holographic panels
    b.panelA.position.y = 1.3 + Math.sin(t * 0.6) * 0.12;
    b.panelB.position.y = -1.5 + Math.sin(t * 0.7 + 1) * 0.12;
    // on wide screens the left panel sits behind the headline, so it waits for the scroll
    const panelIn = smooth(0.35, 1, intro.current) * (1 - smooth(0.55, 0.9, p) * 0.6);
    const panelO = 0.85 * panelIn;
    (b.panelA.material as THREE.MeshBasicMaterial).opacity = heroState.wide ? panelO * smooth(0.12, 0.35, p) : panelO * 0.5;
    (b.panelB.material as THREE.MeshBasicMaterial).opacity = panelO;
    b.panelA.position.x = -4.2 - smooth(0.2, 0.8, p) * 1.2;
    b.panelB.position.x = 3.4 + smooth(0.2, 0.8, p) * 1.3;

    b.particles.rotation.y = t * 0.02 + p * 0.4;
  });

  return (
    <group ref={root}>
      <group ref={tilt}>
        <primitive object={built.particles} />
        <primitive object={built.halo} />
        <group ref={coreGroup}>
          <primitive object={built.core} />
          <primitive object={built.ico} />
          <primitive object={built.verts} />
          {built.rings.map((r, i) => (
            <primitive key={i} object={r} />
          ))}
        </group>
        {built.coreLines.map((l, i) => (
          <primitive key={`c${i}`} object={l} />
        ))}
        {built.chainLines.map((l, i) => (
          <primitive key={`l${i}`} object={l} />
        ))}
        {built.nodes.map((n, i) => (
          <primitive key={`n${i}`} object={n} />
        ))}
        {built.logos.map((s, i) => (
          <primitive key={`o${i}`} object={s} />
        ))}
        <primitive object={built.panelA} />
        <primitive object={built.panelB} />
      </group>
    </group>
  );
}

export default function HeroScene({ active }: { active: boolean }) {
  // canvas textures use the page fonts — wait until they are loaded
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const done = () => alive && setFontsReady(true);
    if (document.fonts?.ready) document.fonts.ready.then(done);
    else done();
    const t = setTimeout(done, 1500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  if (!fontsReady) return null;
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 10], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={<StaticCore />}
      aria-hidden
    >
      <World />
    </Canvas>
  );
}

/** Shown when WebGL is unavailable. */
export function StaticCore() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="relative h-64 w-64">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#a78bfa,#4c1d95_55%,transparent_70%)] blur-[2px]" />
        <div className="absolute -inset-16 rounded-full bg-violet/25 blur-3xl" />
        <div className="spin-slow absolute -inset-10 rounded-full border border-cyan/40" />
      </div>
    </div>
  );
}
