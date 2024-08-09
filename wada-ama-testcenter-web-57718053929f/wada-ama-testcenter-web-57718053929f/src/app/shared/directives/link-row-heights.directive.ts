import { AfterViewInit, Directive, ElementRef, HostBinding, HostListener, Input, OnDestroy } from '@angular/core';
import { LinkedColumnsMapService } from '@shared/services/linked-columns-map.service';

@Directive({
    selector: '[appLinkRowHeights]',
    exportAs: 'appLinkRowHeights',
})
export class LinkRowHeightsDirective implements AfterViewInit, OnDestroy {
    @Input() appLinkRowHeights = '';

    @HostBinding('class.sub-table') subTable = true;

    private rows: Array<HTMLElement> = [];

    constructor(public el: ElementRef, private linkedColumns: LinkedColumnsMapService) {}

    ngAfterViewInit(): void {
        this.linkedColumns.add(this.appLinkRowHeights, this);
        this.rows = Array.from(this.el.nativeElement.querySelectorAll('div'));
        this.resizeRows();
    }

    ngOnDestroy(): void {
        this.linkedColumns.remove(this.appLinkRowHeights, this);
    }

    resizeRows(): void {
        const allDirs = this.linkedColumns.get(this.appLinkRowHeights);
        this.rows.forEach((_, index) => {
            const linkedRows = (allDirs || []).map((d) => d.rows[index]);
            linkedRows.forEach((r) => {
                if (r && r.style) r.style.flexBasis = 'initial';
            });

            const maxHeight = Math.max(...linkedRows.map((r) => r?.offsetHeight || 0));
            linkedRows.forEach((r) => {
                if (r && r.style) r.style.flexBasis = `${maxHeight}px`;
            });
        });
    }

    @HostListener('window:resize') resize(): void {
        this.resizeRows();
    }
}
