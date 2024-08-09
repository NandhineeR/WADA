import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { FieldError, TestRow } from '@to/models';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
    Analysis,
    AnalysisAttribute,
    ATHLETE_LEVEL_LIST,
    ColumnDef,
    CountryWithRegions,
    DataSource,
    Laboratory,
    ListItem,
    MAX_NUMBER_OF_ANALYSES_PER_SAMPLE_TYPE,
    SampleType,
    SampleTypeEnum,
    SportDiscipline,
} from '@shared/models';
import { RemoveParenthesisPipe } from '@shared/pipes';
import { TranslationService } from '@core/services';
import { cloneDeep, find, remove } from 'lodash-es';
import { filter } from 'rxjs/operators';
import { TypeaheadComponent } from '@shared/components';
import { TableTranslationService } from '@shared/services';
import { getSportDisciplineSuggestions, isNotNull, isNullOrBlank } from '@shared/utils';
import { mapTestRowToTest } from '@to/mappers';
import { AnalysisSelectorComponent } from '../analysis-selector/analysis-selector.component';

@Component({
    selector: 'app-add-analyses-table',
    templateUrl: './add-analyses-table.component.html',
    styleUrls: ['./add-analyses-table.component.scss'],
})
export class AddAnalysesTableComponent implements OnDestroy {
    readonly ATHLETE_LEVEL_LIST = ATHLETE_LEVEL_LIST;

    readonly MAX_NUMBER_OF_ANALYSES_PER_SAMPLE_TYPE = MAX_NUMBER_OF_ANALYSES_PER_SAMPLE_TYPE;

    readonly sampleTypeEnum = SampleTypeEnum;

