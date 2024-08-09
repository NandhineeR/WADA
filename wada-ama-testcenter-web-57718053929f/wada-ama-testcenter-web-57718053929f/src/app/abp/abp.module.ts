import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { BootstrapModule } from '@shared/bootstrap.module';
import { ROUTES } from './abp.routes';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, BootstrapModule, RouterModule.forChild(ROUTES)],
    declarations: [],
    providers: [],
})
export class ABPModule {}
