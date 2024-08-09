import { Routes } from '@angular/router';
import { CanDeactivateGuard, YearGuard } from '@shared/guards';
import { DistributionPlanComponent } from './containers';

export const ROUTES: Routes = [
    {
        path: ':year',
        component: DistributionPlanComponent,
        canActivate: [YearGuard],
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: '',
        component: DistributionPlanComponent,
        canDeactivate: [CanDeactivateGuard],
    },
];
