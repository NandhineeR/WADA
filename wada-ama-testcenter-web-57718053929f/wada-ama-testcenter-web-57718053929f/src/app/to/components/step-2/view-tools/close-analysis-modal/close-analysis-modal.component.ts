import { cloneDeep } from 'lodash-es';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Warning, AnalysisDisplay } from '@to/models';
import { Analysis, SampleTypeEnum } from '@shared/models';
import { createAnalysisDisplay, isNullOrBlank } from '@shared/utils';
import { TranslationMap, TranslationService } from '@core/services';

@Component({
    selector: 'app-close-analysis-modal',
    templateUrl: './close-analysis-modal.component.html',
    styleUrls: ['./close-analysis-modal.component.scss'],
})
export class CloseAnalysisModalComponent {
    @Output() readonly analysisToCloseEmitter: EventEmitter<AnalysisDisplay> = new EventEmitter<AnalysisDisplay>();

    @Output()
    readonly displayClosedAnalysisWarning: EventEmitter<Warning> = new EventEmitter<Warning>();

    @Input() set statusUpdateError(statusUpdateError: boolean) {
        this.inError = statusUpdateError;
        if (statusUpdateError) this.handleCloseAnalysisError();
    }

    @Input() set closedAnalysis(closedAnalysis: Analysis | undefined) {
        if (closedAnalysis) {
            this.checkAnalysisStatus(closedAnalysis);
            this.analysisToClosed = createAnalysisDisplay(undefined, undefined, closedAnalysis);
        }
    }

    alreadyClosedWarning = new Warning();

    analysisNotUpdatedWarning = new Warning();

    analysisToClosed: AnalysisDisplay | undefined = undefined;

    cannotBeClosedWarning = new Warning();

    inError = false;

    isSaveActive = false;

    showModal = false;

    constructor(private translationService: TranslationService) {}

    checkAnalysisStatus(closedAnalysis: Analysis): void {
        if (closedAnalysis.isStatusClosed()) {
            this.onCloseModal(true);
        } else if (closedAnalysis instanceof AnalysisDisplay) {
            this.analysisNotUpdatedWarning.names.push(this.displayAnalysisName(closedAnalysis));
            this.analysisNotUpdatedWarning.objectId = closedAnalysis.id;
        }
    }

    displayAnalysisName(analysisToClosed: AnalysisDisplay | undefined): string {
        let result = '';
        if (analysisToClosed?.testName) result += `${analysisToClosed?.testName} | `;
        if (analysisToClosed?.name) {
            switch (analysisToClosed?.name) {
                case SampleTypeEnum.Urine:
                    result += 'Urine ';
                    break;
                case SampleTypeEnum.Blood:
                    result += 'Blood ';
                    break;
                case SampleTypeEnum.BloodPassport:
                    result += 'Blood Passport ';
                    break;
                case SampleTypeEnum.DriedBloodSpot:
                    result += 'Dried Blood Spot ';
                    break;
                default:
                    this.translationService.translations$.subscribe((translationMap: TranslationMap) => {
                        result += translationMap[this.translationService.getErrorMessageKey('unknownAnalysisSample')];
                    });
            }
        }
        if (analysisToClosed?.attribute) result += `(${this.truncateString(analysisToClosed?.attribute)})`;
        if (analysisToClosed?.lab) result += ` | ${analysisToClosed?.lab}`;
        return result;
    }

    handleCloseAnalysisError(): void {
        if (this.analysisToClosed) {
            this.analysisNotUpdatedWarning.names.push(this.displayAnalysisName(this.analysisToClosed));
            this.analysisNotUpdatedWarning.objectId = this.analysisToClosed.id;
            this.isSaveActive = false;
        }
    }

    onCloseModal(displayMessages: boolean): void {
        this.setShowModal(false);
        if (displayMessages && this.analysisToClosed) {
            const closedWarning = new Warning();
            closedWarning.names = [this.displayAnalysisName(this.analysisToClosed)];
            this.displayClosedAnalysisWarning.emit(cloneDeep(closedWarning));
        }
    }

    onConfirm(): void {
        if (this.analysisToClosed) {
            this.analysisToCloseEmitter.emit(this.analysisToClosed);
        }
    }

    setShowModal(showModal: boolean): void {
        this.showModal = showModal;
        this.analysisNotUpdatedWarning = new Warning();
        this.alreadyClosedWarning = new Warning();
        this.cannotBeClosedWarning = new Warning();
    }

    setWarnings(analysisToClose: AnalysisDisplay | undefined): AnalysisDisplay | undefined {
        if (!analysisToClose) {
            this.translationService.translations$.subscribe((translationMap: TranslationMap) => {
                this.cannotBeClosedWarning.names.push(
                    translationMap[this.translationService.getErrorMessageKey('unknownAnalysisSample')]
                );
            });
            this.cannotBeClosedWarning.objectId = '';
            this.isSaveActive = false;
            this.inError = true;
        } else if (isNullOrBlank(analysisToClose?.id) || isNullOrBlank(analysisToClose?.testId)) {
            this.cannotBeClosedWarning.names.push(this.displayAnalysisName(analysisToClose));
            this.cannotBeClosedWarning.objectId = analysisToClose?.id || '';
            this.isSaveActive = false;
            this.inError = true;
        } else if (analysisToClose?.isStatusClosed()) {
            this.alreadyClosedWarning.names.push(this.displayAnalysisName(analysisToClose));
            this.alreadyClosedWarning.objectId = analysisToClose.id;
            this.isSaveActive = false;
            this.inError = true;
        } else {
            this.isSaveActive = true;
        }
        return analysisToClose;
    }

    show(analysisToClose: AnalysisDisplay | undefined): void {
        this.analysisToClosed = cloneDeep(this.setWarnings(analysisToClose));
        this.showModal = true;
    }

    private truncateString(inputString: string): string {
        if (!inputString) return '';

        const maxLength = 14;
        if (inputString.length <= maxLength) {
            return inputString;
        }
        return `${inputString.substring(0, maxLength)}...`;
    }

    get displayMessages(): boolean {
        return !isNullOrBlank(this.analysisToClosed?.id.toString()) && !this.inError;
    }
}
