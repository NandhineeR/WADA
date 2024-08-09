import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AccordionModule } from 'ngx-bootstrap/accordion';

@NgModule({
    imports: [
        CommonModule,
        AccordionModule.forRoot(),
        BsDropdownModule.forRoot(),
        ModalModule.forRoot(),
        TypeaheadModule.forRoot(),
        CollapseModule.forRoot(),
    ],
    exports: [AccordionModule, BsDropdownModule, ModalModule, TypeaheadModule, CollapseModule],
})
export class BootstrapModule {}
