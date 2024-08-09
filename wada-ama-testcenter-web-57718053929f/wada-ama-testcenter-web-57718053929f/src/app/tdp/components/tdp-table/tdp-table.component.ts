import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { DirtyCellInfo, ISportDisciplineId, TDPCell, TDPRow, TDPSheet, TDPSheetInfo, TDPSubRow } from '@tdp/models';
import { TranslationService } from '@core/services';

// An interface to map number ids to booleans
// to determine the visibility of subrows in the table
interface SportIdToVisibilityMap {
    [key: number]: boolean;
}

@Component({
    selector: 'app-tdp-table',
    templateUrl: './tdp-table.component.html',
    styleUrls: ['./tdp-table.component.scss'],
})
export class TDPTableComponent implements OnChanges, OnDestroy {
    @Input() tdpSheetInfo: TDPSheetInfo = new TDPSheetInfo();

    @Input() tdpSheet: TDPSheet = new TDPSheet();

    @Input() highlightedSportDiscipline: ISportDisciplineId | undefined;

    @Input() readonly = false;

    @Output()
    readonly editTDPCell: EventEmitter<DirtyCellInfo> = new EventEmitter<DirtyCellInfo>();

    @Output()
    readonly updateTDPCell: EventEmitter<DirtyCellInfo> = new EventEmitter<DirtyCellInfo>();

    @Output()
    readonly deleteSportDiscipline: EventEmitter<ISportDisciplineId> = new EventEmitter<ISportDisciplineId>();

    visibilityMap: SportIdToVisibilityMap = {};

    highlightedDisciplineId = -1;

    highlightTimeout?: NodeJS.Timer = undefined;

    currentYear = new Date().getFullYear();

    anyExpanded = false;

    anyCollapsed = true;

    translations$ = this.translationService.translations$;

    disableDeleteButton = false;

    constructor(private translationService: TranslationService) {}

    ngOnDestroy(): void {
        if (this.highlightTimeout) {
            clearTimeout(this.highlightTimeout);
            this.highlightTimeout = undefined;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // When the TDP sheet is updated, update the visibility array
        if (this.tdpSheetInfo && changes.tdpSheetInfo && this.tdpSheetInfo !== changes.tdpSheetInfo.previousValue) {
            let totalSportDiscipline = 0;
            this.tdpSheetInfo.rows.forEach((row: TDPRow) => {
                this.visibilityMap[row.sportId] = this.visibilityMap[row.sportId] || false;
                totalSportDiscipline += row.subRows.length;
            });
            this.disableDeleteButton = totalSportDiscipline < 2;
            this.updateCollapseButtonStatus();
        }

        // Scroll to and highlight the discipline if a highlight is required
        if (
            this.highlightedSportDiscipline &&
            changes.highlightedSportDiscipline &&
            this.highlightedSportDiscipline !== changes.highlightedSportDiscipline.previousValue
        ) {
            this.highlightSportDiscipline(this.highlightedSportDiscipline);
        }
    }

    highlightSportDiscipline(sportDiscipline: ISportDisciplineId): void {
        // Expand the sport containing the discipline
        this.visibilityMap[sportDiscipline.sportId] = true;

        // Highlight the discipline
        this.highlightedDisciplineId = sportDiscipline.disciplineId;

        // Remove the highlight after a delay
        if (this.highlightTimeout) {
            clearTimeout(this.highlightTimeout);
        }
        this.highlightTimeout = setTimeout(() => {
            this.highlightedDisciplineId = -1;
            this.highlightTimeout = undefined;
        }, 5000);

        // Scroll to the discipline
        // The setTimeout(0) schedules the code to be executed
        // once the stack is empty. That way, we are sure the discipline has been added
        // to the table and its sport has been expanded.
        setTimeout(() => {
            const row = document.getElementById(`row${sportDiscipline.disciplineId}`);
            if (row) {
                row.scrollIntoView();
            }
        }, 0);
    }

    toggleVisibility(sportId: number): void {
        this.visibilityMap[sportId] = !this.visibilityMap[sportId];
        this.updateCollapseButtonStatus();
    }

    updateCollapseButtonStatus(): void {
        if (this.tdpSheetInfo) {
            this.anyCollapsed = false;
            this.anyExpanded = false;
            this.sportsNotDeleted(this.tdpSheetInfo).forEach((row) => {
                this.anyCollapsed = this.anyCollapsed || this.visibilityMap[row.sportId] === false;
                this.anyExpanded = this.anyExpanded || this.visibilityMap[row.sportId] === true;
            });
        }
    }

    showAll(isVisible: boolean): void {
        this.anyExpanded = isVisible;
        this.anyCollapsed = !isVisible;
        if (this.tdpSheetInfo) {
            this.tdpSheetInfo.rows.forEach((row: TDPRow) => {
                this.visibilityMap[row.sportId] = isVisible;
            });
        }
    }

    onDeleteSportDiscipline(sportDiscipline: ISportDisciplineId): void {
        this.deleteSportDiscipline.emit(sportDiscipline);
    }

    onChange(cell: TDPCell, sportId: number, disciplineId: number): void {
        const dirtyCellInfo = {
            id: cell.id,
            dirtyValue: cell.value,
            sportId,
            disciplineId,
        };
        this.updateTDPCell.emit(dirtyCellInfo);
    }

    onInput(value: string, cell: TDPCell, sportId: number, disciplineId: number): void {
        const num = Number.isSafeInteger(+value) ? +value : 0;
        const dirtyCellInfo = {
            id: cell.id,
            dirtyValue: num,
            sportId,
            disciplineId,
        };
        if (cell.value !== dirtyCellInfo.dirtyValue) {
            this.editTDPCell.emit(dirtyCellInfo);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    customTrackBy(index: number, _item: any): number {
        return index;
    }

    disciplinesNotDeleted(sport: TDPRow): Array<TDPSubRow> {
        return sport.subRows.filter((disc) => !disc.isDeleted);
    }

    sportsNotDeleted(tdpSheetInfo: TDPSheetInfo): Array<TDPRow> {
        return tdpSheetInfo.rows.filter((sport) => this.disciplinesNotDeleted(sport).length > 0);
    }
}
