import * as fromRootStore from '@core/store';
import { ColumnDef, DataSource, FieldsSecurity, TOActionRight } from '@shared/models';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromStore from '@to/store';
import { ModalStatus, SearchAthleteResult, SearchAthleteRow, SearchAthleteRowColumnNames, Test } from '@to/models';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationMap, TranslationService } from '@core/services';
import { formatDisplayDate } from '@shared/utils';
import { mapSearchAthleteToAthleteRows } from '@to/mappers';
import { BaseAddAthleteComponent } from '../../base-add-athlete/base-add-athlete.component';

@Component({
    selector: 'app-add-athlete-from-group-table',
    templateUrl: './add-athlete-from-group-table.component.html',
    styleUrls: ['./add-athlete-from-group-table.component.scss'],
})
export class AddAthleteFromGroupTableComponent extends BaseAddAthleteComponent implements OnDestroy, OnInit {
    readonly actionRight = TOActionRight;

    @ViewChild('athleteHeader', { static: true }) set athleteHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.NAME, template);
    }

    @ViewChild('genderHeader', { static: true }) set genderHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.SEX, template);
    }

    @ViewChild('sportDisciplineHeader', { static: true })
    set sportDisciplineHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.SPORT_DISCIPLINES, template);
    }

    @ViewChild('sportNationalityHeader', { static: true })
    set sportNationalityHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.SPORT_NATIONALITY, template);
    }

    @ViewChild('latestTestHeader', { static: true }) set latestTestHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.LATEST_TEST, template);
    }

    @Output()
    readonly updateSelectionEmitter: EventEmitter<Array<SearchAthleteRow>> = new EventEmitter<
        Array<SearchAthleteRow>
    >();

    @Input() set athletesFromGroup(athletesFromGroup: Array<SearchAthleteResult>) {
        this.initializeData(athletesFromGroup);
    }

    @Input() fieldsSecurity: FieldsSecurity | null = null;

    // used by the parent to identify children
    @Input() groupId = '';

    @Input() inCreation = false;

    @Input() isTOIssued = false;

    translations$ = this.translationService.translations$;

    athletesFromGroupOrTests: Array<SearchAthleteResult | Test> = [];

    athletesFromGroupRows: Array<SearchAthleteRow> = [];

    dataSource = new DataSource(Array<SearchAthleteRow>());

    hasError = false;

    subscriptions: Subscription = new Subscription();

    columns: Array<Partial<ColumnDef<SearchAthleteRow>>> = [
        {
            key: SearchAthleteRowColumnNames.NAME,
            headerTemplate: this.athleteHeader,
            cell: (e) => e.name,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: SearchAthleteRowColumnNames.SEX,
            headerTemplate: this.genderHeader,
            cell: (e) => e.sex,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: SearchAthleteRowColumnNames.SPORT_NATIONALITY,
            headerTemplate: this.sportNationalityHeader,
            cell: (e) => e.sportNationality,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: SearchAthleteRowColumnNames.SPORT_DISCIPLINES,
            headerTemplate: this.sportDisciplineHeader,
            cell: (e) => e.sportDisciplines,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: SearchAthleteRowColumnNames.LATEST_TEST,
            headerTemplate: this.latestTestHeader,
            cell: (e) => formatDisplayDate(e.latestTest),
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
    ];

    constructor(
        public router: Router,
        public store: Store<fromRootStore.IState>,
        private translationService: TranslationService
    ) {
        super(store, router);
        this.isFromSearch = false;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.cleanDataTableSelection();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.pipe(select(fromStore.getTOTests)).subscribe((tests: Array<Test>) => {
                this.testsFromTestingOrder = tests;
            })
        );
    }

    initializeData(athletesFromGroup: Array<SearchAthleteResult>): void {
        this.subscriptions.add(
            this.translationService.translations$.subscribe((translations: TranslationMap) => {
                this.possibleAthletes = athletesFromGroup;
                this.possibleAthleteRows = mapSearchAthleteToAthleteRows(
                    athletesFromGroup,
                    translations,
                    this.translationService
                );
                this.dataSource.data = this.possibleAthleteRows;
            })
        );
    }

    redirectOnConfirm(status: ModalStatus): void {
        if (status === ModalStatus.add) this.addAthlete();
    }

    private setHeaderTemplate(columnName: string, template: TemplateRef<any>) {
        (this.columns.find((column) => column.key === columnName) || {}).headerTemplate = template;
        this.columns = this.columns.slice();
    }
}
