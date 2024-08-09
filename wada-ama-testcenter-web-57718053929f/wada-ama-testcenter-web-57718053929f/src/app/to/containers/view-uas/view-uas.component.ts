import {
    FieldsSecurity,
    ObjectTargetEnum,
    Reason,
    SpecificCode,
    UAActionRight,
    ErrorMessageKeyEnums,
    ModificationInfo,
} from '@shared/models';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { TranslationService } from '@core/services';
import { IViewUA, UADeletion, UAForm, UAFormUtils, UAStatus } from '@to/models';
import * as fromRootStore from '@core/store';
import { DeleteModalComponent } from '@shared/components';
import { map, withLatestFrom } from 'rxjs/operators';
import { pull } from 'lodash-es';
import * as fromStore from '@to/store';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-view-uas',
    templateUrl: './view-uas.component.html',
    styleUrls: ['./view-uas.component.scss'],
})
export class ViewUAsComponent implements OnInit, OnDestroy {
    readonly objectTargetEnum = ObjectTargetEnum;

    @ViewChild(DeleteModalComponent, { static: true })
    deleteUAModal?: DeleteModalComponent;

    error$: Observable<boolean> = this.store.select(fromStore.getUAError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getUAErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    fieldsSecurityByUAId$: Observable<Map<string, FieldsSecurity>> = this.store.select(
        fromStore.getFieldsSecurityByUAId
    );

    hasBeenDeleted$: Observable<boolean> = this.store.select(fromStore.getUAHasBeenDeleted);

    loading$: Observable<boolean> = this.store.select(fromStore.getUALoading);

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    translations$ = this.translationService.translations$;

    inView = false;

    ids: Array<string> = new Array<string>();

    showErrors = false;

    toId = '';

    uaDeletion: UADeletion | null = null;

    viewModels: Array<IViewUA> | undefined = [];

    private currentId: string | undefined;

    private subscriptions = new Subscription();

    constructor(
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private store: Store<fromRootStore.IState>,
        private translationService: TranslationService
    ) {
        iconRegistry.addSvgIcon('more_vert', sanitizer.bypassSecurityTrustResourceUrl('assets/more_vert.svg'));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            combineLatest([this.store.select(fromRootStore.getActiveRoute)]).subscribe(
                ([state]: [fromRootStore.RouterStateUrl]) => {
                    this.ids = (state.queryParams?.id as string)?.split(',') || [];
                    this.inView = state.module.includes('view');
                    const payload = {
                        ids: this.parseIds(state.queryParams.id),
                    };
                    this.store.dispatch(fromStore.InitViewUA(payload));
                }
            )
        );

        this.subscriptions.add(
            combineLatest([this.store.select(fromRootStore.getActiveRoute), this.hasBeenDeleted$]).subscribe(
                ([, hasBeenDeleted]: [any, boolean]) => {
                    if (hasBeenDeleted) {
                        this.ids = pull(this.ids, this.uaDeletion?.unsuccessfulAttemptId || '');
                    }
                }
            )
        );

        this.subscriptions.add(
            this.store.select(fromStore.getUATOId).subscribe((id: string) => {
                this.toId = id;
            })
        );

        this.subscriptions.add(
            this.store
                .pipe(select(fromStore.getUAForm), withLatestFrom(this.fieldsSecurityByUAId$))
                .subscribe(([uas, fieldsSecurityByUAId]: [Array<UAForm>, Map<string, FieldsSecurity>]) => {
                    this.viewModels = uas.map((ua: UAForm) => {
                        const uaId = ua.id || '';
                        const singleUA = (uas && uas.length === 1) || false;
                        const active = uaId === this.currentId || singleUA;
                        const status =
                            ua.status?.specificCode === SpecificCode.Complete
                                ? UAStatus.SavedAsComplete
                                : UAStatus.SavedAsDraft;
                        const security = fieldsSecurityByUAId.get(uaId) || new FieldsSecurity();

                        const view: IViewUA = {
                            title: ua.athleteName,
                            active,
                            data: ua,
                            uaId,
                            errors: new Set<string>(),
                            status,
                            security,
                        };

                        this.validateUA(view);

                        return view;
                    });
                })
        );
    }

    canEditUA(uaId: string): Observable<boolean> {
        return this.fieldsSecurityByUAId$.pipe(
            map((securityMap: Map<string, FieldsSecurity>) => {
                const actions = securityMap.get(uaId)?.actions;

                return actions?.includes(UAActionRight.Edit) || false;
            })
        );
    }

    cancel(): void {
        window.history.go(-1);
    }

    deleteUnsuccessfulAttempt(uaObject: Reason): void {
        if (this.uaDeletion) {
            this.store.dispatch(
                fromStore.DeleteUA({
                    testId: this.uaDeletion.testId,
                    unsuccessfulAttemptId: uaObject.objectId,
                    reason: uaObject.details,
                })
            );
        }
    }

    isEdit(module: string): boolean {
        return module.substring(module.lastIndexOf('/') + 1) === 'edit';
    }

    openDeleteUA(uaDeletion: UADeletion): void {
        this.uaDeletion = uaDeletion;
        if (this.deleteUAModal) {
            this.deleteUAModal.onOpen();
        }
    }

    parseIds(param: any): Array<string> {
        return param.length <= 1 ? [param] : param;
    }

    print(): void {
        window.print();
    }

    resetUA(): void {
        this.store.dispatch(fromStore.ResetUA());
    }

    toggleAccordion(selectedModel: IViewUA, id: string): void {
        const tempActiveModel = this.viewModels && this.viewModels.find((model: IViewUA) => model.active);
        // set the first clicked UA as active if nothing is currently active
        if (!tempActiveModel) {
            selectedModel.active = true;
            this.currentId = undefined;
        }

        // close the UA if clicked twice
        if (this.currentId === id) {
            selectedModel.active = false;
            return;
        }

        if (tempActiveModel && this.currentId !== id) {
            tempActiveModel.active = false;
            selectedModel.active = true;
        }

        if (!this.currentId) {
            this.currentId = id;
        }

        if (this.viewModels) {
            const currentModel = this.viewModels.find((vm) => vm.uaId === this.currentId);

            if (currentModel) {
                this.currentId = id;
            }
        }
    }

    validateUA(model: IViewUA): void {
        model.errors.clear();
        model.errors = UAFormUtils.missingFields(model.data);
    }

    get createInfo(): ModificationInfo | null {
        return this.viewModels && this.viewModels.length > 0 && this.viewModels[0].data
            ? this.viewModels[0].data.creationInfo
            : null;
    }

    get updateInfo(): ModificationInfo | null {
        return this.viewModels && this.viewModels.length > 0 && this.viewModels[0].data
            ? this.viewModels[0].data.updateInfo
            : null;
    }
}
