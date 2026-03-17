import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface AgentDef {
  id: string;
  name: string;
  description: string;
  argumentHint: string;
  body: string;
  type: "system" | "marketing" | "design";
}

const DESIGN_SKILLS = new Set([
  "social-creative",
  "deliverable-design",
  "web-mockup",
  "brand-asset-design",
  "canvas-art",
]);

const SYSTEM_SKILLS = new Set(["orchestrator"]);

let _agents: AgentDef[] | null = null;

function getSkillsDir(): string {
  // In Vercel, process.cwd() is the project root
  return path.join(process.cwd(), ".claude", "skills");
}

export function getAgents(): AgentDef[] {
  if (_agents) return _agents;

  const skillsDir = getSkillsDir();
  const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  _agents = dirs
    .map((dir) => {
      const skillPath = path.join(skillsDir, dir, "SKILL.md");
      if (!fs.existsSync(skillPath)) return null;

      const raw = fs.readFileSync(skillPath, "utf-8");
      const { data, content } = matter(raw);

      const id = data.name || dir;
      let type: AgentDef["type"] = "marketing";
      if (SYSTEM_SKILLS.has(id)) type = "system";
      else if (DESIGN_SKILLS.has(id)) type = "design";

      return {
        id,
        name: formatName(id),
        description: data.description || "",
        argumentHint: data["argument-hint"] || "",
        body: content.trim(),
        type,
      } satisfies AgentDef;
    })
    .filter((a): a is AgentDef => a !== null)
    .sort((a, b) => {
      const order = { system: 0, marketing: 1, design: 2 };
      return order[a.type] - order[b.type] || a.name.localeCompare(b.name);
    });

  return _agents;
}

export function getAgent(id: string): AgentDef | undefined {
  return getAgents().find((a) => a.id === id);
}

function formatName(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
