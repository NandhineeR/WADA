import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { FieldsSecurity, StatusEnum, TOActionRight } from '@shared/models';
import { AthleteGroup, IAthleteGroupView, TestingOrderMode } from '@to/models';
import { map } from 'rxjs/operators';
import { TranslationMap, TranslationService } from '@core/services';
import { ModalComponent } from '@shared/components';
import { AddAthleteFromGroupTableComponent } from './add-athlete-from-group-table/add-athlete-from-group-table.component';

type RouterStateUrl = fromRootStore.RouterStateUrl;

@Component({
    selector: 'app-add-athlete-from-group',
    templateUrl: './add-athlete-from-group.component.html',
    styleUrls: ['./add-athlete-from-group.component.scss'],
})
export class AddAthleteFromGroupComponent implements OnInit, OnDestroy {
    readonly actionRight = TOActionRight;

    readonly PLURAL: string = 'plural';

    readonly SINGULAR: string = 'singular';

    @ViewChild(ModalComponent, { static: true }) modal?: ModalComponent;

    @ViewChildren(AddAthleteFromGroupTableComponent)
    tableComponents?: QueryList<AddAthleteFromGroupTableComponent>;

    athletesError$: Observable<boolean> = this.store.select(fromStore.getAthletesError);

    athleteGroups$: Observable<Array<AthleteGroup> | null> = this.store.pipe(select(fromStore.getAthleteGroups));

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    inCreation$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Create)
    );

    isTOIssued$: Observable<boolean> = this.store.pipe(
        select(fromStore.getTOStatus),
        map((status) => status === StatusEnum.Issued)
    );

    loadingAthleteGroups$: Observable<boolean> = this.store.pipe(select(fromStore.getIsLoadingAthletes));

    sportDisciplines$ = this.store.pipe(select(fromAutoCompletesStore.getAutoCompletesSportDisciplines));

    route$: Observable<RouterStateUrl | null> = this.store.pipe(select(fromRootStore.getActiveRoute));

    translations$ = this.translationService.translations$;

    urlWithoutParenthesis$: Observable<string> = this.store.pipe(
        select(fromRootStore.getActiveRouteUrlWithoutParenthesis())
    );

    numberOfAthletesExcess = 0;

    viewModels: Array<IAthleteGroupView> = [];

    private currentGroupId: string | undefined;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>, private translationService: TranslationService) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.athleteGroups$.subscribe((athleteGroups: Array<AthleteGroup> | null) => {
                if (!athleteGroups) {
                    this.store.dispatch(fromStore.Step2GetAthleteGroups());
                } else {
                    const nonEmptyAthleteGroups = athleteGroups.filter(
                        (athleteGroup) => athleteGroup.numberOfAthletes > 0
                    );
                    this.viewModels = nonEmptyAthleteGroups.map((athleteGroup: AthleteGroup) => {
                        const groupId = athleteGroup.id;
                        const singleGroup = nonEmptyAthleteGroups.length === 1;
                        const active = singleGroup;
                        const view: IAthleteGroupView = {
                            groupId,
                            title: this.getSectionTitle(athleteGroup),
                            data: athleteGroup,
                            singleGroup,
                            active,
                        };

                        return view;
                    });
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    clearSelectionInChildTable(groupId: string): void {
        const tableComponent = this.tableComponents?.find((x) => x.groupId === groupId);
        tableComponent?.cleanDataTableSelection();
    }

    closeModal(): void {
        if (this.modal) {
            this.modal.closeModal(true);
        }
    }

    getSectionTitle(athleteGroup: AthleteGroup): string {
        const title = athleteGroup.name;
        if (athleteGroup.description !== '') title.concat(` - ${athleteGroup.description}`);

        return title;
    }

    getRightInfo(numberOfAthletes: number): Observable<string> {
        return this.translations$.pipe(
            map((translations: TranslationMap) => {
                const athleteLabel =
                    numberOfAthletes > 1
                        ? translations[this.translationService.getAthleteKey(this.PLURAL)]
                        : translations[this.translationService.getAthleteKey(this.SINGULAR)];
                return `${numberOfAthletes} ${athleteLabel}`;
            })
        );
    }

    setNumberOfAthletesExcess(numberOfAthletesExcess: number): void {
        this.numberOfAthletesExcess = numberOfAthletesExcess;
    }

    toggleAccordion(selectedModel: IAthleteGroupView): void {
        if (this.viewModels) {
            const currentModel = this.viewModels.find((vm) => vm.groupId === this.currentGroupId);

            this.clearSelectionInChildTable(selectedModel?.groupId);
            selectedModel.active = true;
            if (currentModel && currentModel?.groupId === selectedModel?.groupId) {
                this.currentGroupId = undefined;
                this.viewModels.forEach((viewModel: IAthleteGroupView) => {
                    viewModel.active = false;
                });
            } else {
                this.currentGroupId = selectedModel.groupId?.toString();
                this.viewModels.forEach((viewModel: IAthleteGroupView) => {
                    if (viewModel.groupId !== selectedModel.groupId) {
                        viewModel.active = false;
                    }
                });
            }
        }
    }

    get isMaxNumberOfAthletesExceeded(): boolean {
        return this.numberOfAthletesExcess > 0;
    }
}
