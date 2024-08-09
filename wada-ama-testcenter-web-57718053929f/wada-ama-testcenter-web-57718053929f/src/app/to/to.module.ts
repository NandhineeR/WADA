import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AngularResizedEventModule } from 'angular-resize-event';
import { MaterialModule } from '@shared/material.module';
import { SharedModule } from '@shared/shared.module';
import { BootstrapModule } from '@shared/bootstrap.module';
import { ROUTES } from './to.routes';
import { effects, toReducers, uaReducers } from './store';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromServices from './services';
import * as fromPipes from './pipes';
import * as fromGuards from './guards';

@NgModule({
    imports: [
        BootstrapModule,
        CommonModule,
        EffectsModule.forFeature(effects),
        FormsModule,
        ReactiveFormsModule,
        AngularResizedEventModule,
        RouterModule.forChild(ROUTES),
        SharedModule,
        StoreModule.forFeature('to', toReducers),
        StoreModule.forFeature('ua', uaReducers),
        MaterialModule,
    ],
    declarations: [...fromComponents.components, ...fromContainers.containers, ...fromPipes.pipes],
    providers: [...fromGuards.guards, ...fromServices.services],
})
export class TOModule {}
