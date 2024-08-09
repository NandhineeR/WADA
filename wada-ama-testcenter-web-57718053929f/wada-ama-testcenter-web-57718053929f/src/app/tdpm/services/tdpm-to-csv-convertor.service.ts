import { Injectable } from '@angular/core';
import { FromToDate } from '@shared/models';
import { TranslationMap, TranslationService } from '@core/services';
import { AnalysisValues, SampleValues, TDPMCell, TDPMSheetInfo, TDPMTotals, TestTypeToShow } from '@tdpm/models';

interface CSVSubRow {
    rowKey: string;
    name: string;
    values: Array<string>;
}

interface CSVRow {
    name: string;
    values: Array<string>;
}

interface CSVData {
    parameters: string;
    columnNames: Array<string>;
    rows: Array<CSVRow>;
    subRows: Array<CSVSubRow>;
}

@Injectable()
export class TDPMToCSVConvertorService {
    constructor(private translationService: TranslationService) {}

    exportCSVString(filename: string, csvString: string): void {
        const hiddenExportLink = document.createElement('a');
        hiddenExportLink.href = `data:text/csv;charset=utf-8,${encodeURI(csvString)}`;
        hiddenExportLink.target = '_blank';
        hiddenExportLink.download = filename;
        hiddenExportLink.click();
        hiddenExportLink.remove();
    }

    CSVDataToString(csvData: CSVData): string {
        const emptyLine = new Array<string>(csvData.columnNames.length - 1);
        let csvString = `"Parameters: ${csvData.parameters}",${emptyLine.join(',')}\n`;
        csvString += `${csvData.columnNames.join(',')}\n`;
        csvData.rows.forEach((row: CSVRow) => {
            row.values.splice(0, 0, '');
            csvString += `"${row.name}",${row.values.join(',')}\n`;
            csvData.subRows.forEach((subRow: CSVSubRow) => {
                if (subRow.rowKey === row.name) {
                    csvString += `"","${subRow.name}",${subRow.values.join(',')}\n`;
                }
            });
        });
        return csvString;
    }

    TDPMSheetToCSVData(
        tdpmSheetInfo: TDPMSheetInfo,
        translations: TranslationMap,
        dateRange: FromToDate,
        organizationName: string,
        showType: TestTypeToShow
    ): CSVData {
        const rows = new Array<CSVRow>();
        const subRows = new Array<CSVSubRow>();
        rows.push({
            name: translations[this.translationService.getTDPMonitoringCSVKey('grandTotal')],
            values: this.TDPMTotalsToCSVRow(tdpmSheetInfo.tdpTotals, showType),
        });
        tdpmSheetInfo.rows.forEach((row) => {
            rows.push({
                name: row.sportName,
                values: this.TDPMTotalsToCSVRow(row.tdpTotals, showType),
            });
            row.subRows.forEach((subRow) => {
                subRows.push({
                    name: subRow.disciplineName,
                    values: this.TDPMTotalsToCSVRow(subRow.tdpTotals, showType),
                    rowKey: row.sportName,
                });
            });
        });

        const fromMonth = translations[this.translationService.getMonthKey(dateRange.fromMonth.toString())];
        const toMonth = translations[this.translationService.getMonthKey(dateRange.toMonth.toString())];

        let samplesType = '';

        switch (showType) {
            case TestTypeToShow.PlannedAndComplete:
                samplesType = 'Planned and Completed - Sample(s) Collected';
                break;
            case TestTypeToShow.Complete:
                samplesType = 'Complete-Sample(s) Collected - Laboratory result reported';
                break;
            case TestTypeToShow.CompleteNoLabResultMatched:
                samplesType = 'Completed-Sample(s) Collected - No laboratory result matched';
                break;
            default:
        }

        return {
            parameters: `${organizationName}-${fromMonth}-${dateRange.fromYear}-${toMonth}-${dateRange.toYear}-${samplesType}`,
            columnNames: this.getTranslatedColumnNames(tdpmSheetInfo.tdpTotals, translations),
            rows,
            subRows,
        };
    }

