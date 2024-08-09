import { AfterViewChecked, Directive, ElementRef, Input, Renderer2 } from '@angular/core';

/**
 * Directive used for hiding fields according to user permission to access them
 */
@Directive({
    selector: '[appHideControl]',
})
export class HideControlDirective implements AfterViewChecked {
    @Input() permissions: Map<string, string> = new Map<string, string>();

    constructor(private elementRef: ElementRef, private renderer2: Renderer2) {}

    /**
     * Filter user access by fields allowed, hiding elements in the DOM in case of lack of privilege
     */
    ngAfterViewChecked(): void {
        if (this.permissions && Object.prototype.toString.call(this.permissions).includes('Map')) {
            this.filterUserAccess(this.permissions);
        } else if (this.permissions && Object.prototype.toString.call(this.permissions).includes('Object')) {
            this.filterUserAccess(new Map<string, string>(Object.entries(this.permissions)));
        }
    }

    private filterUserAccess(permissionMap: Map<string, string>): void {
        const children = this.elementRef.nativeElement.querySelectorAll('app-view-entry');
        children.forEach((child: any) => {
            if (child?.id && !permissionMap.has(child.id)) {
                this.renderer2.setStyle(child, 'display', 'none');
            } else if (child?.id && permissionMap.get(child.id) !== 'RW') {
                this.renderer2.setAttribute(child, 'readonly', 'true');
            }
        });
    }
}
