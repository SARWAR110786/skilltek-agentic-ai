import type { BrandKey } from "./brands";

/* ───────────────────────── Site configuration ───────────────────────── */
export const SITE = {
  name: "The Skilltek Institute & Media Solution",
  short: "Skilltek",
  program: "No-Code & Low-Code Agentic AI & Automation",
  duration: "2 Months",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://agenticai.theskilltek.com",
  /** Every "Apply" button sends students to the official SkillTek admissions page. */
  applyUrl: "https://theskilltek.com/admissions",
  address: "Near Dargah Shah Mubeen, Beside Dr Luchman Clinic, Doctor Street, Thatta",
  phone: "0312 2098894",
  phoneIntl: "+923122098894",
  email: "theskilltek@gmail.com",
};

export const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Course" },
  { id: "curriculum", label: "Curriculum" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

/* ───────────────────────── Automation evolution ───────────────────────── */
export const EVOLUTION = [
  {
    key: "traditional",
    stage: "Stage 01",
    title: "Traditional Automation",
    tagline: "Does exactly what it was told. Nothing more.",
    points: ["Fixed rules", "Predetermined workflows", "Limited decision-making"],
  },
  {
    key: "ai",
    stage: "Stage 02",
    title: "AI Automation",
    tagline: "Understands language. Responds with context.",
    points: ["AI-powered processing", "Context-aware responses", "Intelligent integrations"],
  },
  {
    key: "agentic",
    stage: "Stage 03",
    title: "Agentic AI",
    tagline: "Plans, uses tools and finishes the job.",
    points: [
      "Tool calling",
      "Task planning",
      "Memory",
      "Multi-step execution",
      "Multi-agent collaboration",
    ],
  },
] as const;

/* ───────────────────────── Technology ecosystem ───────────────────────── */
export type Tech = { brand: BrandKey; name: string; desc: string };

export const TECH_GROUPS: { label: string; items: Tech[] }[] = [
  {
    label: "Automation platforms",
    items: [
      { brand: "make", name: "Make", desc: "Visual scenarios for fast multi-app automations." },
      { brand: "zapier", name: "Zapier", desc: "Quick trigger-action Zaps across thousands of apps." },
    ],
  },
  {
    label: "AI platforms",
    items: [
      { brand: "openai", name: "OpenAI", desc: "GPT models for reasoning, writing and tool calls." },
      { brand: "gemini", name: "Google Gemini", desc: "Multimodal models for text, images and documents." },
      { brand: "claude", name: "Anthropic Claude", desc: "Careful long-context reasoning for agent work." },
    ],
  },
  {
    label: "Databases",
    items: [
      { brand: "supabase", name: "Supabase", desc: "Postgres, auth and vector storage for agents." },
      { brand: "sheets", name: "Google Sheets", desc: "The friendliest database your clients already use." },
      { brand: "airtable", name: "Airtable", desc: "Structured records with views your team can edit." },
    ],
  },
  {
    label: "Communication",
    items: [
      { brand: "whatsapp", name: "WhatsApp Cloud API", desc: "Official API for AI chat, support and sales." },
      { brand: "telegram", name: "Telegram", desc: "Bots for alerts, assistants and internal tools." },
      { brand: "gmail", name: "Gmail", desc: "Read, sort, draft and reply to email automatically." },
    ],
  },
];

export const ADVANCED = [
  { key: "mcp", name: "MCP", desc: "Model Context Protocol: one standard way to plug tools into any agent." },
  { key: "rag", name: "RAG", desc: "Ground answers in your own documents with retrieval." },
  { key: "tools", name: "Tool Calling", desc: "Agents that choose and call APIs on their own." },
  { key: "multi", name: "Multi-Agent Systems", desc: "Specialist agents that delegate and collaborate." },
  { key: "hitl", name: "Human-in-the-Loop", desc: "Approval steps where people stay in control." },
] as const;

/* ───────────────────────── Curriculum ───────────────────────── */
export type ModuleIcon =
  | "brain" | "prompt" | "workflow" | "webhook" | "bot" | "database" | "search"
  | "plug" | "network" | "chat" | "briefcase" | "shield" | "server" | "rocket";

export const MODULES: { title: string; icon: ModuleIcon; topics: string[] }[] = [
  { title: "AI Fundamentals", icon: "brain", topics: ["Artificial Intelligence", "Generative AI", "Large Language Models", "AI Agents", "Traditional vs Intelligent Automation"] },
  { title: "Prompt Engineering", icon: "prompt", topics: ["System instructions", "Context engineering", "Structured outputs", "JSON fundamentals", "Prompt optimization"] },
  { title: "n8n Workflow Automation", icon: "workflow", topics: ["Nodes and connections", "Triggers and actions", "Workflow logic", "Conditions and loops", "Expressions", "Debugging"] },
  { title: "API & Webhook Integration", icon: "webhook", topics: ["REST APIs", "HTTP requests", "API authentication", "Webhooks", "Third-party integrations"] },
  { title: "AI Agent Development", icon: "bot", topics: ["AI Agent architecture", "Tool calling", "Agent memory", "Decision-making", "Multi-step execution"] },
  { title: "Databases & Integrations", icon: "database", topics: ["Supabase", "Google Sheets", "Airtable", "CRUD operations", "Data management"] },
  { title: "RAG & Knowledge-Based Agents", icon: "search", topics: ["Document processing", "Embeddings", "Vector databases", "Semantic search", "PDF knowledge assistants"] },
  { title: "Model Context Protocol (MCP)", icon: "plug", topics: ["MCP fundamentals", "MCP clients and servers", "External tool integration", "Connecting AI agents with MCP"] },
  { title: "Multi-Agent Systems", icon: "network", topics: ["Supervisor agents", "Specialized agents", "Agent delegation", "Agent collaboration", "Workflow orchestration"] },
  { title: "WhatsApp AI Automation", icon: "chat", topics: ["WhatsApp Cloud API", "AI customer support", "Conversation memory", "Automated replies", "Lead management"] },
  { title: "Business Process Automation", icon: "briefcase", topics: ["CRM automation", "Lead generation", "Email automation", "Appointment booking", "Sales automation"] },
  { title: "Advanced AI Automation", icon: "shield", topics: ["Human approval", "Error handling", "Monitoring", "Security", "Agent evaluation"] },
  { title: "Deployment & Hosting", icon: "server", topics: ["n8n Cloud", "VPS hosting", "Docker fundamentals", "Production workflows", "Deployment and maintenance"] },
  { title: "Freelancing & AI Agency", icon: "rocket", topics: ["Finding clients", "Identifying business problems", "Automation proposals", "Project pricing", "Building an AI automation portfolio"] },
];

export const PHASES = [
  { name: "Foundations", from: 0, to: 3 },
  { name: "Building Agents", from: 4, to: 8 },
  { name: "Real-World Automation", from: 9, to: 11 },
  { name: "Launch & Earn", from: 12, to: 13 },
];

/* ───────────────────────── Projects ───────────────────────── */
export const PROJECTS: {
  title: string;
  summary: string;
  flow: BrandKey[];
  tags: string[];
}[] = [
  {
    title: "WhatsApp AI Support Agent",
    summary: "Answers customer questions 24/7, remembers each conversation and hands hard cases to a human.",
    flow: ["whatsapp", "n8n", "openai", "supabase"],
    tags: ["Cloud API", "Memory", "Handoff"],
  },
  {
    title: "PDF Knowledge Assistant",
    summary: "Upload policies or course notes, then ask questions and get answers that cite the source page.",
    flow: ["gmail", "n8n", "gemini", "supabase"],
    tags: ["RAG", "Embeddings", "Vector search"],
  },
  {
    title: "Lead Capture & CRM Pipeline",
    summary: "Captures leads from forms and chats, scores them with AI and books follow-ups automatically.",
    flow: ["telegram", "n8n", "claude", "airtable"],
    tags: ["Lead scoring", "CRM", "Email"],
  },
  {
    title: "Multi-Agent Research Team",
    summary: "A supervisor agent splits a brief between researcher, writer and reviewer agents, then delivers a report.",
    flow: ["n8n", "openai", "claude", "sheets"],
    tags: ["Supervisor", "Delegation", "Review"],
  },
  {
    title: "Appointment Booking Bot",
    summary: "Checks availability, books slots, sends reminders and reschedules through a natural chat.",
    flow: ["whatsapp", "make", "gemini", "sheets"],
    tags: ["Scheduling", "Reminders", "Make"],
  },
  {
    title: "MCP-Connected Business Agent",
    summary: "One agent that reaches your database, inbox and docs through MCP, with approval before it acts.",
    flow: ["mcp", "n8n", "claude", "supabase"],
    tags: ["MCP", "Tool calling", "Human approval"],
  },
];

export const AUDIENCE = [
  { title: "Students & graduates", desc: "Build a portfolio in one of the fastest-growing skills in tech." },
  { title: "Business owners", desc: "Automate support, sales and admin without hiring a dev team." },
  { title: "Freelancers", desc: "Add AI automation services that clients are already asking for." },
  { title: "Professionals", desc: "Remove repetitive work from your job and lead AI adoption at work." },
];

export const FAQ = [
  { q: "Do I need to know how to code?", a: "No. The program is built on visual, no-code and low-code tools. You will learn to read JSON and call APIs, and everything is taught from first principles." },
  { q: "How long is the program?", a: "Two months of guided, hands-on learning across 14 modules, finishing with portfolio projects you can show clients or employers." },
  { q: "What will I have at the end?", a: "Working automations and AI agents you built yourself, deployed and documented, plus a playbook for finding and pricing client work." },
  { q: "Which tools do I need?", a: "A laptop and an internet connection. Every platform used in class has a free tier or trial, and we show you how to set each one up." },
];
