/* eslint-disable */
import { ColumnFooterDirective } from '@shared/directives/column-footer.directive';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnCellDirective } from '@shared/directives/column-cell.directive';
import { ColumnHeaderDirective } from '@shared/directives/column-header.directive';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu } from '@angular/material/menu';
import { DataSource, ColumnDef } from '@shared/models';
import { TestRow } from '@to/models';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslationService } from '@core/services';
import { isNullOrBlank } from '@shared/utils';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush, // To prevent errors with the selections emitter
    selector: 'app-data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T> implements OnInit, AfterViewInit {
    @ViewChild('bottomFooter', { static: true }) set bottomFooter(
        bottomFooter: ElementRef
    ) {
        this.showFooter = bottomFooter && bottomFooter.nativeElement;
    }

    @ViewChild('masterSelect') masterSelectElement: MatTooltip | null = null;

    @ViewChild(MatMenu, { static: true }) menu: MatMenu | null = null;

    @ViewChild('menu') menuElement: ElementRef | null = null;

    @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

    @ViewChild('selectedCount', { static: true })
    selectedCountElement: ElementRef | null = null;

    @ViewChild(MatSort, { static: true }) sort: MatSort | null = null;
    
    @ViewChild(MatTable, { static: true }) set table(
        table: MatTable<T> | null
    ) {
        this._table = table;
        if (table) {
            this.setInputWidth();
        }
    }
    
    get table(): MatTable<T> | null {
        return this._table;
    }

    @ViewChild('table', { static: true })
    tableElement: ElementRef | null = null;

    @Output() readonly deletedRow = new EventEmitter<T>();

    @Output() readonly orders = new EventEmitter<Array<T>>();

    @Output() readonly selections = new EventEmitter<Array<T>>();

    @Input() set allowMultiSelect(multi: boolean) {
        this.multiSelection = multi;
        this.selection = new SelectionModel<T>(multi, []);
    }

    get allowMultiSelect(): boolean {
        return this.multiSelection;
    }
   
    @Input() changeTableStyles = false;

    @Input() set columnDefs(cols: Array<Partial<ColumnDef<T>>>) {
        this.columns = cols.map((c) => ({ ...new ColumnDef<T>(), ...c }));
        this.menuColumns = this.columns.filter((c) => !c.disabled);
        this.menuColumns.forEach(
            (col) => (col.isActive = col.default || col.mandatory)
        );
        this.updateColumns();
    }

    @Input() dataSource: DataSource<T> | null = null;
    
    @Input() defaultPaginator = 0;

    @Input() deleteRowIcon = false;
    
    @Input() disabledSelections: Array<string> = [];

    @Input() error = false;

    @Input() isFirstRowSpecial = false;

    @Input() loading = false;

    @Input() marginTop = null;

    @Input() modifyState = false;

    @Input() paginatorChoices = [10, 25, 50, 100];

    @Input() showColumnMenu = false;

    @Input() showDrag = false;

    @Input() showFooter = true;
    
    @Input() showOrder = false;

    @Input() showPaginator = true;
    
    @Input() showRemove = false;
    
    @Input() showSelect = false;
    
    @Input() showTableFooter = true;
    
    @Input() showTopHeader = true;
    
    @Input() whiteBackground = false;

    translations$ = this.translationService.translations$;

    _table: MatTable<T> | null = null;
    
    activeColumns: Array<string> = [];
    
    columns: Array<ColumnDef<T>> = [];

    isDragEnabled = false;

    menuColumns: Array<ColumnDef<T>> = [];

    multiSelection = true;
    
    selection = new SelectionModel<T>(this.allowMultiSelect, []);

    constructor(
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private translationService: TranslationService,
        private renderer: Renderer2
    ) {
        iconRegistry.addSvgIcon(
            'more_vert',
            sanitizer.bypassSecurityTrustResourceUrl('assets/more_vert.svg')
        );
    }

    ngAfterViewInit(): void {
        if (this.dataSource !== null) {
            this.dataSource.sort = this.sort;
            // @ts-ignore
            this.dataSource.sortingDataAccessor = (
                data,
                sortHeaderId: string
            ) => {
                return this.getPropertyByPath(data as Object, sortHeaderId);
            };
            this.dataSource.paginator = this.paginator;
        }
        this.setInputWidth();
        this.redefineTableStyles();
        this.updateColumns();
    }

    ngOnInit(): void {
        if (this.dataSource !== null) {
            this.dataSource.sort = this.sort;
            // @ts-ignore
            this.dataSource.sortingDataAccessor = (
                data,
                sortHeaderId: string
            ) => {
                return this.getPropertyByPath(data as Object, sortHeaderId);
            };
            this.dataSource.paginator = this.paginator;
        }

        if (!this.allowMultiSelect) {
            this.selection.clear();
        }

        this.selection.changed.subscribe(() => {
            this.selections.emit(this.selection.selected);
        });
    }

    mousedown(): void {
        this.isDragEnabled = true;
    }

    mouseup(): void {
        this.isDragEnabled = false;
    }

    // Overrides tables styles
    redefineTableStyles(): void {
        if (
            this.changeTableStyles &&
            this.marginTop &&
            this.tableElement &&
            this.table
        ) {
            const tableContainer = this.tableElement.nativeElement;
            this.renderer.setStyle(
                tableContainer,
                'margin-top',
                this.marginTop
            );
        }
    }

    /**
     * Set the div width over the checkbox. The div is used to catch the onclick event.
     */
    setInputWidth(): void {
        const fakeCheckboxes = document.querySelectorAll('#fakeCheckbox');
        if (fakeCheckboxes.length > 0) {
            const inputWidth = fakeCheckboxes[0].clientHeight;
            fakeCheckboxes.forEach((checkbox: any) => {
                this.renderer.setStyle(
                    checkbox,
                    'width',
                    `${inputWidth - 2}px`
                );
            });
        }
    }

    getPropertyByPath(obj: Object, pathString: string): {} {
        // @ts-ignore
        return pathString.split('.').reduce((o, i) => o[i], obj);
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        // @ts-ignore
        const numRows = (this.dataSource && this.dataSource.data || []).filter(x => x.canBeSelected).length;
        return numSelected === numRows;
    }

    masterToggle(): void {
        this.isAllSelected() ? this.selection.clear() : this.markSelected();
        setTimeout(
            () => this.masterSelectElement && this.masterSelectElement.show()
        );
    }

    markSelected(): void {
        if (this.allowMultiSelect) {
            ((this.dataSource && this.dataSource.data) || []).forEach(
                (row: T) => {
                    // @ts-ignore
                    if (row.canBeSelected) this.selection.select(row);
                }
            );
        } else {
            this.selection.select(
                ((this.dataSource && this.dataSource.data) || [])[0]
            );
        }
    }

    updateColumns(): void {
        const menuColumns = this.menuColumns
            .filter((col) => col.isActive && !col.disabled)
            .map((col) => col.key);
        this.activeColumns = [];
        const DRAG = 'drag';
        const SELECT = 'select';
        const ORDER = 'order';
        const REMOVE = 'remove';
        if (this.showDrag) {
            this.activeColumns.push(DRAG);
        }

        if (this.showSelect) {
            this.activeColumns.push(SELECT);
        }

        if (this.showOrder) {
            this.activeColumns.push(ORDER);
        }
        this.activeColumns.push(...menuColumns);
        if (this.showRemove) {
            this.activeColumns.push(REMOVE);
        }
    }

    reorderCols(event: CdkDragDrop<Array<ColumnDef<T>>>): void {
        moveItemInArray(
            this.menuColumns,
            event.previousIndex,
            event.currentIndex
        );
        this.updateColumns();
    }

    drop(event: CdkDragDrop<Array<T>>): void {
        const prevIndex = (
            (this.dataSource && this.dataSource.data) ||
            []
        ).findIndex((d) => d === event.item.data);
        moveItemInArray(
            (this.dataSource && this.dataSource.data) || [],
            prevIndex,
            event.currentIndex
        );
        if (this.dataSource !== null) {
            this.dataSource.data = this.setRowOrder(this.dataSource.data);
            this.dataSource.data = this.dataSource.data.slice();
        }
        this.render();
    }

    deleteRow(row: T): void {
        if (row && this.dataSource) {
            if (!this.modifyState) {
                const dataCopy = [...this.dataSource.data];
                const index = dataCopy.findIndex((d) => d === row);
                dataCopy.splice(index, 1);
                this.dataSource.data = this.setRowOrder(dataCopy);
                this.render();
            }
            this.selection.deselect(row);
            this.deletedRow.emit(row);
        }
    }

    render(): void {
        this.table && this.table.dataSource && this.table.renderRows();
    }

    @ContentChildren(ColumnCellDirective)
    set cellTemplates(defs: QueryList<ColumnCellDirective>) {
        defs.forEach((def) => {
            const col = this.columns.find((x) => x.key === def.columnCell) || {
                cellTemplate: null,
                key: null,
            };
            col.cellTemplate = def.template;
            if (!col.key) {
                col.key = def.columnCell;
                // @ts-ignore
                this.columns = [...this.columns, {
                    ...new ColumnDef(),
                    ...col
                }];
            }
        });
    }

    @ContentChildren(ColumnHeaderDirective)
    set headerTemplates(defs: QueryList<ColumnHeaderDirective>) {
        defs.forEach((def) => {
            const col = this.columns.find(
                (x) => x.key === def.columnHeader
            ) || { headerTemplate: null, field: null };
            col.headerTemplate = def.template;
            if (!col.hasOwnProperty('key')) {
                // @ts-ignore
                col.key = def.columnHeader;
                this.columns = [
                    ...this.columns,
                    {
                        ...new ColumnDef(),
                        ...col,
                    },
                ];
            }
        });
    }

    @ContentChildren(ColumnFooterDirective)
    set footerTemplates(defs: QueryList<ColumnFooterDirective>) {
        defs.forEach((def) => {
            const col = this.columns.find(
                (x) => x.key === def.columnFooter
            ) || { footerTemplate: null, key: null };
            col.footerTemplate = def.template;
            if (!col.key) {
                col.key = def.columnFooter;
                // @ts-ignore
                this.columns = [...this.columns, {
                    ...new ColumnDef(),
                    ...col
                }];
            }
        });
    }

    setRowOrder(tests: Array<T>): Array<T> {
        for (let i = 0; i < tests.length; i++) {
            const test = (tests[i] as unknown) as TestRow;
            if (test.hasOwnProperty('order')) {
                const t = tests[i];
                // @ts-ignore
                t['order'] = i + 1;
            }
        }
        return tests;
    }

    canDeleteRow(index: number): boolean {
        return !this.isFirstRowSpecial || index != 0;
    }
}
