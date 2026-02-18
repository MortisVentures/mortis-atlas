"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  InfoCircledIcon,
  MagnifyingGlassIcon,
  RocketIcon,
  GlobeIcon,
  BarChartIcon,
  TargetIcon,
  FileTextIcon,
  CheckCircledIcon,
  PersonIcon,
  LightningBoltIcon,
  CubeIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateICMemo, type CreateICMemoData } from "@/hooks/use-ic-memos";
import {
  FOCUS_AREA_OPTIONS,
  STAGE_OPTIONS,
  SCORE_RATING_CONFIG,
  RECOMMENDATION_CONFIG,
} from "@/lib/validations/ic-memo";
import { ScoreRating, ICMemoRecommendation } from "@prisma/client";
import type { ICMemoContent } from "@/lib/validations/ic-memo";

// =============================================================================
// TYPES
// =============================================================================

interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  completed: boolean;
}

interface CompanyOption {
  id: string;
  name: string;
  sector: string | null;
}

interface RiskItem {
  category: string;
  description: string;
  mitigation: string;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ReturnToTop() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-24 right-6 z-50",
        "flex items-center gap-2 px-4 py-3",
        "bg-navy-600 text-white rounded-atlas-md",
        "shadow-lg shadow-navy-500/30",
        "transition-all duration-300",
        "hover:bg-navy-500 hover:shadow-xl hover:shadow-navy-500/40",
        "hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2"
      )}
      aria-label="Return to top"
    >
      <ChevronUpIcon className="size-5" />
      <span className="text-sm font-medium">Back to Top</span>
    </button>
  );
}

function FormSectionNav({
  sections,
  activeSection,
  onSectionClick,
}: {
  sections: FormSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}) {
  return (
    <Card variant="raised" className="sticky top-4">
      <CardHeader withBorder>
        <CardTitle size="md">Sections</CardTitle>
      </CardHeader>
      <CardContent padding="sm">
        <nav className="space-y-1">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-atlas-sm text-left transition-colors",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                  section.completed
                    ? "bg-tactical-500 text-white"
                    : activeSection === section.id
                    ? "bg-white/20"
                    : "bg-muted"
                )}
              >
                {section.completed ? <CheckIcon className="size-3" /> : index + 1}
              </span>
              <span className="text-sm font-medium truncate">{section.title}</span>
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  hint,
  required,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 bg-muted/30 border border-border rounded-atlas-sm text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {hint && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <InfoCircledIcon className="size-3" />
          {hint}
        </p>
      )}
    </div>
  );
}

function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  required,
  min,
  max,
  step,
}: {
  label: string;
  type?: "text" | "number" | "url";
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-full p-3 bg-muted/30 border border-border rounded-atlas-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
            prefix && "pl-8",
            suffix && "pr-12"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <InfoCircledIcon className="size-3" />
          {hint}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-muted/30 border border-border rounded-atlas-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">{placeholder || "Select..."}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreSelector({
  label,
  value,
  onChange,
  hint,
  allowAdequate = false,
}: {
  label: string;
  value: ScoreRating | null;
  onChange: (value: ScoreRating | null) => void;
  hint?: string;
  allowAdequate?: boolean;
}) {
  const options = allowAdequate
    ? Object.entries(SCORE_RATING_CONFIG)
    : Object.entries(SCORE_RATING_CONFIG).filter(([key]) => key !== "ADEQUATE");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        {options.map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(value === key ? null : (key as ScoreRating))}
            className={cn(
              "px-4 py-2 rounded-atlas-sm text-sm font-medium transition-colors",
              value === key ? config.color : "bg-muted/30 hover:bg-muted"
            )}
          >
            {config.label}
          </button>
        ))}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <InfoCircledIcon className="size-3" />
          {hint}
        </p>
      )}
    </div>
  );
}

