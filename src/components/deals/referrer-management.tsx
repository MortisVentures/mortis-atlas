"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PersonIcon,
  EnvelopeClosedIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  StarFilledIcon,
  StarIcon,
  ChatBubbleIcon,
  CalendarIcon,
  RocketIcon,
  BackpackIcon,
  ClockIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import {
  Referrer,
  ReferrerTier,
  SAMPLE_REFERRERS,
  referrerTierConfig,
} from "@/lib/deals/source-tracking";

// ============================================================================
// Referrer Card Component
// ============================================================================

interface ReferrerCardProps {
  referrer: Referrer;
  onSendThankYou?: (referrer: Referrer) => void;
  onUpdateTier?: (referrer: Referrer, tier: ReferrerTier) => void;
  onToggleStar?: (referrer: Referrer) => void;
}

export function ReferrerCard({
  referrer,
  onSendThankYou,
  onUpdateTier,
  onToggleStar,
}: ReferrerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tierConfig = referrerTierConfig[referrer.tier];

  const successRate =
    referrer.totalReferrals > 0
      ? (referrer.successfulReferrals / referrer.totalReferrals) * 100
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        variant="raised"
        className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-lg font-semibold">
              {referrer.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {referrer.contactId ? (
                  <Link
                    href={`/contacts/${referrer.contactId}?highlight=referrals`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-foreground hover:text-tactical-400 transition-colors"
                  >
                    {referrer.name}
                  </Link>
                ) : (
                  <h3 className="font-semibold">{referrer.name}</h3>
                )}
                <Badge
                  className={`${tierConfig.color} text-xs`}
                  variant="outline"
                >
                  {tierConfig.label}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar?.(referrer);
                  }}
                  className="text-yellow-400 hover:scale-110 transition-transform"
                >
                  {referrer.isStarred ? (
                    <StarFilledIcon className="w-4 h-4" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
              </div>

              {referrer.organization && (
                <p className="text-sm text-zinc-400">{referrer.organization}</p>
              )}

              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <RocketIcon className="w-3 h-3" />
                  {referrer.totalReferrals} referrals
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircledIcon className="w-3 h-3 text-emerald-400" />
                  {successRate.toFixed(0)}% success rate
                </span>
                {referrer.totalDealsValue > 0 && (
                  <span className="flex items-center gap-1">
                    ${(referrer.totalDealsValue / 1000000).toFixed(1)}M value
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!referrer.lastThankYouSent ||
            new Date().getTime() - new Date(referrer.lastThankYouSent).getTime() >
              30 * 24 * 60 * 60 * 1000 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendThankYou?.(referrer);
                }}
                className="text-xs"
              >
                <EnvelopeClosedIcon className="w-3 h-3 mr-1" />
                Send Thanks
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs text-emerald-400">
                <CheckIcon className="w-3 h-3 mr-1" />
                Thanked
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Contact Info */}
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 mb-2">
                      Contact
                    </h4>
                    {referrer.email && (
                      <p className="text-sm flex items-center gap-1">
                        <EnvelopeClosedIcon className="w-3 h-3" />
                        {referrer.email}
                      </p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 mb-2">
                      Relationship
                    </h4>
                    <p className="text-sm capitalize">
                      {referrer.relationship.replace("_", " ")}
                    </p>
                  </div>

                  {/* First Referral */}
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 mb-2">
                      First Referral
                    </h4>
                    <p className="text-sm">
                      {new Date(referrer.firstReferralDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Last Contact */}
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 mb-2">
                      Last Contact
                    </h4>
                    <p className="text-sm">
                      {referrer.lastContactDate
                        ? new Date(referrer.lastContactDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {referrer.notes && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-zinc-500 mb-2">
                      Notes
                    </h4>
                    <p className="text-sm text-zinc-400">{referrer.notes}</p>
                  </div>
                )}

                {/* Tier Management */}
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-zinc-500 mb-2">
                    Update Tier
                  </h4>
                  <div className="flex gap-2">
                    {(Object.keys(referrerTierConfig) as ReferrerTier[]).map(
                      (tier) => (
                        <Button
                          key={tier}
                          size="sm"
                          variant={referrer.tier === tier ? "primary" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateTier?.(referrer, tier);
                          }}
                          className={`text-xs ${
                            referrer.tier === tier
                              ? referrerTierConfig[tier].color
                              : ""
                          }`}
                        >
                          {referrerTierConfig[tier].label}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Referrer List Component
// ============================================================================

interface ReferrerListProps {
  referrers?: Referrer[];
  onSendThankYou?: (referrer: Referrer) => void;
  onUpdateTier?: (referrer: Referrer, tier: ReferrerTier) => void;
  onToggleStar?: (referrer: Referrer) => void;
}

export function ReferrerList({
  referrers = SAMPLE_REFERRERS,
  onSendThankYou,
  onUpdateTier,
  onToggleStar,
}: ReferrerListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<ReferrerTier | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"referrals" | "value" | "recent">(
    "referrals"
  );

  // Filter and sort referrers
  const filteredReferrers = referrers
    .filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.organization?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === "ALL" || r.tier === tierFilter;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.totalDealsValue - a.totalDealsValue;
        case "recent":
          return (
            new Date(b.lastContactDate || b.firstReferralDate).getTime() -
            new Date(a.lastContactDate || a.firstReferralDate).getTime()
          );
        case "referrals":
        default:
          return b.totalReferrals - a.totalReferrals;
      }
    });

  // Starred referrers first
  const sortedReferrers = [
    ...filteredReferrers.filter((r) => r.isStarred),
    ...filteredReferrers.filter((r) => !r.isStarred),
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search referrers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tierFilter === "ALL" ? "primary" : "outline"}
            onClick={() => setTierFilter("ALL")}
          >
            All
          </Button>
          {(Object.keys(referrerTierConfig) as ReferrerTier[]).map((tier) => (
            <Button
              key={tier}
              size="sm"
              variant={tierFilter === tier ? "primary" : "outline"}
              onClick={() => setTierFilter(tier)}
              className={tierFilter === tier ? referrerTierConfig[tier].color : ""}
            >
              {referrerTierConfig[tier].label}
            </Button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        >
          <option value="referrals">Sort by Referrals</option>
          <option value="value">Sort by Deal Value</option>
          <option value="recent">Sort by Recent</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedReferrers.map((referrer) => (
            <ReferrerCard
              key={referrer.id}
              referrer={referrer}
              onSendThankYou={onSendThankYou}
              onUpdateTier={onUpdateTier}
              onToggleStar={onToggleStar}
            />
          ))}
        </AnimatePresence>

        {sortedReferrers.length === 0 && (
          <Card variant="raised" className="p-8 text-center">
            <PersonIcon className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
            <p className="text-zinc-400">No referrers found</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Thank You Automation Component
// ============================================================================

interface ThankYouAutomationProps {
  referrers?: Referrer[];
  onSendThankYou?: (referrer: Referrer) => void;
  onBulkSend?: (referrers: Referrer[]) => void;
}

export function ThankYouAutomation({
  referrers = SAMPLE_REFERRERS,
  onSendThankYou,
  onBulkSend,
}: ThankYouAutomationProps) {
  const [selectedReferrers, setSelectedReferrers] = useState<Set<string>>(
    new Set()
  );

  // Find referrers who need thank you notes
  const needsThankYou = referrers.filter((r) => {
    if (!r.lastThankYouSent) return true;
    const daysSinceThankYou = Math.floor(
      (new Date().getTime() - new Date(r.lastThankYouSent).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysSinceThankYou > 30 && r.totalReferrals > 0;
  });

  // Recent thank you notes sent
  const recentlyThanked = referrers
    .filter((r) => r.lastThankYouSent)
    .sort(
      (a, b) =>
        new Date(b.lastThankYouSent!).getTime() -
        new Date(a.lastThankYouSent!).getTime()
    )
    .slice(0, 5);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedReferrers);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedReferrers(newSelection);
  };

  const handleBulkSend = () => {
    const selected = referrers.filter((r) => selectedReferrers.has(r.id));
    onBulkSend?.(selected);
    setSelectedReferrers(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Pending Thank Yous */}
      <Card variant="raised" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <ClockIcon className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">Pending Thank Yous</h3>
              <p className="text-xs text-zinc-500">
                {needsThankYou.length} referrers need acknowledgment
              </p>
            </div>
          </div>

          {selectedReferrers.size > 0 && (
            <Button onClick={handleBulkSend}>
              <EnvelopeClosedIcon className="w-4 h-4 mr-2" />
              Send to {selectedReferrers.size} Selected
            </Button>
          )}
        </div>

        {needsThankYou.length > 0 ? (
          <div className="space-y-2">
            {needsThankYou.map((referrer) => (
              <motion.div
                key={referrer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-3 rounded-lg border ${
                  selectedReferrers.has(referrer.id)
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-zinc-800 bg-zinc-900/50"
                } flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors`}
                onClick={() => toggleSelection(referrer.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border ${
                      selectedReferrers.has(referrer.id)
                        ? "bg-cyan-500 border-cyan-500"
                        : "border-zinc-600"
                    } flex items-center justify-center`}
                  >
                    {selectedReferrers.has(referrer.id) && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{referrer.name}</p>
                    <p className="text-xs text-zinc-500">
                      {referrer.totalReferrals} referrals •{" "}
                      {referrer.lastThankYouSent
                        ? `Last thanked ${Math.floor(
                            (new Date().getTime() -
                              new Date(referrer.lastThankYouSent).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} days ago`
                        : "Never thanked"}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendThankYou?.(referrer);
                  }}
                >
                  <EnvelopeClosedIcon className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircledIcon className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
            <p className="text-zinc-400">All referrers have been thanked!</p>
          </div>
        )}
      </Card>

      {/* Recent Thank Yous */}
      <Card variant="raised" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CheckCircledIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold">Recently Thanked</h3>
            <p className="text-xs text-zinc-500">Last 5 thank you notes sent</p>
          </div>
        </div>

        {recentlyThanked.length > 0 ? (
          <div className="space-y-2">
            {recentlyThanked.map((referrer) => (
              <div
                key={referrer.id}
                className="p-3 rounded-lg bg-zinc-900/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                    {referrer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{referrer.name}</p>
                    <p className="text-xs text-zinc-500">
                      Thanked{" "}
                      {new Date(referrer.lastThankYouSent!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <ChatBubbleIcon className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
            <p className="text-zinc-400">No thank you notes sent yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// Referral Rewards Tracking Component
// ============================================================================

interface ReferralReward {
  id: string;
  referrerId: string;
  referrerName: string;
  type: "GIFT" | "DINNER" | "EVENT_TICKET" | "RECOGNITION" | "OTHER";
  description: string;
  value?: number;
  date: string;
  status: "PLANNED" | "SENT" | "DELIVERED";
}

const SAMPLE_REWARDS: ReferralReward[] = [
  {
    id: "1",
    referrerId: "ref-1",
    referrerName: "Sarah Chen",
    type: "GIFT",
    description: "Premium wine collection",
    value: 500,
    date: "2024-01-15",
    status: "DELIVERED",
  },
  {
    id: "2",
    referrerId: "ref-2",
    referrerName: "Michael Park",
    type: "DINNER",
    description: "Dinner at Nobu",
    value: 800,
    date: "2024-01-20",
    status: "PLANNED",
  },
  {
    id: "3",
    referrerId: "ref-3",
    referrerName: "Jennifer Walsh",
    type: "EVENT_TICKET",
    description: "Tech conference VIP pass",
    value: 1500,
    date: "2024-02-05",
    status: "SENT",
  },
  {
    id: "4",
    referrerId: "ref-4",
    referrerName: "David Kim",
    type: "RECOGNITION",
    description: "Featured in LP newsletter",
    date: "2024-01-10",
    status: "DELIVERED",
  },
];

const rewardTypeConfig = {
  GIFT: { label: "Gift", icon: BackpackIcon, color: "text-purple-400" },
  DINNER: { label: "Dinner", icon: CalendarIcon, color: "text-amber-400" },
  EVENT_TICKET: { label: "Event", icon: RocketIcon, color: "text-cyan-400" },
  RECOGNITION: { label: "Recognition", icon: StarFilledIcon, color: "text-yellow-400" },
  OTHER: { label: "Other", icon: CheckIcon, color: "text-zinc-400" },
};

const rewardStatusConfig = {
  PLANNED: { label: "Planned", color: "bg-yellow-500/20 text-yellow-400" },
  SENT: { label: "Sent", color: "bg-blue-500/20 text-blue-400" },
  DELIVERED: { label: "Delivered", color: "bg-emerald-500/20 text-emerald-400" },
};

interface ReferralRewardsProps {
  rewards?: ReferralReward[];
  onAddReward?: () => void;
  onUpdateStatus?: (reward: ReferralReward, status: ReferralReward["status"]) => void;
}

export function ReferralRewards({
  rewards = SAMPLE_REWARDS,
  onAddReward,
  onUpdateStatus,
}: ReferralRewardsProps) {
  const [filter, setFilter] = useState<ReferralReward["status"] | "ALL">("ALL");

  const filteredRewards = rewards.filter(
    (r) => filter === "ALL" || r.status === filter
  );

  const totalSpent = rewards
    .filter((r) => r.status === "DELIVERED" && r.value)
    .reduce((sum, r) => sum + (r.value || 0), 0);

  const pendingCount = rewards.filter(
    (r) => r.status === "PLANNED" || r.status === "SENT"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="raised" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BackpackIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
              <p className="text-xs text-zinc-500">Total Rewards Value</p>
            </div>
          </div>
        </Card>

        <Card variant="raised" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircledIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {rewards.filter((r) => r.status === "DELIVERED").length}
              </p>
              <p className="text-xs text-zinc-500">Delivered</p>
            </div>
          </div>
        </Card>

        <Card variant="raised" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-zinc-500">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rewards List */}
      <Card variant="raised" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Reward History</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filter === "ALL" ? "primary" : "outline"}
                onClick={() => setFilter("ALL")}
              >
                All
              </Button>
              {(Object.keys(rewardStatusConfig) as ReferralReward["status"][]).map(
                (status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filter === status ? "primary" : "outline"}
                    onClick={() => setFilter(status)}
                  >
                    {rewardStatusConfig[status].label}
                  </Button>
                )
              )}
            </div>
            <Button onClick={onAddReward}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Reward
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredRewards.map((reward) => {
            const typeConfig = rewardTypeConfig[reward.type];
            const statusConfig = rewardStatusConfig[reward.status];
            const TypeIcon = typeConfig.icon;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${typeConfig.color}`}
                  >
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{reward.description}</p>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-500">
                      For {reward.referrerName} •{" "}
                      {new Date(reward.date).toLocaleDateString()}
                      {reward.value && ` • $${reward.value.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {reward.status !== "DELIVERED" && (
                  <div className="flex gap-2">
                    {reward.status === "PLANNED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus?.(reward, "SENT")}
                      >
                        Mark Sent
                      </Button>
                    )}
                    {reward.status === "SENT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus?.(reward, "DELIVERED")}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {filteredRewards.length === 0 && (
            <div className="text-center py-8">
              <BackpackIcon className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
              <p className="text-zinc-400">No rewards found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Referrer Management Dashboard
// ============================================================================

interface ReferrerManagementDashboardProps {
  referrers?: Referrer[];
}

export function ReferrerManagementDashboard({
  referrers = SAMPLE_REFERRERS,
}: ReferrerManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<"list" | "thankyou" | "rewards">(
    "list"
  );

  // Calculate stats
  const totalReferrers = referrers.length;
  const activeReferrers = referrers.filter((r) => r.totalReferrals > 0).length;
  const goldPlatinum = referrers.filter(
    (r) => r.tier === "GOLD" || r.tier === "PLATINUM"
  ).length;
  const totalReferrals = referrers.reduce((sum, r) => sum + r.totalReferrals, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="raised" className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Referrers</p>
          <p className="text-2xl font-bold">{totalReferrers}</p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Active Referrers</p>
          <p className="text-2xl font-bold">{activeReferrers}</p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Gold/Platinum</p>
          <p className="text-2xl font-bold">{goldPlatinum}</p>
        </Card>
        <Card variant="raised" className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Referrals</p>
          <p className="text-2xl font-bold">{totalReferrals}</p>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <Button
          variant={activeTab === "list" ? "primary" : "ghost"}
          onClick={() => setActiveTab("list")}
        >
          <PersonIcon className="w-4 h-4 mr-2" />
          Referrer Directory
        </Button>
        <Button
          variant={activeTab === "thankyou" ? "primary" : "ghost"}
          onClick={() => setActiveTab("thankyou")}
        >
          <EnvelopeClosedIcon className="w-4 h-4 mr-2" />
          Thank You Automation
        </Button>
        <Button
          variant={activeTab === "rewards" ? "primary" : "ghost"}
          onClick={() => setActiveTab("rewards")}
        >
          <BackpackIcon className="w-4 h-4 mr-2" />
          Rewards Tracking
        </Button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "list" && <ReferrerList referrers={referrers} />}
          {activeTab === "thankyou" && (
            <ThankYouAutomation referrers={referrers} />
          )}
          {activeTab === "rewards" && <ReferralRewards />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
