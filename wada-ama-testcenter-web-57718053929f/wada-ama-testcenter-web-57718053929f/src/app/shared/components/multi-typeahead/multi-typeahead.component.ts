/* eslint-disable no-new-func */
import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrBlank, latinize } from '@shared/utils/string-utils';

export const MULTI_TYPEAHEAD_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiTypeaheadComponent),
    multi: true,
};

@Component({
    selector: 'app-multi-typeahead',
    styleUrls: ['./multi-typeahead.component.scss'],
    templateUrl: './multi-typeahead.component.html',
    providers: [MULTI_TYPEAHEAD_VALUE_ACCESSOR],
})
export class MultiTypeaheadComponent implements OnChanges, ControlValueAccessor {
    onChange: any;

    onTouched: any;

    value = '';

    _preSelectedItem = new Array<any>();

    // Pre-selected items
    @Input() set preSelectedItem(items: Array<any>) {
        if (this.selectedSuggestions.length !== items.length && !isNullOrBlank(this.suggestionField)) {
            this.selectedSuggestions = [];
            this._preSelectedItem = items;
            items.forEach((item) => {
                this.valueSelected(item);
            });
        }
    }

    // The delay in milliseconds after the last keystroke before the suggestions are loaded
    @Input() delayMs = 100;

    // Wheter the list is scrollable or not
    @Input() scrollable = false;

    // The total number of suggestions to show
    @Input() suggestionsLimit = 50;

    // The number of suggestions to show in a scrollable view
    @Input() suggestionsInScrollableView = 10;

    // If the suggestions are complex objects, this is the field to show in the input field
    @Input() suggestionField = '';

    // Whether to render the input as invalid or not
    @Input() isInvalid = false;

    // The input field placeholder
    @Input() placeholder = '';

    // If allowArbitraryInput is false, the user cannot enter text that is not in the suggestions list
    @Input() allowArbitraryInput = false;

    // An optional function to sort the suggestions (useful for custom sorting on complex objects)
    // This is a currying function. It takes the query as input and must return a comparison function
    // (query: string) => (item1: any, item2: any): number { ... }
    @Input() sortSuggestions: any;

    // Optional template to render a suggestion item in the list
    @Input() itemTemplate: TemplateRef<any> | undefined;

    // Function that takes a string as input and returns an Array Observable
    @Input() suggestions = Function();

    @Input() removeItem = '';

    // The maximum number of items selected
    @Input() maxTags = 3;

    // The input field data-qa attribute
    @Input() dataQA = '';

    @Input() isDisabled = false;

    // Event emitted when an item is selected
    @Output() readonly selected = new EventEmitter<Array<any>>();

    // Event emitted when no suggestion is found for the user input
    @Output() readonly noResult = new EventEmitter<boolean>();

    // Event emitted when the suggestions loading state changes
    @Output() readonly loading = new EventEmitter<boolean>();

    selectedSuggestions: Array<any> = [];

    constructor() {
        this.sortSuggestions = (query: string): ((item1: any, item2: any) => number) => (
            item1: any,
            item2: any
        ): number => {
            const item1LowerCase = this.getField(item1).toLocaleLowerCase();
            const item2LowerCase = this.getField(item2).toLocaleLowerCase();

            if (query === undefined) {
                return item1LowerCase.localeCompare(item2LowerCase);
            }

            const latinizedQuery = latinize(query.toLocaleLowerCase());
            const i1 = item1LowerCase.indexOf(latinizedQuery);
            const i2 = item2LowerCase.indexOf(latinizedQuery);
            return i1 - i2;
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ngOnChanges(_changes: SimpleChanges): void {
        if (this.removeItem) {
            this.removeValue(this.removeItem);
        }
    }

    valueSelected(item: any): void {
        setTimeout(() => {
            this.value = '';
        });
        if (item !== undefined && this.selectedSuggestions.length < this.maxTags) {
            this.selectedSuggestions = [...this.selectedSuggestions, item].sort(this.sortSuggestions());
            if (this.onChange) this.onChange(this.selectedSuggestions);
            this.selected.emit(this.selectedSuggestions);
        }
    }

    removeValue(item: any): void {
        const index = this.selectedSuggestions.indexOf(item);
        if (index !== -1) {
            this.selectedSuggestions = [
                ...this.selectedSuggestions.slice(0, index),
                ...this.selectedSuggestions.slice(index + 1),
            ];
            if (this.onChange) this.onChange(this.selectedSuggestions);
            this.selected.emit(this.selectedSuggestions);
        }
    }

    suggestionsWithoutSelected = (token: string): Observable<Array<any>> => {
        return this.suggestions(token.trim()).pipe(
            map((suggestions: Array<any>) =>
                suggestions.filter((item: any) => this.selectedSuggestions.indexOf(item) === -1)
            )
        );
    };

    getField(item: any): any {
        return this.suggestionField.length > 0 ? item[this.suggestionField] : item;
    }

    writeValue(value: Array<any>): void {
        if (value !== this.selectedSuggestions) {
            this.selectedSuggestions = value;
        }
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
}
