"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  FileText,
  Lightbulb,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Message } from "@/stores/chatStore";

interface AIGCSidebarProps {
  messages: Message[];
  isConnected: boolean;
  className?: string;
}

type GeneratorConfig = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  sample: string;
};

const CONTENT_TOOLS: GeneratorConfig[] = [
  {
    id: "summary",
    label: "Zusammenfassung",
    description: "Erstelle eine prägnante Zusammenfassung",
    icon: FileText,
    accent: "#2563EB",
    sample:
      "📄 Zusammenfassung\nWichtige Punkte aus dem Gespräch, einschließlich Haupttrends und strategischer Erkenntnisse.",
  },
  {
    id: "key-insights",
    label: "Wichtige Trenderkenntnisse",
    description: "Extrahiere die wichtigsten Trends",
    icon: Lightbulb,
    accent: "#F59E0B",
    sample:
      "💡 Wichtige Trenderkenntnisse\nIdentifizierte Megatrends und strategische Muster aus der Analyse.",
  },
  {
    id: "strategic-recommendations",
    label: "Strategische Empfehlungen",
    description: "Entwickle strategische Handlungsempfehlungen",
    icon: ShieldCheck,
    accent: "#10B981",
    sample:
      "🎯 Strategische Empfehlungen\nHandlungsempfehlungen basierend auf identifizierten Zukunftstrends und strategischer Vorausschau.",
  },
  {
    id: "trend-frameworks",
    label: "Trend-Frameworks",
    description: "Zugriff auf strategische Rahmenwerke",
    icon: FileText,
    accent: "#8B5CF6",
    sample:
      "📋 Trend-Frameworks\nStrategische Rahmenwerke und Methoden der Zukunftsforschung.",
  },
  {
    id: "scenario-planning",
    label: "Szenario-Planung",
    description: "Entwickle Zukunftsszenarien",
    icon: CheckCircle2,
    accent: "#3B82F6",
    sample:
      "🔮 Szenario-Planung\nMögliche Zukunftsszenarien basierend auf aktuellen Trendmustern und Entwicklungen.",
  },
];


export function AIGCSidebar({ messages, isConnected, className }: AIGCSidebarProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<GeneratorConfig | null>(null);

  const handleGenerate = (config: GeneratorConfig) => {
    if (!isConnected || isGenerating) return;
    setActiveTool(config.id);
    setSelectedTool(config);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
    }, 900);
  };

  const renderToolCard = (config: GeneratorConfig) => {
    const Icon = config.icon;
    const isActive = activeTool === config.id;
    const disabled = !isConnected || isGenerating;

    return (
      <motion.button
        key={config.id}
        onClick={() => handleGenerate(config)}
        disabled={disabled}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border-[3px] p-4 text-left transition-all",
          "bg-white hover:bg-neutral-off-white",
          isActive ? "border-neutral-accent-primary shadow-wine-sm" : "border-neutral-accent-primary",
          disabled && "cursor-not-allowed opacity-60",
        )}
        whileHover={disabled ? undefined : { y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${config.accent}20`, color: config.accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="desktop:text-[18px] text-[17px] font-semibold text-neutral-text-primary">{config.label}</p>
            <p className="desktop:text-[15px] text-[14px] text-neutral-text-secondary">{config.description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-text-muted transition-transform group-hover:translate-x-1" />
        </div>
      </motion.button>
    );
  };

  return (
    <div className={cn("flex h-full flex-col overflow-hidden overflow-x-hidden bg-neutral-off-white text-neutral-text-primary max-w-full", className)} style={{ boxSizing: 'border-box' }}>
      <header className="border-b border-neutral-accent-primary px-6 py-6 max-w-full bg-white" style={{ boxSizing: 'border-box' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-accent-primary/20">
            <Sparkles className="h-5 w-5 text-neutral-accent-primary" />
          </div>
          <div>
            <p className="desktop:text-[22px] text-[20px] font-semibold text-neutral-text-primary">K.I.-Studio</p>
            <p className="desktop:text-[16px] text-[15px] text-neutral-text-secondary">Generiere Inhalte aus deinem Gespräch</p>
          </div>
        </div>
      </header>

      {!isConnected ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-light">
            <Brain className="h-8 w-8 text-neutral-text-muted" />
          </div>
          <div>
            <p className="desktop:text-[18px] text-[17px] font-semibold text-neutral-text-primary">Verbinden, um Inhalte zu generieren</p>
            <p className="desktop:text-[15px] text-[14px] text-neutral-text-secondary">Das KI-Studio wird aktiviert, sobald deine Sitzung beginnt.</p>
          </div>
        </div>
      ) : selectedTool ? (
        <div className="flex h-full flex-col">
          <div className="border-b border-neutral-accent-primary px-6 py-4 bg-white">
            <button
              onClick={() => setSelectedTool(null)}
              className="flex items-center gap-2 desktop:text-[15px] text-[14px] font-semibold uppercase tracking-wider text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Zurück zu Tools
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${selectedTool.accent}20`, color: selectedTool.accent }}
                >
                  <selectedTool.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="desktop:text-[22px] text-[20px] font-semibold text-neutral-text-primary">{selectedTool.label}</h3>
                  <p className="desktop:text-[16px] text-[15px] text-neutral-text-secondary">{selectedTool.description}</p>
                </div>
              </div>
              <div className="rounded-xl bg-neutral-light border-[3px] border-neutral-accent-primary p-4">
                <p className="desktop:text-[15px] text-[14px] font-semibold uppercase tracking-wider text-neutral-text-muted mb-2">Beispielausgabe</p>
                <p className="desktop:text-[16px] text-[15px] text-neutral-text-primary whitespace-pre-line">{selectedTool.sample}</p>
              </div>
              <div className="space-y-2 desktop:text-[16px] text-[15px] text-neutral-text-secondary">
                <p className="font-semibold text-neutral-text-primary">So funktioniert es:</p>
                <p>Dieses Tool analysiert dein Gespräch und generiert {selectedTool.label.toLowerCase()} basierend auf dem Kontext und den besprochenen Inhalten.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-accent-primary p-6 bg-white">
            <button
              onClick={() => setSelectedTool(null)}
              className="w-full rounded-lg bg-white border-[3px] border-neutral-accent-primary py-3 desktop:text-[18px] text-[17px] font-semibold text-neutral-accent-primary hover:bg-neutral-accent-primary hover:text-white transition-colors"
            >
              {selectedTool.label} generieren
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="border-b border-neutral-accent-primary px-6 py-4 bg-white">
            <p className="desktop:text-[15px] text-[14px] font-semibold uppercase tracking-wider text-neutral-text-muted">Inhaltstyp wählen</p>
          </div>
          <ScrollArea className="flex-1 overflow-y-auto px-4 bg-neutral-off-white">
            <div className="space-y-2 py-4">
              {CONTENT_TOOLS.map(renderToolCard)}
            </div>
          </ScrollArea>
          <div className="border-t border-neutral-accent-primary px-6 py-4 bg-neutral-light flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <p className="desktop:text-[15px] text-[14px] text-neutral-text-secondary">Powered by</p>
              <img
                src="/uare-logo-negative.png"
                alt="Uare.AI"
                className="h-5 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
