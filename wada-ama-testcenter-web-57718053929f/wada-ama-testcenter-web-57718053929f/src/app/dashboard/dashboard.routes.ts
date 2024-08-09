import { Routes } from '@angular/router';
import { DashboardMonitoringComponent } from './containers';

export const ROUTES: Routes = [
    {
        path: '',
        canActivate: [],
        component: DashboardMonitoringComponent,
    },
];
