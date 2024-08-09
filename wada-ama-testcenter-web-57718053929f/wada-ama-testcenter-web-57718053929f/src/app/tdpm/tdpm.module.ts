import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgrxFormsModule } from 'ngrx-forms';
import { BootstrapModule } from '@shared/bootstrap.module';
import { SharedModule } from '@shared/shared.module';
import * as fromGuards from '@shared/guards';
import { ROUTES } from './tdpm.routes';
import { reducers, effects } from './store';

import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromServices from './services';
import * as fromPipes from './pipes';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BootstrapModule,
        SharedModule,
        NgrxFormsModule,
        RouterModule.forChild(ROUTES),
        StoreModule.forFeature('tdpm', reducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [...fromContainers.containers, ...fromComponents.components, ...fromPipes.pipes],
    providers: [...fromServices.services, ...fromGuards.guards],
})
export class TDPMModule {}
