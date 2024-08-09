import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TypeaheadComponent } from '@shared/components/typeahead/typeahead.component';
import { PopoverService } from '@core/services';
import { Organization } from '@core/models';

@Component({
    selector: 'app-switch-organization',
    templateUrl: './switch-organization.component.html',
    styleUrls: ['./switch-organization.component.scss'],
})
export class SwitchOrganizationComponent {
    @Input() organizationName = '';

    @Input() page = '';

    @Input() organizationsSuggestions: any;

    @Output()
    readonly changeOrganization: EventEmitter<Organization> = new EventEmitter<Organization>();

    @ViewChild('typeaheadRef', { static: true })
    typeaheadRef?: TypeaheadComponent;

    private organization?: Organization;

    constructor(private popoverService: PopoverService) {}

    selected(organization: Organization): void {
        this.organization = organization;
    }

    changeOrg(): void {
        if (this.organization) {
            this.changeOrganization.emit(this.organization);
        }
        this.requestClose();
    }

    onClose(): void {
        this.organization = undefined;
        if (this.typeaheadRef) {
            this.typeaheadRef.value = '';
        }
    }

    onOpen(): void {
        if (this.typeaheadRef) {
            this.typeaheadRef.focus();
        }
    }

    requestClose(): void {
        this.popoverService.closeAll();
    }
}
