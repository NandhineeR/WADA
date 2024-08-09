import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ConfirmLeaveComponent, DataTableComponent } from '@shared/components';
import { Analysis, AnalysisAttribute, DataSource, SportDiscipline } from '@shared/models';
import { Athlete, SearchAthleteResult, SearchAthleteRow, Test, TestRow } from '@to/models';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { Store } from '@ngrx/store';
import { convertSearchAthleteToTest } from '@to/mappers';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

@Component({
    selector: 'app-base-add-athlete-component',
    template: '',
})
export class BaseAddAthleteComponent {
    readonly MAX_NUMBER_OF_TESTS = 200;

    @ViewChild(DataTableComponent)
    dataTableComponent?: DataTableComponent<TestRow>;

    @ViewChild('duplicateAthlete', { static: true })
    duplicateAthleteRef?: ConfirmLeaveComponent;

    @Output()
    readonly closeModalEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    readonly numberOfAthletesExcessEmitter: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    readonly resetResearchEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() urlWithoutParenthesis = '';

    @Input() sportDisciplines: Array<SportDiscipline> = [];

    dataSource = new DataSource(Array<SearchAthleteRow>());

    duplicateAthletes: Array<Test> = [];

    duplicateAthletesString: Array<string> = [];

    /* flag used to determine if the component extending this one is the search athlete or the add from group */
    isFromSearch = false;

    maxNumberOfAthletesExceeded = false;

    numberOfAthletesExcess = 0;

    possibleAthleteRows: Array<SearchAthleteRow> = [];

    possibleAthletes: Array<SearchAthleteResult> = [];

    selectedAthletes: Array<SearchAthleteRow> = [];

    selectedAthletesOrTest: Array<SearchAthleteResult | Test> = [];

    selectedRowCount = 0;

    subscriptions: Subscription = new Subscription();

    tempIdsSelected?: Array<string>;

    testsFromTestingOrder: Array<Test> = [];

    constructor(public store: Store<fromRootStore.IState>, public router: Router) {}

    addAnalysesToAthlete(): void {
        this.validateNumberOfAthletes();
        if (!this.maxNumberOfAthletesExceeded && !this.isAthleteDuplicate()) {
            this.addAthleteToTempTestRow();
            this.navigateToAnalysesModal();
        }
    }

    addAthlete(): void {
        this.resetSearchAthletesData();
        this.store.dispatch(
            fromStore.Step2AddAthletesAsATest({
                addedAthletes: convertSearchAthleteToTest(this.selectedAthletesOrTest, this.sportDisciplines),
            })
        );
        this.closeModal();
    }

    addAthleteToTempTestRow(): void {
        this.resetSearchAthletesData();
        this.store.dispatch(
            fromStore.Step2AddTemporaryTests({
                addedTests: convertSearchAthleteToTest(this.selectedAthletesOrTest, this.sportDisciplines),
            })
        );
    }

    buildAnalysisAttributes(analysis: Analysis): string {
        let result = '';
        analysis.sampleAnalysisAttributes.forEach((analysisAttribute: AnalysisAttribute, index: number) => {
            result += `${analysisAttribute.analysisDescription.shortDescription}`;
            if (index + 1 !== analysis.sampleAnalysisAttributes.length) {
                result += ', ';
            }
        });
        return result;
    }

    buildAnalyses(analyses: Array<Analysis>): string {
        let result = '';
        analyses.forEach((analysis: Analysis, index: number) => {
            let sample = `${analysis.sampleType.description} `;
            if (analysis.sampleAnalysisAttributes.length > 0) {
                sample += '(';
            }
            const attribute = this.buildAnalysisAttributes(analysis);
            if (analysis.sampleAnalysisAttributes.length > 0) {
                result += `${sample}${attribute})`;
            } else {
                result += `${sample}${attribute}`;
            }
            if (index + 1 !== analyses.length) {
                result += ', ';
            }
        });
        return result;
    }

