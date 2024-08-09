import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { ToastrModule } from 'ngx-toastr';
import { RouterStateSerializer, StoreRouterConnectingModule, DefaultRouterStateSerializer } from '@ngrx/router-store';
import { MetaReducer, StoreModule } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';

import { APP_BASE_HREF, DecimalPipe, PlatformLocation } from '@angular/common';
import { storeDevToolsModule } from 'environments/store-dev-tools-module';
import { ApmErrorHandler, ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { environment } from '@env';
import { BootstrapModule } from '@shared/bootstrap.module';
import { SharedModule } from '@shared/shared.module';
import { AthleteModule } from '@athlete/athlete.module';
import { AutoCompletesModule } from '@autocompletes/autocompletes.module';
import { SampleManagementModule } from '@sampleManagement/sample-management.module';
import { TOModule } from '@to/to.module';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromHttpInterceptors from './http-interceptors';
import * as fromServices from './services';
import * as fromGuards from './guards';
import { ROUTES } from './core.routes';
import { CustomSerializer, effects, logger, reducers } from './store';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { featureWatcher } from './store/meta-reducers/feature-watcher.meta-reducer';
import { BuildManifestService } from './services/build-manifest.service';

/**
 * not used in production
 */
const metaReducers: Array<MetaReducer<any>> = [logger, featureWatcher];

export function getBaseHref(platformLocation: PlatformLocation): string {
    return platformLocation.getBaseHrefFromDOM();
}

export function getLocale(): string {
    return localStorage.getItem('locale') || 'en';
}

@NgModule({
    imports: [
        ApmModule,
        AthleteModule,
        TOModule,
        AutoCompletesModule,
        SampleManagementModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        BootstrapModule,
        SharedModule,
        ToastrModule.forRoot({ preventDuplicates: true }),
        RouterModule.forRoot(ROUTES, {
            enableTracing: true,
            relativeLinkResolution: 'legacy',
        }),
        StoreModule.forRoot(reducers, {
            metaReducers,
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
            },
        }),
        EffectsModule.forRoot(effects),
        StoreRouterConnectingModule.forRoot({
            serializer: DefaultRouterStateSerializer,
            stateKey: 'router',
        }),
        storeDevToolsModule,
    ],
    declarations: [...fromComponents.components, ...fromContainers.containers, UnauthorizedComponent],
    exports: [RouterModule, StoreModule, EffectsModule],
    providers: [
        ...fromServices.services,
        ...fromHttpInterceptors.interceptors,
        ...fromGuards.guards,
        BuildManifestService,
        DecimalPipe,
        CookieService,
        ApmService,
        { provide: ErrorHandler, useClass: ApmErrorHandler },
        {
            provide: APP_BASE_HREF,
            useFactory: getBaseHref,
            deps: [PlatformLocation],
        },
        { provide: RouterStateSerializer, useClass: CustomSerializer },
        { provide: LOCALE_ID, useValue: getLocale() },
    ],
    bootstrap: [fromContainers.AppComponent],
})
export class CoreModule {
    constructor(apmService: ApmService) {
        // Agent API is exposed through this apm instance
        if (environment.production && environment.apm.enabled) {
            apmService.init({
                serviceName: 'TestCenter-Web',
                serverUrl: environment.apm.serverUrl,
                environment: environment.apm.environment,
            });
        }
    }
}
