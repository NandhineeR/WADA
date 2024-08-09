import { MatTableDataSource } from '@angular/material/table';
import { ColumnDef } from '@shared/models';

interface Filters {
    columns: { [field: string]: string };
    global: string;
}

export class DataSource<T> extends MatTableDataSource<T> {
    filters: Filters = { columns: {}, global: '' };

    constructor(data: Array<T>) {
        super(data);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.filterPredicate = (item: T, _filter: string) => {
            const globalMatch = Object.keys(item).some((field) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return item[field] !== null
                    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      item[field].toString().toLocaleLowerCase().includes(this.filters.global)
                    : false;
            });
            const colMatch = !Object.keys(this.filters.columns).reduce((remove, field) => {
                return remove ||
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    item[field] !== null
                    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      !item[field].toString().toLocaleLowerCase().includes(this.filters.columns[field])
                    : false;
            }, false);
            return globalMatch && colMatch;
        };
    }

    filterColumn(filterValue: string, columnDef: ColumnDef<T>): void {
        this.filters.columns[columnDef.key] = filterValue.trim().toLocaleLowerCase();
        this.filter = JSON.stringify(this.filters);
        columnDef.value = filterValue;
    }

    filterGlobal(filterValue: string): void {
        this.filters.global = filterValue.trim().toLocaleLowerCase();
        this.filter = JSON.stringify(this.filters);
    }
}
