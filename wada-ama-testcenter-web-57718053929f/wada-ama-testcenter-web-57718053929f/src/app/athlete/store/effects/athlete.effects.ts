import { WhereaboutsFailure } from '@athlete/models/whereabouts-failure.model';
import { Test } from '@to/models';
import {
    AthleteSupportPersonnel,
    BloodPassport,
    CompetitionLevelAthlete,
    SportIdentity,
    SteroidPassport,
    TestPoolParticipant,
    WhereaboutsEntry,
} from '@athlete/models';
import { Injectable } from '@angular/core';
import { AthleteService } from '@athlete/services';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Address, Athlete, MajorEvent, Phone } from '@shared/models';
import * as AllAthleteActions from '@athlete/store/actions';

@Injectable()
export class AthleteEffects {
    initAthlete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.InitAthletePage),
            switchMap((action) => [
                AllAthleteActions.GetAthlete({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetAddresses({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetPhones({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetSportIdentities({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetCompetitionLevels({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetWhereabouts({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetBloodPassports({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetSteroidPassports({
                    athleteId: action.athleteId,
                }),
            ])
        )
    );

    initDashboard$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.InitDashboard),
            switchMap((action) => [
                AllAthleteActions.GetTestingMetadata({
                    athleteId: action.athleteId,
                }),
            ])
        )
    );

    initProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.InitAthleteProfile),
            switchMap((action) => [
                AllAthleteActions.GetMajorEvents({
                    athleteId: action.athleteId,
                }),
                AllAthleteActions.GetAthleteAgents({
                    athleteId: action.athleteId,
                }),
            ])
        )
    );

    initTests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.InitAthleteTests),
            switchMap((action) => [
                AllAthleteActions.GetAthleteTests({
                    athleteId: action.athleteId,
                }),
            ])
        )
    );

    initWhereabouts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.InitWhereabouts),
            switchMap((action) => [
                AllAthleteActions.GetWhereaboutsFailures({
                    athleteId: action.athleteId,
                }),
            ])
        )
    );

    initADRVs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.InitADRVs),
            switchMap((action) => [
                AllAthleteActions.GetAthleteADRVs({
                    athleteId: action.athleteId,
                }),
            ])
        )
    );

    initSanctions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.InitSanctions),
            switchMap((action) => [
                AllAthleteActions.GetAthleteSanctions({
                    athleteId: action.athleteId,
                }),
            ])
        )
    );

    getAthlete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetAthlete),
            switchMap((action) => this.athleteService.getAthlete(action.athleteId)),
            map((athlete: Athlete) => AllAthleteActions.GetAthleteSuccess({ athlete })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetAthleteError()))
            )
        )
    );

    getAddresses$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetAddresses),
            switchMap((action) => this.athleteService.getAddresses(action.athleteId)),
            map((addresses: Array<Address>) => AllAthleteActions.GetAddressesSuccess({ addresses })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetAddressesError()))
            )
        )
    );

    getPhones$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetPhones),
            switchMap((action) => this.athleteService.getPhones(action.athleteId)),
            map((phones: Array<Phone>) => AllAthleteActions.GetPhonesSuccess({ phones })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetPhonesError()))
            )
        )
    );

    getSportIdentities$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetSportIdentities),
            switchMap((action) => this.athleteService.getSportIdentities(action.athleteId)),
            map((sportIdentities: Array<SportIdentity>) =>
                AllAthleteActions.GetSportIdentitiesSuccess({
                    sportIdentities,
                })
            ),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetSportIdentitiesError()))
            )
        )
    );

    getCompetitionLevels$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetCompetitionLevels),
            switchMap((action) => this.athleteService.getCompetitionLevels(action.athleteId)),
            map((competitionLevels: Array<CompetitionLevelAthlete>) =>
                AllAthleteActions.GetCompetitionLevelsSuccess({
                    competitionLevels,
                })
            ),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetCompetitionLevelsError()))
            )
        )
    );

    getTestPools$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetTestPools),
            switchMap((action) => this.athleteService.getTestPoolsAthletes('testPoolId', action.athleteId)),
            map((testPools: Array<TestPoolParticipant>) => AllAthleteActions.GetTestPoolsSuccess({ testPools })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetTestPoolsError()))
            )
        )
    );

    getMajorEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetMajorEvents),
            switchMap((action) => this.athleteService.getMajorEvents(action.athleteId)),
            map((majorEvents: Array<MajorEvent>) => AllAthleteActions.GetMajorEventsSuccess({ majorEvents })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetMajorEventsError()))
            )
        )
    );

    getWhereabouts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetWhereabouts),
            switchMap((action) => this.athleteService.getWhereabouts(action.athleteId, new Date(), new Date())),
            map((whereabouts: Array<WhereaboutsEntry>) => AllAthleteActions.GetWhereaboutsSuccess({ whereabouts })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetWhereaboutsError()))
            )
        )
    );

    getBloodPassports$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetMajorEvents),
            switchMap((action) => this.athleteService.getBloodPassports(action.athleteId)),
            map((bloodPassports: Array<BloodPassport>) =>
                AllAthleteActions.GetBloodPassportsSuccess({
                    bloodPassports,
                })
            ),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetBloodPassportsError()))
            )
        )
    );

    getSteroidPassports$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetSteroidPassports),
            switchMap((action) => this.athleteService.getSteroidPassports(action.athleteId)),
            map((steroidPassports: Array<SteroidPassport>) =>
                AllAthleteActions.GetSteroidPassportsSuccess({
                    steroidPassports,
                })
            ),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetSteroidPassportsError()))
            )
        )
    );

    getTestingMetadata$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetTestingMetadata),
            switchMap((action) => this.athleteService.getTestingMetadata(action.athleteId)),
            map((testingMetadata: any) =>
                AllAthleteActions.GetTestingMetadataSuccess({
                    testingMetadata,
                })
            ),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetTestingMetadataError()))
            )
        )
    );

    getAthleteAgents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetAthleteAgents),
            switchMap((action) => this.athleteService.getAthleteAgents(action.athleteId)),
            map((athleteAgents: Array<AthleteSupportPersonnel>) =>
                AllAthleteActions.GetAthleteAgentsSuccess({ athleteAgents })
            ),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetAthleteAgentsError()))
            )
        )
    );

    getAthleteTests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetAthleteTests),
            switchMap((action) => this.athleteService.getAthleteTests(action.athleteId, 'status')),
            map((tests: Array<Test>) => AllAthleteActions.GetAthleteTestsSuccess({ tests })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetMajorEventsError()))
            )
        )
    );

    getWhereaboutsFailures$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetWhereaboutsFailures),
            switchMap((action) => this.athleteService.getWhereaboutsFailures(action.athleteId)),
            map((whereaboutsFailures: Array<WhereaboutsFailure>) =>
                AllAthleteActions.GetWhereaboutsFailuresSuccess({
                    whereaboutsFailures,
                })
            ),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetWhereaboutsFailuresError()))
            )
        )
    );

    getAthleteTUEs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetAthleteTUEs),
            switchMap((action) => this.athleteService.getAthleteTUEs(action.athleteId)),
            map((tues: any) => AllAthleteActions.GetAthleteTUEsSuccess({ tues })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetAthleteTUEsError()))
            )
        )
    );

    getAthleteAdrvs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetAthleteADRVs),
            switchMap((action) => this.athleteService.getAthleteAdrvs(action.athleteId)),
            map((adrvs: any) => AllAthleteActions.GetAthleteADRVsSuccess({ adrvs })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetAthleteADRVsError()))
            )
        )
    );

    getAthleteSanctions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AllAthleteActions.GetAthleteSanctions),
            switchMap((action) => this.athleteService.getAthleteSanctions(action.athleteId)),
            map((sanctions: any) => AllAthleteActions.GetAthleteSanctionsSuccess({ sanctions })),
            catchError((_error: any, effect: Observable<Action>) =>
                effect.pipe(startWith(AllAthleteActions.GetAthleteSanctionsError()))
            )
        )
    );

    constructor(private actions$: Actions, private athleteService: AthleteService) {}
}
