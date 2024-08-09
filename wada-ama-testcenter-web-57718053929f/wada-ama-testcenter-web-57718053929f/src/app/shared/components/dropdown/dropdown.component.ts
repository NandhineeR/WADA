/* eslint-disable prettier/prettier */
import {
    AfterContentInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnDestroy,
    Output,
    QueryList,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DropdownElementDirective } from '@shared/directives/dropdown-element.directive';
import { deepEqual } from '@shared/utils/object-util';

export const DROPDOWN_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownComponent),
    multi: true,
};

@Component({
    selector: 'app-dropdown',
    template: `
        <div
            *ngIf="!isDisabled"
            #dropDownWrapper
            appClickOutside
            class="dropdown-wrapper"
            tabindex="0"
            [attr.data-qa]="dataQA"
            [attr.data-qa-precision]="dataQAIndex"
            (blur)="closeSelect()">
            <div
                class="dropdown-container"
                [class.error]="hasError"
                [class.open]="displayed">
                <span *ngIf="selectedElement">{{ selectedElement!.text }}</span>
                <span *ngIf="!selectedElement" i18n="@@select">Select</span>
            </div>
            <div
                #container
                class="dropdown-options-container"
                [hidden]="!displayed">
                <div #defaultOption *ngIf="defaultValue" class="dropdown-item" i18n="@@select" [appDropdownElement]="undefined">Select</div>
                <ng-content> </ng-content>
            </div>
        </div>
        <input
            *ngIf="isDisabled"
            field-input
            class="dropdown-wrapper fullWidth"
            type="text"
            [appDisable]="isDisabled"
            [attr.data-qa]="dataQA"
            [attr.data-qa-precision]="dataQAIndex"
            [value]="selectedElement?.text || ''">
    `,
    styleUrls: ['./dropdown.component.scss'],
    providers: [DROPDOWN_VALUE_ACCESSOR],
})
export class DropdownComponent implements OnDestroy, ControlValueAccessor, AfterContentInit {
    @ContentChildren(DropdownElementDirective)
    options: QueryList<DropdownElementDirective> = new QueryList();

    @ViewChild(DropdownElementDirective) set defaultDropdownElement(defaultDropdownElement: DropdownElementDirective) {
        if (this.defaultValue && defaultDropdownElement && this.options.length > 0) {
            this.subscriptions.unsubscribe();
            this.subscriptions = new Subscription();

            const newOptions = this.options.toArray();
            if (newOptions[0] === this._defaultDropdownElement) {
                newOptions[0] = defaultDropdownElement;
                this.options.reset(newOptions);
            } else {
                this.options.reset([defaultDropdownElement, ...this.options.toArray()]);
            }

            this._defaultDropdownElement = defaultDropdownElement;
            this.options.forEach((o: any) => this.subscriptions.add(this.setUpOnSelect(o)));
        }
    }

    @ViewChild('dropDownWrapper', { static: true })
    dropDownWrapper?: ElementRef;

    @ViewChild('container', { static: true }) set tableElement(element: ElementRef | null) {
        this.container = element;
        if (element && element.nativeElement) {
            this._renderer.setStyle(element.nativeElement, 'width', 'auto');
        }
    }

    get tableElement(): ElementRef | null {
        return this.container;
    }

    @Output() readonly selected = new EventEmitter<any>();

    @Output() readonly selectedItem = new EventEmitter<any>();

    @Output() readonly selectedOnBlur = new EventEmitter<any>();

    @Input() compare:(value1: any, value2: any) => boolean = deepEqual;

    @Input() dataQA = '';

    @Input() dataQAIndex = '';

    @Input() defaultValue = false;

    @Input() disableMouseOver = false;

    @Input() hasError = false;

    @Input() set identifier(id: string) {
        if (this.dropDownWrapper) {
            this.dropDownWrapper.nativeElement.id = id;
            this._identifier = id;
        }
    }

    get identifier(): string {
        return this._identifier;
    }

    @Input() set isDisabled(isDisabled: boolean) {
        this._isDisabled = isDisabled;
    }

    get isDisabled(): boolean {
        return this._isDisabled;
    }

    @Input() set minWidth(minWidth: number) {
        this._minWidth = minWidth;
        if (this.useMinWidth && this.dropDownWrapper && this.container) {
            this._renderer.setStyle(this.dropDownWrapper.nativeElement, 'width', `${this.minWidth}px`);
            this._renderer.setStyle(this.container.nativeElement, 'width', `${this.minWidth}px`);
        }
    }

    get minWidth(): number {
        return this._minWidth;
    }

    @Input() property = '';

    @Input() set useMinWidth(useMinWidth: boolean) {
        this._useMinWidth = useMinWidth;
    }

    get useMinWidth(): boolean {
        return this._useMinWidth;
    }

    @Input() set value(selectedValue: any) {
        if (selectedValue) {
            this.selectedValue = selectedValue;
            this.selectOption(selectedValue);
        }
    }

    displayed = false;

    selectedElement: DropdownElementDirective | undefined;

    private _defaultDropdownElement?: DropdownElementDirective;

    private _identifier = '';;

    private _isDisabled = false;

    private _minWidth = 30;

    private _useMinWidth = false;

    private container: ElementRef | null = null;

    private onChange: any;

    private onTouched: any;
    
    private selectedValue: any;
    
    private subscriptions = new Subscription();

    constructor(private _renderer: Renderer2) {}

    @HostListener('click') onClick(): void {
        if (!this.isDisabled) {
            this.openSelect();
        }
    }

