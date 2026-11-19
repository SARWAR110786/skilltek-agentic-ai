import * as THREE from "three";
import { BRANDS, type BrandKey } from "@/lib/brands";

function fontFamily(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

function drawBrand(ctx: CanvasRenderingContext2D, brand: BrandKey, cx: number, cy: number, size: number, color?: string) {
  const b = BRANDS[brand];
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color ?? b.color;
  ctx.fill(new Path2D(b.path), "evenodd");
  ctx.restore();
}

/** Soft radial glow used for the core halo and node flares. */
export function glowTexture(inner = "rgba(167,139,250,1)", mid = "rgba(99,102,241,0.35)") {
  const [c, ctx] = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, mid);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(c);
}

/** Glass "app chip" holding an official brand mark — used for orbiting logos. */
export function logoTexture(brand: BrandKey) {
  const S = 256;
  const [c, ctx] = canvas(S, S);
  const b = BRANDS[brand];
  // outer glow
  const glow = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S / 2);
  glow.addColorStop(0, hexA(b.color, 0.35));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);
  // glass disc
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2);
  const fill = ctx.createLinearGradient(0, 0, S, S);
  fill.addColorStop(0, "rgba(34,34,64,0.96)");
  fill.addColorStop(1, "rgba(10,10,24,0.96)");
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = hexA(b.color, 0.75);
  ctx.stroke();
  // specular
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.33, Math.PI * 1.1, Math.PI * 1.65);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  drawBrand(ctx, brand, S / 2, S / 2, S * 0.36);
  return toTexture(c);
}

export type NodeSpec = {
  label: string;
  sub: string;
  color: string;
  brand?: BrandKey;
  glyph?: string;
};