function RatingSlider({
  label,
  value,
  onChange,
  max = 5,
  hint,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  max?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm font-bold text-primary">{value || "-"} / {max}</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(value === num ? null : num)}
            className={cn(
              "w-10 h-10 rounded-atlas-sm text-sm font-medium transition-colors",
              value === num
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 hover:bg-muted"
            )}
          >
            {num}
          </button>
        ))}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <InfoCircledIcon className="size-3" />
          {hint}
        </p>
      )}
    </div>
  );
}

function CompanySelector({
  selectedCompany,
  onSelect,
  companies,
  isLoading,
}: {
  selectedCompany: CompanyOption | null;
  onSelect: (company: CompanyOption) => void;
  companies: CompanyOption[];
  isLoading: boolean;
}) {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.sector && c.sector.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Select Company<span className="text-red-400 ml-1">*</span>
      </label>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full p-3 bg-muted/30 border border-border rounded-atlas-sm cursor-pointer flex items-center justify-between",
            isOpen && "ring-2 ring-primary/50"
          )}
        >
          {selectedCompany ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-atlas-sm bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white text-xs font-bold">
                {selectedCompany.name[0]}
              </div>
              <div>
                <div className="font-medium text-sm">{selectedCompany.name}</div>
                <div className="text-xs text-muted-foreground">{selectedCompany.sector || "No sector"}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">
              {isLoading ? "Loading companies..." : "Choose a company..."}
            </span>
          )}
          <ChevronDownIcon className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-atlas-sm shadow-lg">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-atlas-sm text-sm"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    onSelect(company);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-atlas-sm hover:bg-muted text-left",
                    selectedCompany?.id === company.id && "bg-muted"
                  )}
                >
                  <div className="w-8 h-8 rounded-atlas-sm bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-white text-xs font-bold">
                    {company.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{company.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {company.sector || "No sector"}
                    </div>
                  </div>
                </button>
              ))}
              {filteredCompanies.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">No companies found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskRow({
  risk,
  onUpdate,
  onRemove,
}: {
  risk: RiskItem;
  onUpdate: (field: keyof RiskItem, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 border border-border rounded-atlas-sm space-y-3">
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={risk.category}
          onChange={(e) => onUpdate("category", e.target.value)}
          placeholder="Risk Category (e.g., Technical, Market, Team)"
          className="flex-1 p-2 bg-muted/30 border border-border rounded-atlas-sm text-sm"
        />
        <button onClick={onRemove} className="ml-3 p-2 text-red-400 hover:bg-red-500/10 rounded">
          <TrashIcon className="size-4" />
        </button>
      </div>
      <textarea
        value={risk.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        placeholder="Describe the risk..."
        rows={2}
        className="w-full p-2 bg-muted/30 border border-border rounded-atlas-sm text-sm resize-none"
      />
      <textarea
        value={risk.mitigation}
        onChange={(e) => onUpdate("mitigation", e.target.value)}
        placeholder="Mitigation strategy..."
        rows={2}
        className="w-full p-2 bg-muted/30 border border-border rounded-atlas-sm text-sm resize-none"
      />
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function NewICMemoPage() {
  const router = useRouter();
  const { createMemo, submitMemo, isCreating, isSubmitting, error } = useCreateICMemo();

  const [activeSection, setActiveSection] = React.useState("company");
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyOption | null>(null);
  const [companies, setCompanies] = React.useState<CompanyOption[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = React.useState(true);

  // Form state - Header & Thesis
  const [title, setTitle] = React.useState("");
  const [stage, setStage] = React.useState("");
  const [focusArea, setFocusArea] = React.useState("");
  const [memoRecommendation, setMemoRecommendation] = React.useState<ICMemoRecommendation | null>(null);
  const [decisionRationale, setDecisionRationale] = React.useState("");

  // Financial Terms - Ask
  const [askAmount, setAskAmount] = React.useState("");
  const [askValuation, setAskValuation] = React.useState("");

  // Financial Terms - Proposed
  const [preMoneyValuation, setPreMoneyValuation] = React.useState("");
  const [postMoneyValuation, setPostMoneyValuation] = React.useState("");
  const [roundSize, setRoundSize] = React.useState("");
  const [mortisInvestment, setMortisInvestment] = React.useState("");
  const [mortisOwnership, setMortisOwnership] = React.useState("");
  const [followOnReserve, setFollowOnReserve] = React.useState("");

  // Projections
  const [projectedExitYears, setProjectedExitYears] = React.useState("");
  const [targetExitLow, setTargetExitLow] = React.useState("");
  const [targetExitHigh, setTargetExitHigh] = React.useState("");
  const [projectedMoicLow, setProjectedMoicLow] = React.useState("");
  const [projectedMoicHigh, setProjectedMoicHigh] = React.useState("");

  // Scores
  const [tripleUseScore, setTripleUseScore] = React.useState<ScoreRating | null>(null);
  const [wlcdiaScore, setWlcdiaScore] = React.useState<ScoreRating | null>(null);
  const [expectedCostDecline, setExpectedCostDecline] = React.useState("");
  const [teamScore, setTeamScore] = React.useState<ScoreRating | null>(null);
  const [founderTechRating, setFounderTechRating] = React.useState<number | null>(null);
  const [founderBusinessRating, setFounderBusinessRating] = React.useState<number | null>(null);
  const [founderDesignRating, setFounderDesignRating] = React.useState<number | null>(null);
  const [marketScore, setMarketScore] = React.useState<ScoreRating | null>(null);
  const [capitalEfficiencyScore, setCapitalEfficiencyScore] = React.useState<ScoreRating | null>(null);

  // Market Sizing
  const [tam, setTam] = React.useState("");
  const [sam, setSam] = React.useState("");
  const [som, setSom] = React.useState("");

  // Capital Metrics
  const [trlStage, setTrlStage] = React.useState("");
  const [monthlyBurn, setMonthlyBurn] = React.useState("");
  const [runwayMonths, setRunwayMonths] = React.useState("");

  // Content (JSON)
  const [content, setContent] = React.useState<ICMemoContent>({
    // Triple-Use
    defenseApplication: "",
    commercialApplication: "",
    spaceApplication: "",
    tripleUseJustification: "",
    // WLCDIA
    scaleAnalysis: "",
    demandAnalysis: "",
    supplyChainAnalysis: "",
    // Team (GWC)
    founderName: "",
    founderBackground: "",
    founderTechEvidence: "",
    founderBusinessEvidence: "",
    founderDesignEvidence: "",
    gwcGetIt: "",
    gwcWantIt: "",
    gwcCapacity: "",
    teamSize: undefined,
    keyHiresAssessment: "",
    // Market
    marketUnderstanding: "",
    directCompetitors: "",
    adjacentPlayers: "",
    unfairAdvantage: "",
    metricsAlignment: "",
    // Capital Efficiency
    milestones: [],
    futureFinancing: [],
    contingencyPlanning: "",
    // Risks
    keyRisks: [],
    // Thesis
    strategicValue: "",
    portfolioSynergies: "",
    // Committee
    nextSteps: "",
  });

  // Load companies on mount
  React.useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/companies?limit=100");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    loadCompanies();
  }, []);

  const updateContent = (field: keyof ICMemoContent, value: ICMemoContent[keyof ICMemoContent]) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const addRisk = () => {
    updateContent("keyRisks", [...(content.keyRisks || []), { category: "", description: "", mitigation: "" }]);
  };

  const updateRisk = (index: number, field: keyof RiskItem, value: string) => {
    const risks = [...(content.keyRisks || [])];
    risks[index] = { ...risks[index], [field]: value };
    updateContent("keyRisks", risks);
  };

  const removeRisk = (index: number) => {
    updateContent("keyRisks", (content.keyRisks || []).filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    updateContent("milestones", [...(content.milestones || []), { description: "" }]);
  };

  const updateMilestone = (index: number, value: string) => {
    const milestones = [...(content.milestones || [])];
    milestones[index] = { description: value };
    updateContent("milestones", milestones);
  };

  const removeMilestone = (index: number) => {
    updateContent("milestones", (content.milestones || []).filter((_, i) => i !== index));
  };

  const sections: FormSection[] = [
    { id: "company", title: "Company & Header", icon: <GlobeIcon />, description: "Company and deal info", completed: !!selectedCompany && !!title },
    { id: "triple-use", title: "Triple-Use Analysis", icon: <RocketIcon />, description: "Defense, Commercial, Space", completed: !!tripleUseScore },
    { id: "wlcdia", title: "WLCDIA", icon: <LightningBoltIcon />, description: "Wright's Law analysis", completed: !!wlcdiaScore },
    { id: "team", title: "Team Assessment", icon: <PersonIcon />, description: "Founder & team GWC", completed: !!teamScore },
    { id: "market", title: "Market Analysis", icon: <BarChartIcon />, description: "TAM/SAM/SOM & competition", completed: !!marketScore },
    { id: "capital", title: "Capital Efficiency", icon: <CubeIcon />, description: "TRL, burn, milestones", completed: !!capitalEfficiencyScore },
    { id: "financials", title: "Financial Terms", icon: <TargetIcon />, description: "Ask, terms, projections", completed: !!mortisInvestment },
    { id: "risks", title: "Key Risks", icon: <FileTextIcon />, description: "Risks & mitigations", completed: (content.keyRisks?.length || 0) > 0 },
    { id: "recommendation", title: "Recommendation", icon: <CheckCircledIcon />, description: "Final recommendation", completed: !!memoRecommendation },
  ];

  const buildFormData = (): CreateICMemoData => ({
    title,
    companyId: selectedCompany?.id || "",
    focusArea: focusArea || null,
    stage: stage || null,
    tripleUseScore,
    wlcdiaScore,
    expectedCostDecline: expectedCostDecline ? parseFloat(expectedCostDecline) : null,
    teamScore,
    founderTechRating,
    founderBusinessRating,
    founderDesignRating,
    marketScore,
    capitalEfficiencyScore,
    tam: tam ? parseFloat(tam) * 1e9 : null,
    sam: sam ? parseFloat(sam) * 1e9 : null,
    som: som ? parseFloat(som) * 1e6 : null,
    trlStage: trlStage ? parseInt(trlStage) : null,
    monthlyBurn: monthlyBurn ? parseFloat(monthlyBurn) * 1e3 : null,
    runwayMonths: runwayMonths ? parseInt(runwayMonths) : null,
    askAmount: askAmount ? parseFloat(askAmount) * 1e6 : null,
    askValuation: askValuation ? parseFloat(askValuation) * 1e6 : null,
    preMoneyValuation: preMoneyValuation ? parseFloat(preMoneyValuation) * 1e6 : null,
    postMoneyValuation: postMoneyValuation ? parseFloat(postMoneyValuation) * 1e6 : null,
    roundSize: roundSize ? parseFloat(roundSize) * 1e6 : null,
    mortisInvestment: mortisInvestment ? parseFloat(mortisInvestment) * 1e6 : null,
    mortisOwnership: mortisOwnership ? parseFloat(mortisOwnership) / 100 : null,
    followOnReserve: followOnReserve ? parseFloat(followOnReserve) * 1e6 : null,
    projectedExitYears: projectedExitYears ? parseInt(projectedExitYears) : null,
    targetExitLow: targetExitLow ? parseFloat(targetExitLow) * 1e6 : null,
    targetExitHigh: targetExitHigh ? parseFloat(targetExitHigh) * 1e6 : null,
    projectedMoicLow: projectedMoicLow ? parseFloat(projectedMoicLow) : null,
    projectedMoicHigh: projectedMoicHigh ? parseFloat(projectedMoicHigh) : null,
    memoRecommendation,
    decisionRationale: decisionRationale || null,
    content,
  });

  const handleSaveDraft = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    const result = await createMemo(buildFormData());
    if (result) {
      toast.success("Draft saved successfully");
      router.push(`/ic-memos/${result.id}`);
    } else {
      toast.error(error || "Failed to save draft");
    }
  };

  const handleSubmitForVote = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }
    if (!title) {
      toast.error("Please enter a title");
      return;
    }
    if (!memoRecommendation) {
      toast.error("Please select a recommendation");
      return;
    }

    const result = await createMemo(buildFormData());
    if (result) {
      const submitted = await submitMemo(result.id);
      if (submitted) {
        toast.success("Memo submitted for IC vote");
        router.push("/ic-memos");
      } else {
        toast.error("Failed to submit memo");
      }
    } else {
      toast.error(error || "Failed to save memo");
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHeader
          title="Create IC Memo"
          description="Mortis Ventures Investment Committee Memo"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "IC Memos", href: "/ic-memos" },
            { label: "New Memo" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <FormSectionNav
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Company & Header */}
            <Card variant="raised" id="company">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Company & Header</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <CompanySelector
                  selectedCompany={selectedCompany}
                  onSelect={setSelectedCompany}
                  companies={companies}
                  isLoading={isLoadingCompanies}
                />
                <FormField
                  label="Memo Title"
                  placeholder="e.g., Series A Investment - Stellar Dynamics"
                  value={title}
                  onChange={setTitle}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Stage"
                    value={stage}
                    onChange={setStage}
                    options={STAGE_OPTIONS.map((s) => ({ value: s, label: s }))}
                    placeholder="Select stage..."
                  />
                  <SelectField
                    label="Focus Area"
                    value={focusArea}
                    onChange={setFocusArea}
                    options={FOCUS_AREA_OPTIONS.map((f) => ({ value: f, label: f }))}
                    placeholder="Select focus area..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Triple-Use Analysis */}
            <Card variant="raised" id="triple-use">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <RocketIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Triple-Use Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <ScoreSelector
                  label="Triple-Use Score"
                  value={tripleUseScore}
                  onChange={setTripleUseScore}
                  hint="How applicable is the technology across defense, commercial, and space?"
                />
                <TextArea
                  label="Defense Application"
                  placeholder="How can this technology serve defense applications?"
                  value={content.defenseApplication || ""}
                  onChange={(v) => updateContent("defenseApplication", v)}
                />
                <TextArea
                  label="Commercial Application"
                  placeholder="Commercial use cases and market opportunity"
                  value={content.commercialApplication || ""}
                  onChange={(v) => updateContent("commercialApplication", v)}
                />
                <TextArea
                  label="Space Application"
                  placeholder="Space industry applications"
                  value={content.spaceApplication || ""}
                  onChange={(v) => updateContent("spaceApplication", v)}
                />
                <TextArea
                  label="Triple-Use Justification"
                  placeholder="Overall rationale for triple-use assessment"
                  value={content.tripleUseJustification || ""}
                  onChange={(v) => updateContent("tripleUseJustification", v)}
                />
              </CardContent>
            </Card>

            {/* WLCDIA */}
            <Card variant="raised" id="wlcdia">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <LightningBoltIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">WLCDIA (Wright&apos;s Law Cost Decline)</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ScoreSelector
                    label="WLCDIA Score"
                    value={wlcdiaScore}
                    onChange={setWlcdiaScore}
                    hint="Cost decline potential with scale"
                  />
                  <FormField
                    label="Expected Cost Decline"
                    type="number"
                    placeholder="20"
                    value={expectedCostDecline}
                    onChange={setExpectedCostDecline}
                    suffix="% per doubling"
                    hint="Wright's Law: % cost reduction per doubling of cumulative production"
                  />
                </div>
                <TextArea
                  label="Scale Analysis"
                  placeholder="How does cost scale with production volume?"
                  value={content.scaleAnalysis || ""}
                  onChange={(v) => updateContent("scaleAnalysis", v)}
                />
                <TextArea
                  label="Demand Analysis"
                  placeholder="What drives demand growth?"
                  value={content.demandAnalysis || ""}
                  onChange={(v) => updateContent("demandAnalysis", v)}
                />
                <TextArea
                  label="Supply Chain Analysis"
                  placeholder="Supply chain considerations and risks"
                  value={content.supplyChainAnalysis || ""}
                  onChange={(v) => updateContent("supplyChainAnalysis", v)}
                />
              </CardContent>
            </Card>

            {/* Team Assessment */}
            <Card variant="raised" id="team">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <PersonIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Team Assessment (GWC)</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <ScoreSelector
                  label="Team Score"
                  value={teamScore}
                  onChange={setTeamScore}
                  allowAdequate
                  hint="Overall team assessment"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Founder Name(s)"
                    placeholder="John Doe, Jane Smith"
                    value={content.founderName || ""}
                    onChange={(v) => updateContent("founderName", v)}
                  />
                  <FormField
                    label="Team Size"
                    type="number"
                    placeholder="12"
                    value={content.teamSize?.toString() || ""}
                    onChange={(v) => updateContent("teamSize", v ? parseInt(v) : undefined)}
                  />
                </div>
                <TextArea
                  label="Founder Background"
                  placeholder="Relevant experience and track record"
                  value={content.founderBackground || ""}
                  onChange={(v) => updateContent("founderBackground", v)}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <RatingSlider
                    label="Technical Capability"
                    value={founderTechRating}
                    onChange={setFounderTechRating}
                    hint="Technical depth & execution"
                  />
                  <RatingSlider
                    label="Business Acumen"
                    value={founderBusinessRating}
                    onChange={setFounderBusinessRating}
                    hint="GTM & commercial skills"
                  />
                  <RatingSlider
                    label="Design/Product"
                    value={founderDesignRating}
                    onChange={setFounderDesignRating}
                    hint="Product vision & UX"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextArea
                    label="Get It (GWC)"
                    placeholder="Do they understand the problem deeply?"
                    value={content.gwcGetIt || ""}
                    onChange={(v) => updateContent("gwcGetIt", v)}
                    rows={3}
                  />
                  <TextArea
                    label="Want It (GWC)"
                    placeholder="Is the drive and passion evident?"
                    value={content.gwcWantIt || ""}
                    onChange={(v) => updateContent("gwcWantIt", v)}
                    rows={3}
                  />
                  <TextArea
                    label="Capacity (GWC)"
                    placeholder="Do they have the capacity to execute?"
                    value={content.gwcCapacity || ""}
                    onChange={(v) => updateContent("gwcCapacity", v)}
                    rows={3}
                  />
                </div>
                <TextArea
                  label="Key Hires Assessment"
                  placeholder="Critical hires needed and plan to fill gaps"
                  value={content.keyHiresAssessment || ""}
                  onChange={(v) => updateContent("keyHiresAssessment", v)}
                />
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card variant="raised" id="market">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <BarChartIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Market Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <ScoreSelector
                  label="Market Score"
                  value={marketScore}
                  onChange={setMarketScore}
                  hint="Market opportunity assessment"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="TAM"
                    type="number"
                    placeholder="50"
                    value={tam}
                    onChange={setTam}
                    prefix="$"
                    suffix="B"
                    hint="Total Addressable Market"
                  />
                  <FormField
                    label="SAM"
                    type="number"
                    placeholder="8"
                    value={sam}
                    onChange={setSam}
                    prefix="$"
                    suffix="B"
                    hint="Serviceable Addressable Market"
                  />
                  <FormField
                    label="SOM"
                    type="number"
                    placeholder="800"
                    value={som}
                    onChange={setSom}
                    prefix="$"
                    suffix="M"
                    hint="Serviceable Obtainable Market"
                  />
                </div>
                <TextArea
                  label="Market Understanding"
                  placeholder="Key market dynamics and trends"
                  value={content.marketUnderstanding || ""}
                  onChange={(v) => updateContent("marketUnderstanding", v)}
                />
                <TextArea
                  label="Direct Competitors"
                  placeholder="Primary competitors and positioning"
                  value={content.directCompetitors || ""}
                  onChange={(v) => updateContent("directCompetitors", v)}
                />
                <TextArea
                  label="Adjacent Players"
                  placeholder="Companies in adjacent markets"
                  value={content.adjacentPlayers || ""}
                  onChange={(v) => updateContent("adjacentPlayers", v)}
                />
                <TextArea
                  label="Unfair Advantage"
                  placeholder="Moat and competitive advantages"
                  value={content.unfairAdvantage || ""}
                  onChange={(v) => updateContent("unfairAdvantage", v)}
                />
              </CardContent>
            </Card>

            {/* Capital Efficiency */}
            <Card variant="raised" id="capital">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <CubeIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Capital Efficiency</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <ScoreSelector
                  label="Capital Efficiency Score"
                  value={capitalEfficiencyScore}
                  onChange={setCapitalEfficiencyScore}
                  hint="How efficiently is capital deployed?"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="TRL Stage"
                    type="number"
                    placeholder="5"
                    value={trlStage}
                    onChange={setTrlStage}
                    min={1}
                    max={9}
                    hint="Technology Readiness Level (1-9)"
                  />
                  <FormField
                    label="Monthly Burn"
                    type="number"
                    placeholder="250"
                    value={monthlyBurn}
                    onChange={setMonthlyBurn}
                    prefix="$"
                    suffix="K"
                    hint="Current monthly burn rate"
                  />
                  <FormField
                    label="Runway (Post-Financing)"
                    type="number"
                    placeholder="24"
                    value={runwayMonths}
                    onChange={setRunwayMonths}
                    suffix="months"
                    hint="Expected runway after this round"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Key Milestones</label>
                    <Button variant="outline" size="sm" onClick={addMilestone}>
                      <PlusIcon className="size-4 mr-1" />
                      Add Milestone
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(content.milestones || []).map((m, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={m.description}
                          onChange={(e) => updateMilestone(index, e.target.value)}
                          placeholder="Milestone description"
                          className="flex-1 p-2 bg-muted/30 border border-border rounded-atlas-sm text-sm"
                        />
                        <button
                          onClick={() => removeMilestone(index)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <TextArea
                  label="Contingency Planning"
                  placeholder="What happens if milestones are missed?"
                  value={content.contingencyPlanning || ""}
                  onChange={(v) => updateContent("contingencyPlanning", v)}
                />
              </CardContent>
            </Card>

            {/* Financial Terms */}
            <Card variant="raised" id="financials">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <TargetIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Financial Terms & Projections</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-atlas-sm">
                  <h4 className="text-sm font-medium mb-4">Company Ask</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Ask Amount"
                      type="number"
                      placeholder="5"
                      value={askAmount}
                      onChange={setAskAmount}
                      prefix="$"
                      suffix="M"
                    />
                    <FormField
                      label="Ask Valuation (Post-Money)"
                      type="number"
                      placeholder="50"
                      value={askValuation}
                      onChange={setAskValuation}
                      prefix="$"
                      suffix="M"
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-atlas-sm">
                  <h4 className="text-sm font-medium mb-4">Mortis Proposed Terms</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Pre-Money Valuation"
                      type="number"
                      placeholder="45"
                      value={preMoneyValuation}
                      onChange={setPreMoneyValuation}
                      prefix="$"
                      suffix="M"
                    />
                    <FormField
                      label="Round Size"
                      type="number"
                      placeholder="5"
                      value={roundSize}
                      onChange={setRoundSize}
                      prefix="$"
                      suffix="M"
                    />
                    <FormField
                      label="Post-Money Valuation"
                      type="number"
                      placeholder="50"
                      value={postMoneyValuation}
                      onChange={setPostMoneyValuation}
                      prefix="$"
                      suffix="M"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormField
                      label="Mortis Investment"
                      type="number"
                      placeholder="2"
                      value={mortisInvestment}
                      onChange={setMortisInvestment}
                      prefix="$"
                      suffix="M"
                      required
                    />
                    <FormField
                      label="Mortis Ownership"
                      type="number"
                      placeholder="10"
                      value={mortisOwnership}
                      onChange={setMortisOwnership}
                      suffix="%"
                    />
                    <FormField
                      label="Follow-on Reserve"
                      type="number"
                      placeholder="4"
                      value={followOnReserve}
                      onChange={setFollowOnReserve}
                      prefix="$"
                      suffix="M"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-atlas-sm">
                  <h4 className="text-sm font-medium mb-4">Exit Projections</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <FormField
                      label="Exit Timeline"
                      type="number"
                      placeholder="7"
                      value={projectedExitYears}
                      onChange={setProjectedExitYears}
                      suffix="years"
                    />
                    <FormField
                      label="Exit Value (Low)"
                      type="number"
                      placeholder="500"
                      value={targetExitLow}
                      onChange={setTargetExitLow}
                      prefix="$"
                      suffix="M"
                    />
                    <FormField
                      label="Exit Value (High)"
                      type="number"
                      placeholder="2000"
                      value={targetExitHigh}
                      onChange={setTargetExitHigh}
                      prefix="$"
                      suffix="M"
                    />
                    <FormField
                      label="MOIC (Low)"
                      type="number"
                      placeholder="5"
                      value={projectedMoicLow}
                      onChange={setProjectedMoicLow}
                      suffix="x"
                      step={0.1}
                    />
                    <FormField
                      label="MOIC (High)"
                      type="number"
                      placeholder="20"
                      value={projectedMoicHigh}
                      onChange={setProjectedMoicHigh}
                      suffix="x"
                      step={0.1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Risks */}
            <Card variant="raised" id="risks">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Key Risks</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Identify key risks and mitigation strategies
                  </p>
                  <Button variant="outline" size="sm" onClick={addRisk}>
                    <PlusIcon className="size-4 mr-1" />
                    Add Risk
                  </Button>
                </div>
                <div className="space-y-4">
                  {(content.keyRisks || []).map((risk, index) => (
                    <RiskRow
                      key={index}
                      risk={risk}
                      onUpdate={(field, value) => updateRisk(index, field, value)}
                      onRemove={() => removeRisk(index)}
                    />
                  ))}
                  {(content.keyRisks?.length || 0) === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-atlas-sm">
                      No risks added yet. Click &quot;Add Risk&quot; to add key risks.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card variant="raised" id="recommendation">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <CheckCircledIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Recommendation</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Recommendation<span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="flex gap-3">
                    {Object.entries(RECOMMENDATION_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMemoRecommendation(
                          memoRecommendation === key ? null : (key as ICMemoRecommendation)
                        )}
                        className={cn(
                          "px-6 py-3 rounded-atlas-sm text-sm font-medium transition-colors",
                          memoRecommendation === key ? config.color : "bg-muted/30 hover:bg-muted"
                        )}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
                <TextArea
                  label="Decision Rationale"
                  placeholder="1-2 sentence summary of why we should invest, pass, or revisit"
                  value={decisionRationale}
                  onChange={setDecisionRationale}
                  rows={3}
                  hint="Concise summary for quick reference"
                />
                <TextArea
                  label="Strategic Value"
                  placeholder="How does this fit our thesis and portfolio strategy?"
                  value={content.strategicValue || ""}
                  onChange={(v) => updateContent("strategicValue", v)}
                />
                <TextArea
                  label="Portfolio Synergies"
                  placeholder="Synergies with existing portfolio companies"
                  value={content.portfolioSynergies || ""}
                  onChange={(v) => updateContent("portfolioSynergies", v)}
                />
                <TextArea
                  label="Next Steps"
                  placeholder="What happens after IC vote?"
                  value={content.nextSteps || ""}
                  onChange={(v) => updateContent("nextSteps", v)}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-atlas-md sticky bottom-4">
              <div className="text-sm text-muted-foreground">
                {sections.filter((s) => s.completed).length} of {sections.length} sections completed
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isCreating || isSubmitting}
                >
                  {isCreating ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={handleSubmitForVote}
                  disabled={isCreating || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit for IC Vote"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Return to Top Button */}
        <ReturnToTop />
    </>
  );
}
