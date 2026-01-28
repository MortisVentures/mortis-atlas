"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  EnvelopeClosedIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  PlusIcon,
  EyeOpenIcon,
  DownloadIcon,
  ArchiveIcon,
  PersonIcon,
  LockClosedIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";

// =============================================================================
// TYPES
// =============================================================================

interface LPContact {
  id: string;
  name: string;
  email: string;
  organization: string;
  commitment: number;
  type: "ANCHOR" | "STRATEGIC" | "INSTITUTIONAL" | "FAMILY_OFFICE" | "OTHER";
  isActive: boolean;
}

interface DistributionRecord {
  id: string;
  lpId: string;
  lpName: string;
  lpEmail: string;
  sentAt: string;
  openedAt?: string;
  downloadedAt?: string;
  status: "SENT" | "DELIVERED" | "OPENED" | "DOWNLOADED" | "FAILED";
}

interface ReportArchive {
  id: string;
  period: string;
  generatedAt: string;
  distributedAt?: string;
  recipientCount: number;
  status: "DRAFT" | "DISTRIBUTED";
  fileUrl?: string;
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

const SAMPLE_LPS: LPContact[] = [
  {
    id: "lp1",
    name: "John Smith",
    email: "jsmith@institutional.com",
    organization: "Institutional Partners LP",
    commitment: 25000000,
    type: "INSTITUTIONAL",
    isActive: true,
  },
  {
    id: "lp2",
    name: "Sarah Johnson",
    email: "sjohnson@familyoffice.com",
    organization: "Johnson Family Office",
    commitment: 15000000,
    type: "FAMILY_OFFICE",
    isActive: true,
  },
  {
    id: "lp3",
    name: "Michael Chen",
    email: "mchen@strategic.vc",
    organization: "Strategic Ventures",
    commitment: 30000000,
    type: "ANCHOR",
    isActive: true,
  },
  {
    id: "lp4",
    name: "Emily Davis",
    email: "edavis@pension.org",
    organization: "State Pension Fund",
    commitment: 50000000,
    type: "INSTITUTIONAL",
    isActive: true,
  },
  {
    id: "lp5",
    name: "Robert Wilson",
    email: "rwilson@endowment.edu",
    organization: "University Endowment",
    commitment: 20000000,
    type: "INSTITUTIONAL",
    isActive: true,
  },
];

const SAMPLE_DISTRIBUTION_HISTORY: DistributionRecord[] = [
  {
    id: "d1",
    lpId: "lp1",
    lpName: "John Smith",
    lpEmail: "jsmith@institutional.com",
    sentAt: "2024-10-05T14:30:00Z",
    openedAt: "2024-10-05T15:45:00Z",
    downloadedAt: "2024-10-05T15:48:00Z",
    status: "DOWNLOADED",
  },
  {
    id: "d2",
    lpId: "lp2",
    lpName: "Sarah Johnson",
    lpEmail: "sjohnson@familyoffice.com",
    sentAt: "2024-10-05T14:30:00Z",
    openedAt: "2024-10-05T18:20:00Z",
    status: "OPENED",
  },
  {
    id: "d3",
    lpId: "lp3",
    lpName: "Michael Chen",
    lpEmail: "mchen@strategic.vc",
    sentAt: "2024-10-05T14:30:00Z",
    status: "DELIVERED",
  },
];

const SAMPLE_ARCHIVES: ReportArchive[] = [
  {
    id: "r1",
    period: "Q3 2024",
    generatedAt: "2024-10-05T12:00:00Z",
    distributedAt: "2024-10-05T14:30:00Z",
    recipientCount: 5,
    status: "DISTRIBUTED",
    fileUrl: "/reports/q3-2024.pdf",
  },
  {
    id: "r2",
    period: "Q2 2024",
    generatedAt: "2024-07-08T10:00:00Z",
    distributedAt: "2024-07-08T11:00:00Z",
    recipientCount: 5,
    status: "DISTRIBUTED",
    fileUrl: "/reports/q2-2024.pdf",
  },
  {
    id: "r3",
    period: "Q1 2024",
    generatedAt: "2024-04-10T09:00:00Z",
    distributedAt: "2024-04-10T10:30:00Z",
    recipientCount: 4,
    status: "DISTRIBUTED",
    fileUrl: "/reports/q1-2024.pdf",
  },
];

// =============================================================================
// DISTRIBUTION MODAL
// =============================================================================

interface DistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportPeriod: string;
  onDistribute: (lpIds: string[], options: DistributionOptions) => void;
}

