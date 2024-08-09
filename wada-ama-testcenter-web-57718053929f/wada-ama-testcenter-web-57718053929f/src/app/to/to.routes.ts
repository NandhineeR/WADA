import { Routes } from '@angular/router';
import { RoleGuard } from '@core/guards';
import { UserRolesEnum } from '@shared/models';
import {
    AddAnalysesModalComponent,
    AddAthleteFromGroupComponent,
    AddAthleteModalComponent,
    AddPlaceholderComponent,
    CreateEditTOComponent,
    CreateEditUAComponent,
    SearchAthleteComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    ViewTestingOrderComponent,
    ViewUAsComponent,
} from './containers';
import { ViewTestingOrdersComponent } from './containers/view-testing-orders/view-testing-orders.component';
import { CanDeactivateGuard, TORouteGuard, UACanDeactivateGuard } from './guards';

export interface StepRouteData {
    step: number;
    nextStep: number;
}

const STEP2_ROUTES: Routes = [
    {
        path: 'add-athlete',
        component: AddAthleteModalComponent,
        outlet: 'modal',
        children: [
            {
                path: '',
                redirectTo: 'search-athlete',
                pathMatch: 'full',
            },
            {
                path: 'search-athlete',
                component: SearchAthleteComponent,
            },
            {
                path: 'add-athlete-from-group',
                component: AddAthleteFromGroupComponent,
            },
            {
                path: 'add-analyses-athlete',
                component: AddAnalysesModalComponent,
            },
            {
                path: 'add-placeholder',
                component: AddPlaceholderComponent,
            },
        ],
    },
];

const STEPS_ROUTES: Routes = [
    {
        path: 'step/1',
        component: Step1Component,
        data: {
            step: 1,
            nextStep: 2,
        },
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'step/2',
        component: Step2Component,
        children: STEP2_ROUTES,
        data: {
            step: 2,
            nextStep: 3,
        },
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'step/3',
        component: Step3Component,
        data: {
            step: 3,
            nextStep: 4,
        },
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'step/4',
        component: Step4Component,
        data: {
            step: 4,
            nextStep: 0,
        },
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: '',
        redirectTo: 'step/1',
        pathMatch: 'prefix',
    },
];

export const ROUTES: Routes = [
    {
        path: 'tos',
        component: ViewTestingOrdersComponent,
        canActivate: [RoleGuard, TORouteGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_READER,
            fallback: [UserRolesEnum.MISSION_ORDER_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'to/new',
        component: CreateEditTOComponent,
        children: STEPS_ROUTES,
        canActivate: [RoleGuard, TORouteGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_WRITER,
            fallback: [],
        },
    },
    {
        path: 'to/edit/:id',
        component: CreateEditTOComponent,
        children: STEPS_ROUTES,
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_WRITER,
            fallback: [],
        },
    },
    {
        path: 'to/view/:id',
        component: ViewTestingOrderComponent,
        children: STEP2_ROUTES,
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_READER,
            fallback: [UserRolesEnum.MISSION_ORDER_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'to/ua/new',
        component: CreateEditUAComponent,
        canActivate: [RoleGuard],
        canDeactivate: [UACanDeactivateGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_WRITER,
            fallback: [UserRolesEnum.DCF_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'to/ua/edit',
        component: CreateEditUAComponent,
        canActivate: [RoleGuard],
        canDeactivate: [UACanDeactivateGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_WRITER,
            fallback: [UserRolesEnum.DCF_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'to/ua/view',
        component: ViewUAsComponent,
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.MISSION_ORDER_READER,
            fallback: [
                UserRolesEnum.MISSION_ORDER_WRITER,
                UserRolesEnum.DCF_WRITER,
                UserRolesEnum.DCF_READER,
                UserRolesEnum.DCO_RIGHT,
            ],
        },
    },
    {
        path: 'to',
        redirectTo: 'to/new',
        pathMatch: 'prefix',
    },
];
