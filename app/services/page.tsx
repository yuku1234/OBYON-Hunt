import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { Service } from "@/types";

export const metadata: Metadata = {
  title: "Services",
};

const SERVICES: Service[] = [
  {
    id: "svc-001",
    category: "ai_agents",
    name: "AI Agents",
    description:
      "Custom autonomous AI agents that handle tasks end-to-end — customer support, research, data processing, or multi-step workflows without human intervention.",
    icon: "Bot",
    keywords: ["autonomous", "agent", "LLM", "workflow", "customer support"],
    opportunityCount: 1,
  },
  {
    id: "svc-002",
    category: "ai_automation",
    name: "AI Automation",
    description:
      "End-to-end AI-powered automation for business processes — eliminate repetitive manual work and connect your data sources intelligently.",
    icon: "Zap",
    keywords: ["automation", "workflow", "n8n", "Make", "Zapier"],
    opportunityCount: 2,
  },
  {
    id: "svc-003",
    category: "ai_chatbots",
    name: "AI Chatbots",
    description:
      "Conversational AI chatbots trained on your data — for websites, apps, or internal tools. Deploy on any channel in days, not months.",
    icon: "MessageSquare",
    keywords: ["chatbot", "conversational AI", "NLP", "RAG", "knowledge base"],
    opportunityCount: 1,
  },
  {
    id: "svc-004",
    category: "saas_development",
    name: "SaaS Development",
    description:
      "Full-stack SaaS product development from MVP to scale. We own architecture decisions, not just execute tickets.",
    icon: "Code2",
    keywords: ["saas", "product", "mvp", "startup", "full-stack"],
    opportunityCount: 2,
  },
  {
    id: "svc-005",
    category: "web_development",
    name: "Web Development",
    description:
      "Modern, performant web applications and websites — Next.js, React, or custom stacks. From landing pages to complex web platforms.",
    icon: "Globe",
    keywords: ["web", "nextjs", "react", "landing page", "redesign"],
    opportunityCount: 1,
  },
  {
    id: "svc-006",
    category: "mobile_development",
    name: "Mobile Development",
    description:
      "Cross-platform and native mobile applications for iOS and Android. Fast delivery, clean architecture.",
    icon: "Smartphone",
    keywords: ["mobile", "ios", "android", "react native", "flutter"],
    opportunityCount: 0,
  },
  {
    id: "svc-007",
    category: "video_editing",
    name: "Video Editing",
    description:
      "Professional video editing for creators and businesses — YouTube, social media, ads, and long-form content.",
    icon: "Video",
    keywords: ["video", "youtube", "editing", "premiere", "content"],
    opportunityCount: 1,
  },
  {
    id: "svc-008",
    category: "ai_video",
    name: "AI Video Generation",
    description:
      "AI-generated video content — faceless channels, explainer videos, ad creatives, and automated video pipelines.",
    icon: "Sparkles",
    keywords: ["ai video", "faceless", "runway", "sora", "heygen"],
    opportunityCount: 0,
  },
  {
    id: "svc-009",
    category: "whatsapp_automation",
    name: "WhatsApp Automation",
    description:
      "WhatsApp Business API integrations — automated order updates, customer service bots, marketing sequences.",
    icon: "MessageCircle",
    keywords: ["whatsapp", "whatsapp business", "chatbot", "retail", "automation"],
    opportunityCount: 1,
  },
  {
    id: "svc-010",
    category: "data_automation",
    name: "Data Automation",
    description:
      "Automated data pipelines, ETL workflows, and integrations between your tools — eliminate manual CSV exports and copy-paste forever.",
    icon: "Database",
    keywords: ["data", "etl", "pipeline", "csv", "erp", "integration"],
    opportunityCount: 1,
  },
  {
    id: "svc-011",
    category: "ui_ux",
    name: "UI/UX Design",
    description:
      "User research, wireframing, and high-fidelity design for products and websites. Figma-ready, developer-friendly output.",
    icon: "Palette",
    keywords: ["ui", "ux", "figma", "design", "wireframe"],
    opportunityCount: 0,
  },
  {
    id: "svc-012",
    category: "cloud_devops",
    name: "Cloud / DevOps",
    description:
      "Cloud infrastructure, CI/CD pipelines, containerisation, and observability. AWS, GCP, and Azure.",
    icon: "Cloud",
    keywords: ["devops", "aws", "gcp", "docker", "kubernetes", "ci/cd"],
    opportunityCount: 0,
  },
  {
    id: "svc-013",
    category: "api_integrations",
    name: "API Integrations",
    description:
      "Connect any two systems via REST, GraphQL, or webhooks. Rapid integration development for any stack.",
    icon: "Plug",
    keywords: ["api", "rest", "webhook", "integration", "connector"],
    opportunityCount: 0,
  },
  {
    id: "svc-014",
    category: "marketing_automation",
    name: "Marketing Automation",
    description:
      "Automated email sequences, lead nurturing workflows, CRM integrations, and campaign automation.",
    icon: "BarChart2",
    keywords: ["marketing", "email", "hubspot", "mailchimp", "crm"],
    opportunityCount: 0,
  },
  {
    id: "svc-015",
    category: "crm_automation",
    name: "CRM Automation",
    description:
      "Automate CRM data entry, lead routing, follow-up sequences, and reporting dashboards.",
    icon: "TrendingUp",
    keywords: ["crm", "salesforce", "hubspot", "pipedrive", "automation"],
    opportunityCount: 0,
  },
  {
    id: "svc-016",
    category: "custom_software",
    name: "Custom Software",
    description:
      "Bespoke software solutions for unique business needs — internal tools, platforms, and automation systems.",
    icon: "Wrench",
    keywords: ["custom", "bespoke", "internal tool", "platform"],
    opportunityCount: 0,
  },
  {
    id: "svc-017",
    category: "ai_integrations",
    name: "AI Integrations",
    description:
      "Integrate AI capabilities into existing products — OpenAI, Gemini, or open-source LLMs into your current stack.",
    icon: "Cpu",
    keywords: ["openai", "gemini", "llm", "integration", "embedding"],
    opportunityCount: 1,
  },
  {
    id: "svc-018",
    category: "other",
    name: "Other Digital Services",
    description:
      "Technology and digital services not listed above — we assess each request individually.",
    icon: "Package",
    keywords: ["other", "digital", "technology", "services"],
    opportunityCount: 0,
  },
];

export default function ServicesPage() {
  const activeServices = SERVICES.filter((s) => s.opportunityCount > 0);
  const otherServices = SERVICES.filter((s) => s.opportunityCount === 0);

  return (
    <div>
      <PageHeader
        title="Services"
        description="OBYON's service categories — the capabilities we match against every detected signal."
        badge={`${SERVICES.length} services`}
      />

      {/* Active services */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 className="heading-md" style={{ marginBottom: "1rem" }}>
          Services with Active Signals
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {activeServices.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      </div>

      {/* Other services */}
      <div>
        <h2 className="heading-md" style={{ marginBottom: "1rem" }}>
          All Other Services
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {otherServices.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      </div>
    </div>
  );
}
