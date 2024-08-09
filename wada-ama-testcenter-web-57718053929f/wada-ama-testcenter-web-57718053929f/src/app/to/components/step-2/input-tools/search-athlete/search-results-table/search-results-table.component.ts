import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import {
    ModalStatus,
    SearchAthleteResult,
    SearchAthleteRow,
    SearchAthleteRowColumnNames,
    Test,
    TestingOrderMode,
} from '@to/models';
import * as fromRootStore from '@core/store';
import { ColumnDef, FieldsSecurity, InfoBubbleSourceEnum, TOActionRight } from '@shared/models';
import * as fromStore from '@to/store';
import { mapSearchAthleteToAthleteRows } from '@to/mappers';
import { TranslationMap, TranslationService } from '@core/services';
import { formatDisplayDate, isNullOrBlank } from '@shared/utils';
import { map } from 'rxjs/operators';
import { BaseAddAthleteComponent } from '../../base-add-athlete/base-add-athlete.component';

@Component({
    selector: 'app-search-results-table',
    templateUrl: './search-results-table.component.html',
    styleUrls: ['./search-results-table.component.scss'],
})
export class SearchResultsTableComponent extends BaseAddAthleteComponent implements OnInit {
    readonly actionRight = TOActionRight;

    readonly infoBubbleSource = InfoBubbleSourceEnum.Warning;