    private getTranslatedColumnNames(totals: TDPMTotals, translations: TranslationMap): Array<string> {
        const columns: Array<string> = [
            `"${translations[this.translationService.getTDPMonitoringCSVKey('sport')]}"`,
            `"${translations[this.translationService.getTDPMonitoringCSVKey('discipline')]}"`,
            `"${translations[this.translationService.getTDPMonitoringCSVKey('total')]}"`,
        ];

        totals.getSamplesAndAnalysesList().forEach((element: SampleValues | AnalysisValues) => {
            const type = element instanceof SampleValues ? element.sampleType : element.analysisCategoryCode;
            [
                `ic${type}Test`,
                `ic${type}Forecast`,
                `ic${type}Percent`,
                `ooc${type}Test`,
                `ooc${type}Forecast`,
                `ooc${type}Percent`,
            ].forEach((key: string) =>
                columns.push(`"${translations[this.translationService.getTDPMonitoringCSVKey(key)]}"`)
            );
        });
        return columns;
    }

    private TDPMTotalsToCSVRow(totals: TDPMTotals, showType: TestTypeToShow): Array<string> {
        const rows: Array<string> = [];
        switch (showType) {
            case TestTypeToShow.PlannedAndComplete:
                rows.push(`"${totals.plannedAndCompleteSampleTotal}"`);
                break;
            case TestTypeToShow.Complete:
                rows.push(`"${totals.completeSampleTotal}"`);
                break;
            case TestTypeToShow.CompleteNoLabResultMatched:
                rows.push(`"${totals.completeWithoutLabResultSampleTotal}"`);
                break;
            default:
                rows.push('0');
        }

        totals.getSamplesAndAnalysesList().forEach((element: SampleValues | AnalysisValues) => {
            switch (showType) {
                case TestTypeToShow.PlannedAndComplete:
                    this.samplesAndAnalysesTOCSVRow(
                        rows,
                        element.inCompetitionPlannedAndCompleteCell,
                        element.outOfCompetitionPlannedAndCompleteCell
                    );
                    break;
                case TestTypeToShow.Complete:
                    this.samplesAndAnalysesTOCSVRow(
                        rows,
                        element.inCompetitionCompleteCell,
                        element.outOfCompetitionCompleteCell
                    );
                    break;
                case TestTypeToShow.CompleteNoLabResultMatched:
                    this.samplesAndAnalysesTOCSVRow(
                        rows,
                        element.inCompetitionCompleteWithoutLabResultsCell,
                        element.outOfCompetitionCompleteWithoutLabResultsCell
                    );
                    break;
                default:
                    rows.push('0');
                    rows.push('');
                    rows.push('');
                    rows.push('0');
                    rows.push('');
                    rows.push('');
            }
        });
        return rows;
    }

    private samplesAndAnalysesTOCSVRow(
        rows: Array<string>,
        inCompetitionCell: TDPMCell,
        outOfCompetitionCell: TDPMCell
    ): void {
        rows.push(
            this.valueToString(inCompetitionCell.actualValue) === ''
                ? '0'
                : this.valueToString(inCompetitionCell.actualValue)
        );
        rows.push(this.valueToString(inCompetitionCell.forecastedValue));
        rows.push(this.percentToString(inCompetitionCell.actualValue, inCompetitionCell.forecastedValue));
        rows.push(
            this.valueToString(outOfCompetitionCell.actualValue) === ''
                ? '0'
                : this.valueToString(outOfCompetitionCell.actualValue)
        );
        rows.push(this.valueToString(outOfCompetitionCell.forecastedValue));
        rows.push(this.percentToString(outOfCompetitionCell.actualValue, outOfCompetitionCell.forecastedValue));
    }

    private valueToString(value: number): string {
        return Math.round(value) === 0 ? '' : `"${Math.round(value)}"`;
    }

    private percentToString(actual: number, forecast: number): string {
        return Math.round(forecast) === 0 ? '' : `"${Math.round((actual / forecast) * 100)}%"`;
    }
}