interface DistributionOptions {
  includeDataRoom: boolean;
  customMessage: string;
  scheduleTime?: string;
}

export function DistributionModal({
  isOpen,
  onClose,
  reportPeriod,
  onDistribute,
}: DistributionModalProps) {
  const [selectedLPs, setSelectedLPs] = useState<Set<string>>(new Set(SAMPLE_LPS.map(lp => lp.id)));
  const [customMessage, setCustomMessage] = useState("");
  const [includeDataRoom, setIncludeDataRoom] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const toggleLP = (lpId: string) => {
    const newSelected = new Set(selectedLPs);
    if (newSelected.has(lpId)) {
      newSelected.delete(lpId);
    } else {
      newSelected.add(lpId);
    }
    setSelectedLPs(newSelected);
  };

  const selectAll = () => {
    setSelectedLPs(new Set(SAMPLE_LPS.map(lp => lp.id)));
  };

  const selectNone = () => {
    setSelectedLPs(new Set());
  };

  const handleDistribute = async () => {
    setIsSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    onDistribute(
      Array.from(selectedLPs),
      {
        includeDataRoom,
        customMessage,
        scheduleTime: isScheduled ? scheduleTime : undefined,
      }
    );
    setIsSending(false);
    onClose();
  };

  const lpTypeConfig = {
    ANCHOR: { label: "Anchor", color: "bg-purple-500/20 text-purple-400" },
    STRATEGIC: { label: "Strategic", color: "bg-cyan-500/20 text-cyan-400" },
    INSTITUTIONAL: { label: "Institutional", color: "bg-blue-500/20 text-blue-400" },
    FAMILY_OFFICE: { label: "Family Office", color: "bg-amber-500/20 text-amber-400" },
    OTHER: { label: "Other", color: "bg-zinc-500/20 text-zinc-400" },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold">Distribute LP Report</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Send {reportPeriod} report to limited partners
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* LP Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Select Recipients</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={selectNone}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {SAMPLE_LPS.map((lp) => (
                <label
                  key={lp.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedLPs.has(lp.id)
                      ? "bg-cyan-500/10 border border-cyan-500/30"
                      : "bg-zinc-800/50 border border-transparent hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedLPs.has(lp.id)}
                      onChange={() => toggleLP(lp.id)}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <div>
                      <p className="font-medium text-sm">{lp.name}</p>
                      <p className="text-xs text-zinc-500">{lp.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={lpTypeConfig[lp.type].color} variant="outline">
                      {lpTypeConfig[lp.type].label}
                    </Badge>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {selectedLPs.size} of {SAMPLE_LPS.length} LPs selected
            </p>
          </div>

          {/* Custom Message */}
          <div>
            <h4 className="text-sm font-medium mb-2">Custom Message (Optional)</h4>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal note to accompany the report..."
              className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm resize-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Distribution Options</h4>
            <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeDataRoom}
                onChange={(e) => setIncludeDataRoom(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <p className="text-sm font-medium">Upload to Data Room</p>
                <p className="text-xs text-zinc-500">Automatically add report to LP data room</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-cyan-500 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Schedule Distribution</p>
                <p className="text-xs text-zinc-500">Send at a specific time</p>
              </div>
              {isScheduled && (
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm"
                />
              )}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-between items-center">
          <p className="text-sm text-zinc-400">
            <LockClosedIcon className="w-4 h-4 inline mr-1" />
            Report will be sent securely via encrypted email
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleDistribute}
              disabled={selectedLPs.size === 0 || isSending}
            >
              {isSending ? (
                <>
                  <UpdateIcon className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <EnvelopeClosedIcon className="w-4 h-4 mr-2" />
                  Send to {selectedLPs.size} LPs
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// DISTRIBUTION TRACKING
// =============================================================================

interface DistributionTrackingProps {
  distributions?: DistributionRecord[];
}

export function DistributionTracking({ distributions = SAMPLE_DISTRIBUTION_HISTORY }: DistributionTrackingProps) {
  const statusConfig = {
    SENT: { label: "Sent", color: "bg-blue-500/20 text-blue-400", icon: EnvelopeClosedIcon },
    DELIVERED: { label: "Delivered", color: "bg-cyan-500/20 text-cyan-400", icon: CheckCircledIcon },
    OPENED: { label: "Opened", color: "bg-amber-500/20 text-amber-400", icon: EyeOpenIcon },
    DOWNLOADED: { label: "Downloaded", color: "bg-emerald-500/20 text-emerald-400", icon: DownloadIcon },
    FAILED: { label: "Failed", color: "bg-red-500/20 text-red-400", icon: CrossCircledIcon },
  };

  // Calculate stats
  const totalSent = distributions.length;
  const opened = distributions.filter(d => d.openedAt).length;
  const downloaded = distributions.filter(d => d.downloadedAt).length;
  const openRate = totalSent > 0 ? (opened / totalSent) * 100 : 0;

  return (
    <Card variant="raised" className="p-6">
      <h3 className="font-semibold mb-4">Distribution Tracking</h3>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-2xl font-bold">{totalSent}</p>
          <p className="text-xs text-zinc-500">Sent</p>
        </div>
        <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-2xl font-bold">{opened}</p>
          <p className="text-xs text-zinc-500">Opened</p>
        </div>
        <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-2xl font-bold">{downloaded}</p>
          <p className="text-xs text-zinc-500">Downloaded</p>
        </div>
        <div className="text-center p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-2xl font-bold text-cyan-400">{openRate.toFixed(0)}%</p>
          <p className="text-xs text-zinc-500">Open Rate</p>
        </div>
      </div>

      {/* Distribution List */}
      <div className="space-y-2">
        {distributions.map((dist) => {
          const config = statusConfig[dist.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={dist.id}
              className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                  <PersonIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{dist.lpName}</p>
                  <p className="text-xs text-zinc-500">{dist.lpEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    Sent {new Date(dist.sentAt).toLocaleDateString()}
                  </p>
                  {dist.openedAt && (
                    <p className="text-xs text-zinc-500">
                      Opened {new Date(dist.openedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <Badge className={config.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// =============================================================================
// REPORT ARCHIVE
// =============================================================================

interface ReportArchiveListProps {
  archives?: ReportArchive[];
  onDownload?: (archive: ReportArchive) => void;
  onView?: (archive: ReportArchive) => void;
}

export function ReportArchiveList({
  archives = SAMPLE_ARCHIVES,
  onDownload,
  onView,
}: ReportArchiveListProps) {
  return (
    <Card variant="raised" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Report Archive</h3>
        <Badge variant="outline">{archives.length} reports</Badge>
      </div>

      <div className="space-y-3">
        {archives.map((archive) => (
          <div
            key={archive.id}
            className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                <ArchiveIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="font-medium">{archive.period}</p>
                <p className="text-xs text-zinc-500">
                  Generated {new Date(archive.generatedAt).toLocaleDateString()}
                  {archive.distributedAt && ` - Sent to ${archive.recipientCount} LPs`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={
                  archive.status === "DISTRIBUTED"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }
              >
                {archive.status === "DISTRIBUTED" ? "Distributed" : "Draft"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => onView?.(archive)}>
                <EyeOpenIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDownload?.(archive)}>
                <DownloadIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// =============================================================================
// LP MANAGEMENT
// =============================================================================

interface LPManagementProps {
  lps?: LPContact[];
  onAddLP?: () => void;
  onEditLP?: (lp: LPContact) => void;
  _onRemoveLP?: (lp: LPContact) => void;
}

export function LPManagement({
  lps = SAMPLE_LPS,
  onAddLP,
  onEditLP,
  _onRemoveLP,
}: LPManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const lpTypeConfig = {
    ANCHOR: { label: "Anchor", color: "bg-purple-500/20 text-purple-400" },
    STRATEGIC: { label: "Strategic", color: "bg-cyan-500/20 text-cyan-400" },
    INSTITUTIONAL: { label: "Institutional", color: "bg-blue-500/20 text-blue-400" },
    FAMILY_OFFICE: { label: "Family Office", color: "bg-amber-500/20 text-amber-400" },
    OTHER: { label: "Other", color: "bg-zinc-500/20 text-zinc-400" },
  };

  const filteredLPs = lps.filter(
    (lp) =>
      lp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lp.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCommitment = lps.reduce((sum, lp) => sum + lp.commitment, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card variant="raised" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">LP Directory</h3>
          <p className="text-xs text-zinc-500">
            {lps.length} LPs | Total Commitment: {formatCurrency(totalCommitment)}
          </p>
        </div>
        <Button onClick={onAddLP}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add LP
        </Button>
      </div>

      <Input
        placeholder="Search LPs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      <div className="space-y-2">
        {filteredLPs.map((lp) => (
          <div
            key={lp.id}
            className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center font-semibold">
                {lp.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{lp.name}</p>
                <p className="text-xs text-zinc-500">{lp.organization}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{formatCurrency(lp.commitment)}</p>
                <p className="text-xs text-zinc-500">committed</p>
              </div>
              <Badge className={lpTypeConfig[lp.type].color} variant="outline">
                {lpTypeConfig[lp.type].label}
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEditLP?.(lp)}>
                  <GearIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredLPs.length === 0 && (
          <div className="text-center py-8">
            <PersonIcon className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
            <p className="text-zinc-400">No LPs found</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Missing icon import
function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.07095 0.650238C6.67391 0.650238 6.32977 0.925096 6.24198 1.31231L6.0039 2.36247C5.6249 2.47269 5.26335 2.62363 4.92436 2.81013L4.01335 2.23585C3.67748 2.02413 3.23978 2.07312 2.95903 2.35386L2.35294 2.95996C2.0722 3.2407 2.0232 3.6784 2.23493 4.01427L2.80942 4.92561C2.62307 5.2645 2.47227 5.62594 2.36216 6.00481L1.31209 6.24287C0.924883 6.33065 0.650024 6.6748 0.650024 7.07183V7.92897C0.650024 8.32601 0.924883 8.67015 1.31209 8.75794L2.36228 8.99603C2.47246 9.375 2.62335 9.73652 2.80979 10.0755L2.2354 10.9867C2.02367 11.3225 2.07267 11.7602 2.35341 12.041L2.95951 12.6471C3.24025 12.9278 3.67795 12.9768 4.01382 12.7651L4.92506 12.1907C5.26384 12.377 5.62516 12.5278 6.0039 12.6379L6.24198 13.6881C6.32977 14.0753 6.67391 14.3502 7.07095 14.3502H7.92809C8.32512 14.3502 8.66927 14.0753 8.75765 13.6881L8.99569 12.6381C9.37484 12.528 9.73652 12.3771 10.0756 12.1906L10.9867 12.7649C11.3225 12.9766 11.7602 12.9276 12.041 12.6469L12.6471 12.0408C12.9278 11.76 12.9768 11.3223 12.7651 10.9865L12.1908 10.0755C12.3771 9.73658 12.5279 9.37517 12.638 8.99628L13.6879 8.75794C14.0751 8.67015 14.35 8.32601 14.35 7.92897V7.07183C14.35 6.6748 14.0751 6.33065 13.6879 6.24287L12.6381 6.00488C12.528 5.62585 12.3771 5.26414 12.1906 4.92507L12.7649 4.01407C12.9766 3.6782 12.9276 3.2405 12.6469 2.95975L12.0408 2.35366C11.76 2.07292 11.3223 2.02392 10.9865 2.23565L10.0755 2.80989C9.73622 2.62328 9.37437 2.4722 8.99517 2.36201L8.75765 1.31231C8.66927 0.925096 8.32512 0.650238 7.92809 0.650238H7.07095ZM4.92053 3.81251C5.44724 3.44339 6.05665 3.18424 6.71543 3.06839L7.07095 1.50024H7.92809L8.28374 3.06816C8.94279 3.18387 9.5525 3.44302 10.0795 3.81224L11.4397 2.9547L12.0458 3.56079L11.1882 4.92117C11.5573 5.44798 11.8164 6.0575 11.9321 6.71638L13.5 7.07183V7.92897L11.932 8.28444C11.8162 8.94342 11.557 9.55301 11.1878 10.0798L12.0453 11.4402L11.4392 12.0462L10.0787 11.1886C9.55192 11.5576 8.94241 11.8166 8.28353 11.9323L7.92809 13.5002H7.07095L6.71543 11.932C6.0569 11.8163 5.44772 11.5573 4.92116 11.1883L3.56055 12.046L2.95445 11.4399L3.81213 10.0794C3.4431 9.55266 3.18403 8.94326 3.06825 8.2845L1.50002 7.92897V7.07183L3.06818 6.71631C3.18388 6.05765 3.44283 5.44833 3.81171 4.92165L2.95398 3.561L3.56008 2.95491L4.92053 3.81251ZM9.02496 7.50008C9.02496 8.34226 8.34223 9.02499 7.50005 9.02499C6.65786 9.02499 5.97513 8.34226 5.97513 7.50008C5.97513 6.65789 6.65786 5.97516 7.50005 5.97516C8.34223 5.97516 9.02496 6.65789 9.02496 7.50008ZM9.92496 7.50008C9.92496 8.83932 8.83929 9.92499 7.50005 9.92499C6.1608 9.92499 5.07513 8.83932 5.07513 7.50008C5.07513 6.16084 6.1608 5.07516 7.50005 5.07516C8.83929 5.07516 9.92496 6.16084 9.92496 7.50008Z"
        fill="currentColor"
      />
    </svg>
  );
}
