import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '@env';
import { EnsureHttpsInterceptor } from './ensure-https.interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { OrganizationIdInterceptor } from './organization-id.interceptor';
import { TimezoneInterceptor } from './timezone.interceptor';
import { LocaleInterceptor } from './locale.interceptor';
import { ThirdPartySourceOrgInterceptor } from './third-party-source-org.interceptor';
import { XCorrelationIDInterceptor } from './x-correlation-id.interceptor';
// Http interceptor providers in outside-in order
// eslint-disable-next-line prettier/prettier
export const interceptors: Array<Provider> = [ // NOSONAR
    {
        provide: HTTP_INTERCEPTORS,
        useClass: EnsureHttpsInterceptor,
        multi: true,
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: OrganizationIdInterceptor,
        multi: true,
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: TimezoneInterceptor,
        multi: true,
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: LocaleInterceptor,
        multi: true,
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ThirdPartySourceOrgInterceptor,
        multi: true,
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: XCorrelationIDInterceptor,
        multi: true,
    },
];

if (!environment.production) {
    interceptors.push({
        provide: HTTP_INTERCEPTORS,
        useClass: LoggingInterceptor,
        multi: true,
    });
}