    @ViewChild('athleteIdHeaderToDisplayAdamsId', { static: true }) set athleteIdHeaderToDisplayAdamsId(
        template: TemplateRef<any>
    ) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.ATHLETE_ID, template);
    }

    @ViewChild('athleteHeader', { static: true }) set athleteHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.NAME, template);
    }

    @ViewChild('genderHeader', { static: true }) set genderHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.SEX, template);
    }

    @ViewChild('sportNationalityHeader', { static: true })
    set sportNationalityHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.SPORT_NATIONALITY, template);
    }

    @ViewChild('sportDisciplineHeader', { static: true })
    set sportDisciplineHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.SPORT_DISCIPLINES, template);
    }

    @ViewChild('dateOfBirthHeader', { static: true }) set dateOfBirthHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.DATE_OF_BIRTH, template);
    }

    @ViewChild('formerLastNameHeader', { static: true })
    set formerLastNameHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.FORMER_LAST_NAME, template);
    }

    @ViewChild('preferredNameHeader', { static: true }) set preferredNameHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.PREFERRED_NAME, template);
    }

    @ViewChild('ageHeader', { static: true }) set ageHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.AGE, template);
    }

    @ViewChild('rtpHeader', { static: true }) set rtpHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.TESTING_POOL_TYPES, template);
    }

    @ViewChild('custodianHeader', { static: true }) set custodianHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.WHEREABOUTS_CUSTODIAN, template);
    }

    @ViewChild('abpHeader', { static: true }) set abpHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.PASSPORT_CUSTODIAN, template);
    }

    @ViewChild('nfHeader', { static: true }) set nfHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.NATIONAL_FEDERATIONS, template);
    }

    @ViewChild('teamsHeader', { static: true }) set teamsHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.TEAMS, template);
    }

    @ViewChild('adamsIdHeader', { static: true }) set adamsIdHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.ADAMS_ID, template);
    }

    @ViewChild('abpIdHeader', { static: true }) set abpIdHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.BP_NUMBER, template);
    }

    @ViewChild('ifIdHeader', { static: true }) set ifIdHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.IF_ID, template);
    }

    @ViewChild('nfIdHeader', { static: true }) set nfIdHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.NF_ID, template);
    }

    @ViewChild('nadoIdHeader', { static: true }) set nadoIdHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.NADO_ID, template);
    }

    @ViewChild('retiredHeader', { static: true }) set retiredHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.RETIRED_ATHLETE, template);
    }

    @ViewChild('latestTestHeader', { static: true }) set latestTestHeader(template: TemplateRef<any>) {
        this.setHeaderTemplate(SearchAthleteRowColumnNames.LATEST_TEST, template);
    }

    @Input() isBindAthlete = false;

    @Input() isSearchAthletes = false;

    @Input() isTOIssued = false;

    @Input() loadingSearch = false;

    @Input() searchStringText = '';

    @Input() selectedTestId = '';

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    inCreation$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Create)
    );

    translations$ = this.translationService.translations$;

    showAll = false;

    redirectToDCFCreation = false;

    columns: Array<Partial<ColumnDef<SearchAthleteRow>>> = [
        {
            key: SearchAthleteRowColumnNames.ATHLETE_ID,
            headerTemplate: this.athleteIdHeaderToDisplayAdamsId,
            cell: (e) => e.adamsId,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
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
            key: SearchAthleteRowColumnNames.DATE_OF_BIRTH,
            headerTemplate: this.dateOfBirthHeader,
            cell: (e) => formatDisplayDate(e.dateOfBirth),
            mandatory: false,
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
            key: SearchAthleteRowColumnNames.FORMER_LAST_NAME,
            headerTemplate: this.formerLastNameHeader,
            cell: (e) => e.formerLastName,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.PREFERRED_NAME,
            headerTemplate: this.preferredNameHeader,
            cell: (e) => e.preferredName,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.AGE,
            headerTemplate: this.ageHeader,
            cell: (e) => e.age,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.TESTING_POOL_TYPES,
            headerTemplate: this.rtpHeader,
            cell: (e) => e.testingPoolTypes,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.WHEREABOUTS_CUSTODIAN,
            headerTemplate: this.custodianHeader,
            cell: (e) => e.whereaboutsCustodianOrganization,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.PASSPORT_CUSTODIAN,
            headerTemplate: this.abpHeader,
            cell: (e) => e.passportCustodian,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.NATIONAL_FEDERATIONS,
            headerTemplate: this.nfHeader,
            cell: (e) => e.nationalFederations,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.TEAMS,
            headerTemplate: this.teamsHeader,
            cell: (e) => e.teams,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.ADAMS_ID,
            headerTemplate: this.adamsIdHeader,
            cell: (e) => e.adamsId,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.BP_NUMBER,
            headerTemplate: this.abpIdHeader,
            cell: (e) => e.bloodPassportIdNumber,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.IF_ID,
            headerTemplate: this.ifIdHeader,
            cell: (e) => e.ifIdNumber,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.NF_ID,
            headerTemplate: this.nfIdHeader,
            cell: (e) => e.nfIdNumber,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.NADO_ID,
            headerTemplate: this.nadoIdHeader,
            cell: (e) => e.naDOIdNumber,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
        },
        {
            key: SearchAthleteRowColumnNames.RETIRED_ATHLETE,
            headerTemplate: this.retiredHeader,
            cell: (e) => e.retiredAthlete,
            mandatory: false,
            hasFiltering: true,
            hasSorting: true,
            default: false,
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
        public store: Store<fromRootStore.IState>,
        public router: Router,
        private translationService: TranslationService
    ) {
        super(store, router);
        this.isFromSearch = true;
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.pipe(select(fromStore.getTOTests)).subscribe((tests: Array<Test>) => {
                this.testsFromTestingOrder = tests;
            })
        );

        this.subscriptions.add(
            combineLatest([
                this.store.pipe(select(fromStore.getSearchedAthleteResult)),
                this.translationService.translations$,
            ]).subscribe(([athletes, translation]: [Array<SearchAthleteResult>, TranslationMap]) => {
                this.showAll = false;
                this.possibleAthletes = athletes;
                this.possibleAthleteRows = mapSearchAthleteToAthleteRows(
                    athletes,
                    translation,
                    this.translationService
                );
                this.dataSource.data = this.possibleAthleteRows.filter((ath: SearchAthleteRow) => ath.accessible);
            })
        );
    }

    /**
     * Dispatch action for binding athlete to test
     */
    bindAthleteToTest(isValidated: boolean, navigateToDCF?: boolean): void {
        this.redirectToDCFCreation = navigateToDCF || this.redirectToDCFCreation;
        if (
            isValidated ||
            (!this.isAthleteDuplicate() && !isNullOrBlank(this.selectedTestId) && this.selectedAthletes.length > 0)
        ) {
            this.store.dispatch(
                fromStore.Step2BindAthleteToTest({
                    testId: this.selectedTestId,
                    athleteId: this.selectedAthletes[0].id,
                })
            );
            if (this.redirectToDCFCreation) {
                this.navigateToDCF();
            } else {
                this.navigateToViewTO();
                this.closeModal();
            }
        }
    }

    /**
     * Redirects to dcf page
     */
    navigateToDCF(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { from: 'to', testId: this.selectedTestId },
        };
        this.router.navigate(['/dcf/new/step/1'], navigationExtras);
    }

    /**
     * Redirects to view TO page
     */
    navigateToViewTO(): void {
        this.router.navigate([this.urlWithoutParenthesis]);
    }

    redirectOnConfirm(status: ModalStatus): void {
        switch (status) {
            case ModalStatus.add:
                if (this.isSearchAthletes) {
                    this.addAthlete();
                } else {
                    this.bindAthleteToTest(true);
                }
                break;
            case ModalStatus.cancel:
                this.resetSearchAthletesData();
                break;
            default:
                break;
        }
    }

    showAllAthlete(): void {
        this.showAll = !this.showAll;
        this.dataSource.data = this.showAll
            ? this.possibleAthleteRows
            : this.possibleAthleteRows.filter((ath: SearchAthleteRow) => ath.accessible);
    }

    /**
     * Skip DCF creation ->  execute action add athlete to TO
     */
    skipDCFCreation(): void {
        if (!this.isAthleteDuplicate()) {
            this.redirectToDCFCreation = false;
            this.bindAthleteToTest(true);
        }
    }

    private setHeaderTemplate(columnName: string, template: TemplateRef<any>) {
        (this.columns.find((column) => column.key === columnName) || {}).headerTemplate = template;
        this.columns = this.columns.slice();
    }
}
