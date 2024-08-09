import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Observer, of, Subject } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { isNullOrBlank, latinize } from '@shared/utils/string-utils';
import { deepEqual, objectContains } from '@shared/utils';

export const TYPEAHEAD_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TypeaheadComponent),
    multi: true,
};

interface BlurOrSelectEvent {
    isWipedItem?: boolean;
    selectedItem?: any;
}

@Component({
    selector: 'app-typeahead',
    templateUrl: './typeahead.component.html',
    styleUrls: ['./typeahead.component.scss'],
    providers: [TYPEAHEAD_VALUE_ACCESSOR],
})
export class TypeaheadComponent implements ControlValueAccessor, OnInit {
    @ViewChild('inputRef', { static: true }) inputRef?: ElementRef;

    @Output() readonly inputBlur = new EventEmitter();

    @Output() readonly inputChange = new EventEmitter();

    @Output() readonly inputFocus = new EventEmitter();

    // Event emitted when the suggestions loading state changes
    @Output() readonly loading = new EventEmitter<boolean>();

    // Event emitted when no suggestion is found for the user input
    @Output() readonly noResult = new EventEmitter<boolean>();

    // Event emitted when an item is selected
    @Output() readonly selected = new EventEmitter<any>();

    // If allowArbitraryInput is false, the user cannot enter text that is not in the suggestions list
    @Input() allowArbitraryInput = false;

    // If the suggestions are complex objects, this is the alternative field to show in the input field
    @Input() alternativeSuggestionField: any;

    // This is true if the control is bound to a string in a form
    @Input() bindAsString = false;

    // The input field data-qa attribute
    @Input() dataQA = '';

    @Input() dataQAIndex = '';

    // The delay in milliseconds after the last keystroke before the suggestions are loaded
    @Input() delayMs = 0;

    // The field input ID
    @Input() fieldId = '';

    @Input() hasError = false;

    @Input() hasWarning = false;

    // For DCO table, provide the index of the row.
    @Input() index = -1;

    @Input() isDCOParticipant = false;

    // Whether to render the input as disable or not (and empties the field)
    @Input() isDisabled = false;

    // Whether to render the input as invalid or not
    @Input() isInvalid = false;

    @Input() isStartingFocus = false;

    // Whether to render the input as disable or not (doesn't empty the field)
    @Input() isReadonly = false;

    // Optional template to render a suggestion item in the list
    @Input() itemTemplate: TemplateRef<any> | undefined;

    // The input field placeholder
    @Input() placeholder = '';

    // Whether the list is scrollable or not
    @Input() scrollable = true;

    // An optional function to sort the suggestions (useful for custom sorting on complex objects)
    // This is a currying function. It takes the query as input and must return a comparison function
    // (query: string) => (item1: any, item2: any): number { ... }
    @Input() sortSuggestions: any;

    // Function that takes a string as input and returns an Array Observable
    @Input() suggestions: any;

    // If the suggestions are complex objects, this is the field to show in the input field
    @Input() suggestionField: any;

    // The number of suggestions to show in a scrollable view
    @Input() suggestionsInScrollableView = 7;

    // The total number of suggestions to show
    @Input() suggestionsLimit = 50;

    @Input() removeItem = '';

    dataSource$: Observable<Array<any>>;

    isSelectedIetm = false;

    onBlurSubject$: Subject<BlurOrSelectEvent> = new Subject<BlurOrSelectEvent>();

    onChange: any;

    onTouched: any;

    // The item selected, used to clear the field when the component
    // loses focus and the value is invalid
    selectedItem: any | undefined;

    // The value of the input field
    value = '';

    constructor() {
        // This is the default sorting function
        this.sortSuggestions = (query: string): ((item1: any, item2: any) => number) => (
            item1: any,
            item2: any
        ): number => {
            const latinizedQuery = latinize(query.toLocaleLowerCase());
            const item1LowerCase = this.getField(item1).toLocaleLowerCase();
            const item2LowerCase = this.getField(item2).toLocaleLowerCase();
            const i1 = Math.min(item1LowerCase.indexOf(latinizedQuery), 1);
            const i2 = Math.min(item2LowerCase.indexOf(latinizedQuery), 1);
            let compareResult = i1 - i2;
            if (compareResult === 0) {
                // If the result is 0, then it will sort alphabetically
                compareResult = item1LowerCase.localeCompare(item2LowerCase);
            }
            return compareResult;
        };

        // Initialize the data source for the suggestions
        this.dataSource$ = new Observable((observer: Observer<any>) => {
            // This runs on every subscription and feeds the observable
            // It is triggered on keyup after the specifed typeahead delay
            observer.next(this.value);
        }).pipe(
            switchMap((query: string) => {
                // Load the suggestions for this query
                return this.loadSuggestions(query);
            }),
            map((suggestions: Array<any>) => {
                this.setQAAttributes();
                // Sort the suggestions
                if (this.sortSuggestions) {
                    return suggestions.sort(this.sortSuggestions(this.value));
                }
                return suggestions;
            })
        );

        // If-Statement are ordered by operations' priority
        this.onBlurSubject$.pipe(debounceTime(100)).subscribe((event: BlurOrSelectEvent) => {
            // Focus out clear out the field, sync with form
            if (event.isWipedItem) {
                if (this.onChange) this.onChange(undefined);
                this.selected.emit();
                // There was a selection, set field, sync with form, trigger select
            } else if (event.selectedItem) {
                this.selectItem(event);
                // The field was cleared out, set field, sync with form, trigger select
            } else if (!this.value || !this.value.trim()) {
                this.clearSelection();
                // No selection, field not cleared out, arbitrary values forbidden, reset the field to the last selected value
            } else if (!this.allowArbitraryInput) {
                this.value = this.getField(this.selectedItem);
                // No selection, field not cleared out, arbitrary values allowed, sync with form
            } else if (this.isDisabled) {
                this.value = '';
            } else if (this.bindAsString) {
                if (this.onChange) this.onChange(this.value);
            }
            if (this.onTouched) this.onTouched();
            this.inputBlur.emit();
        });
    }

