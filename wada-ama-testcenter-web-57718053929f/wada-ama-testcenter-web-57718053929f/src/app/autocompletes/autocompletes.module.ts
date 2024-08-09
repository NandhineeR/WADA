import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MaterialModule } from '@shared/material.module';
import { SharedModule } from '@shared/shared.module';
import { effects } from './store/effects';
import { autoCompletesReducers } from './store/reducers';
import * as fromServices from './services';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MaterialModule,
        StoreModule.forFeature('autoCompletes', autoCompletesReducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [],
    providers: [...fromServices.services],
})
export class AutoCompletesModule {}
