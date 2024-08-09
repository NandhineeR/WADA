import { ISportDisciplineDescription } from '@core/models';
import { TDPTotals } from './tdp-totals.model';
import { TDPRow } from './tdp-row.model';
import { SampleValues } from './sample-values.model';
import { AnalysisValues } from './analysis-values.model';
import { TDPSubRow } from './tdp-sub-row.model';
import { ISportDisciplineId } from './sport-discipline-id.model';
import { DirtyCellInfo } from './dirty-cell-info.model';
import { TDPCell } from './tdp-cell.model';
import { Period } from './period.model';

export class TDPSheetInfo {
    organizationName: string;

    year: number;

    startMonth: number;

    endMonth: number;

    tdpTotals: TDPTotals;

    rows: Array<TDPRow>;

    constructor(tdpSheetInfo?: TDPSheetInfo) {
        this.organizationName = tdpSheetInfo?.organizationName || '';
        this.year = tdpSheetInfo?.year || 0;
        this.startMonth = tdpSheetInfo?.startMonth || 0;
        this.endMonth = tdpSheetInfo?.endMonth || 0;
        this.tdpTotals = tdpSheetInfo ? new TDPTotals(tdpSheetInfo.tdpTotals) : new TDPTotals();
        this.rows = new Array<TDPRow>();

        if (tdpSheetInfo) {
            tdpSheetInfo.rows.forEach((row: TDPRow) => this.rows.push(new TDPRow(row)));
            this.updateTotals();
        }
    }

    clone(): this {
        const clone = new (this.constructor as typeof TDPSheetInfo)() as this;
        clone.organizationName = this.organizationName;
        clone.year = this.year;
        clone.startMonth = this.startMonth;
        clone.endMonth = this.endMonth;
        clone.tdpTotals = this.tdpTotals.clone();
        this.rows.forEach((row: TDPRow) => clone.rows.push(row.clone()));

        return clone;
    }

    resetDirtyAndDisabled(): void {
        this.rows.forEach((row: TDPRow) => {
            row.tdpTotals.setDirty(false);
            row.subRows.forEach((subRow: TDPSubRow) => {
                subRow.isDirty = false;
                subRow.isDisabled = false;
                subRow.tdpTotals.setDirty(false);
            });
        });
        // the following property is not used. We set it to false
        // to keep the model in a coherent and predictable state.
        this.tdpTotals.setDirty(false);
    }

    sort(): this {
        this.rows.forEach((row: TDPRow) => row.sort());
        this.rows.sort((a: TDPRow, b: TDPRow) => a.sportName.localeCompare(b.sportName));

        return this;
    }

    updateTotals(): void {
        this.tdpTotals.reset();

        this.rows.forEach((row: TDPRow) => {
            row.updateTotals();
            this.tdpTotals.samples.forEach((sampleTotal: SampleValues) => {
                const sample = row.tdpTotals.samples.find(
                    (sampleToFind) => sampleToFind.sampleTypeId === sampleTotal.sampleTypeId
                );
                if (sample) {
                    sampleTotal.inCompetitionCell.value += sample.inCompetitionCell.value;
                    sampleTotal.outOfCompetitionCell.value += sample.outOfCompetitionCell.value;
                }
            });
            this.tdpTotals.analyses.forEach((analysisTotal: AnalysisValues) => {
                const analysis = row.tdpTotals.analyses.find(
                    (analysisToFind) => analysisToFind.analysisCategoryCode === analysisTotal.analysisCategoryCode
                );
                if (analysis) {
                    analysisTotal.inCompetitionCell.value += analysis.inCompetitionCell.value;
                    analysisTotal.outOfCompetitionCell.value += analysis.outOfCompetitionCell.value;
                }
            });
        });
        this.tdpTotals.updateTotal();
    }

    // Returns true if the discipline was added, false otherwise
    addSportDiscipline(sportDiscipline: ISportDisciplineDescription): boolean {
        // Find the sport/discipline rows
        const sportRow = this.rows.find((row: TDPRow) => row.sportId === sportDiscipline.sportId);
        if (
            sportRow &&
            sportRow.subRows.find((subRow: TDPSubRow) => subRow.disciplineId === sportDiscipline.disciplineId)
        ) {
            return false;
        }

        // Add the sport row if necessary
        let dirtyRow = this.rows.find((row: TDPRow) => row.sportId === sportDiscipline.sportId);
        if (!dirtyRow) {
            dirtyRow = new TDPRow();
            this.rows.push(dirtyRow);
            dirtyRow.sportId = sportDiscipline.sportId;
            dirtyRow.sportName = sportDiscipline.sportDescription;
            dirtyRow.tdpTotals = this.tdpTotals.clone();
            dirtyRow.tdpTotals.reset();
        }

        // Add the discipline subRow
        const dirtySubRow: TDPSubRow = new TDPSubRow();
        dirtyRow.subRows.push(dirtySubRow);
        dirtySubRow.isDirty = true;
        dirtySubRow.disciplineId = sportDiscipline.disciplineId;
        dirtySubRow.disciplineName = sportDiscipline.disciplineDescription;
        dirtySubRow.tdpTotals = this.tdpTotals.clone();
        dirtySubRow.tdpTotals.reset();
        dirtySubRow.tdpTotals.setDirty(true);
        removeTdpCellsId([...dirtySubRow.tdpTotals.analyses, ...dirtySubRow.tdpTotals.samples]);
        return true;
    }

    // Returns true if the discipline was removed, false otherwise
    removeSportDiscipline(sportDisciplineId: ISportDisciplineId): boolean {
        // Find the sport
        const dirtyRow = this.rows.find((row: TDPRow) => row.sportId === sportDisciplineId.sportId);
        if (!dirtyRow) {
            return false;
        }

        // Find the discipline
        const dirtySubRow = dirtyRow.subRows.find(
            (subRow: TDPSubRow) => subRow.disciplineId === sportDisciplineId.disciplineId
        );
        if (!dirtySubRow) {
            return false;
        }
        dirtySubRow.isDirty = true;
        dirtySubRow.tdpTotals.setDirty(true);

        return true;
    }

    getSubRow(disciplineId: number, sportId: number): TDPSubRow | undefined {
        const row = this.rows.find((r: TDPRow) => r.sportId === sportId);
        let subRow;
        if (row) {
            subRow = row.subRows.find((sr: TDPSubRow) => sr.disciplineId === disciplineId);
        }
        return subRow;
    }

    getCell(dirtyCell: DirtyCellInfo): { cell: TDPCell; subRow: TDPSubRow } | undefined {
        const subRow = this.getSubRow(dirtyCell.disciplineId, dirtyCell.sportId);
        if (subRow) {
            const cell = subRow.tdpTotals.getCell(dirtyCell.id);
            return cell ? { cell, subRow } : undefined;
        }
        return undefined;
    }

    getPeriod(): Period {
        return new Period(this.startMonth, this.endMonth);
    }
}

function removeTdpCellsId(cellContainers: Array<SampleValues | AnalysisValues>): void {
    cellContainers.forEach((value) => {
        delete value.inCompetitionCell.id;
        delete value.outOfCompetitionCell.id;
    });
}
