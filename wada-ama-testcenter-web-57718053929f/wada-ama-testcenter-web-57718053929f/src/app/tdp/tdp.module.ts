import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '@shared/shared.module';
import { BootstrapModule } from '@shared/bootstrap.module';
import { ROUTES } from './tdp.routes';
import { effects, reducers } from './store';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromServices from './services';
import * as fromPipes from './pipes';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        BootstrapModule,
        RouterModule.forChild(ROUTES),
        StoreModule.forFeature('tdp', reducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [...fromComponents.components, ...fromContainers.containers, ...fromPipes.pipes],
    providers: [...fromServices.services],
})
export class TDPModule {}
