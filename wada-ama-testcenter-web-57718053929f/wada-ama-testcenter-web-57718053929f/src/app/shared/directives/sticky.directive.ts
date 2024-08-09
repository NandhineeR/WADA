import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Output,
    Renderer2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/*
 * This directive mut be placed on a table
 * It makes the header sticky when scrolled out
 * by adding the sticky class to it
 */
@Directive({
    selector: '[appSticky]',
})
export class StickyDirective implements AfterViewInit {
    // This event returns the host's portion which is covered in pixels
    @Output()
    readonly lengthCovered: EventEmitter<number> = new EventEmitter<number>();

    private isSticky = false;

    private stickyHeaderSpacer: Element | undefined;

    constructor(
        private elementRef: ElementRef,
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2
    ) {}

    ngAfterViewInit(): void {
        const tableRef = this.elementRef.nativeElement;
        const bodyRef = this.getFirstChildByTagNameFromElement(tableRef, 'tbody');
        const headerRef = this.getFirstChildByTagNameFromElement(tableRef, 'thead');

        this.stickyHeaderSpacer = headerRef.cloneNode(true);
        this.renderer.setStyle(this.stickyHeaderSpacer, 'display', 'none');
        this.renderer.insertBefore(tableRef, this.stickyHeaderSpacer, bodyRef);

        this.checkIfSticky();
    }

    @HostListener('window:scroll')
    @HostListener('window:resize')
    onWindowEvents(): void {
        this.checkIfSticky();
    }

    checkIfSticky(): void {
        const tableRef = this.elementRef.nativeElement;
        const headerRef = this.getFirstChildByTagNameFromElement(tableRef, 'thead');

        const offsetScroll = this.document.documentElement.scrollTop;
        const offsetTable = tableRef.offsetTop;

        if (!this.isSticky && offsetScroll >= offsetTable) {
            this.renderer.addClass(headerRef, 'sticky');
            this.renderer.setStyle(this.stickyHeaderSpacer, 'display', 'table-header-group');
            this.isSticky = true;
        } else if (this.isSticky && offsetScroll <= offsetTable) {
            this.renderer.removeClass(headerRef, 'sticky');
            this.renderer.setStyle(this.stickyHeaderSpacer, 'display', 'none');
            this.isSticky = false;
        }

        if (this.isSticky) {
            this.renderer.setStyle(headerRef, 'width', `${tableRef.clientWidth}px`);
            this.renderer.setStyle(headerRef, 'margin-left', `-${this.document.documentElement.scrollLeft}px`);
            this.lengthCovered.emit(offsetScroll - offsetTable);
        } else {
            this.lengthCovered.emit(0);
        }
    }

    getFirstChildByTagNameFromElement(element: any, tag: string): any {
        return [...element.children].find((childElement: any) => {
            return tag.toLocaleUpperCase() === childElement.tagName;
        });
    }

    getChildrenByTagNameFromElement(element: any, tag: string): Array<any> {
        return [...element.children].filter((childElement: any) => {
            return tag.toLocaleUpperCase() === childElement.tagName;
        });
    }
}
