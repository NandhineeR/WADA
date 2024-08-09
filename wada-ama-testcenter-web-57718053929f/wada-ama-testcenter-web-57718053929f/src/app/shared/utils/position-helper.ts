import { ElementRef } from '@angular/core';
import { Placement } from './placement.type';
import { Rect } from './rect.type';

interface SpaceRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

interface SpaceMapEntry {
    space: SpaceRect;
    overlap: number;
    placement: Placement;
}

interface SpaceMap {
    [key: string]: SpaceMapEntry;
}

export class PositionHelper {
    static getBestPosition(element: ElementRef, target: Rect, placement: Placement, margin: number): Placement {
        // Get the free space around the tooltip
        const spaceMap = this.getSpaceMap(element, target, margin);

        // Try to place the tooltip where the user asked, or on the opposite side
        if (spaceMap[placement].overlap === 0) {
            return placement;
        }
        if (spaceMap[this.getOppositeSide(placement)].overlap === 0) {
            return this.getOppositeSide(placement);
        }
        // There is some overlap with the user placement, pick the side with the least overlap
        // Since the overlap is a negative value or 0, we must pick the maximum here.
        let overlapMax = spaceMap.top;
        Object.keys(spaceMap).forEach((side) => {
            if (side) {
                overlapMax = overlapMax.overlap > spaceMap[side].overlap ? overlapMax : spaceMap[side];
            }
        });
        return overlapMax.placement;
    }

    // Returns a map that can be indexed by placement to get the space around the tooltip for that placement
    static getSpaceMap(element: ElementRef, target: Rect, margin: number): SpaceMap {
        const tooltipWidth = element.nativeElement.clientWidth;
        const tooltipHeight = element.nativeElement.clientHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const halfTargetWidth = target.width / 2;
        const halfTooltipWidth = tooltipWidth / 2;
        const halfTargetHeight = target.height / 2;
        const halfTooltipHeight = tooltipHeight / 2;

        const spaceMap: SpaceMap = {
            top: {
                space: {
                    left: target.left + halfTargetWidth - halfTooltipWidth - margin,
                    right: windowWidth - (target.left + halfTargetWidth + halfTooltipWidth) - margin,
                    top: target.top - tooltipHeight - margin,
                    bottom: margin,
                },
                overlap: 0,
                placement: Placement.top,
            },
            bottom: {
                space: {
                    left: target.left + halfTargetWidth - halfTooltipWidth - margin,
                    right: windowWidth - (target.left + halfTargetWidth + halfTooltipWidth) - margin,
                    top: margin,
                    bottom: windowHeight - (target.top + target.height + tooltipHeight) - margin,
                },
                overlap: 0,
                placement: Placement.bottom,
            },
            left: {
                space: {
                    left: target.left - tooltipWidth - margin,
                    right: margin,
                    top: target.top + halfTargetHeight - halfTooltipHeight - margin,
                    bottom: windowHeight - (target.top + halfTargetHeight + halfTooltipHeight) - margin,
                },
                overlap: 0,
                placement: Placement.left,
            },
            right: {
                space: {
                    left: margin,
                    right: windowWidth - (target.left + target.width + tooltipWidth) - margin,
                    top: target.top + halfTargetHeight - halfTooltipHeight - margin,
                    bottom: windowHeight - (target.top + halfTargetHeight + halfTooltipHeight) - margin,
                },
                overlap: 0,
                placement: Placement.right,
            },
        };

        Object.keys(spaceMap).forEach((side) => {
            if (side) {
                spaceMap[side].overlap = this.calculateTotalOverlap(spaceMap[side]);
            }
        });

        return spaceMap;
    }

    // Returns the sum of overlap on each side
    // This gives a measure of the total overlap
    static calculateTotalOverlap(mapEntry: SpaceMapEntry): number {
        return (
            mapEntry.space.left * (mapEntry.space.left < 0 ? 1 : 0) +
            mapEntry.space.right * (mapEntry.space.right < 0 ? 1 : 0) +
            mapEntry.space.top * (mapEntry.space.top < 0 ? 1 : 0) +
            mapEntry.space.bottom * (mapEntry.space.bottom < 0 ? 1 : 0)
        );
    }

    static getOppositeSide(placement: Placement): Placement {
        switch (placement) {
            case Placement.left:
                return Placement.right;
            case Placement.right:
                return Placement.left;
            case Placement.top:
                return Placement.bottom;
            default:
                return Placement.top;
        }
    }
}
