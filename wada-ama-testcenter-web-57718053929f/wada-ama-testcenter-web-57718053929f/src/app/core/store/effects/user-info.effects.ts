import { APP_BASE_HREF } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IPreferences, IUserSettings } from '@core/models';
import { CoreApiService } from '@core/services';
import { environment } from '@env';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromRouter from '@ngrx/router-store';
import { GET_PREFERENCES_MAX_RETRIES, GET_PREFERENCES_RETRY_INTERVAL } from '@shared/models';
import { Observable, of } from 'rxjs';
import { catchError, delay, filter, map, mapTo, retryWhen, scan, switchMap, take, tap } from 'rxjs/operators';
import * as UserInfoActions from '@core/store/actions/user-info.actions';
import * as EnterpriseActions from '@core/store/actions/enterprise.actions';

@Injectable()
export class UserInfoEffects {
    readonly DEFAULT_LANGUAGE = 'en';

    getUserInfo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserInfoActions.GetUserInfo),
            switchMap(() =>
                this.coreService.getUserInfo().pipe(retryWhen((errors) => this.retryGetPreferences(errors)))
            ),
            switchMap((settings: IUserSettings) => [
                EnterpriseActions.GetDcfDataRetentionPeriod(),
                EnterpriseActions.GetDcfDecommissionStartDate(),
                EnterpriseActions.GetMaxNumberAdos(),
                EnterpriseActions.GetSampleCollectionDateInUtcStartDate(),
                EnterpriseActions.GetToDecommissionStartDate(),
                UserInfoActions.GetPreferencesSuccess({
                    preferences: settings.preferences,
                }),
                UserInfoActions.GetUserRolesSuccess({
                    roles: settings.roles,
                }),
                UserInfoActions.GetUserProfileSuccess({
                    profile: settings.profile,
                }),
            ]),
            catchError(() => of(UserInfoActions.GetUserInfoError()))
        )
    );

    getUserInfoError$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserInfoActions.GetUserInfoError),
            take(1),
            tap(() =>
                this.router.navigate(['/external-redirect', { externalUrl: 'https://site-maintenance.wada-ama.org' }], {
                    skipLocationChange: true,
                })
            )
        )
    );

    getPreferencesSuccess$: Observable<IPreferences> = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UserInfoActions.GetPreferencesSuccess),
                map((action) => action.preferences),
                tap((preferences: IPreferences) => {
                    const supportedLanguages: Array<string> = environment.supportedLanguages.split(',');

                    let preferredLanguage =
                        supportedLanguages.find((language: string) => language === preferences.locale) ||
                        this.DEFAULT_LANGUAGE;
                    if (preferredLanguage === 'pt_BR') {
                        preferredLanguage = 'pt';
                    } else if (preferredLanguage === 'pt') {
                        preferredLanguage = 'pt-PT';
                    } else if (preferredLanguage === 'nl_BE') {
                        preferredLanguage = 'nl';
                    } else if (preferredLanguage === 'nl') {
                        preferredLanguage = 'nl-NL';
                    } else if (preferredLanguage === 'zh_TW') {
                        preferredLanguage = 'zh';
                    } else if (preferredLanguage === 'zh') {
                        preferredLanguage = 'zh-CH';
                    } else if (preferredLanguage === 'fa_IR') {
                        preferredLanguage = 'fa-IR';
                    } else if (preferredLanguage === 'uk_UA') {
                        preferredLanguage = 'uk-UA';
                    }

                    // persist chosen locale
                    localStorage.setItem('locale', preferredLanguage);

                    // if we are not serving the app in the language set in the preferences
                    if (!this.baseHref.includes(`${preferredLanguage}/`) && environment.production) {
                        // substitute the locale and navigate to new path
                        const barePathIndex = window.location.href.indexOf(this.baseHref) + this.baseHref.length;
                        const barePath = window.location.href.slice(barePathIndex);
                        window.location.assign(`/ng/${preferredLanguage}/${barePath}`);
                    }
                })
            ),
        { dispatch: false }
    );

    resetOrganization$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromRouter.ROUTER_NAVIGATION),
            scan((modules, nextModule: any) => [modules[1], nextModule.payload.routerState.module], ['', '']),
            filter((modules) => modules[0] !== modules[1]),
            mapTo(UserInfoActions.ResetOrganizationView())
        )
    );

    constructor(
        private actions$: Actions,
        private coreService: CoreApiService,
        private router: Router,
        @Inject(APP_BASE_HREF) private baseHref: string
    ) {}

    retryGetPreferences(errors: Observable<any>) {
        let retries = 0;
        return errors.pipe(
            delay(GET_PREFERENCES_RETRY_INTERVAL),
            map((error) => {
                retries += 1;
                if (retries === GET_PREFERENCES_MAX_RETRIES) {
                    throw error;
                }
                return error;
            })
        );
    }
}
