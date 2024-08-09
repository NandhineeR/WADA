import { AfterViewInit, Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

const DISABLED = 'disabled';
const APP_DISABLED = 'app-disabled';
const TAB_INDEX = 'tabindex';
const TAG_ANCHOR = 'a';

/**
 * Directive takes disable status as input parameter. It will disable/enable DOM elements and their children
 * elements based on the input.
 */
@Directive({
    selector: '[appDisable]',
})
export class DisableDirective implements OnChanges, AfterViewInit {
    @Input() appDisable = true;

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

    ngOnChanges(): void {
        this.disableElement(this.elementRef.nativeElement);
    }

    ngAfterViewInit(): void {
        this.disableElement(this.elementRef.nativeElement);
    }

    private disableElement(element: any): void {
        if (this.appDisable) {
            if (!element.hasAttribute(DISABLED)) {
                this.renderer.setAttribute(element, APP_DISABLED, '');
                this.renderer.setAttribute(element, DISABLED, 'true');

                // disabling anchor tab keyboard event
                if (element.tagName.toLowerCase() === TAG_ANCHOR) {
                    this.renderer.setAttribute(element, TAB_INDEX, '-1');
                }
            }
        } else if (element.hasAttribute(APP_DISABLED)) {
            if (element.getAttribute('disabled') !== '') {
                element.removeAttribute(DISABLED);
            }
            element.removeAttribute(APP_DISABLED);
            if (element.tagName.toLowerCase() === TAG_ANCHOR) {
                element.removeAttribute(TAB_INDEX);
            }
        }
        if (element.children) {
            [...element.children].forEach((ele: any) => {
                this.disableElement(ele);
            });
        }
    }
}
