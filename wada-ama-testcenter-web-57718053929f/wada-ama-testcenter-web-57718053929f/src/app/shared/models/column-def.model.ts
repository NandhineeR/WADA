import { TemplateRef } from '@angular/core';

export class ColumnDef<T> {
    key = '';

    header = '';

    footer = '';

    cell: ((element: T) => any) | undefined;

    value = '';

    isActive = true;

    hasFiltering = false;

    hasSorting = false;

    disabled = false;

    mandatory = false;

    default = true;

    columnWidth = false;

    wrapContain = false;

    headerTemplate: TemplateRef<any> | null = null;

    cellTemplate: TemplateRef<any> | null = null;

    footerTemplate: TemplateRef<any> | null = null;

    total: (() => any) | undefined;
}
