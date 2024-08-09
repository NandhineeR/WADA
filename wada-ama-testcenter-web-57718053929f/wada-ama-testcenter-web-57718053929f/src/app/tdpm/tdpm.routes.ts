import { Routes } from '@angular/router';
import { YearGuard } from '@shared/guards';
import { TDPMMonitoringComponent } from './containers';

export const ROUTES: Routes = [
    { path: '', component: TDPMMonitoringComponent },
    {
        path: ':year',
        component: TDPMMonitoringComponent,
        canActivate: [YearGuard],
    },
];
