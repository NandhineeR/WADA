import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Directive({
    selector: '[appDropdownElement]',
})
export class DropdownElementDirective {
    @Input('appDropdownElement') value: any;

    @HostBinding('style.position') position = 'relative';

    @HostBinding('style.padding') padding = '0.25rem 1rem';

    @HostBinding('class.selected') get chose(): any {
        return this.isSelected;
    }

    @Output() readonly selected: EventEmitter<any> = new EventEmitter<any>();

    set isSelected(selected: boolean) {
        this._isSelected = selected;
    }

    get isSelected(): boolean {
        return this._isSelected;
    }

    private _isSelected = false;

    get text(): string {
        const { nativeElement } = this.elementRef;

        return (nativeElement && nativeElement.textContent) || '';
    }

    constructor(private elementRef: ElementRef) {}

    @HostListener('click') onClick(): void {
        this.selected.emit(this.value);
    }

    @HostListener('mouseover') onMouseover(): void {
        this._isSelected = true;
    }

    @HostListener('mouseout') onMouseout(): void {
        this._isSelected = false;
    }
}
