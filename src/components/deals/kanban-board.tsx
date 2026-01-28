"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { DealStage } from "@prisma/client";

import { cn } from "@/lib/utils";
import { DealWithRelations } from "@/lib/db/deals";
import { StageColumn, StageColumnSkeleton } from "./stage-column";
import { DealCard } from "./deal-card";
import { STAGE_ORDER } from "@/lib/deals/pipeline-utils";

// =============================================================================
// TYPES
// =============================================================================

export interface KanbanBoardProps {
  dealsByStage: Map<DealStage, DealWithRelations[]>;
  visibleStages: DealStage[];
  isLoading?: boolean;
  onStageChange: (dealId: string, newStage: DealStage) => Promise<boolean>;
  onAddDeal?: (stage: DealStage) => void;
  onViewDeal?: (deal: DealWithRelations) => void;
  compact?: boolean;
  className?: string;
}

// =============================================================================
// KANBAN BOARD COMPONENT
// =============================================================================

export function KanbanBoard({
  dealsByStage,
  visibleStages,
  isLoading = false,
  onStageChange,
  onAddDeal,
  onViewDeal,
  compact = false,
  className,
}: KanbanBoardProps) {
  // Track the currently dragging deal
  const [activeDeal, setActiveDeal] = React.useState<DealWithRelations | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  );

  // Find deal by ID across all stages
  const findDealById = React.useCallback(
    (id: string): DealWithRelations | null => {
      const entries = Array.from(dealsByStage.entries());
      for (const [, deals] of entries) {
        const deal = deals.find((d: DealWithRelations) => d.id === id);
        if (deal) return deal;
      }
      return null;
    },
    [dealsByStage]
  );

  // Handle drag start
  const handleDragStart = React.useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const deal = findDealById(active.id as string);
      setActiveDeal(deal);
    },
    [findDealById]
  );

  // Handle drag over (for visual feedback)
  const handleDragOver = React.useCallback((_event: DragOverEvent) => {
    // Can add visual feedback here if needed
  }, []);

  // Handle drag end
  const handleDragEnd = React.useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveDeal(null);

      if (!over) return;

      const dealId = active.id as string;
      const deal = findDealById(dealId);

      if (!deal) return;

      // Determine the target stage
      let targetStage: DealStage | null = null;

      // Check if dropped on a stage column
      if (STAGE_ORDER.includes(over.id as DealStage)) {
        targetStage = over.id as DealStage;
      } else {
        // Dropped on another deal - find which column it belongs to
        const targetDeal = findDealById(over.id as string);
        if (targetDeal) {
          targetStage = targetDeal.stage;
        }
      }

      // Only update if stage changed
      if (targetStage && targetStage !== deal.stage) {
        await onStageChange(dealId, targetStage);
      }
    },
    [findDealById, onStageChange]
  );

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 min-h-[600px]",
          className
        )}
      >
        {visibleStages.map((stage) => (
          <StageColumnSkeleton key={stage} />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 min-h-[600px]",
          className
        )}
      >
        {visibleStages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            deals={dealsByStage.get(stage) || []}
            onAddDeal={onAddDeal}
            onViewDeal={onViewDeal}
            compact={compact}
          />
        ))}
      </div>

      {/* Drag Overlay - shows the card being dragged */}
      <DragOverlay>
        {activeDeal ? (
          <DealCard deal={activeDeal} isOverlay compact={compact} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { KanbanBoard as default };
