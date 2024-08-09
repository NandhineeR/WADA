import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DpDatePickerModule } from 'ng2-date-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgrxFormsModule } from 'ngrx-forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MaterialModule } from '@shared/material.module';
import { SharedModule } from '@shared/shared.module';
import { BootstrapModule } from '@shared/bootstrap.module';
import { ROUTES } from './dcf.routes';
import { effects } from './store/effects';
import { dcfMultipleReducers, dcfReducers } from './store/reducers';
import * as fromContainers from './containers';
import * as fromComponents from './components';
import * as fromServices from './services';
import * as fromGuards from './guards';
import * as fromPipes from './pipes';

@NgModule({
    imports: [
        CommonModule,
        DpDatePickerModule,
        SharedModule,
        BootstrapModule,
        FormsModule,
        ReactiveFormsModule,
        NgrxFormsModule,
        MaterialModule,
        RouterModule.forChild(ROUTES),
        StoreModule.forFeature('dcf', dcfReducers),
        StoreModule.forFeature('multiple-dcf', dcfMultipleReducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [...fromContainers.containers, ...fromComponents.components, ...fromPipes.pipes],
    providers: [...fromGuards.guards, ...fromServices.services, ...fromPipes.pipes],
})
export class DCFModule {}