    private selectItem(event: BlurOrSelectEvent) {
        const value = event.selectedItem;
        this.value = this.getField(value);
        if (this.getField(this.selectedItem) !== this.getField(value)) {
            this.selectedItem = value;
            if (this.onChange) this.onChange(this.bindAsString ? this.value : value);
            this.selected.emit(value);
        }
    }

    private clearSelection() {
        this.value = '';
        if (this.getField(this.selectedItem) !== '' || this.bindAsString) {
            this.selectedItem = undefined;
            if (this.onChange) this.onChange(undefined);
            this.selected.emit();
        }
    }

    ngOnInit(): void {
        if (this.isStartingFocus) {
            this.focus();
        }
    }

    getField(item: any): string {
        let field = this.suggestionField.length > 0 && item ? item[this.suggestionField] : item;
        if (!field && this.alternativeSuggestionField) {
            field = this.alternativeSuggestionField.length > 0 && item ? item[this.alternativeSuggestionField] : item;
        }
        return (field || '').trim();
    }

    loadSuggestions = (token: string): Observable<Array<any>> => {
        if (this.isDCOParticipant && this.index >= 0) {
            return this.suggestions ? this.suggestions(token.trim(), this.index) : of([]);
        }
        return this.suggestions ? this.suggestions(token.trim()) : of([]);
    };

    typeaheadLoading(loading: boolean): void {
        this.loading.emit(loading);
    }

    typeaheadOnSelect(event: any): void {
        this.isSelectedIetm = true;
        this.onBlurSubject$.next({ selectedItem: event.item });
    }

    typeaheadNoResults(noResults: boolean): void {
        this.noResult.emit(noResults);
    }

    // Check ngModelChange(It needs to be ngModelChange and not change because the former emits on each keypress,not the latter)
    // on new keypress, if user can enter random strings
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleOnChange(_event: any): void {
        if (this.allowArbitraryInput) {
            if (this.onChange) this.onChange(this.value);
            this.inputChange.emit();
        }
    }

    writeValue(value: any): void {
        this.value = this.bindAsString ? (value as string) : this.getField(value);
        this.selectedItem = value;
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    focus(): void {
        // Without the setTimeout, the input field doesnt get the focus
        setTimeout(() => {
            if (this.inputRef) {
                this.inputRef.nativeElement.focus();
            }
        });
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled && !this.isReadonly) {
            this.value = '';
            this.selectedItem = undefined;
        }
    }

    handleOnFocusOut(event: any) {
        const newValue = event?.target?.value || '';
        if (this.allowArbitraryInput) {
            // Update value if user can enter text that is not in the suggestions list
            this.value = newValue;
            this.selectedItem = this.value;
            this.onBlurSubject$.next({});
        } else if (!(deepEqual(this.selectedItem, newValue) || objectContains(this.selectedItem, newValue))) {
            // Reset value if no selection, value changed
            setTimeout(() => {
                // Wait because typeaheadOnSelect is being trigger after focusout
                if (!this.isSelectedIetm) {
                    this.value = '';
                    this.selectedItem = undefined;
                    this.onBlurSubject$.next({ isWipedItem: true });
                }
            }, 100);
        }
        this.isSelectedIetm = false;
    }

    // Listen to keyboard keys in order to cover case in which element value is deleted and user stays in the field
    handleDeleteKeyboardEvent(event: KeyboardEvent): void {
        const target = event.target as HTMLTextAreaElement;
        if (
            (target != null &&
                ((isNullOrBlank(target.value) && event.key === 'Delete') ||
                    (isNullOrBlank(target.value) && event.key === 'Backspace'))) ||
            event.key === 'Tab'
        ) {
            this.onBlurSubject$.next({});
        }
    }

    setQAAttributes(): void {
        setTimeout(() => {
            const dropdownItems = Array.from(this.inputRef?.nativeElement.nextElementSibling?.children || []);
            dropdownItems.forEach((element, index) => {
                const el = element as Element;
                if (el !== null && !isNullOrBlank(el.id)) {
                    el.setAttribute('data-qa', `${this.dataQA}Option`);
                    el.setAttribute('data-qa-precision', index.toString());
                }
            });
        });
    }
}
