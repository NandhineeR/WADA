import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UnprocessableEntityError } from '@core/models';
import { TranslationService } from '@core/services';
import * as fromRootStore from '@core/store';
import { RouterStateUrl } from '@core/store';
import { select, Store } from '@ngrx/store';
import { DCF_MODULE_NAME, TESTING_ORDER, UNSUCCESSFUL_ATTEMPT } from '@shared/utils/module-name';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-loading-frame',
    templateUrl: './loading-frame.component.html',
    styleUrls: ['./loading-frame.component.scss'],
})
export class LoadingFrameComponent {
    @Input() loading = false;

    @Input() error = false;

    @Input() saveError = false;

    @Input() errorDescription = '';

    @Input() unprocessableEntityError: UnprocessableEntityError | null = null;

    @Output() resetErrors = new EventEmitter<any>();

    translations$ = this.translationService.translations$;

    targetObject = '';

    action = '';

    isFromUA$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getActiveRoute),
        map((routerState: RouterStateUrl) => {
            return this.checkRouterState(UNSUCCESSFUL_ATTEMPT, routerState.url);
        })
    );

    isFromTO$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getActiveRoute),
        map((routerState: RouterStateUrl) => {
            if (routerState.url.includes(UNSUCCESSFUL_ATTEMPT)) return false;
            return this.checkRouterState(TESTING_ORDER, routerState.url);
        })
    );

    isFromDCF$: Observable<boolean> = this.store.pipe(
        select(fromRootStore.getActiveRoute),
        map((routerState: RouterStateUrl) => {
            return this.checkRouterState(DCF_MODULE_NAME, routerState.url);
        })
    );

    constructor(private store: Store<fromRootStore.IState>, private translationService: TranslationService) {}

    callParentComponent() {
        if (this.error) this.resetErrors.emit();
    }

    private getAction(url: string): string {
        if (url.includes('view')) return 'view';
        if (url.includes('edit')) return 'edit';
        return '';
    }

    private checkRouterState(targetModule: string, url: string): boolean {
        if (url.includes(targetModule)) {
            this.targetObject = targetModule;
            this.action = this.getAction(url);
            return true;
        }
        return false;
    }

    get unprocessableEntityErrorType(): string | null {
        return this.unprocessableEntityError?.entityType || null;
    }

    get unprocessableEntityErrorMaximum(): string | null {
        return this.unprocessableEntityError?.unprocessableEntities[0].parameters?.get('MAXIMUM') || null;
    }
}
