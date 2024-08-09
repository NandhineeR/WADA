import { Routes } from '@angular/router';
import { UserRolesEnum } from '@shared/models';
import { ExternalUrlGuard, RoleGuard } from './guards';
import { RootComponent, UnauthorizedComponent } from './components';

export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: RootComponent,
    },
    {
        path: 'dashboard',
        loadChildren: () => import('@dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.TDP_READER,
            fallback: [UserRolesEnum.TDP_WRITER],
        },
    },
    {
        path: 'tdssa',
        loadChildren: () => import('@tdssa/tdssa.module').then((m) => m.TDSSAModule),
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.TDP_READER,
            fallback: [UserRolesEnum.TDP_WRITER],
        },
    },
    {
        path: 'tdpm',
        loadChildren: () => import('@tdpm/tdpm.module').then((m) => m.TDPMModule),
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.TDP_READER,
            fallback: [UserRolesEnum.TDP_WRITER],
        },
    },
    {
        path: 'tdp',
        loadChildren: () => import('@tdp/tdp.module').then((m) => m.TDPModule),
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.TDP_READER,
            fallback: [UserRolesEnum.TDP_WRITER],
        },
    },
    {
        path: 'dcf',
        loadChildren: () => import('@dcf/dcf.module').then((m) => m.DCFModule),
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.DCF_READER,
            fallback: [
                UserRolesEnum.DCF_WRITER,
                UserRolesEnum.DCF_ANONYMOUS_READER,
                UserRolesEnum.DCF_ANONYMOUS_WRITER,
                UserRolesEnum.DCO_RIGHT,
            ],
        },
    },
    {
        path: 'to',
        loadChildren: () => import('@to/to.module').then((m) => m.TOModule),
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_READER,
            fallback: [UserRolesEnum.MISSION_ORDER_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'athlete',
        loadChildren: () => import('@athlete/athlete.module').then((m) => m.AthleteModule),
        canActivate: [RoleGuard],
        data: { role: 'mission_order', fallback: [UserRolesEnum.DCO_RIGHT], mode: 'read' }, // need to be changed for the right role
    },
    {
        path: 'tue',
        loadChildren: () => import('@tue/tue.module').then((m) => m.TUEModule),
        canActivate: [RoleGuard],
    },
    {
        path: 'abp',
        loadChildren: () => import('@abp/abp.module').then((m) => m.ABPModule),
        canActivate: [RoleGuard],
    },
    {
        path: 'report',
        loadChildren: () => import('@report/report.module').then((m) => m.ReportModule),
        canActivate: [RoleGuard],
    },
    {
        path: 'external-redirect',
        canActivate: [ExternalUrlGuard],
        // We need a component here because we cannot define the route otherwise
        // Though this component will never get navigated to from this route
        component: UnauthorizedComponent,
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent,
    },
    {
        path: '**',
        redirectTo: '',
    },
];
