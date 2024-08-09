import { Injectable } from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NEVER, Observable } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, switchMapTo, withLatestFrom } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import { DCF, DCFForm, Sample, UrineSampleBoundaries } from '@dcf/models';
import * as AutoCompletesActions from '@autocompletes/store/actions/autocompletes.actions';
import * as DCFActions from '@dcf/store/actions/dcf.actions';
import * as MultipleDCFActions from '@dcf/store/actions/multiple-dcf.actions';
import * as AutoCompletesSelectors from '@autocompletes/store/selectors/autocompletes.selectors';
import * as MultipleDCFSelectors from '@dcf/store/selectors/multiple-dcf.selectors';
import { mapDCFFromForm } from '@dcf/mappers';
import { SampleType, SecurityWrapper, Test } from '@shared/models';
import { ConflictException } from '@core/models';
import { NavigationExtras } from '@angular/router';
import { DCFService } from '@dcf/services';
import { isNullOrBlank, propsUndefined } from '@shared/utils';

@Injectable()
export class MultipleDCFEffects {
    constructor(
        private store: Store<fromRootStore.IState>,
        private actions$: Actions,
        private dcfService: DCFService
    ) {}

    backToView$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFBackToView),
            map((action) =>
                MultipleDCFActions.MultipleDCFGoToView({
                    ids: action.ids,
                })
            )
        )
    );

    backToViewTestingOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFBackToViewTestingOrder),
            switchMapTo(this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFGlobalTestingOrderId))),
            filter((toId: string) => !isNullOrBlank(toId)),
            switchMap((toId: string) => [DCFActions.GoToViewTestingOrder({ id: toId })])
        )
    );

    cancel$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFCancel),
            switchMap((action) => {
                const ids: Array<number> = action.dcfIds.map(Number);
                if (action.isEditMode) {
                    return [MultipleDCFActions.MultipleDCFBackToView({ ids })];
                }
                return [MultipleDCFActions.MultipleDCFBackToViewTestingOrder()];
            })
        )
    );

    executeSampleCodeValidation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFSampleCodeValidation),
            switchMap((action) => {
                return this.dcfService.executeSampleCodeValidation(action.dcf);
            }),
            map((samples: Array<Sample> | ConflictException) => {
                const samplesUpdated: Array<Sample> = samples instanceof ConflictException ? [] : samples;
                return MultipleDCFActions.MultipleDCFSampleCodeValidationSuccess({ samples: samplesUpdated });
            }),
            catchError((error: any, effect: Observable<Action>) => {
                const exception: ConflictException = new ConflictException(error.error);
                return effect.pipe(startWith(MultipleDCFActions.MultipleDCFSampleCodeValidationError({ exception })));
            })
        )
    );

    getAutoCompletes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFGetAutoCompletes),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getMultipleDCFSectionUpAutoCompletes)),
                this.store.pipe(select(AutoCompletesSelectors.getMultipleDCFSectionDownAutoCompletes))
            ),
            switchMap(([, sectionUp, sectionDown]: [any, any, any]) => {
                this.store.dispatch(AutoCompletesActions.GetMultipleDCFCoachMap());
                this.store.dispatch(AutoCompletesActions.GetMultipleDCFDcos());
                this.store.dispatch(AutoCompletesActions.GetMultipleDCFDoctorMap());
                if (!sectionUp?.bloodOfficials?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFBloodOfficials());
                }
                if (!sectionUp?.countriesWithRegions?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFCountriesWithRegions());
                }
                if (!sectionUp?.laboratories?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFLaboratories());
                }
                if (!sectionDown?.manufacturers?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFManufacturers());
                }
                if (!sectionDown?.notifyingChaperones?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFNotifyingChaperones());
                }
                if (!sectionDown?.sampleTypes?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFSampleTypes());
                }
                if (!sectionDown?.sportDisciplines?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFSportDisciplines());
                }
                if (!sectionDown?.timezones?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFTimezones());
                }
                if (!sectionDown?.witnessChaperones?.length) {
                    this.store.dispatch(AutoCompletesActions.GetMultipleDCFWitnessChaperones());
                }
                return [];
            }),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError()))
            )
        )
    );

    getDCFs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFGetDCFs),
            switchMap((action) => this.dcfService.getDCFs(action.ids)),
            switchMap((securityWrappers: Array<SecurityWrapper<DCF>>) => [
                MultipleDCFActions.MultipleDCFGetDCFsSuccess({
                    securityWrappers,
                }),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(MultipleDCFActions.MultipleDCFGetDCFsError(_error)));
            })
        )
    );

    getTests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFGetTests),
            switchMap((action) => this.dcfService.getTests(action.ids)),
            switchMap((tests: Array<Test>) => [
                MultipleDCFActions.MultipleDCFGetTestsSuccess({ tests }),
                MultipleDCFActions.MultipleDCFGetAutoCompletes(),
            ]),
            catchError((_error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(MultipleDCFActions.MultipleDCFGetTestsError(_error)));
            })
        )
    );

    getUrineSampleBoundaries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFGetUrineSampleBoundaries),
            withLatestFrom(this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFUrineSampleBoundaries))),
            filter(([, urineSampleBoundaries]: [Action, any]) => propsUndefined(urineSampleBoundaries)),
            switchMap(() => this.dcfService.getUrineBoundaries()),
            map((urineSampleBoundaries: UrineSampleBoundaries) => {
                return MultipleDCFActions.MultipleDCFGetUrineSampleBoundariesSuccess({ urineSampleBoundaries });
            })
        )
    );

    goToView$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFGoToView),
            switchMap((action) => {
                const idAsString = (action.ids.filter(
                    (id: number | null) => id !== null
                ) as Array<number>).map((id: number) => id.toString());

                const navigationExtras: NavigationExtras = {
                    queryParams: { id: idAsString.toString() },
                };
                return [
                    fromRootStore.Go({
                        path: ['dcf', 'multiple', 'view'],
                        extras: navigationExtras,
                    }),
                ];
            })
        )
    );

    initCreate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFInitCreate),
            switchMap((action) => [
                MultipleDCFActions.MultipleDCFGetUrineSampleBoundaries(),
                MultipleDCFActions.MultipleDCFGetTests({ ids: action.ids }),
            ])
        )
    );

    initEdit$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFInitEdit),
            switchMap((action) => [
                MultipleDCFActions.MultipleDCFGetUrineSampleBoundaries(),
                MultipleDCFActions.MultipleDCFGetDCFs({ ids: action.ids }),
                MultipleDCFActions.MultipleDCFGetAutoCompletes(),
            ])
        )
    );

    initView$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFInitView),
            switchMap((action) => [MultipleDCFActions.MultipleDCFGetDCFs({ ids: action.ids })])
        )
    );

    saveAll$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFSaveAll),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes))),
            switchMap(([action, sampleTypes]: [any, Array<SampleType>]) =>
                this.dcfService.saveAllDCF(
                    action.data.map((item: { dcfForm: DCFForm; dcf: DCF }) => mapDCFFromForm(item.dcfForm, item.dcf)),
                    sampleTypes
                )
            ),
            map((dcfs: Array<SecurityWrapper<DCF>>) => MultipleDCFActions.MultipleDCFSaveAllSuccess({ dcfs })),
            catchError((error: any, effect: Observable<Action>) => {
                return effect.pipe(startWith(MultipleDCFActions.MultipleDCFSaveAllError(error)));
            })
        )
    );

    saveAllSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MultipleDCFActions.MultipleDCFSaveAllSuccess),
            switchMapTo(this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFIsAllDCFsSaved))),
            withLatestFrom(this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFAllDCFIds))),
            switchMap(([allSaved, ids]: [boolean, Array<number | null>]) => {
                if (allSaved) {
                    return [MultipleDCFActions.MultipleDCFBackToView({ ids })];
                }
                return NEVER;
            })
        )
    );
}
