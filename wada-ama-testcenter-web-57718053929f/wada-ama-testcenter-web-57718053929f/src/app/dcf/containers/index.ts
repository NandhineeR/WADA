import { ViewResultsVerificationComponent } from '@dcf/containers/view-results-verification/view-results-verification';
import { CreateEditDCFComponent } from './create-edit-dcf/create-edit-dcf.component';
import { CreateEditMultipleDCFComponent } from './create-edit-multiple-dcf/create-edit-multiple-dcf.component';
import { Step1Component } from './step-1/step-1.component';
import { Step2Component } from './step-2/step-2.component';
import { Step3Component } from './step-3/step-3.component';
import { ViewDCFComponent } from './view-dcf/view-dcf.component';
import { ViewMultipleDCFComponent } from './view-multiple-dcf/view-multiple-dcf.component';

export const containers = [
    CreateEditDCFComponent,
    CreateEditMultipleDCFComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    ViewDCFComponent,
    ViewMultipleDCFComponent,
    ViewResultsVerificationComponent,
];

export * from './create-edit-dcf/create-edit-dcf.component';
export * from './create-edit-multiple-dcf/create-edit-multiple-dcf.component';
export * from './step-1/step-1.component';
export * from './step-2/step-2.component';
export * from './step-3/step-3.component';
export * from './view-dcf/view-dcf.component';
export * from './view-multiple-dcf/view-multiple-dcf.component';
export * from '@dcf/containers/view-results-verification/view-results-verification';