    buildDuplicateAthletesString(duplicateAthlete: Array<Test>): Array<string> {
        this.duplicateAthletesString = duplicateAthlete.map((test: Test) => {
            const name = this.buildName(test);
            const analyses = this.buildAnalyses(test.analyses);
            return `${name}${analyses}`;
        });
        return this.duplicateAthletesString;
    }

    buildName(test: Test): string {
        return `${test.athlete && test.athlete.lastName}, ${test.athlete && test.athlete.firstName}${
            test.analyses && test.analyses.length > 0 ? ' - ' : ''
        }`;
    }

    cleanDataTableSelection(): void {
        if (this.dataTableComponent) {
            this.dataTableComponent.selection.clear();
            this.tempIdsSelected = [];
            this.selectedRowCount = 0;
        }
    }

    closeModal(): void {
        this.closeModalEmitter.emit(true);
    }

    getDuplicateAthlete(): Array<Test> {
        let added = false;
        this.selectedAthletes.forEach((athlete: SearchAthleteRow) => {
            this.testsFromTestingOrder.forEach((test: Test) => {
                if (test.athlete && test.athlete.id && test.athlete.id.toString() === athlete.id) {
                    const updatedTest = new Test(test);
                    updatedTest.tempId = athlete.tempId;
                    this.duplicateAthletes.push(test);
                    if (!added) {
                        this.selectedAthletesOrTest.push(test);
                    }
                    added = true;
                }
            });
            if (!added) {
                const findAthlete = this.possibleAthletes.find((ath: SearchAthleteResult) => ath.id === athlete.id);
                const findAthleteClone = new SearchAthleteResult(findAthlete);
                findAthleteClone.tempId = athlete.tempId;
                findAthleteClone.originalAthlete = new Athlete(athlete.originalAthlete);
                if (findAthleteClone?.sportDisciplines && findAthleteClone.sportDisciplines?.length > 1) {
                    findAthleteClone.sportDisciplines = [];
                }
                this.selectedAthletesOrTest.push(findAthleteClone);
            }
            added = false;
        });
        return this.duplicateAthletes;
    }

    isAthleteDuplicate(): boolean {
        if (this.duplicateAthletes.length > 0) {
            this.showCancelCreateModal();
            return true;
        }
        return false;
    }

    navigateToAnalysesModal(): void {
        const navigationExtras: NavigationExtras = {
            state: this.tempIdsSelected,
            queryParams: { isSearchAthlete: true },
            skipLocationChange: true,
        };
        this.router.navigate(
            [
                this.urlWithoutParenthesis,
                {
                    outlets: {
                        modal: ['add-athlete', 'add-analyses-athlete'],
                    },
                },
            ],
            navigationExtras
        );
        this.cleanDataTableSelection();
    }

    resetSearchAthletesData(): void {
        if (this.isFromSearch) {
            this.store.dispatch(fromStore.Step2SearchAthletesClear());
            this.dataSource.data = new Array<SearchAthleteRow>();
            this.resetResearchEmitter.emit(true);
        }
    }

    showCancelCreateModal(): void {
        if (this.duplicateAthleteRef) {
            this.duplicateAthleteRef.show();
        }
    }

    skipAnalyses(): void {
        this.validateNumberOfAthletes();
        if (!this.maxNumberOfAthletesExceeded && !this.isAthleteDuplicate()) {
            this.addAthlete();
        }
    }

    updateSelections($event: Array<SearchAthleteRow>): void {
        this.tempIdsSelected = $event.map((testRowId) => testRowId.tempId);
        this.selectedRowCount = $event.length;
        this.selectedAthletes = $event;
        this.duplicateAthletes = [];
        this.selectedAthletesOrTest = [];
        this.getDuplicateAthlete();
        this.buildDuplicateAthletesString(this.duplicateAthletes);
        this.validateNumberOfAthletes();
    }

    validateNumberOfAthletes(): void {
        const excess = this.testsFromTestingOrder.length + this.selectedAthletes.length - this.MAX_NUMBER_OF_TESTS;
        this.maxNumberOfAthletesExceeded = excess > 0;
        this.numberOfAthletesExcessEmitter.emit(excess);
    }
}
