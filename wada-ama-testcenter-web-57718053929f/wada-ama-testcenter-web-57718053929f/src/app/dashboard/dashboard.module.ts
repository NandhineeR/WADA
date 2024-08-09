import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '@shared/shared.module';
import { BootstrapModule } from '@shared/bootstrap.module';
import { ROUTES } from './dashboard.routes';
import { effects, reducers } from './store';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromServices from './services';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BootstrapModule,
        SharedModule,
        RouterModule.forChild(ROUTES),
        StoreModule.forFeature('dashboard', reducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [...fromComponents.components, ...fromContainers.containers],
    providers: [...fromServices.services],
})
export class DashboardModule {}
