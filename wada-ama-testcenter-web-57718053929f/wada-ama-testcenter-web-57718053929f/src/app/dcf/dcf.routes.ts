import { Routes } from '@angular/router';
import { UserRolesEnum } from '@shared/models';
import { RoleGuard } from '@core/guards';
import {
    CreateEditDCFComponent,
    CreateEditMultipleDCFComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    ViewDCFComponent,
    ViewMultipleDCFComponent,
    ViewResultsVerificationComponent,
} from './containers';
import { CanDeactivateGuard, DCFRouteGuard } from './guards';

export interface StepRouteData {
    step: number;
    nextStep: number;
}

const stepsRoutes: Routes = [
    {
        path: 'step/1',
        component: Step1Component,
        data: { step: 1, nextStep: 2 },
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'step/2',
        component: Step2Component,
        data: { step: 2, nextStep: 3 },
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'step/3',
        component: Step3Component,
        data: { step: 3, nextStep: 0 },
        canDeactivate: [CanDeactivateGuard],
    },
    { path: '', redirectTo: 'step/1' },
];

export const ROUTES: Routes = [
    {
        path: 'new',
        component: CreateEditDCFComponent,
        children: stepsRoutes,
        canActivate: [RoleGuard, DCFRouteGuard],
        data: { role: UserRolesEnum.DCF_WRITER, fallback: [UserRolesEnum.DCO_RIGHT] },
    },
    {
        path: 'edit/:id',
        component: CreateEditDCFComponent,
        children: stepsRoutes,
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.DCF_WRITER,
            fallback: [UserRolesEnum.DCF_ANONYMOUS_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'view/:id',
        component: ViewDCFComponent,
        canActivate: [RoleGuard],
        runGuardsAndResolvers: 'always',
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
        path: 'multiple/view',
        component: ViewMultipleDCFComponent,
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.DCF_READER,
            fallback: [UserRolesEnum.DCF_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'multiple/new',
        component: CreateEditMultipleDCFComponent,
        canActivate: [RoleGuard],
        data: { role: UserRolesEnum.DCF_WRITER, fallback: [UserRolesEnum.DCO_RIGHT] },
    },
    {
        path: 'multiple/edit',
        component: CreateEditMultipleDCFComponent,
        canActivate: [RoleGuard],
        data: {
            role: UserRolesEnum.DCF_WRITER,
            fallback: [UserRolesEnum.DCF_ANONYMOUS_WRITER, UserRolesEnum.DCO_RIGHT],
        },
    },
    {
        path: 'result/:id/sample/:sampleId/matching-result/:matchingResultId',
        component: ViewResultsVerificationComponent,
    },
    {
        path: '',
        redirectTo: 'new',
    },
];
