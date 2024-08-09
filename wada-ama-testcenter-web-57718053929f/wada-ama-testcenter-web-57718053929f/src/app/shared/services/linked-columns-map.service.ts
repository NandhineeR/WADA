import { Injectable } from '@angular/core';
import { LinkRowHeightsDirective } from '@shared/directives/link-row-heights.directive';

@Injectable({ providedIn: 'root' })
export class LinkedColumnsMapService {
    private columnsMap = new Map<string, Array<LinkRowHeightsDirective>>();

    add(key: string, directive: LinkRowHeightsDirective): void {
        if (key) {
            const dirs = this.columnsMap.get(key) || [];
            this.columnsMap.set(key, [...dirs, directive]);
        }
    }

    remove(key: string, directive: LinkRowHeightsDirective): void {
        const dirs = (this.columnsMap.get(key) || []).filter((d) => d !== directive);
        if (dirs.length > 0) {
            this.columnsMap.set(key, dirs);
        } else {
            this.columnsMap.delete(key);
        }
    }

    get(key: string): Array<LinkRowHeightsDirective> | undefined {
        return this.columnsMap.get(key);
    }
}
