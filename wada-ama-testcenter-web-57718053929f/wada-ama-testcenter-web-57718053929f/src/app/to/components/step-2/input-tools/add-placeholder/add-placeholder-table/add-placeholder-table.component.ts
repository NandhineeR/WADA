import * as fromRootStore from '@core/store';
import { ColumnDef, DataSource, FieldsSecurity, SportDiscipline, TOActionRight } from '@shared/models';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromStore from '@to/store';
import { PlaceHolderRow, TestRow, TestingOrderMode } from '@to/models';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { mapPlaceholderRowToTest } from '@to/mappers';
import { DropdownComponent } from '@shared/components';
import { DropdownElementDirective } from '@shared/directives/dropdown-element.directive';
import { TranslationService } from '@core/services';
import { TableTranslationService } from '@shared/services';
import { map } from 'rxjs/operators';
import { getSportDisciplineSuggestions } from '@shared/utils';

@Component({
    selector: 'app-add-placeholder-table',
    templateUrl: './add-placeholder-table.component.html',
    styleUrls: ['./add-placeholder-table.component.scss'],
})
export class AddPlaceholderTableComponent implements OnInit {
    readonly MAXIMUM_ROWS_NUMBER = 99;

    readonly actionRight = TOActionRight;

    readonly genders = [
        { description: 'Male', value: 'M' },
        { description: 'Female', value: 'F' },
        { description: 'X(Unknown)', value: 'XU' },
    ];

    @ViewChild(DropdownComponent) dropDown?: DropdownComponent;

    @Input() activateActions = true;

    @Input() isTOIssued = false;

    @Input() showError = false;

    @Input() showErrorSportDiscipline = false;

    @Input() routerLink = '';

    @Input() urlWithoutParenthesis = '';

    @Output()
    readonly confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    inCreation$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Create)
    );

    sportsDisciplines$: Observable<Array<SportDiscipline>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesSportDisciplines)
    );

    translations$ = this.translationService.translations$;

    dataSource = new DataSource(Array<PlaceHolderRow>());

    defaultElement: DropdownElementDirective | undefined;

    deleteRowIcon = false;

    maximumNumber = 0;

    numberOfTests = 0;

    showModal = false;

    subscriptions: Subscription = new Subscription();

    testRows?: Array<TestRow>;

    columns: Array<Partial<ColumnDef<PlaceHolderRow>>> = [
        {
            key: 'placeholder',
            header: this.getHeaderTranslation('placeholder'),
            cell: (e) => e.placeholder,
            mandatory: true,
            columnWidth: true,
        },
        {
            key: 'sportDiscipline',
            header: this.getHeaderTranslation('sportsDiscipline'),
            cell: (e) => e.sportDiscipline || '',
            mandatory: true,
            columnWidth: true,
        },
        {
            key: 'gender',
            header: this.getHeaderTranslation('sex'),
            cell: (e) => e.gender,
            mandatory: true,
            columnWidth: true,
        },
        {
            key: 'button',
            header: '',
            cell: () => {},
            mandatory: true,
            columnWidth: true,
        },
    ];

    constructor(
        private router: Router,
        private store: Store<fromRootStore.IState>,
        private tableTranslationService: TableTranslationService,
        private translationService: TranslationService
    ) {}

    ngOnInit(): void {
        this.deleteRowIcon = true;
        this.dataSource.data.push(new PlaceHolderRow());
        this.store.select(fromStore.getTOTestRows).subscribe((testRows) => {
            if (testRows) {
                this.testRows = testRows;
                this.numberOfTests = testRows.length;
            }
        });

        this.calculateRows();
    }

    addAthleteToTempTestRow(): void {
        // need to convert search athlete to test before adding
        const testsAdded = this.dataSource.data.map((placeholderRow: PlaceHolderRow) =>
            mapPlaceholderRowToTest(placeholderRow)
        );
        this.store.dispatch(fromStore.Step2AddTemporaryTests({ addedTests: testsAdded }));
    }

    addRow(): void {
        this.dataSource.data = [...this.dataSource.data, new PlaceHolderRow()];
        this.calculateRows();

        setTimeout(() =>
            document.getElementById('addNewPlaceholderButton')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        );
    }

    calculateRows(): void {
        this.maximumNumber = this.dataSource.data.length + this.numberOfTests;
    }

    copyRow(element: any): void {
        this.dataSource.data = [...this.dataSource.data, new PlaceHolderRow(element)];
        this.calculateRows();

        setTimeout(() => {
            document.getElementById(`input-placeholder-${this.dataSource.data.length - 1}`)?.focus();
            document.getElementById('addNewPlaceholderButton')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.subscriptions.add(
            this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
                headerTranslation = value;
            })
        );
        return headerTranslation;
    }

    onAddAnalyses(): void {
        this.showErrorMessage();
        if (!this.showErrorSportDiscipline && !this.showError) {
            this.addAthleteToTempTestRow();
            const navigationExtras: NavigationExtras = {
                queryParams: { isPlaceholder: true },
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
        }
    }

    onDelete(): void {
        this.onSelectSportDiscipline();
        this.maximumNumber -= 1;
        if (this.maximumNumber <= this.MAXIMUM_ROWS_NUMBER) {
            this.showError = false;
        }
    }

    onSelectSportDiscipline(): void {
        if (this.showErrorSportDiscipline === true) {
            let isAllRowsFilled = true;
            this.dataSource.data.forEach((row: any) => {
                if (row.sportDiscipline == null) {
                    isAllRowsFilled = false;
                }
            });
            if (isAllRowsFilled === true) {
                this.showErrorSportDiscipline = false;
            }
        }
    }

    setSportDisciplineError(): void {
        this.showErrorSportDiscipline = false;
        this.dataSource.data.forEach((row: any) => {
            if (row.sportDiscipline == null) {
                this.showErrorSportDiscipline = true;
            }
        });
    }

    showErrorMessage(): void {
        if (this.maximumNumber > this.MAXIMUM_ROWS_NUMBER) {
            this.showError = true;
        }
        this.setSportDisciplineError();
    }

    sportDisciplineSuggestions = (token: string): Observable<Array<SportDiscipline>> => {
        return getSportDisciplineSuggestions(token, this.sportsDisciplines$);
    };

    submitData(): void {
        this.showErrorMessage();
        if (!this.showErrorSportDiscipline && !this.showError) {
            const newTests = this.dataSource.data.map((placeholderRow: PlaceHolderRow) =>
                mapPlaceholderRowToTest(placeholderRow)
            );
            this.store.dispatch(fromStore.Step2AddPlaceholderAsATest({ tests: newTests }));
            this.router.navigate([this.router.url.split('(')[0]]);
        }
    }
}
