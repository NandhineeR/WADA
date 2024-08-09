import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { MaterialModule } from '@shared/material.module';
import { SharedModule } from '@shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { effects } from './store/effects';
import * as fromServices from './services';
import { sampleManagementReducers } from './store';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MaterialModule,
        StoreModule.forFeature('sampleManagement', sampleManagementReducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [],
    providers: [...fromServices.services],
})
export class SampleManagementModule {}
