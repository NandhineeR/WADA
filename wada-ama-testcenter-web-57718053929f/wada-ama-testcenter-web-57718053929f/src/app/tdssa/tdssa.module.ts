import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BootstrapModule } from '@shared/bootstrap.module';
import { SharedModule } from '@shared/shared.module';
import { ROUTES } from './tdssa.routes';
import { effects, reducers } from './store';
import * as fromContainers from './containers';
import * as fromComponents from './components';
import * as fromPipes from './pipes';
import * as fromServices from './services';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BootstrapModule,
        SharedModule,
        ReactiveFormsModule,
        RouterModule.forChild(ROUTES),
        StoreModule.forFeature('tdssa', reducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [...fromContainers.containers, ...fromComponents.components, ...fromPipes.pipes],
    providers: [...fromServices.services],
})
export class TDSSAModule {}