/** Workflow node card, styled like a visual automation editor. */
export function nodeTexture(spec: NodeSpec) {
  const W = 512, H = 168;
  const [c, ctx] = canvas(W, H);
  const display = fontFamily("--font-sora", "system-ui");
  const mono = fontFamily("--font-jbmono", "monospace");
  const r = 30;
  roundRect(ctx, 6, 6, W - 12, H - 12, r);
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "rgba(28,28,56,0.94)");
  bg.addColorStop(1, "rgba(12,12,28,0.94)");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = hexA(spec.color, 0.8);
  ctx.stroke();
  // icon tile
  roundRect(ctx, 26, 30, 108, 108, 24);
  ctx.fillStyle = hexA(spec.color, 0.16);
  ctx.fill();
  ctx.strokeStyle = hexA(spec.color, 0.5);
  ctx.lineWidth = 2;
  ctx.stroke();
  if (spec.brand) drawBrand(ctx, spec.brand, 80, 84, 60);
  else if (spec.glyph) {
    ctx.fillStyle = spec.color;
    ctx.font = `700 54px ${mono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(spec.glyph, 80, 88);
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F8FAFC";
  ctx.font = `600 40px ${display}`;
  ctx.fillText(spec.label, 158, 84);
  ctx.fillStyle = "#94A3B8";
  ctx.font = `500 25px ${mono}`;
  ctx.fillText(spec.sub, 158, 122);
  // connection handles
  for (const x of [6, W - 6]) {
    ctx.beginPath();
    ctx.arc(x, H / 2, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#0b0b18";
    ctx.fill();
    ctx.strokeStyle = hexA(spec.color, 0.9);
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  return toTexture(c);
}

/** Holographic workflow-editor panel. */
export function workflowPanelTexture() {
  const W = 800, H = 500;
  const [c, ctx] = canvas(W, H);
  const mono = fontFamily("--font-jbmono", "monospace");
  const display = fontFamily("--font-sora", "system-ui");
  holoFrame(ctx, W, H, "#8B5CF6");
  ctx.fillStyle = "#c4b5fd";
  ctx.font = `600 22px ${mono}`;
  ctx.fillText("workflow / lead-qualifier.agent", 34, 52);
  // grid dots
  ctx.fillStyle = "rgba(148,163,184,0.18)";
  for (let x = 40; x < W - 20; x += 28) for (let y = 90; y < H - 70; y += 28) ctx.fillRect(x, y, 2, 2);
  const nodes: [number, number, string, BrandKey | null, string][] = [
    [70, 150, "Webhook", null, "#22D3EE"],
    [300, 120, "AI Agent", "n8n", "#EA4B71"],
    [300, 290, "Memory", "supabase", "#3FCF8E"],
    [540, 200, "Reply", "whatsapp", "#25D366"],
  ];
  // links
  ctx.lineWidth = 3;
  const link = (a: number, b: number) => {
    const [x1, y1] = [nodes[a][0] + 170, nodes[a][1] + 36];
    const [x2, y2] = [nodes[b][0], nodes[b][1] + 36];
    const g = ctx.createLinearGradient(x1, 0, x2, 0);
    g.addColorStop(0, nodes[a][4]);
    g.addColorStop(1, nodes[b][4]);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2);
    ctx.stroke();
  };
  link(0, 1); link(0, 2); link(1, 3); link(2, 3);
  for (const [x, y, label, brand, col] of nodes) {
    roundRect(ctx, x, y, 170, 72, 16);
    ctx.fillStyle = "rgba(16,16,36,0.95)";
    ctx.fill();
    ctx.strokeStyle = hexA(col, 0.85);
    ctx.lineWidth = 2;
    ctx.stroke();
    if (brand) drawBrand(ctx, brand, x + 36, y + 36, 32);
    else {
      ctx.fillStyle = col;
      ctx.font = `700 28px ${mono}`;
      ctx.fillText("{ }", x + 14, y + 46);
    }
    ctx.fillStyle = "#F8FAFC";
    ctx.font = `600 22px ${display}`;
    ctx.fillText(label, x + 64, y + 44);
  }
  // status bar
  ctx.fillStyle = "#22D3EE";
  ctx.font = `500 20px ${mono}`;
  ctx.fillText("● run #2481   4 nodes   1.2s   success", 34, H - 34);
  return toTexture(c);
}

/** Holographic chat panel: an AI agent replying on WhatsApp. */
export function chatPanelTexture() {
  const W = 560, H = 640;
  const [c, ctx] = canvas(W, H);
  const mono = fontFamily("--font-jbmono", "monospace");
  const sans = fontFamily("--font-inter", "system-ui");
  holoFrame(ctx, W, H, "#22D3EE");
  drawBrand(ctx, "whatsapp", 54, 52, 34);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = `600 24px ${sans}`;
  ctx.fillText("AI Support Agent", 84, 60);
  ctx.fillStyle = "#3FCF8E";
  ctx.font = `500 18px ${mono}`;
  ctx.fillText("online · tools: calendar, crm", 84, 88);
  const bubble = (y: number, text: string[], mine: boolean) => {
    const w = 380, h = 26 + text.length * 32;
    const x = mine ? W - w - 30 : 30;
    roundRect(ctx, x, y, w, h, 20);
    ctx.fillStyle = mine ? "rgba(59,130,246,0.32)" : "rgba(139,92,246,0.24)";
    ctx.fill();
    ctx.strokeStyle = mine ? "rgba(59,130,246,0.6)" : "rgba(139,92,246,0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#F8FAFC";
    ctx.font = `500 22px ${sans}`;
    text.forEach((t, i) => ctx.fillText(t, x + 20, y + 40 + i * 32));
  };
  bubble(130, ["Can I book a demo", "tomorrow at 3pm?"], true);
  bubble(250, ["Checking the calendar…", "3:00 PM is free. Booked ✓"], false);
  ctx.fillStyle = "#94A3B8";
  ctx.font = `500 18px ${mono}`;
  ctx.fillText("→ tool_call: calendar.create_event", 40, 400);
  ctx.fillText("→ tool_call: crm.update_lead", 40, 430);
  bubble(470, ["Confirmation sent to", "your email. Anything else?"], false);
  return toTexture(c);
}

function holoFrame(ctx: CanvasRenderingContext2D, W: number, H: number, color: string) {
  roundRect(ctx, 4, 4, W - 8, H - 8, 28);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, hexA(color, 0.16));
  bg.addColorStop(1, "rgba(10,10,30,0.55)");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = hexA(color, 0.65);
  ctx.lineWidth = 3;
  ctx.stroke();
  // scanlines
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let y = 8; y < H; y += 6) ctx.fillRect(8, y, W - 16, 1);
  // traffic lights
  ["#f87171", "#fbbf24", "#34d399"].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(W - 40 - i * 24, 34, 6, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
