import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { BootstrapModule } from '@shared/bootstrap.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ROUTES } from './athlete.routes';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromServices from './services';
import * as fromPipes from './pipes';
import { athleteReducers } from './store/reducers';
import { effects } from './store/effects';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        BootstrapModule,
        RouterModule.forChild(ROUTES),
        StoreModule.forFeature('athlete', athleteReducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [...fromComponents.components, ...fromContainers.containers, ...fromPipes.pipes],
    providers: [...fromServices.services],
})
export class AthleteModule {}
