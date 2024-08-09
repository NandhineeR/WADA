import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { TranslationService } from '@core/services';
import * as fromRootStore from '@core/store';
import { DCFForm, DCFFormUtils, IMultipleDCFView, UrineSampleBoundaries } from '@dcf/models';
import * as fromStore from '@dcf/store';
import { ErrorMessageKeyEnums } from '@shared/models/enums';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-view-multiple-dcf',
    templateUrl: './view-multiple-dcf.component.html',
    styleUrls: ['./view-multiple-dcf.component.scss'],
})
export class ViewMultipleDCFComponent implements OnInit, OnDestroy {
    error$: Observable<boolean> = this.store.select(fromStore.getMultipleDCFGlobalError);

    errorMsgKey$: Observable<string | undefined> = this.store.pipe(
        select(fromStore.getMultipleDCFErrorMessageKey),
        map((messageKey: string | null) => ErrorMessageKeyEnums.getValue(messageKey))
    );

    loading$: Observable<boolean> = this.store.select(fromStore.getMultipleDCFGlobalLoading);

    locale$: Observable<string> = this.store.select(fromRootStore.getLocale);

    translations$ = this.translationService.translations$;

    urineSampleBoundaries$: Observable<UrineSampleBoundaries | null> = this.store.select(
        fromStore.getMultipleDCFUrineSampleBoundaries
    );

    completedDcfs: Array<IMultipleDCFView> = new Array<IMultipleDCFView>();

    draftedDcfs: Array<IMultipleDCFView> = new Array<IMultipleDCFView>();

    ids: Array<string> = new Array<string>();

    inView = false;

    showErrors = false;

    toId: string | null = null;

    viewModels: Array<IMultipleDCFView> | undefined = [];

    private currentId: string | undefined;

    private selectedId: string | undefined;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>, private translationService: TranslationService) {}

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                this.ids = state.queryParams ? (state.queryParams.id as string).split(',') : [];
                this.inView = state.url.includes('view');
                const payload = {
                    ids: this.parseIds(state.queryParams.id),
                };
                this.store.dispatch(fromStore.MultipleDCFInitView(payload));
            })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getMultipleDCFTestingOrderId).subscribe((id: string | null) => {
                this.toId = id;
            })
        );

        this.subscriptions.add(
            this.store.pipe(select(fromStore.getMultipleDCFFormView)).subscribe((dcfs: Array<DCFForm>) => {
                this.buildViewModel(dcfs);
            })
        );
    }

    /**
     * Build the presentation object needed to display the forms
     * @param dcfs: Array of dcfForm
     */
    buildViewModel(dcfs: Array<DCFForm>): void {
        if (this.completedDcfs.length > 0) this.completedDcfs = [];
        if (this.draftedDcfs.length > 0) this.draftedDcfs = [];
        this.viewModels = dcfs.map((dcf: DCFForm) => {
            const dcfId = dcf.id?.toString() || '';
            const singleDCF = (dcfs && dcfs.length === 1) || false;
            const active = dcfId === this.currentId || singleDCF;
            const view: IMultipleDCFView = {
                title: dcf.name,
                active,
                data: dcf,
                dcfId,
                errors: new Set<string>(),
                fieldsSecurity: dcf.fieldsSecurity,
                status: dcf.status,
                sampleErrors: 0,
            };

            this.validateDCF(view);

            if (dcf.status === 'Completed') {
                this.completedDcfs.push(view);
            }
            if (dcf.status === 'Draft') {
                this.draftedDcfs.push(view);
            }
            return view;
        });
    }

    isEdit(module: string): boolean {
        return module.substring(module.lastIndexOf('/') + 1) === 'edit';
    }

    isModelSelected(id: any): boolean {
        return id.toString() === this.selectedId?.toString();
    }

    parseIds(param: any): Array<string> {
        return param && param.length <= 1 ? [param] : param;
    }

    showModel(id: any): boolean {
        return id.toString() === this.currentId?.toString();
    }

    scroll(id: string): void {
        if (id) {
            const element: Element | null = document.getElementById(`${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    toggleAccordion(id: string): void {
        this.selectedId = id?.toString() || '';
        if (this.currentId?.toString() === id.toString()) {
            this.currentId = undefined;
            return;
        }

        if (!this.currentId) {
            const activeModel =
                this.viewModels && this.viewModels.find((m: IMultipleDCFView) => m.dcfId.toString() === id.toString());
            if (activeModel) {
                this.currentId = id;
            }
        } else {
            this.currentId = undefined;
        }
    }

    validateDCF(model: IMultipleDCFView): void {
        model.errors.clear();
        model.errors = DCFFormUtils.missingFields(model.data);
    }
}