    @ViewChild('analyses', { static: true }) set analyses(template: TemplateRef<any>) {
        this.columns[1].cellTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChildren(AnalysisSelectorComponent)
    analysesSelected?: QueryList<AnalysisSelectorComponent>;

    @ViewChild('errorRef') errorRef?: ElementRef;

    @ViewChild('toolTipAthleteLevel', { static: true }) set toolTipAthleteLevel(template: TemplateRef<any>) {
        this.columns[3].headerTemplate = template;
        this.columns = this.columns.slice();
    }

    @ViewChildren(TypeaheadComponent)
    typeAheadRefs?: QueryList<TypeaheadComponent>;

    @Output()
    readonly resetSelection: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() set removeTestRows(removeTestRows: boolean) {
        if (removeTestRows && this.dataSource.data) {
            this.deleteTemporaryTests();
        }
    }

    @Input() url = '';

    @Input() urlWithoutParenthesis = '';

    defaultLaboratory$: Observable<ListItem | null> = this.store.pipe(select(fromStore.getDefaultLaboratory));

    laboratories$: Observable<Array<Laboratory>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesLaboratories)
    );

    sampleTypes$: Observable<Array<SampleType>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesSampleTypes)
    );

    sportsDisciplines$: Observable<Array<SportDiscipline>> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesSportDisciplines)
    );

    translations$ = this.translationService.translations$;

    analysesErrors = 0;

    checkLabFullValidation = false;

    dataSource = new DataSource(Array<TestRow>());

    /**
     * map where key is sample type specific code and
     * value is whether the button to add analyses for the sample type is enabled
     */
    isAddAnalysisButtonEnabledMap = new Map<string, boolean>();

    isEditAnalyses = false;

    /**
     * map where key is sample type specific code and
     * value is whether the max number of analyses for the sample type has been exceeded (from Classic data)
     */
    isMaxExceededMap = new Map<string, boolean>();

    /**
     * map where key is sample type specific code and
     * value is whether the max number of analyses for the sample type has been reached
     */
    isMaxReachedMap = new Map<string, boolean>();

    isPlaceholder = false;

    // if save analyses is clicked, validations should be automatic
    isSaveAnalysesClicked = false;

    isSearchAthlete = false;

    laboratoryErrors: Array<FieldError> = [];

    /**
     * map where key is sample type specific code and
     * value is the max number of analyses for the sample type
     */
    maxMap = new Map<string, number>();

    multipleAthleteSelection = true;

    removeParenthesis = new RemoveParenthesisPipe();

    selectedAnalyses: Array<Analysis> = [];

    sportDisciplineErrors: Array<FieldError> = [];

    subscriptions: Subscription = new Subscription();

    testRowsUpdated: Array<TestRow> = [];

    columns: Array<Partial<ColumnDef<TestRow>>> = [
        {
            key: 'name',
            header: this.getHeaderTranslation('name'),
            cell: (e) => e.name,
            mandatory: true,
            wrapContain: true,
        },
        {
            key: 'analyses',
            header: this.getHeaderTranslation('analyses'),
            cell: (e) => e.analysisDisplay || [],
            cellTemplate: this.analyses,
            mandatory: true,
        },
        {
            key: 'sportDiscipline',
            header: this.getHeaderTranslation('sportDiscipline'),
            cell: (e) => e.sportDiscipline || '',
            mandatory: true,
        },
        {
            key: 'athleteLevel',
            header: this.getHeaderTranslation('athleteLevel'),
            cell: (e) => e.athleteLevel,
            headerTemplate: this.toolTipAthleteLevel,
            mandatory: true,
        },
        {
            key: 'team',
            header: this.getHeaderTranslation('team'),
            cell: (e) => e.team,
            default: false,
            mandatory: true,
        },
        {
            key: 'teams',
            header: this.getHeaderTranslation('teams'),
            cell: (e) => e.teams,
            disabled: true,
            default: false,
        },
        {
            key: 'placeholder',
            cell: (e) => e.placeholder,
            default: false,
            disabled: true,
        },
        {
            key: 'athleteAccessible',
            cell: (e) => e.placeholder,
            default: false,
            disabled: true,
        },
    ];

    constructor(
        private router: Router,
        private translationService: TranslationService,
        public activatedRoute: ActivatedRoute,
        private store: Store<fromRootStore.IState>,
        private tableTranslationService: TableTranslationService
    ) {
        this.handleAnalysesInitialData();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Save the updated analyses
     */
    addAnalysesToTests(): void {
        if (this.laboratoryErrors.length === 0) {
            this.dataSource.data.forEach((testRow: TestRow) => {
                const index = this.testRowsUpdated.findIndex(
                    (test: TestRow) =>
                        test.tempId === testRow.tempId ||
                        (test.id === testRow.id && test.id !== null && testRow.id !== null)
                );
                if (index > -1) {
                    this.testRowsUpdated[index].sportDiscipline = testRow.sportDiscipline;
                    this.testRowsUpdated[index].athleteLevel = testRow.athleteLevel;
                    this.mergeUpdatedAnalyses(index);
                }
            });
            this.dataSource.data = [...this.testRowsUpdated];
            const testRowsModified = this.dataSource.data.map((testRow: TestRow) => {
                const countryWithRegions = this.getCountryWithRegions(testRow.sportNationality);
                return mapTestRowToTest(testRow, countryWithRegions);
            });
            // Add new Tests to TO coming from search athlete
            if (this.isSearchAthlete || this.isPlaceholder) {
                this.store.dispatch(
                    fromStore.Step2AddAthletesAsATest({
                        addedAthletes: testRowsModified,
                    })
                );
                this.deleteTemporaryTests();
                // Modify existing Tests in TO
            } else {
                this.store.dispatch(
                    fromStore.Step2AddAnalysesToTests({
                        modifiedTests: testRowsModified,
                    })
                );
            }
        }
    }

    /**
     * Adds an analysis to the selectedAnalyses array
     * @param sampleType - the sample type of the new analysis
     */
    addAnalysis(sampleType: SampleType): void {
        this.selectedAnalyses.push(new Analysis({ sampleType }));
    }

    /**
     * Removes an analysis from the 'selectedAnalyses' array
     * @param tempId - the temp id of the analysis to remove
     */
    deleteAnalysis(tempId: string) {
        const analysisToRemove = this.selectedAnalyses.find((analysis) => analysis.tempId === tempId);

        if (analysisToRemove) {
            const index = this.selectedAnalyses.indexOf(analysisToRemove);
            this.selectedAnalyses.splice(index, 1);
            this.enableOrDisableAddAnalysisButtons(analysisToRemove.sampleType);
        }
    }

    /**
     * Delete temporary tests in store
     */
    deleteTemporaryTests(): void {
        this.store.dispatch(fromStore.Step2DeleteTempTests());
    }

    /**
     * Toggle 'add buttons' for each sample type
     * @param sampleType - the sample type
     */
    enableOrDisableAddAnalysisButtons(sampleType: SampleType): void {
        const maxAllowed = this.maxMap.get(sampleType.specificCode) || MAX_NUMBER_OF_ANALYSES_PER_SAMPLE_TYPE;
        const currentNumber = this.getSelectedAnalysesBySampleType(sampleType).length;
        const isMaxReached = currentNumber === maxAllowed;
        this.isMaxReachedMap.set(sampleType.specificCode, isMaxReached);

        const isMaxExceeded = currentNumber > maxAllowed;
        this.isMaxExceededMap.set(sampleType.specificCode, isMaxExceeded);
        let areAllAnalysesFilled = true;

        if (this.analysesSelected && currentNumber !== 0) {
            areAllAnalysesFilled =
                this.analysesSelected.filter(
                    (analysis: AnalysisSelectorComponent) =>
                        analysis.sampleType?.specificCode === sampleType.specificCode && analysis.isLabEmpty
                ).length === 0;
        }

        const canAddAnalysis = !isMaxReached && !isMaxExceeded && areAllAnalysesFilled;
        this.isAddAnalysisButtonEnabledMap.set(sampleType.specificCode, canAddAnalysis);
    }

    /**
     * Get a country with its region from the store
     * @param countryName - the name of the country
     * @returns a country with its regions
     */
    getCountryWithRegions(countryName: string): CountryWithRegions {
        let countryWithRegions = new CountryWithRegions();
        const countryWithRegions$ = this.store.select(
            fromAutoCompletesStore.getCountryWithRegionsByCountry(countryName)
        );
        this.subscriptions.add(
            countryWithRegions$.subscribe((country: CountryWithRegions | undefined) => {
                countryWithRegions = country || countryWithRegions;
            })
        );
        return countryWithRegions;
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.subscriptions.add(
            this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
                headerTranslation = value;
            })
        );
        return headerTranslation;
    }

    /**
     * Returns either the temporary tests (analyses are being set for new tests still not added to the TO)
     * or the selected tests (analyses are being added/modified on tests that have already been added to the TO)
     * @param areTestsNew
     * @returns Observable of TestRow[]
     */
    getInitialTests(areTestsNew: boolean): Observable<TestRow[]> {
        let tests$: Observable<TestRow[]> = of([]);
        if (areTestsNew) {
            tests$ = this.store.select(fromStore.getTemporaryTests);
        } else {
            const navigation = this.router?.getCurrentNavigation() || null;
            // gets state from router navigate, which contains test row ids
            if (navigation && navigation.extras && navigation.extras.state) {
                const testIds = navigation.extras.state.map((test: string) => test);
                tests$ = this.store.select(fromStore.getTOSelectedTests(testIds));
            }
        }

        return tests$;
    }

    /**
     * Verifies if labs displayed have some value
     * otherwise, if labs field are displayed but empty, set lab errors
     */
    getLaboratoryErrors(): FieldError[] {
        const laboratoryErrors: FieldError[] = [];
        if (this.analysesSelected) {
            const analysesWithEmptyLabs = this.analysesSelected.filter(
                (analysesComponent: AnalysisSelectorComponent) =>
                    analysesComponent.isLabEmpty && analysesComponent.showLaboratory
            );
            if (analysesWithEmptyLabs.length > 0) {
                analysesWithEmptyLabs.forEach((analysisSelectorComponent: AnalysisSelectorComponent) => {
                    const laboratoryError = new FieldError();
                    laboratoryError.hasError = true;
                    laboratoryError.sampleType = analysisSelectorComponent.sampleType?.specificCode || '';
                    laboratoryError.inputId = analysisSelectorComponent.inputId;
                    laboratoryErrors.push(laboratoryError);
                });
            }
        }

        return laboratoryErrors;
    }

    /**
     * Return all analyses for the specified sample type
     * @param sampleType - the sample type
     */
    getSelectedAnalysesBySampleType(sampleType: SampleType): Analysis[] {
        return this.selectedAnalyses.filter(
            (analysis) => analysis.sampleType?.specificCode === sampleType.specificCode
        );
    }

    /**
     * Go back to TO Step 2
     * @param save - whether saving the new analysis selection is necessary
     */
    goBackToTO(save: boolean): void {
        if (!save) {
            this.redirectToTO();
        } else {
            this.checkLabFullValidation = true;
            this.validateData();
            if (this.laboratoryErrors.length === 0 && this.sportDisciplineErrors.length === 0) {
                this.removeEmptyAnalysesBeforeSave();
                this.addAnalysesToTests();
                this.resetSelection.emit(true);
                this.redirectToTO();
            } else {
                setTimeout(() => this.errorRef?.nativeElement.focus());
            }
        }
    }

    /**
     * Navigate to Search Athlete
     */
    goToSearchAthlete(): void {
        this.isSaveAnalysesClicked = true;
        this.checkLabFullValidation = true;
        this.validateData();
        if (this.laboratoryErrors.length === 0) {
            this.addAnalysesToTests();
            this.router.navigate([
                this.urlWithoutParenthesis,
                { outlets: { modal: ['add-athlete', 'search-athlete'] } },
            ]);
        }
    }

    /**
     * Handle data source for adding analyses based on where the information comes from
     */
    handleAnalysesInitialData(): void {
        const { queryParamMap } = this.activatedRoute.snapshot;
        this.isSearchAthlete = queryParamMap.has('isSearchAthlete');
        this.isPlaceholder = queryParamMap.has('isPlaceholder');
        this.isEditAnalyses = queryParamMap.has('isEditAnalyses');
        // checks if it is coming from search athlete or add placeholder
        const areTestsNew = this.isSearchAthlete || this.isPlaceholder;
        this.handleInitialTests(areTestsNew);
    }

    /**
     * Sets up validations (max allowed for analyses per sample type) and enable/disable buttons
     * @param areTestsNew - whether the tests already exist in the TO
     */
    handleInitialTests(areTestsNew: boolean): void {
        const tests$ = this.getInitialTests(areTestsNew);

        this.subscriptions.add(
            combineLatest([tests$, this.sampleTypes$])
                .pipe(
                    filter(
                        ([tests, sampleTypes]: [Array<TestRow>, SampleType[]]) =>
                            isNotNull(tests) && isNotNull(sampleTypes)
                    )
                )
                .subscribe(([tests, sampleTypes]: [Array<TestRow>, SampleType[]]) => {
                    this.setDataSource(tests);
                    // initialize add buttons status for each sample type
                    sampleTypes.forEach((sampleType) => {
                        if (areTestsNew || this.isEditAnalyses) {
                            this.initializeMaxAnalysesBySampleTypeToDefault(sampleType);
                        } else {
                            this.setMaxAnalysesPerSampleTypeBasedOnExistingAnalyses(sampleType);
                        }
                        this.enableOrDisableAddAnalysisButtons(sampleType);
                    });
                })
        );
    }

    /**
     * Initializes max number of analyses allowed for each sample type to the constant max
     * @param sampleType - the sample type of the analyses
     */
    initializeMaxAnalysesBySampleTypeToDefault(sampleType: SampleType): void {
        this.maxMap.set(sampleType.specificCode, MAX_NUMBER_OF_ANALYSES_PER_SAMPLE_TYPE);
    }

    /**
     * Determine if an analysis is removable
     * @param currentAnalysis - the analysis modified in the analysis-selector component
     * @returns whether the analysis is removable
     */
    isAnalysisRemovable(currentAnalysis: Analysis): boolean {
        let isBloodPassportSelected = false;
        let isBasicUrine = false;
        let isDriedBloodSpotSelected = false;
        if (this.analysesSelected) {
            switch (currentAnalysis.sampleType.specificCode) {
                case this.sampleTypeEnum.BloodPassport:
                    [isBloodPassportSelected] = this.analysesSelected
                        .filter((analysis: AnalysisSelectorComponent) => analysis.isBloodPassport)
                        .map((analysis: AnalysisSelectorComponent) => analysis.isBloodPassportSelected);
                    break;
                case this.sampleTypeEnum.Urine:
                    [isBasicUrine] = this.analysesSelected
                        .filter((analysis: AnalysisSelectorComponent) => analysis.isUrine)
                        .map((analysis: AnalysisSelectorComponent) => analysis.isBasicUrine);
                    break;
                case this.sampleTypeEnum.DriedBloodSpot:
                    [isDriedBloodSpotSelected] = this.analysesSelected
                        .filter((analysis: AnalysisSelectorComponent) => analysis.isDriedBloodSpot)
                        .map((analysis: AnalysisSelectorComponent) => analysis.isDriedBloodSpotSelected);
                    break;
                default:
                    break;
            }
        }
        return !(isBloodPassportSelected || isBasicUrine || isDriedBloodSpotSelected);
    }

    /**
     * Sets the save button display (enabled/disabled)
     * if there is any attribute selected, save button should be enabled
     */
    isSaveButtonEnabled(): boolean {
        let atLeastOneAnalysisHasBeenSelected = false;
        if (this.analysesSelected) {
            const analysesWithAttributeSelected = this.analysesSelected.filter(
                (analysesComponent: AnalysisSelectorComponent) =>
                    analysesComponent.isBloodPassportSelected ||
                    analysesComponent.isBasicUrine ||
                    analysesComponent.hasSelectedAnalysis ||
                    analysesComponent.isDriedBloodSpotSelected
            );
            atLeastOneAnalysisHasBeenSelected = analysesWithAttributeSelected.length > 0;
        }

        return this.isEditAnalyses || atLeastOneAnalysisHasBeenSelected;
    }

    /**
     * Either update previously selected analyses, or add new ones
     * @param index
     */
    mergeUpdatedAnalyses(index: number): void {
        if (this.isEditAnalyses) {
            this.testRowsUpdated[index].analyses = this.selectedAnalyses;
        } else {
            this.testRowsUpdated[index].analyses = [...this.testRowsUpdated[index].analyses, ...this.selectedAnalyses];
        }
    }

    /**
     * Triggered whenever the sport discipline of the athlete is changed
     */
    onSelectSportDiscipline(): void {
        this.validateData();
    }

    /**
     * Nagivate to TO
     */
    redirectToTO(): void {
        this.router.navigate([this.urlWithoutParenthesis, { outlets: { modal: null } }]);
    }

    /**
     * Filters out the empty analyses from the selectedAnalyses array
     * (empty analyses should not be persisted)
     */
    removeEmptyAnalysesBeforeSave(): void {
        const analysesToRemove = this.selectedAnalyses.filter((analysis) => {
            const isAttributeSelected = analysis.sampleAnalysisAttributes.length > 0;
            return !isAttributeSelected && this.isAnalysisRemovable(analysis);
        });

        analysesToRemove.forEach((analysisToRemove) => {
            remove(this.selectedAnalyses, analysisToRemove);
        });
    }

    /**
     * Set the datasource for the tests table
     * @param tests$ - the testRows used for the table
     */
    setDataSource(tests: TestRow[]): void {
        this.dataSource.data = cloneDeep(tests);
        this.testRowsUpdated = this.dataSource.data;
        // if edit analyses mode is requested
        if (this.isEditAnalyses) {
            this.multipleAthleteSelection = false;
            // set selectedAnalyses to the analyses in the test selected
            this.selectedAnalyses = this.dataSource.data[0].analyses;
        }
    }

    /**
     * Set Laboratory error in the analysis-selector component
     */
    setLabErrorInAnalysisSelectorComponent(): void {
        if (this.analysesSelected) {
            this.analysesSelected.forEach((analysesComponent: AnalysisSelectorComponent) => {
                if (analysesComponent && analysesComponent.sampleType) {
                    const labError = find(this.laboratoryErrors, {
                        sampleType: analysesComponent.sampleType.specificCode,
                    });
                    analysesComponent.laboratoryError = labError !== undefined;
                    if (labError !== undefined) labError.inputId = analysesComponent.inputId;
                }
            });
        }
    }

    /**
     * Sets max number of analyses allowed for each sample type to the difference between the constant max
     * and the number of analyses previously selected
     *  * E.g. constant max for urine is 5,
     *  * the greatest number of urine analyses for a test in the selected tests is 3,
     *  * max = difference = 2
     * @param sampleType
     */
    setMaxAnalysesPerSampleTypeBasedOnExistingAnalyses(sampleType: SampleType): void {
        let currentNumberOfAnalyses = 0;
        this.testRowsUpdated.forEach((testRow) => {
            const number = testRow.analyses.filter(
                (analysis) => analysis.sampleType.specificCode === sampleType.specificCode
            ).length;
            if (number > currentNumberOfAnalyses) currentNumberOfAnalyses = number;
        });
        const difference = this.MAX_NUMBER_OF_ANALYSES_PER_SAMPLE_TYPE - currentNumberOfAnalyses;
        this.maxMap.set(sampleType.specificCode, difference);
    }

    /**
     * Set sport discipline errors, getting link reference (input id) of sport discipline field
     */
    setSportDisciplineError(): void {
        const sportDisciplineErrors: Array<FieldError> = [];
        if (this.typeAheadRefs) {
            this.typeAheadRefs.forEach((typeAheadRef: TypeaheadComponent) => {
                const sportDisciplineError = new FieldError();
                if (typeAheadRef.inputRef && typeAheadRef.fieldId.includes('sportDiscipline')) {
                    typeAheadRef.hasError = false;
                    if (isNullOrBlank(typeAheadRef.value)) {
                        typeAheadRef.hasError = true;
                        // link reference (input id) of sport discipline field
                        sportDisciplineError.inputId = typeAheadRef.inputRef.nativeElement.id;
                        sportDisciplineError.hasError = true;
                        sportDisciplineErrors.push(sportDisciplineError);
                    }
                }
            });
        }
        this.sportDisciplineErrors = sportDisciplineErrors;
    }

    /**
     * Returns whether the user should see the warning that a selected athlete has already reached the max number
     * @param sampleType - the sample type
     */
    showAddWarning(sampleType: SampleType): boolean {
        const isMaxReached = this.isMaxReachedMap.get(sampleType.specificCode) || false;
        const isMaxExceeded = this.isMaxExceededMap.get(sampleType.specificCode) || false;
        const atLeastOneAnalysisAlreadyExists =
            this.maxMap.get(sampleType.specificCode) !== MAX_NUMBER_OF_ANALYSES_PER_SAMPLE_TYPE;

        return !this.isEditAnalyses && (isMaxReached || isMaxExceeded) && atLeastOneAnalysisAlreadyExists;
    }

    /**
     * Populate the sport discipline autocomplete
     * @param token - the user input
     * @returns - the autocomplete suggestions
     */
    sportDisciplineSuggestions = (token: string): Observable<Array<SportDiscipline>> => {
        return getSportDisciplineSuggestions(token, this.sportsDisciplines$);
    };

    /**
     * Update the analysis whenever the user selects a new analysis attribute
     * @param currentAnalysis - the updated analysis coming from the analysis-selector component
     */
    updateAnalysis(currentAnalysis: Analysis): void {
        if (currentAnalysis) {
            const updatedAnalysis = new Analysis(currentAnalysis);

            // keep only selected attributes (currentAnalysis contains all possible attributes, with some of them set to "selected")
            updatedAnalysis.sampleAnalysisAttributes = currentAnalysis.sampleAnalysisAttributes?.filter(
                (analysisAttributes: AnalysisAttribute) => analysisAttributes?.selected
            );

            this.updateAnalysisInSelectedAnalyses(updatedAnalysis);

            this.validateData();
            this.enableOrDisableAddAnalysisButtons(updatedAnalysis.sampleType);
        }
    }

    /**
     * Determine how to update the analyses for a specific sample type
     * @param currentAnalysis - the analysis that was modified in the analysis-selector component
     * @param testRowSelected - the test that is being updated
     * @param sampleType - the sample type of the analysis
     * @returns - the testRow once it has been updated
     */
    updateAnalysisInSelectedAnalyses(currentAnalysis: Analysis): void {
        // Select all analysis from TestRow given a specific sample type
        const updatedAnalysis = this.selectedAnalyses.find(
            (individualAnalysis: Analysis) => individualAnalysis.tempId === currentAnalysis.tempId
        );

        if (updatedAnalysis) {
            // update fields common to all types of analyses
            updatedAnalysis.laboratory = currentAnalysis.laboratory;
            updatedAnalysis.sampleAnalysisAttributes = [];
            updatedAnalysis.dbsAnalysisTypeDetails = currentAnalysis.dbsAnalysisTypeDetails;

            // update attributes if applicable (e.g. for blood and urine analyses)
            const isAttributeSelected = currentAnalysis.sampleAnalysisAttributes.length > 0;
            if (isAttributeSelected) {
                updatedAnalysis.laboratory = currentAnalysis.laboratory;
                const newAttributes: AnalysisAttribute[] = [];

                // keep the attribute id for the existing analysis attributes (these attributes have been selected during a previous save of the TO)
                currentAnalysis.sampleAnalysisAttributes.forEach((newAttribute: AnalysisAttribute) => {
                    const oldAttribute = updatedAnalysis.sampleAnalysisAttributes.find(
                        (attribute: AnalysisAttribute) =>
                            attribute.analysisDescription.id === newAttribute.analysisDescription.id
                    );
                    const newAttr = new AnalysisAttribute(newAttribute);
                    newAttr.id = oldAttribute?.id || '';

                    newAttributes.push(newAttr);
                });

                updatedAnalysis.sampleAnalysisAttributes = newAttributes;
            }
        }
    }

    /**
     * Check if all required data has been entered, otherwise set errors
     */
    validateData(): void {
        if (this.checkLabFullValidation) {
            this.setSportDisciplineError();
            this.laboratoryErrors = this.getLaboratoryErrors();
            this.setLabErrorInAnalysisSelectorComponent();
            this.analysesErrors = this.sportDisciplineErrors.length + this.laboratoryErrors.length;
            if (this.analysesErrors === 0) {
                this.checkLabFullValidation = false;
            }
        }
    }
}
