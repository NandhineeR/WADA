import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ColumnDef, DataSource, FieldsSecurity, GenericActivity } from '@shared/models';
import { ActivityColumnNamesEnum } from '@shared/models/enums/activity-column-names.enum';
import { TableTranslationService } from '@shared/services';
import * as fromRootStore from '@core/store';
import * as fromDCFStore from '@dcf/store';
import { RouterStateUrl } from '@core/store';
import { select, Store } from '@ngrx/store';
import { DCF_MODULE_NAME, TESTING_ORDER } from '@shared/utils/module-name';
import { Observable, Subscription, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { isNotNull } from '@shared/utils';
import { DataTableComponent } from '../data-table/data-table.component';

@Component({
    selector: 'app-activity-table',
    templateUrl: './activity-table.component.html',
    styleUrls: ['./activity-table.component.scss'],
})
export class ActivityTableComponent implements OnInit, OnDestroy {
    readonly SAMPLE_VALIDITY_ACTIVITY_SUBJECT = 'Sample validity modification';

    @ViewChild('createdByHeader', { static: true }) set createdByHeader(template: TemplateRef<any>) {
        const createdByHeaderColumn = this.columns.find((column) => column.key === ActivityColumnNamesEnum.CREATED_BY);
        if (createdByHeaderColumn) createdByHeaderColumn.headerTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChild('lastUpdatedByHeader', { static: true }) set lastUpdatedByHeader(template: TemplateRef<any>) {
        const lastUpdatedByHeaderColumn = this.columns.find(
            (column) => column.key === ActivityColumnNamesEnum.LAST_UPDATED_BY
        );
        if (lastUpdatedByHeaderColumn) lastUpdatedByHeaderColumn.headerTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChild('referenceDateHeader', { static: true }) set referenceDateHeader(template: TemplateRef<any>) {
        const referenceDateHeaderColumn = this.columns.find(
            (column) => column.key === ActivityColumnNamesEnum.REFERENCE_DATE
        );
        if (referenceDateHeaderColumn) referenceDateHeaderColumn.headerTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChild('referenceDateTemplate', { static: true }) set referenceDateTemplate(template: TemplateRef<any>) {
        const referenceDateColumn = this.columns.find(
            (column) => column.key === ActivityColumnNamesEnum.REFERENCE_DATE
        );
        if (referenceDateColumn) referenceDateColumn.cellTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChild('subjectHeader', { static: true }) set subjectHeader(template: TemplateRef<any>) {
        const subjectHeaderColumn = this.columns.find((column) => column.key === ActivityColumnNamesEnum.SUBJECT);
        if (subjectHeaderColumn) subjectHeaderColumn.headerTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChild('organizationHeader', { static: true }) set organizationHeader(template: TemplateRef<any>) {
        const organizationHeaderColumn = this.columns.find(
            (column) => column.key === ActivityColumnNamesEnum.ORGANIZATION
        );
        if (organizationHeaderColumn) organizationHeaderColumn.headerTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChild('table', { static: true }) set table(component: DataTableComponent<GenericActivity>) {
        this._table = component;
    }

    @ViewChild('typeHeader', { static: true }) set typeHeader(template: TemplateRef<any>) {
        const typeHeaderColumn = this.columns.find((column) => column.key === ActivityColumnNamesEnum.TYPE);
        if (typeHeaderColumn) typeHeaderColumn.headerTemplate = template;
        this.columns = this.columns.slice();
    }

    @Input() athleteId = '';

    @Input() dataSource = new DataSource(Array<GenericActivity>());

    @Input() error = false;

    @Input() loading = false;

    @Input() ownerId = '';

    @Input() targetObject = '';

    @Input() userHasCreateRoles = false;

    athleteId$: Observable<number | null> = of(null);

    fromDCF$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getActiveRoute),
        map((routerState: RouterStateUrl) => routerState.url.split('#')[0].includes(DCF_MODULE_NAME)),
        tap((fromDCF: boolean) => {
            this.fromDCF = fromDCF;
        })
    );

    canReadSampleValidity$ = this.fromDCF$.pipe(
        filter(Boolean),
        switchMap(() => this.store.pipe(select(fromDCFStore.getFieldsSecurity))),
        filter(isNotNull),
        map((fieldsSecurity: FieldsSecurity) => fieldsSecurity.fields),
        tap((fields: Map<string, string>) => {
            if (fields && Object.prototype.toString.call(fields).includes('Map')) {
                this.canReadSampleValidity = fields.has('valid');
            } else if (fields && Object.prototype.toString.call(fields).includes('Object')) {
                this.canReadSampleValidity = new Map<string, string>(Object.entries(fields)).has('valid');
            }
        })
    );

    dcfId$: Observable<number | null> = of(null);

    fromTO$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getActiveRoute),
        map((routerState: RouterStateUrl) => routerState.url.split('#')[0].includes(TESTING_ORDER)),
        tap((fromTO: boolean) => {
            this.fromTO = fromTO;
        })
    );

    toId$: Observable<number | null> = of(null);

    _table: DataTableComponent<GenericActivity> | null = null;

    abpAccess = this.route?.snapshot?.queryParams?.abpAccess || '';

    canReadSampleValidity = false;

    columns: Array<Partial<ColumnDef<GenericActivity>>> = [
        {
            key: ActivityColumnNamesEnum.REFERENCE_DATE,
            header: this.getHeaderTranslation('referenceDate'),
            headerTemplate: this.referenceDateHeader,
            cellTemplate: this.referenceDateTemplate,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: ActivityColumnNamesEnum.SUBJECT,
            header: this.getHeaderTranslation('subject'),
            headerTemplate: this.subjectHeader,
            cell: (e) => e.subject,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: ActivityColumnNamesEnum.TYPE,
            header: this.getHeaderTranslation('activityType'),
            headerTemplate: this.typeHeader,
            cell: (e) => e.type,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: ActivityColumnNamesEnum.CREATED_BY,
            header: this.getHeaderTranslation('createdBy'),
            headerTemplate: this.createdByHeader,
            cell: (e) => e.createdBy,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: ActivityColumnNamesEnum.ORGANIZATION,
            header: this.getHeaderTranslation('modUserOrgShortName'),
            headerTemplate: this.organizationHeader,
            cell: (e) => e.modUserOrgShortName,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
        {
            key: ActivityColumnNamesEnum.LAST_UPDATED_BY,
            header: this.getHeaderTranslation('lastUpdatedBy'),
            headerTemplate: this.lastUpdatedByHeader,
            cell: (e) => e.lastUpdatedBy,
            mandatory: true,
            hasFiltering: true,
            hasSorting: true,
            default: true,
        },
    ];

    fromDCF = false;

    fromTO = false;

    private subscriptions = new Subscription();

    constructor(
        private store: Store<fromRootStore.IState>,
        private tableTranslationService: TableTranslationService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.subscriptions.add(this.fromDCF$.subscribe());
        this.subscriptions.add(this.fromTO$.subscribe());
        this.subscriptions.add(this.canReadSampleValidity$.subscribe());

        this.renderTable();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    canViewActivityDetails(activitySubject: string): boolean {
        const isActivityRelatedToSampleValidity = activitySubject === this.SAMPLE_VALIDITY_ACTIVITY_SUBJECT;

        return this.fromDCF && isActivityRelatedToSampleValidity ? this.canReadSampleValidity : true;
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
            headerTranslation = value;
        });
        return headerTranslation;
    }

    renderTable(): void {
        if (this._table) this._table.render();
    }
}
