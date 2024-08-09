import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    AthleteAndAnalysesInformation,
    AthleteAndAnalysesUtils,
    TestStatusUpdate,
    TestsMover,
    Test,
    TestStatuses,
    TestingOrder,
    AnalysisDisplay,
} from '@to/models';
import { RouterStateUrl } from '@core/store';
import { Analysis, SpecificCode, TOFormControls } from '@shared/models';

@Component({
    selector: 'app-athletes-and-analyses',
    templateUrl: './athletes-and-analyses.component.html',
})
export class AthletesAndAnalysesComponent {
    readonly controls = TOFormControls;

    readonly fields = AthleteAndAnalysesUtils.requiredFields;

    @Output() readonly analysisToCloseEmitter: EventEmitter<AnalysisDisplay> = new EventEmitter<AnalysisDisplay>();

    @Output()
    readonly cleanCancelledTestsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly cleanClosedAnalysisEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly cleanClosedTestsEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output() readonly errors = new EventEmitter<boolean>();

    @Output() readonly moveToTOEmitter = new EventEmitter<TestsMover>();

    @Output() readonly testsToCancelEmitter: EventEmitter<Array<TestStatusUpdate>> = new EventEmitter<
        Array<TestStatusUpdate>
    >();

    @Output() readonly testsToCloseEmitter: EventEmitter<Array<TestStatusUpdate>> = new EventEmitter<
        Array<TestStatusUpdate>
    >();

    @Input() actions: Array<string> = [];

    @Input() set athleteAndAnalyses(info: AthleteAndAnalysesInformation | null) {
        this._athleteAndAnalyses = info;
        if (info) this.checkErrors();
    }

    get athleteAndAnalyses(): AthleteAndAnalysesInformation | null {
        return this._athleteAndAnalyses;
    }

    @Input() cancelledTests: Array<Test> = [];

    @Input() canWrite = false;

    @Input() clearTableWarnings = false;

    @Input() closedAnalysis: Analysis | undefined;

    @Input() closedTests: Array<Test> = [];

    @Input() isBplrReaderOrWriter = false;

    @Input() isLrReaderOrWriter = false;

    @Input() missionOrderId = null;

    @Input() routeState?: RouterStateUrl;

    @Input() status = '';

    @Input() statusUpdateError = false;

    @Input() testStatuses: TestStatuses | null = null;

    @Input() testingOrder: TestingOrder | null = null;

    @Input() testingOrderId = null;

    @Input() toEndDate: Date | null = null;

    @Input() toStartDate: Date | null = null;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    missingFields = new Set<string>();

    private _athleteAndAnalyses: AthleteAndAnalysesInformation | null = null;

    cancelTests(testsToCancel: Array<TestStatusUpdate>): void {
        this.testsToCancelEmitter.emit(testsToCancel);
    }

    cleanCancelledTests(): void {
        this.cleanCancelledTestsEmitter.emit(true);
    }

    cleanClosedAnalysis(): void {
        this.cleanClosedAnalysisEmitter.emit(true);
    }

    cleanClosedTests(): void {
        this.cleanClosedTestsEmitter.emit(true);
    }

    closeAnalysis(analysis: AnalysisDisplay): void {
        this.analysisToCloseEmitter.emit(analysis);
    }

    closeTests(testsToClose: Array<TestStatusUpdate>): void {
        this.testsToCloseEmitter.emit(testsToClose);
    }

    moveToTestingOrder(testsToMove: TestsMover): void {
        this.moveToTOEmitter.emit(testsToMove);
    }

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingFields = AthleteAndAnalysesUtils.missingFields();
        const hasMissingFields = this.missingFieldsCount > 0;
        setTimeout(() => this.errors.emit(hasMissingFields));
    }

    get missingFieldsCount(): number {
        return this.status === SpecificCode.Cancel ? 0 : this.missingFields.size;
    }
}
