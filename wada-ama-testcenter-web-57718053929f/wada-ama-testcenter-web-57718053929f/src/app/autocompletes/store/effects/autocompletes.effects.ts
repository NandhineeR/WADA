import { Injectable } from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, switchMapTo, take, withLatestFrom } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import { isNullOrBlank } from '@shared/utils';
import {
    CountryWithRegions,
    Laboratory,
    ListItem,
    LocalizedEntity,
    Participant,
    ParticipantType,
    SampleType,
    SportDiscipline,
    Status,
} from '@shared/models';
import * as AutoCompletesSelectors from '@autocompletes/store/selectors/autocompletes.selectors';
import * as AutoCompletesActions from '@autocompletes/store/actions';
import * as DCFSelectors from '@dcf/store/selectors/dcf.selectors';
import * as DCFActions from '@dcf/store/actions';
import * as MultipleDCFSelectors from '@dcf/store/selectors/multiple-dcf.selectors';
import * as MultipleDCFActions from '@dcf/store/actions/multiple-dcf.actions';
import * as TestingOrderActions from '@to/store/actions';
import * as TestingOrderSelectors from '@to/store/selectors/to.selectors';
import { AutoCompletesService } from '@autocompletes/services';
import { OrganizationRelationship } from '@to/models';
import { Timezone } from '@dcf/models';
import {
    ListMajorEventAutoCompletes,
    ListParticipantAutoCompletes,
    ListUrineSampleBoundaries,
} from '@autocompletes/models';
import { ORGANIZATION_ID_PLACEHOLDER } from '@core/http-interceptors/organization-id.interceptor';

/**
 * NOTE:
 * The objective of the autocompletes is to fetch the required data for the application without disrupting any aspects of the workflow.
 * The use of the 'filter' operator is discouraged, as it may omit crucial parts of the typical workflow and fail to trigger essential actions.
 */
@Injectable()
export class AutoCompletesEffects {
    constructor(
        private store: Store<fromRootStore.IState>,
        private actions$: Actions,
        private autoCompletesService: AutoCompletesService
    ) {}

