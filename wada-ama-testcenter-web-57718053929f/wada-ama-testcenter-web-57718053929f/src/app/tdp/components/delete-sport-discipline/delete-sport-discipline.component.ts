import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISportDisciplineId } from '@tdp/models';
import { PopoverService } from '@core/services';

@Component({
    selector: 'app-delete-sport-discipline',
    templateUrl: './delete-sport-discipline.component.html',
    styleUrls: ['./delete-sport-discipline.component.scss'],
})
export class DeleteSportDisciplineComponent {
    @Input() confirmDeletion = true;

    @Input() sportId = 0;

    @Input() sportName = '';

    @Input() disciplineId = 0;

    @Input() disciplineName = '';

    @Input() disabled = false;

    @Output()
    readonly delete: EventEmitter<ISportDisciplineId> = new EventEmitter();

    constructor(private popoverService: PopoverService) {}

    onDelete(): void {
        this.delete.emit({
            sportId: this.sportId,
            disciplineId: this.disciplineId,
        });
        this.close();
    }

    close(): void {
        this.popoverService.closeAll();
    }
}
