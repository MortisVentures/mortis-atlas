"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { FounderRatingMatrix as FounderRatingMatrixType, RatingCorrelation } from "@/lib/insights/types";

// =============================================================================
// TYPES
// =============================================================================

interface FounderRatingMatrixProps {
  data: FounderRatingMatrixType;
}

// =============================================================================
// RATING ROW
// =============================================================================

interface RatingRowProps {
  label: string;
  ratings: RatingCorrelation[];
}

function RatingRow({ label, ratings }: RatingRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground w-20 flex-shrink-0">
        {label}
      </span>
      <div className="flex gap-1 flex-1">
        {ratings.map((r) => {
          const hasData = r.total > 0;
          const approvalRate = r.approvalRate;

          // Color based on approval rate
          const bgColor = !hasData
            ? "bg-muted/30"
            : approvalRate >= 0.6
            ? "bg-tactical-500"
            : approvalRate >= 0.4
            ? "bg-tactical-500/70"
            : approvalRate >= 0.2
            ? "bg-warning-base"
            : "bg-danger-base/60";

          return (
            <motion.div
              key={r.rating}
              className={cn(
                "flex-1 h-10 rounded flex items-center justify-center",
                bgColor,
                hasData && "text-white"
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: r.rating * 0.1 }}
              title={
                hasData
                  ? `Rating ${r.rating}: ${r.approved}/${r.total} approved (${(approvalRate * 100).toFixed(0)}%)`
                  : `Rating ${r.rating}: No data`
              }
            >
              {hasData && (
                <span className="text-xs font-mono font-medium">
                  {(approvalRate * 100).toFixed(0)}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FounderRatingMatrix({ data }: FounderRatingMatrixProps) {
  return (
    <div className="space-y-4">
      {/* Matrix */}
      <Card variant="raised" className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">
            Founder Rating vs Approval Rate
          </h4>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              data.confidence.level === "high" && "bg-tactical-500/20 text-tactical-500",
              data.confidence.level === "medium" && "bg-blue-500/20 text-blue-400",
              data.confidence.level === "low" && "bg-warning-base/20 text-warning-base"
            )}
          >
            {data.confidence.level} confidence
          </span>
        </div>

        {/* Rating Scale Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-20 flex-shrink-0" />
          <div className="flex gap-1 flex-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <div
                key={rating}
                className="flex-1 text-center text-xs text-muted-foreground font-medium"
              >
                {rating}
              </div>
            ))}
          </div>
        </div>

        {/* Rating Rows */}
        <div className="space-y-2">
          <RatingRow label="Technical" ratings={data.techRatings} />
          <RatingRow label="Business" ratings={data.businessRatings} />
          <RatingRow label="Design" ratings={data.designRatings} />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-danger-base/60" />
            <span className="text-xs text-muted-foreground">&lt;20%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-warning-base" />
            <span className="text-xs text-muted-foreground">20-40%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-tactical-500/70" />
            <span className="text-xs text-muted-foreground">40-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-tactical-500" />
            <span className="text-xs text-muted-foreground">&gt;60%</span>
          </div>
        </div>
      </Card>

      {/* Insight */}
      {data.combinedInsight && (
        <Card variant="raised" className="p-4 bg-muted/30">
          <p className="text-sm text-foreground">{data.combinedInsight}</p>
        </Card>
      )}

      {/* Detailed Table */}
      <Card variant="raised" className="p-4 overflow-x-auto">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Detailed Breakdown
        </h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium text-right">Rating 1</th>
              <th className="pb-2 font-medium text-right">Rating 2</th>
              <th className="pb-2 font-medium text-right">Rating 3</th>
              <th className="pb-2 font-medium text-right">Rating 4</th>
              <th className="pb-2 font-medium text-right">Rating 5</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {[
              { label: "Technical", ratings: data.techRatings },
              { label: "Business", ratings: data.businessRatings },
              { label: "Design", ratings: data.designRatings },
            ].map((row) => (
              <tr key={row.label} className="hover:bg-muted/30">
                <td className="py-2 font-medium">{row.label}</td>
                {row.ratings.map((r) => (
                  <td key={r.rating} className="py-2 text-right font-mono text-xs">
                    {r.total > 0 ? (
                      <span>
                        {r.approved}/{r.total}
                        <span className="text-muted-foreground ml-1">
                          ({(r.approvalRate * 100).toFixed(0)}%)
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default FounderRatingMatrix;