    @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
        if (!this.isDisabled) {
            const { key } = event;
            switch (key) {
                case 'ArrowDown':
                    this.arrowDownKeydown(event);
                    break;

                case 'ArrowUp':
                    this.arrowUpKeydown(event);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    break;
                case 'Escape':
                case 'Esc':
                case 'Tab':
                case 'Enter':
                    this.closeSelect();
                    break;

                default:
                    break;
            }
        }
    }

    @HostListener('mouseover', ['$event']) onMouseover(event: MouseEvent): void {
        if (!this.disableMouseOver && !this.isDisabled) {
            this.selectedValue = event.currentTarget;
        }
    }

    ngAfterContentInit(): void {
        this.options.changes.subscribe(() => this.selectOption(this.selectedValue));
        if (this.selectedValue) {
            this.selectOption(this.selectedValue);
        }
        this.scrollEventListener(true);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.scrollEventListener(false);
    }

    closeSelect(): void {
        this.displayed = false;
        this.selectedOnBlur.emit(this.selectedValue);
    }

    focus(): void {
        setTimeout(() => {
            if (this.dropDownWrapper) {
                this.dropDownWrapper.nativeElement.focus();
            }
        });
    }

    getScrollOffsets(initialElement: ElementRef): string {
        let parentElement: HTMLElement = initialElement.nativeElement;
        let transformation = '';
        while (!(parentElement.style.position === 'relative' || parentElement.parentElement == null)) {
            if (parentElement.scrollLeft) {
                transformation += `translateX(-${parentElement.scrollLeft}px) `;
            }
            if (parentElement.scrollTop) {
                transformation += `translateY(-${parentElement.scrollTop}px) `;
            }
            parentElement = parentElement.parentElement;
        }
        return transformation;
    }

    registerOnChange(onChange: any): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    writeValue(value: any): void {
        this.selectedValue = value;
        this.selectOption(value);
    }

    private arrowDownKeydown(event: KeyboardEvent): void {
        if (!this.displayed) {
            this.openSelect();
        } else if (this.options && this.options.length > 0) {
            event.preventDefault();

            if (!this.selectedElement && !this.options.first.value) {
                this.selectedElement = this.options.first;
            }

            if (!this.selectedElement) {
                this.options.first.onClick();
            } else {
                this.selectNext();
            }
        }
    }

    private arrowUpKeydown(event: KeyboardEvent): void {
        if (this.displayed && this.options && this.options.length > 0) {
            event.preventDefault();

            if (this.selectedElement !== this.options.first) {
                const selectedIndex = this.getSelectedIndex();
                this.options.forEach((option: DropdownElementDirective, index) => {
                    if (index === selectedIndex - 1) {
                        option.onClick();
                    } else {
                        option.isSelected = false;
                    }
                });
            }
        }
    }

    private getSelectedIndex(): number {
        let selectedIndex = -1;
        this.options.forEach((option: DropdownElementDirective, index) => {
            if (this.selectedElement === option) {
                selectedIndex = index;
            }
        });

        return selectedIndex;
    }

    private openSelect(): void {
        if (this.onTouched) this.onTouched();
        this.displayed = !this.displayed;

        if (this.container && this.dropDownWrapper) {
            this._renderer.setStyle(
                this.container.nativeElement,
                'transform',
                this.getScrollOffsets(this.dropDownWrapper)
            );
        }
        this.subscriptions.unsubscribe();
        this.subscriptions = new Subscription();
        this.options.forEach((option: any) => this.subscriptions.add(this.setUpOnSelect(option)));

        if (this.selectedElement) {
            this.selectedElement.onClick();
        }
    }

    private scrollEventListener(isAdd: boolean): void {
        if (this.dropDownWrapper) {
            let currentElement: HTMLElement = this.dropDownWrapper.nativeElement;
            while (!(currentElement.style.position === 'relative' || currentElement.parentElement == null)) {
                if (isAdd) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    currentElement.addEventListener('scroll', (_event) => this.closeSelect());
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    currentElement.removeEventListener('scroll', (_event) => this.closeSelect());
                }
                currentElement = currentElement.parentElement;
            }
        }
    }

    private selectNext(): void {
        if (this.selectedElement !== this.options.last) {
            const selectedIndex = this.getSelectedIndex();
            this.options.forEach((option: DropdownElementDirective, index) => {
                if (index === selectedIndex + 1) {
                    option.onClick();
                } else {
                    option.isSelected = false;
                }
            });
        }
    }

    private selectOption(value: any): void {
        if (this.options) {
            let searchedElement: DropdownElementDirective | undefined =
                !value || !this.property
                    ? this.options.find((option) => option.value === value)
                    : this.options.find(
                        (option) =>
                              option &&
                              option.value &&
                              String(option.value[this.property]) === String(value[this.property])
                      );
            if (searchedElement === undefined) {
                searchedElement = this.options.find((option) => this.compare(option.value, value));
            }

            if (searchedElement) this.selectedElement = searchedElement;
        }
    }

    private setUpOnSelect(element: DropdownElementDirective): Subscription {
        return element.selected.subscribe((value: any) => {
            this.selectedValue = value;
            this.selectedElement = element;

            if (this.onChange) this.onChange(value);
            this.options.forEach((option) => {
                option.isSelected = false;
            });
            element.isSelected = true;
            setTimeout(() => {
                this.selectedItem.emit(value);
                this.selected.emit();
            }, 0);
        });
    }
}
