"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
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
} from "@radix-ui/react-icons";
import { toast } from "sonner";

import { DashboardLayout, DashboardContent, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  sector: string;
  stage: string;
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleCompanies: CompanyOption[] = [
  { id: "c1", name: "TechFlow AI", sector: "AI/ML", stage: "Series A" },
  { id: "c2", name: "CloudScale", sector: "Infrastructure", stage: "Seed" },
  { id: "c3", name: "BioGenix", sector: "HealthTech", stage: "Series B" },
  { id: "c4", name: "FinanceHub", sector: "FinTech", stage: "Pre-Seed" },
  { id: "c5", name: "DataStream", sector: "Data/Analytics", stage: "Series A" },
];

const memoTemplates = [
  { id: "standard", name: "Standard IC Memo", description: "Full memo with all sections" },
  { id: "quick", name: "Quick Assessment", description: "Abbreviated format for initial review" },
  { id: "followon", name: "Follow-on Investment", description: "For existing portfolio companies" },
];

// =============================================================================
// COMPONENTS
// =============================================================================

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

function CompanySelector({
  selectedCompany,
  onSelect,
}: {
  selectedCompany: CompanyOption | null;
  onSelect: (company: CompanyOption) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredCompanies = sampleCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sector.toLowerCase().includes(search.toLowerCase())
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
                <div className="text-xs text-muted-foreground">{selectedCompany.sector}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Choose a company...</span>
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
                      {company.sector} • {company.stage}
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
  risk: { category: string; description: string; severity: string; mitigation: string };
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 border border-border rounded-atlas-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-3 flex-1">
          <input
            type="text"
            value={risk.category}
            onChange={(e) => onUpdate("category", e.target.value)}
            placeholder="Category (e.g., Competition)"
            className="p-2 bg-muted/30 border border-border rounded-atlas-sm text-sm"
          />
          <select
            value={risk.severity}
            onChange={(e) => onUpdate("severity", e.target.value)}
            className="p-2 bg-muted/30 border border-border rounded-atlas-sm text-sm"
          >
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
          </select>
        </div>
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
  const [activeSection, setActiveSection] = React.useState("company");
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyOption | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState("standard");

  // Form state
  const [formData, setFormData] = React.useState({
    // Thesis
    problemStatement: "",
    solutionOverview: "",
    whyNow: "",
    whyThisTeam: "",
    whyUs: "",

    // Market
    tam: "",
    sam: "",
    som: "",
    competitors: "",
    marketTrends: "",

    // Financials
    investmentAmount: "",
    preMoneyValuation: "",
    ownershipTarget: "",
    boardSeat: true,
    proRata: true,

    // Due Diligence
    technicalSummary: "",
    legalSummary: "",
    referencesSummary: "",
    risks: [{ category: "", description: "", severity: "medium", mitigation: "" }],

    // Recommendation
    followOnStrategy: "",
    keyTerms: "",
  });

  const updateFormData = (field: string, value: string | number | boolean | { category: string; description: string; severity: string; mitigation: string }[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRisk = () => {
    setFormData((prev) => ({
      ...prev,
      risks: [...prev.risks, { category: "", description: "", severity: "medium", mitigation: "" }],
    }));
  };

  const updateRisk = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      risks: prev.risks.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  };

  const removeRisk = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index),
    }));
  };

  const sections: FormSection[] = [
    { id: "company", title: "Company Selection", icon: <GlobeIcon />, description: "Select the company", completed: !!selectedCompany },
    { id: "thesis", title: "Investment Thesis", icon: <RocketIcon />, description: "Why we should invest", completed: !!formData.problemStatement && !!formData.solutionOverview },
    { id: "market", title: "Market Analysis", icon: <BarChartIcon />, description: "TAM/SAM/SOM and competition", completed: !!formData.tam },
    { id: "financials", title: "Financial Analysis", icon: <TargetIcon />, description: "Terms and projections", completed: !!formData.investmentAmount },
    { id: "diligence", title: "Due Diligence", icon: <FileTextIcon />, description: "DD findings and risks", completed: !!formData.technicalSummary },
    { id: "recommendation", title: "Recommendation", icon: <CheckCircledIcon />, description: "Final recommendation", completed: !!formData.followOnStrategy },
  ];

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully");
  };

  const handleSubmitForVote = () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }
    toast.success("Memo submitted for IC vote");
    router.push("/ic-memos");
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        <PageHeader
          title="Create IC Memo"
          description="Draft a new Investment Committee memo"
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
            {/* Template Selection */}
            <Card variant="raised">
              <CardHeader withBorder>
                <CardTitle size="md">Template</CardTitle>
              </CardHeader>
              <CardContent padding="lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {memoTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "p-4 border rounded-atlas-sm text-left transition-all",
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <div className="font-medium text-sm mb-1">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Company Selection */}
            <Card variant="raised" id="company">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Company Selection</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg">
                <CompanySelector selectedCompany={selectedCompany} onSelect={setSelectedCompany} />
                {selectedCompany && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-atlas-sm">
                    <p className="text-sm text-muted-foreground">
                      Company data will be auto-populated from the company record. You can edit individual fields as needed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Thesis */}
            <Card variant="raised" id="thesis">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <RocketIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Investment Thesis</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <TextArea
                  label="Problem Statement"
                  placeholder="What problem does this company solve?"
                  value={formData.problemStatement}
                  onChange={(v) => updateFormData("problemStatement", v)}
                  hint="Describe the pain point and market need"
                  required
                />
                <TextArea
                  label="Solution Overview"
                  placeholder="How does the product/service address this problem?"
                  value={formData.solutionOverview}
                  onChange={(v) => updateFormData("solutionOverview", v)}
                  required
                />
                <TextArea
                  label="Why Now?"
                  placeholder="What market trends make this the right time?"
                  value={formData.whyNow}
                  onChange={(v) => updateFormData("whyNow", v)}
                  hint="Market timing, technology enablers, regulatory changes"
                />
                <TextArea
                  label="Why This Team?"
                  placeholder="What makes the founders uniquely positioned?"
                  value={formData.whyThisTeam}
                  onChange={(v) => updateFormData("whyThisTeam", v)}
                />
                <TextArea
                  label="Why Us?"
                  placeholder="What value can we add as investors?"
                  value={formData.whyUs}
                  onChange={(v) => updateFormData("whyUs", v)}
                  hint="Network, expertise, strategic value-add"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="TAM"
                    type="number"
                    placeholder="50"
                    value={formData.tam}
                    onChange={(v) => updateFormData("tam", v)}
                    prefix="$"
                    suffix="B"
                    hint="Total Addressable Market"
                    required
                  />
                  <FormField
                    label="SAM"
                    type="number"
                    placeholder="8"
                    value={formData.sam}
                    onChange={(v) => updateFormData("sam", v)}
                    prefix="$"
                    suffix="B"
                    hint="Serviceable Addressable Market"
                  />
                  <FormField
                    label="SOM"
                    type="number"
                    placeholder="800"
                    value={formData.som}
                    onChange={(v) => updateFormData("som", v)}
                    prefix="$"
                    suffix="M"
                    hint="Serviceable Obtainable Market"
                  />
                </div>
                <TextArea
                  label="Competitive Landscape"
                  placeholder="List key competitors and their positioning..."
                  value={formData.competitors}
                  onChange={(v) => updateFormData("competitors", v)}
                  rows={5}
                />
                <TextArea
                  label="Market Trends"
                  placeholder="Key trends supporting the investment thesis..."
                  value={formData.marketTrends}
                  onChange={(v) => updateFormData("marketTrends", v)}
                />
              </CardContent>
            </Card>

            {/* Financial Analysis */}
            <Card variant="raised" id="financials">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <TargetIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Financial Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Investment Amount"
                    type="number"
                    placeholder="5"
                    value={formData.investmentAmount}
                    onChange={(v) => updateFormData("investmentAmount", v)}
                    prefix="$"
                    suffix="M"
                    required
                  />
                  <FormField
                    label="Pre-Money Valuation"
                    type="number"
                    placeholder="45"
                    value={formData.preMoneyValuation}
                    onChange={(v) => updateFormData("preMoneyValuation", v)}
                    prefix="$"
                    suffix="M"
                    required
                  />
                  <FormField
                    label="Target Ownership"
                    type="number"
                    placeholder="10"
                    value={formData.ownershipTarget}
                    onChange={(v) => updateFormData("ownershipTarget", v)}
                    suffix="%"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.boardSeat}
                      onChange={(e) => updateFormData("boardSeat", e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">Board Seat</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.proRata}
                      onChange={(e) => updateFormData("proRata", e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">Pro-Rata Rights</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Due Diligence */}
            <Card variant="raised" id="diligence">
              <CardHeader withBorder>
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-5 text-muted-foreground" />
                  <CardTitle size="md">Due Diligence Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent padding="lg" className="space-y-6">
                <TextArea
                  label="Technical DD Summary"
                  placeholder="Summary of technical due diligence findings..."
                  value={formData.technicalSummary}
                  onChange={(v) => updateFormData("technicalSummary", v)}
                />
                <TextArea
                  label="Legal DD Summary"
                  placeholder="Summary of legal due diligence findings..."
                  value={formData.legalSummary}
                  onChange={(v) => updateFormData("legalSummary", v)}
                />
                <TextArea
                  label="Reference Checks"
                  placeholder="Summary of reference check findings..."
                  value={formData.referencesSummary}
                  onChange={(v) => updateFormData("referencesSummary", v)}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Risk Assessment</label>
                    <Button variant="outline" size="sm" onClick={addRisk}>
                      <PlusIcon className="size-4 mr-1" />
                      Add Risk
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.risks.map((risk, index) => (
                      <RiskRow
                        key={index}
                        risk={risk}
                        onUpdate={(field, value) => updateRisk(index, field, value)}
                        onRemove={() => removeRisk(index)}
                      />
                    ))}
                  </div>
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
                <TextArea
                  label="Follow-on Strategy"
                  placeholder="Plan for follow-on investments..."
                  value={formData.followOnStrategy}
                  onChange={(v) => updateFormData("followOnStrategy", v)}
                />
                <TextArea
                  label="Key Terms"
                  placeholder="List key deal terms (one per line)..."
                  value={formData.keyTerms}
                  onChange={(v) => updateFormData("keyTerms", v)}
                  hint="Enter each term on a new line"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-atlas-md sticky bottom-4">
              <div className="text-sm text-muted-foreground">
                {sections.filter((s) => s.completed).length} of {sections.length} sections completed
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button onClick={handleSubmitForVote}>
                  Submit for IC Vote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
