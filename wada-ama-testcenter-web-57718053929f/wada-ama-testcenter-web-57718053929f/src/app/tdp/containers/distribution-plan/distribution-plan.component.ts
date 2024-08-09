import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, mapTo, take, withLatestFrom } from 'rxjs/operators';
import { UserRolesEnum } from '@shared/models';
import * as fromRootStore from '@core/store';
import * as fromTDPStore from '@tdp/store';
import { Organization, SportDisciplineDescription } from '@core/models';
import { DirtyCellInfo, ISportDisciplineId, TDPSheet, TDPSheetInfo } from '@tdp/models';
import { latinize } from '@shared/utils/string-utils';
import { CanComponentDeactivate } from '@shared/guards';
import { TranslationService } from '@core/services';
import { GetToasterMessagePipe } from '@shared/pipes';

@Component({
    selector: 'app-distribution-plan',
    templateUrl: './distribution-plan.component.html',
    styleUrls: ['./distribution-plan.component.scss'],
    animations: [
        trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate(250, style({ opacity: 1 }))])]),
    ],
})
export class DistributionPlanComponent implements OnInit, OnDestroy, CanComponentDeactivate {
    organizationName$: Observable<string> = this.store.select(fromRootStore.getOrganizationViewName);

    organizationShortName$: Observable<string> = this.store.select(fromRootStore.getOrganizationViewShortName);

    sportDisciplines$: Observable<Array<SportDisciplineDescription>> = this.store.select(
        fromRootStore.getSportDisciplines
    );

    organizations$: Observable<Array<Organization>> = this.store.select(fromRootStore.getOrganizations);

    saving$: Observable<boolean> = this.store.select(fromTDPStore.getSaving);

    getError$: Observable<boolean> = this.store.select(fromTDPStore.getGetError);

    saveError$: Observable<boolean> = this.store.select(fromTDPStore.getSaveError);

    deleteException$: Observable<boolean> = this.store.select(fromTDPStore.getDeleteException);

    tdpSheetInfo$: Observable<TDPSheetInfo> = this.store.select(fromTDPStore.getCurrentTDPSheetInfo);

    tdpSheet$: Observable<TDPSheet> = this.store.select(fromTDPStore.getTDPSheet);

    requestedYear$: Observable<number> = this.store.select(fromTDPStore.getRequestedYear);

    highlightedSportDiscipline$: Observable<ISportDisciplineId> = this.store.select(
        fromTDPStore.getHighlightedSportDiscipline
    );

    isTdpReadonly$: Observable<boolean>;

    isWada$: Observable<boolean> = this.store.select(fromRootStore.getOrganizationisWada);

    subscription: Subscription = new Subscription();

    loading = true;

    isTouched = false;

    currentYear = new Date().getFullYear();

    translations$ = this.translationService.translations$;

    getToasterMessagePipe = new GetToasterMessagePipe(this.translationService);

    constructor(
        private store: Store<fromRootStore.IState>,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private translationService: TranslationService
    ) {
        const wadaReadOnly$: Observable<boolean> = this.store.select(fromRootStore.getWadaReadOnly);
        this.store.dispatch(fromRootStore.GetOrganizations());

        this.subscription.add(
            this.store.pipe(select(fromTDPStore.getLoading)).subscribe((loading: boolean) => {
                this.loading = loading;
            })
        );

        this.subscription.add(
            this.saveError$.subscribe((saveError: boolean) => {
                this.getToasterMessagePipe.transform(this.translations$, 'error').subscribe((message: any) => {
                    this.toggleToaster(saveError, message);
                });
            })
        );

        this.subscription.add(
            this.deleteException$.subscribe((deleteException: boolean) => {
                this.getToasterMessagePipe.transform(this.translations$, 'reload').subscribe((message: any) => {
                    this.toggleToaster(deleteException, message);
                });
            })
        );

        this.isTdpReadonly$ = this.store.pipe(
            select(fromRootStore.getHasRole(UserRolesEnum.TDP_WRITER)),
            map((roles) => !roles),
            withLatestFrom(wadaReadOnly$),
            map(([roleReadOnly, wadaIsReadOnly]) => roleReadOnly || wadaIsReadOnly)
        );
    }

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                map((params: ParamMap) => Number(params.get('year'))),
                map((year) => year || this.currentYear)
            )
            .subscribe((year: number) => {
                this.store.dispatch(fromTDPStore.GetTDPTable({ year }));
            });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    canDeactivate(): Observable<boolean> {
        this.store.dispatch(fromTDPStore.AttemptSaveTDPTable());

        // Leaving the page is only allowed once the cells are saved
        return combineLatest([this.saving$, this.store.select(fromTDPStore.hasDirtyCells)]).pipe(
            filter(([saving, dirty]: [boolean, boolean]) => !saving && !dirty),
            take(1),
            mapTo(true)
        );
    }

    sportDisciplinesSuggestions = (token: string): Observable<Array<SportDisciplineDescription>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());

        return this.sportDisciplines$.pipe(
            map((disciplines: Array<SportDisciplineDescription>) => {
                return disciplines.filter((discipline: SportDisciplineDescription): boolean => {
                    return latinize(discipline.displayName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0;
                });
            })
        );
    };

    onAddSportDiscipline(sportDiscipline: SportDisciplineDescription): void {
        this.isTouched = true;
        this.store.dispatch(fromTDPStore.AddSportDiscipline({ sportDiscipline }));
    }

    onDeleteSportDiscipline(sportDiscipline: ISportDisciplineId): void {
        this.isTouched = true;
        this.store.dispatch(fromTDPStore.DeleteSportDiscipline({ sportDiscipline }));
    }

    onEditTDPCell(dirtyCell: DirtyCellInfo): void {
        this.isTouched = true;
        this.store.dispatch(fromTDPStore.UpdateTDPTable({ dirtyCell }));
    }

    onUpdateTDPCell(): void {
        this.store.dispatch(fromTDPStore.AttemptSaveTDPTable());
    }

    toggleToaster(saveError: boolean, message: string): void {
        if (saveError) {
            this.showToaster(message);
        } else {
            this.clearToaster();
        }
    }

    showToaster(message: string): void {
        this.toastr.error(`${message}`, '', {
            enableHtml: true,
            toastClass: 'error-toastr',
            positionClass: 'error-toast-top-center',
            disableTimeOut: true,
            tapToDismiss: false,
        });
    }

    clearToaster(): void {
        this.toastr.clear();
    }

    organizationSuggestions = (token: string): Observable<Array<Organization>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());

        return this.organizations$.pipe(
            map((organizations: Array<Organization>) =>
                organizations.filter(
                    (organization: Organization): boolean =>
                        latinize(organization.displayName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )
            )
        );
    };

    changeOrganization(organizationView: Organization): void {
        this.isTouched = false;
        this.store.dispatch(fromRootStore.ChangeOrganizationView({ organizationView }));
    }
}
