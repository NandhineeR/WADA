import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '@shared/guards';
import { RoleGuard } from '@core/guards';
import { DCFRouteGuard } from '@dcf/guards';
import * as fromContainers from './containers';

const stepsRoutes: Routes = [
    {
        path: 'dashboard',
        component: fromContainers.AthleteDashboardComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'profile',
        component: fromContainers.AthleteProfileComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'tests',
        component: fromContainers.AthleteTestsComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'biological-passport',
        component: fromContainers.BiologicalPassportComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'whereabouts',
        component: fromContainers.WhereaboutsComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'tue',
        component: fromContainers.TUEsComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'adrv',
        component: fromContainers.AthleteADRVComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'sanctions',
        component: fromContainers.AthleteSanctionsComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'permissions',
        component: fromContainers.AccessPermissionsComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'account',
        component: fromContainers.AccountManagementComponent,
        canDeactivate: [CanDeactivateGuard],
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
];

export const ROUTES: Routes = [
    {
        path: 'athlete/:id',
        children: stepsRoutes,
        component: fromContainers.AthletePageComponent,
        canDeactivate: [RoleGuard, DCFRouteGuard],
        data: { role: 'dcf', mode: 'write' },
    },
];