    getDCFAdos$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFAdos),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesAdos))),
            switchMap(([, ados]: [Action, Array<ListItem>]) => {
                if (ados.length === 0) {
                    return this.autoCompletesService.getAdos();
                }
                return of(ados);
            }),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesDtps)),
                this.store.pipe(select(fromRootStore.getOrganizationId))
            ),
            switchMap(([object, dtps, orgId]: [Array<ListItem>, Array<ListItem>, number]) => [
                AutoCompletesActions.GetAdosSuccess({ object }),
                DCFActions.SetDCFDefaultValues({ orgId, ados: object, dtps }),
            ]),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetAdosError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFAthleteRepresentatives$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFAthleteRepresentatives),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(
                        select(AutoCompletesSelectors.getAutoCompletesAthleteRepresentativesObject),
                        take(1)
                    ),
                    this.store.pipe(select(DCFSelectors.getAthleteId)),
                    this.store.pipe(select(DCFSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, athleteId, scaId]: [any, any, any]) => !isNullOrBlank(athleteId) && !isNullOrBlank(scaId)),
            switchMap(([object, athleteId, scaId]: [any, any, any]) => {
                if (
                    !object ||
                    object?.athleteId !== athleteId ||
                    object?.participants?.length === 0 ||
                    object?.scaId !== scaId
                ) {
                    return this.autoCompletesService.getAthleteRepresentatives(athleteId, scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) =>
                AutoCompletesActions.GetAthleteRepresentativesSuccess({ object })
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetAthleteRepresentativesError()),
                    startWith(DCFActions.Step3GetAutoCompletesError())
                )
            )
        )
    );

    getDCFBloodOfficials$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFBloodOfficials),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesBloodOfficialsObject), take(1)),
                    this.store.pipe(select(DCFSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getBloodOfficials(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetBloodOfficialsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetBloodOfficialsError()),
                    startWith(DCFActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getDCFCoaches$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFCoaches),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCoachesObject), take(1)),
                    this.store.pipe(select(DCFSelectors.getAthleteId)),
                    this.store.pipe(select(DCFSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, athleteId, scaId]: [any, any, any]) => !isNullOrBlank(athleteId) && !isNullOrBlank(scaId)),
            switchMap(([object, athleteId, scaId]: [any, any, any]) => {
                if (
                    !object ||
                    object?.athleteId !== athleteId ||
                    object?.participants?.length === 0 ||
                    object?.scaId !== scaId
                ) {
                    return this.autoCompletesService.getCoaches(athleteId, scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetCoachesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetCoachesError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFCountriesWithRegions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFCountriesWithRegions),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions))),
            switchMap(([, countriesWithRegions]: [Action, Array<CountryWithRegions>]) => {
                if (countriesWithRegions.length === 0) {
                    return this.autoCompletesService.getCountriesWithRegions();
                }
                return of(countriesWithRegions);
            }),
            map((object: Array<CountryWithRegions>) => AutoCompletesActions.GetCountriesWithRegionsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetCountriesWithRegionsError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    /**
     * When adding a new DCO participant, a new active person is created in section procedural.
     * Therefore, we cannot block the request to retrieve the newly created DCOs.
     */
    getDCFDcos$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFDcos),
            switchMapTo(combineLatest([this.store.pipe(select(DCFSelectors.getSampleCollectionAuthorityId))])),
            filter(([scaId]: [any]) => !isNullOrBlank(scaId)),
            switchMap(([scaId]: [any]) => this.autoCompletesService.getDcos(scaId)),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetDcosSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetDcosError()),
                    startWith(DCFActions.Step3GetAutoCompletesError())
                )
            )
        )
    );

    getDCFDoctors$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFDoctors),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesDoctorsObject), take(1)),
                    this.store.pipe(select(DCFSelectors.getAthleteId)),
                    this.store.pipe(select(DCFSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, athleteId, scaId]: [any, any, any]) => !isNullOrBlank(athleteId) && !isNullOrBlank(scaId)),
            switchMap(([object, athleteId, scaId]: [any, any, any]) => {
                if (
                    !object ||
                    object.athleteId !== athleteId ||
                    object.participants.length === 0 ||
                    object.scaId !== scaId
                ) {
                    return this.autoCompletesService.getDoctors(athleteId, scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetDoctorsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetDoctorsError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFDtps$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFDtps),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesDtps))),
            switchMap(([, dtps]: [Action, Array<ListItem>]) => {
                if (dtps.length === 0) {
                    return this.autoCompletesService.getDtps();
                }
                return of(dtps);
            }),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesAdos)),
                this.store.pipe(select(fromRootStore.getOrganizationId))
            ),
            switchMap(([object, ados, orgId]: [Array<ListItem>, Array<ListItem>, number]) => [
                AutoCompletesActions.GetDtpsSuccess({ object }),
                DCFActions.SetDCFDefaultValues({ orgId, ados, dtps: object }),
            ]),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetDtpsError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFIdentificationDocuments$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFIdentificationDocuments),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesIdentificationDocuments))),
            switchMap(([, identificationDocuments]: [Action, Array<ListItem>]) => {
                if (identificationDocuments.length === 0) {
                    return this.autoCompletesService.getIdentificationDocuments();
                }
                return of(identificationDocuments);
            }),
            map((object: Array<ListItem>) => AutoCompletesActions.GetIdentificationDocumentsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetIdentificationDocumentsError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFLaboratories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFLaboratories),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesLaboratories))),
            switchMap(([, laboratories]: [Action, Array<Laboratory>]) => {
                if (laboratories.length === 0) {
                    return this.autoCompletesService.getLaboratories();
                }
                return of(laboratories);
            }),
            map((object: Array<Laboratory>) => AutoCompletesActions.GetLaboratoriesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetLaboratoriesError()),
                    startWith(DCFActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getMajorEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFMajorEvents),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesMajorEventsObject), take(1)),
                    this.store.pipe(select(DCFSelectors.getMajorEvents)),
                ])
            ),
            filter(([, numberPriorMonths]: [any, any]) => !isNullOrBlank(numberPriorMonths)),
            switchMap(([object, numberPriorMonths]: [any, any]) => {
                if (!object || object?.majorEvents?.length === 0 || object?.numberPriorMonths !== numberPriorMonths) {
                    return this.autoCompletesService.getMajorEvents(numberPriorMonths);
                }
                return of(object);
            }),
            map((object: ListMajorEventAutoCompletes) => AutoCompletesActions.GetMajorEventsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetMajorEventsError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFManufacturers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFManufacturers),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesManufacturers))),
            switchMap(([, manufacturers]: [Action, Array<LocalizedEntity>]) => {
                if (manufacturers.length === 0) {
                    return this.autoCompletesService.getManufacturers();
                }
                return of(manufacturers);
            }),
            map((object: Array<LocalizedEntity>) => AutoCompletesActions.GetManufacturersSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetManufacturersError()),
                    startWith(DCFActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getDCFNonConformityCategories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFNonConformityCategories),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesNonConformityCategories))),
            switchMap(([, nonConformityCategories]: [Action, Array<ListItem>]) => {
                if (nonConformityCategories.length === 0) {
                    return this.autoCompletesService.getNonConformityCategories();
                }
                return of(nonConformityCategories);
            }),
            map((object: Array<ListItem>) => AutoCompletesActions.GetNonConformityCategoriesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetNonConformityCategoriesError()),
                    startWith(DCFActions.Step3GetAutoCompletesError())
                )
            )
        )
    );

    getDCFNotifyingChaperones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFNotifyingChaperones),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesNotifyingChaperonesObject), take(1)),
                    this.store.pipe(select(DCFSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getNotifyingChaperones(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) =>
                AutoCompletesActions.GetNotifyingChaperonesSuccess({ object })
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetNotifyingChaperonesError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFSampleTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFSampleTypes),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes))),
            switchMap(([, sampleTypes]: [Action, Array<SampleType>]) => {
                if (sampleTypes.length === 0) {
                    return this.autoCompletesService.getSampleTypes();
                }
                return of(sampleTypes);
            }),
            map((object: Array<SampleType>) => AutoCompletesActions.GetSampleTypesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetSampleTypesError()),
                    startWith(DCFActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getDCFSelectionCriteria$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFSelectionCriteria),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSelectionCriteria))),
            switchMap(([, selectionCriteria]: [Action, Array<ListItem>]) => {
                if (selectionCriteria.length === 0) {
                    return this.autoCompletesService.getSelectionCriteria();
                }
                return of(selectionCriteria);
            }),
            map((object: Array<ListItem>) => AutoCompletesActions.GetSelectionCriteriaSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetSelectionCriteriaError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFSportDisciplines$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFSportDisciplines),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSportDisciplines))),
            switchMap(([, sportDisciplines]: [Action, Array<SportDiscipline>]) => {
                if (sportDisciplines.length === 0) {
                    return this.autoCompletesService.getSportDisciplines();
                }
                return of(sportDisciplines);
            }),
            map((object: Array<SportDiscipline>) => AutoCompletesActions.GetSportDisciplinesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetSportDisciplinesError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFTimezones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFTimezones),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesTimezones))),
            switchMap(([, timezones]: [Action, Array<Timezone>]) => {
                if (timezones.length === 0) {
                    return this.autoCompletesService.getTimezones();
                }
                return of(timezones);
            }),
            map((object: Array<Timezone>) => AutoCompletesActions.GetTimezonesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetTimezonesError()),
                    startWith(DCFActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getDCFUrineBoundaries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFUrineBoundaries),
            switchMapTo(
                combineLatest([this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesUrineBoundaries))])
            ),
            switchMap(() => this.autoCompletesService.getUrineBoundaries()),
            map((object: ListUrineSampleBoundaries) => AutoCompletesActions.GetUrineBoundariesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetUrineBoundariesError()),
                    startWith(DCFActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getDCFWitnessChaperones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetDCFWitnessChaperones),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesWitnessChaperonesObject), take(1)),
                    this.store.pipe(select(DCFSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getWitnessChaperones(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetWitnessChaperonesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetWitnessChaperonesError()),
                    startWith(DCFActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    /**
     * Multiple DCF
     */
    getMultipleDCFBloodOfficials$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFBloodOfficials),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesBloodOfficialsObject), take(1)),
                    this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFSCAId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getBloodOfficials(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetBloodOfficialsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetBloodOfficialsError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFCoachMap$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFCoachMap),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(select(MultipleDCFSelectors.getMultipleAthleteIds)),
                    this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFSCAId)),
                ])
            ),
            filter(([athleteIds, scaId]: [Array<number>, any]) => athleteIds.length > 0 && !isNullOrBlank(scaId)),
            switchMap(([athleteIds, scaId]: [Array<number>, any]) =>
                this.autoCompletesService.getCoachMap(athleteIds, scaId)
            ),
            map((object: Map<string, Array<Participant>>) => AutoCompletesActions.GetCoachMapSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetCoachMapError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFCountriesWithRegions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFCountriesWithRegions),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions))),
            switchMap(([, countriesWithRegions]: [Action, Array<CountryWithRegions>]) => {
                if (countriesWithRegions.length === 0) {
                    return this.autoCompletesService.getCountriesWithRegions();
                }
                return of(countriesWithRegions);
            }),
            map((object: Array<CountryWithRegions>) => AutoCompletesActions.GetCountriesWithRegionsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetCountriesWithRegionsError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    /**
     * When adding a new DCO participant, a new active person is created in section procedural.
     * Therefore, we cannot block the request to retrieve the newly created DCOs.
     */
    getMultipleDCFDcos$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFDcos),
            switchMapTo(combineLatest([this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFSCAId))])),
            filter(([scaId]: [any]) => !isNullOrBlank(scaId)),
            switchMap(([scaId]: [any]) => this.autoCompletesService.getDcos(scaId)),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetDcosSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetDcosError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFDoctorMap$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFDoctorMap),
            switchMap(() =>
                combineLatest([
                    this.store.pipe(select(MultipleDCFSelectors.getMultipleAthleteIds)),
                    this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFSCAId)),
                ])
            ),
            filter(([athleteIds, scaId]: [Array<number>, any]) => athleteIds.length > 0 && !isNullOrBlank(scaId)),
            switchMap(([athleteIds, scaId]: [Array<number>, any]) =>
                this.autoCompletesService.getDoctorMap(athleteIds, scaId)
            ),
            map((object: Map<string, Array<Participant>>) => AutoCompletesActions.GetDoctorMapSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetDoctorsError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFLaboratories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFLaboratories),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesLaboratories))),
            switchMap(([, laboratories]: [Action, Array<Laboratory>]) => {
                if (laboratories.length === 0) {
                    return this.autoCompletesService.getLaboratories();
                }
                return of(laboratories);
            }),
            map((object: Array<Laboratory>) => AutoCompletesActions.GetLaboratoriesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetLaboratoriesError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFManufacturers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFManufacturers),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesManufacturers))),
            switchMap(([, manufacturers]: [Action, Array<LocalizedEntity>]) => {
                if (manufacturers.length === 0) {
                    return this.autoCompletesService.getManufacturers();
                }
                return of(manufacturers);
            }),
            map((object: Array<LocalizedEntity>) => AutoCompletesActions.GetManufacturersSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetManufacturersError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFNotifyingChaperones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFNotifyingChaperones),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesNotifyingChaperonesObject), take(1)),
                    this.store.pipe(select(MultipleDCFSelectors.getMultipleDCFSCAId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getNotifyingChaperones(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) =>
                AutoCompletesActions.GetNotifyingChaperonesSuccess({ object })
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetNotifyingChaperonesError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFSampleTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFSampleTypes),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes))),
            switchMap(([, sampleTypes]: [Action, Array<SampleType>]) => {
                if (sampleTypes.length === 0) {
                    return this.autoCompletesService.getSampleTypes();
                }
                return of(sampleTypes);
            }),
            map((object: Array<SampleType>) => AutoCompletesActions.GetSampleTypesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetSampleTypesError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFSportDisciplines$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFSportDisciplines),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSportDisciplines))),
            switchMap(([, sportDisciplines]: [Action, Array<SportDiscipline>]) => {
                if (sportDisciplines.length === 0) {
                    return this.autoCompletesService.getSportDisciplines();
                }
                return of(sportDisciplines);
            }),
            map((object: Array<SportDiscipline>) => AutoCompletesActions.GetSportDisciplinesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetSportDisciplinesError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFTimezones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFTimezones),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesTimezones))),
            switchMap(([, timezones]: [Action, Array<Timezone>]) => {
                if (timezones.length === 0) {
                    return this.autoCompletesService.getTimezones();
                }
                return of(timezones);
            }),
            map((object: Array<Timezone>) => AutoCompletesActions.GetTimezonesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetTimezonesError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    getMultipleDCFWitnessChaperones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetMultipleDCFWitnessChaperones),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesWitnessChaperonesObject), take(1)),
                ])
            ),
            switchMap(([object]: [any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== ORGANIZATION_ID_PLACEHOLDER) {
                    return this.autoCompletesService.getWitnessChaperones(ORGANIZATION_ID_PLACEHOLDER);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetWitnessChaperonesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetWitnessChaperonesError()),
                    startWith(MultipleDCFActions.MultipleDCFGetAutoCompletesError())
                )
            )
        )
    );

    /**
     * Get Testing Order
     */
    getTestingOrderAdos$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderAdos),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesAdos))),
            switchMap(([, ados]: [Action, Array<ListItem>]) => {
                if (ados.length === 0) {
                    return this.autoCompletesService.getAdos();
                }
                return of(ados);
            }),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesDtps)),
                this.store.pipe(select(fromRootStore.getOrganizationId))
            ),
            switchMap(([object, dtps, orgId]: [Array<ListItem>, Array<ListItem>, number]) => [
                AutoCompletesActions.GetAdosSuccess({ object }),
                TestingOrderActions.SetDefaultValues({ orgId, ados: object, dtps }),
            ]),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetAdosError()),
                    startWith(TestingOrderActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderBloodOfficials$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderBloodOfficials),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesBloodOfficialsObject), take(1)),
                    this.store.pipe(select(TestingOrderSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getBloodOfficials(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetBloodOfficialsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetBloodOfficialsError()),
                    startWith(TestingOrderActions.Step4GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderCompetitionCategories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderCompetitionCategories),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCompetitionCategories))),
            switchMap(([, competitionCategories]: [Action, Array<ListItem>]) => {
                if (competitionCategories.length === 0) {
                    return this.autoCompletesService.getCompetitionCategories();
                }
                return of(competitionCategories);
            }),
            map((object: Array<ListItem>) => AutoCompletesActions.GetCompetitionCategoriesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetCompetitionCategoriesError()),
                    startWith(TestingOrderActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderCountriesWithRegions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderCountriesWithRegions),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesCountriesWithRegions))),
            switchMap(([, countriesWithRegions]: [Action, Array<CountryWithRegions>]) => {
                if (countriesWithRegions.length === 0) {
                    return this.autoCompletesService.getCountriesWithRegions();
                }
                return of(countriesWithRegions);
            }),
            map((object: Array<CountryWithRegions>) => AutoCompletesActions.GetCountriesWithRegionsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetCountriesWithRegionsError()),
                    startWith(TestingOrderActions.Step1GetAutoCompletesError()),
                    startWith(TestingOrderActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderDcos$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderDcos),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesDcosObject), take(1)),
                    this.store.pipe(select(TestingOrderSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getDcos(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetDcosSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetDcosError()),
                    startWith(TestingOrderActions.Step3GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderDtps$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderDtps),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesDtps))),
            switchMap(([, dtps]: [Action, Array<ListItem>]) => {
                if (dtps.length === 0) {
                    return this.autoCompletesService.getDtps();
                }
                return of(dtps);
            }),
            withLatestFrom(
                this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesAdos)),
                this.store.pipe(select(fromRootStore.getOrganizationId))
            ),
            switchMap(([object, ados, orgId]: [Array<ListItem>, Array<ListItem>, number]) => [
                AutoCompletesActions.GetDtpsSuccess({ object }),
                TestingOrderActions.SetDefaultValues({ orgId, ados, dtps: object }),
            ]),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetDtpsError()),
                    startWith(TestingOrderActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderLaboratories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderLaboratories),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesLaboratories))),
            switchMap(([, laboratories]: [Action, Array<Laboratory>]) => {
                if (laboratories.length === 0) {
                    return this.autoCompletesService.getLaboratories();
                }
                return of(laboratories);
            }),
            map((object: Array<Laboratory>) => AutoCompletesActions.GetLaboratoriesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetLaboratoriesError()),
                    startWith(TestingOrderActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderMOParticipants$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderMOParticipants),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesMOParticipantsObject), take(1)),
                    this.store.pipe(select(TestingOrderSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getMOParticipants(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetMOParticipantsSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetMOParticipantsError()),
                    startWith(TestingOrderActions.Step4GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderNotifyingChaperones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderNotifyingChaperones),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesNotifyingChaperonesObject), take(1)),
                    this.store.pipe(select(TestingOrderSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getNotifyingChaperones(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) =>
                AutoCompletesActions.GetNotifyingChaperonesSuccess({ object })
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetNotifyingChaperonesError()),
                    startWith(TestingOrderActions.Step4GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderOrganizationRelationships$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderOrganizationRelationships),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesOrganizationRelationships))),
            switchMap(([, organizationRelationships]: [Action, Array<OrganizationRelationship>]) => {
                if (organizationRelationships.length === 0) {
                    return this.autoCompletesService.getOrganizationRelationships();
                }
                return of(organizationRelationships);
            }),
            map((object: Array<OrganizationRelationship>) =>
                AutoCompletesActions.GetOrganizationRelationshipsSuccess({ object })
            ),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetOrganizationRelationshipsError()),
                    startWith(TestingOrderActions.Step1GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderParticipantStatuses$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderParticipantStatuses),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesParticipantStatuses))),
            switchMap(([, participantStatuses]: [Action, Array<Status>]) => {
                if (participantStatuses.length === 0) {
                    return this.autoCompletesService.getParticipantStatuses();
                }
                return of(participantStatuses);
            }),
            map((object: Array<Status>) => AutoCompletesActions.GetParticipantStatusesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetParticipantStatusesError()),
                    startWith(TestingOrderActions.Step3GetAutoCompletesError()),
                    startWith(TestingOrderActions.Step4GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderParticipantTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderParticipantTypes),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesParticipantTypes))),
            switchMap(([, participantTypes]: [Action, Array<ParticipantType>]) => {
                if (participantTypes.length === 0) {
                    return this.autoCompletesService.getParticipantTypes();
                }
                return of(participantTypes);
            }),
            map((object: Array<ParticipantType>) => AutoCompletesActions.GetParticipantTypesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetParticipantTypesError()),
                    startWith(TestingOrderActions.Step3GetAutoCompletesError()),
                    startWith(TestingOrderActions.Step4GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderSampleTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderSampleTypes),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSampleTypes))),
            switchMap(([, sampleTypes]: [Action, Array<SampleType>]) => {
                if (sampleTypes.length === 0) {
                    return this.autoCompletesService.getSampleTypes();
                }
                return of(sampleTypes);
            }),
            map((object: Array<SampleType>) => AutoCompletesActions.GetSampleTypesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetSampleTypesError()),
                    startWith(TestingOrderActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderSportDisciplines$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderSportDisciplines),
            withLatestFrom(this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesSportDisciplines))),
            switchMap(([, sportDisciplines]: [Action, Array<SportDiscipline>]) => {
                if (sportDisciplines.length === 0) {
                    return this.autoCompletesService.getSportDisciplines();
                }
                return of(sportDisciplines);
            }),
            map((object: Array<SportDiscipline>) => AutoCompletesActions.GetSportDisciplinesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetSportDisciplinesError()),
                    startWith(TestingOrderActions.Step2GetAutoCompletesError())
                )
            )
        )
    );

    getTestingOrderWitnessChaperones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AutoCompletesActions.GetTestingOrderWitnessChaperones),
            switchMapTo(
                combineLatest([
                    this.store.pipe(select(AutoCompletesSelectors.getAutoCompletesWitnessChaperonesObject), take(1)),
                    this.store.pipe(select(TestingOrderSelectors.getSampleCollectionAuthorityId)),
                ])
            ),
            filter(([, scaId]: [any, any]) => !isNullOrBlank(scaId)),
            switchMap(([object, scaId]: [any, any]) => {
                if (!object || object?.participants?.length === 0 || object?.scaId !== scaId) {
                    return this.autoCompletesService.getWitnessChaperones(scaId);
                }
                return of(object);
            }),
            map((object: ListParticipantAutoCompletes) => AutoCompletesActions.GetWitnessChaperonesSuccess({ object })),
            catchError((_error, effect: Observable<Action>) =>
                effect.pipe(
                    startWith(AutoCompletesActions.GetWitnessChaperonesError()),
                    startWith(TestingOrderActions.Step4GetAutoCompletesError())
                )
            )
        )
    );
}
