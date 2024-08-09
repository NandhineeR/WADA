import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DpDatePickerModule } from 'ng2-date-picker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { BootstrapModule } from './bootstrap.module';
import * as fromDirectives from './directives';
import * as fromComponents from './components';
import * as fromPipes from './pipes';
import * as fromGuards from './guards';
import * as fromServices from './services';
import { MaterialModule } from './material.module';

@NgModule({
    imports: [
        CommonModule,
        BootstrapModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        MaterialModule,
        ReactiveFormsModule,
        DpDatePickerModule,
        MatCardModule,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    exports: [...fromDirectives.directives, ...fromComponents.components, ...fromPipes.pipes],
    declarations: [...fromDirectives.directives, ...fromComponents.components, ...fromPipes.pipes],
    providers: [...fromGuards.guards, ...fromServices.services],
    entryComponents: [fromComponents.TooltipWrapperComponent],
})
export class SharedModule {}
