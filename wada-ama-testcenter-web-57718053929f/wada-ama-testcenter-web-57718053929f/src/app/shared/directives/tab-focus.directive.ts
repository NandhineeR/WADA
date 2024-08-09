import { Directive, ElementRef, HostListener } from '@angular/core';

const RADIO = 'RADIO';
const INPUT = 'INPUT';

@Directive({
    selector: '[appTabFocus]',
})
export class TabFocusDirective {
    constructor(private elementRef: ElementRef) {}

    @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent): void {
        if (
            e.key === 'Tab' &&
            (this.elementRef.nativeElement.className.includes('modal__wrapper') ||
                !this.elementRef.nativeElement.querySelector('.modal__overlay'))
        ) {
            this.focusNextElement(e);
        }
    }

    private focusNextElement(e: KeyboardEvent) {
        const focusables = this.elementRef.nativeElement.querySelectorAll(
            'a.circle, .menu-element, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];

        if (e.shiftKey && e.target === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        } else if (!e.shiftKey && e.target === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        } else {
            // This fix the tab button behavior to skip from one group of radio button to another one when there are multiple in a row
            // instead of skipping them all and going to the next non-radio button form element
            const target = e.target as HTMLElement;
            if (!target.getAttribute('type')) {
                return;
            }
            const inputType = target.getAttribute('type');
            if (target.tagName.toUpperCase() === INPUT && inputType && inputType.toUpperCase() === RADIO) {
                this.findNextFocusableFromRadioButton(e, focusables);
            }
        }
    }

    private findNextFocusableFromRadioButton = (e: KeyboardEvent, focusables: NodeListOf<HTMLElement>): void => {
        e.preventDefault();

        focusables.forEach((focusable: Element, index: number) => {
            if (e.target === focusable) {
                let j = 1;
                let foundFocus = false;

                while (!foundFocus) {
                    const sibling = focusables.item(e.shiftKey ? index - j : index + j);
                    j += 1;

                    foundFocus = this.focusElement(focusable, sibling);
                }
            }
        });
    };

    private focusElement(focusable: Element, elementToFocus: HTMLElement) {
        if (
            focusable.parentNode &&
            elementToFocus &&
            elementToFocus.parentNode &&
            elementToFocus.parentNode.parentNode !== focusable.parentNode.parentNode
        ) {
            const siblingInputType = elementToFocus.getAttribute('type');
            if (
                elementToFocus.tagName.toUpperCase() === INPUT &&
                siblingInputType &&
                siblingInputType.toUpperCase() === RADIO
            ) {
                if ((elementToFocus as HTMLInputElement).checked) {
                    elementToFocus.focus();
                    return true;
                }
            } else {
                elementToFocus.focus();
                return true;
            }
        }

        return false;
    }
}
