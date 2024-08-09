import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Observer, Subject } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { latinize } from '@shared/utils/string-utils';
import { deepEqual } from '@shared/utils/object-util';
import { TOItem } from '@shared/models';

export const TO_TYPEAHEAD_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TOTypeaheadComponent),
    multi: true,
};

interface BlurOrSelectEvent {
    blurEvent?: any;
    selectedItem?: any;
}

@Component({
    selector: 'app-to-typeahead',
    templateUrl: './to-typeahead.component.html',
    styleUrls: ['./to-typeahead.component.scss'],
    providers: [TO_TYPEAHEAD_VALUE_ACCESSOR],
})
export class TOTypeaheadComponent implements ControlValueAccessor, OnInit {
    @ViewChild('inputRef', { static: true }) inputRef?: ElementRef;

    dataSource$: Observable<Array<any>>;

    onBlurSubject$: Subject<BlurOrSelectEvent> = new Subject<BlurOrSelectEvent>();

    onChange: any;

    onTouched: any;

    value = '';

    // The input field data-qa attribute
    @Input() dataQA = '';

    @Input() dataQAIndex = '';

    @Input() hasError = false;

    // The field input ID
    @Input() fieldId = '';

    // Determines if the field is the starting focus for the container's components
    @Input() isStartingFocus = false;

    @Input() suggestionField: any;

    // Whether to render the input as invalid or not
    @Input() isInvalid = false;

    // Whether to render the input as disable or not
    @Input() isDisabled = false;

    // If allowArbitraryInput is false, the user cannot enter text that is not in the suggestions list
    @Input() allowArbitraryInput = false;

    @Input() tos: Observable<Array<TOItem>> = new Observable<Array<TOItem>>();

    @Input() showTestingOrderNumberOnly = false;

    // Event emitted when an item is selected
    @Output() readonly selected = new EventEmitter<any>();

    // Event emitted when no suggestion is found for the user input
    @Output() readonly noResult = new EventEmitter<boolean>();

    // Event emitted when the suggestions loading state changes
    @Output() readonly loading = new EventEmitter<boolean>();

    @Output() readonly inputBlur = new EventEmitter();

    @Output() readonly inputFocus = new EventEmitter<string>();

    // Event emitted when the typeahead has been emptied
    @Output() readonly clearedSelection = new EventEmitter<any>();

    // The item selected, used to clear the field when the component
    // loses focus and the value is invalid
    private selectedItem: TOItem | undefined;

    private sortSuggestions: any;

    constructor() {
        // This is the default sorting function
        this.sortSuggestions = (query: string): ((item1: TOItem, item2: TOItem) => number) => (
            item1: TOItem,
            item2: TOItem
        ): number => {
            const latinizedQuery = latinize(query.toLocaleLowerCase());
            const i1 = item1.testingOrderNumber.toLocaleLowerCase().indexOf(latinizedQuery);
            const i2 = item2.testingOrderNumber.toLocaleLowerCase().indexOf(latinizedQuery);
            return i1 - i2;
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
            map((suggestions: Array<TOItem>) => {
                // Sort the suggestions
                if (this.sortSuggestions) {
                    return suggestions.sort(this.sortSuggestions(this.value));
                }
                return suggestions;
            })
        );

        this.onBlurSubject$.pipe(debounceTime(100)).subscribe((event: BlurOrSelectEvent) => {
            // There was a selection, set field, sync with form, trigger select
            if (event.selectedItem) {
                this.selectItem(event);
            } else if (this.value === '') {
                this.clearSelection();
            } else if (this.selectedItem?.testingOrderNumber) {
                this.writeValue(this.selectedItem);
            }

            if (this.onTouched) this.onTouched();
            this.inputBlur.emit();
        });
    }

    private selectItem(event: BlurOrSelectEvent) {
        const toItem: TOItem = event.selectedItem;

        if (!deepEqual(this.selectedItem, toItem)) {
            this.selected.emit(toItem);
        }

        this.writeValue(toItem);
        if (this.onChange) this.onChange(toItem);
    }

    private clearSelection() {
        this.selectedItem = undefined;
        this.selected.emit();
        this.clearedSelection.emit();
        if (this.onChange) this.onChange(undefined);
    }

    ngOnInit(): void {
        if (this.isStartingFocus) {
            this.focus();
        }
    }

    loadSuggestions = (token: string): Observable<Array<TOItem>> => {
        const latinizedToken = latinize(token.trim().toLocaleLowerCase());
        return this.tos.pipe(
            map((suggestions: Array<TOItem>) => {
                const listTO: Array<TOItem> = suggestions.filter(
                    (toItem: TOItem): boolean =>
                        latinize(toItem.testingOrderNumber.toLocaleLowerCase()).indexOf(latinizedToken) >= 0 &&
                        toItem.test !== undefined
                );
                const exactTo: TOItem | undefined = suggestions.find(
                    (to) => to.testingOrderNumber.replace(/\D/g, '') === token.replace(/\D/g, '') && !to.test
                );
                // Used to populate a 'New Athlete' option
                if (exactTo) {
                    listTO.push(new TOItem(exactTo));
                }
                return listTO;
            })
        );
    };

    typeaheadLoading(loading: boolean): void {
        this.loading.emit(loading);
    }

    typeaheadOnSelect(event: any): void {
        this.onBlurSubject$.next({ selectedItem: event.item });
    }

    typeaheadNoResults(noResults: boolean): void {
        this.noResult.emit(noResults);
    }

    // We listen to blur events on the input component
    // to reset the value if nothing was selected
    onBlur(event: any): void {
        event.stopImmediatePropagation();
        event.preventDefault();
        this.onBlurSubject$.next({ blurEvent: event });
    }

    onFocus(event: any): void {
        this.inputFocus.emit(event.target.value);
    }

    writeValue(toItem: TOItem): void {
        if (toItem) {
            this.value = toItem.placeholder
                ? `${toItem.testingOrderNumber} - ${toItem.placeholder}`
                : toItem.testingOrderNumber;
        }

        this.selectedItem = toItem;
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    focus(): void {
        // Without the setTimeout, the input field doesnt get the focus
        setTimeout(() => this.inputRef && this.inputRef.nativeElement.focus());
    }
}
