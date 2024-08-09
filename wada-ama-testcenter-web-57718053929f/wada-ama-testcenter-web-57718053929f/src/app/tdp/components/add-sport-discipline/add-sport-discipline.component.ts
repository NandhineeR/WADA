import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SportDisciplineDescription } from '@core/models';
import { TypeaheadComponent } from '@shared/components';
import { PopoverService } from '@core/services';

@Component({
    selector: 'app-add-sport-discipline',
    templateUrl: './add-sport-discipline.component.html',
    styleUrls: ['./add-sport-discipline.component.scss'],
})
export class AddSportDisciplineComponent {
    @ViewChild('typeaheadRef', { static: true })
    typeaheadRef?: TypeaheadComponent;

    @Input() sportDisciplinesSuggestions: any;

    @Output()
    readonly addSportDiscipline: EventEmitter<SportDisciplineDescription> = new EventEmitter<SportDisciplineDescription>();

    private sportDiscipline?: SportDisciplineDescription;

    constructor(private popoverService: PopoverService) {}

    selected(discipline: SportDisciplineDescription): void {
        this.sportDiscipline = discipline;
    }

    addDiscipline(): void {
        if (this.sportDiscipline) {
            this.addSportDiscipline.emit(this.sportDiscipline);
        }
        this.requestClose();
    }

    onClose(): void {
        this.sportDiscipline = undefined;
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
