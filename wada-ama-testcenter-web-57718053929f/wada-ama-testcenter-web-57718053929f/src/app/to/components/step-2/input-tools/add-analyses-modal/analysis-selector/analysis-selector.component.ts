import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { trigger } from '@angular/animations';
import { isNullOrBlank, latinize } from '@shared/utils';
import { TypeaheadComponent } from '@shared/components';
import { Analysis, AnalysisAttribute, Laboratory, ListItem, SampleType, SampleTypeEnum } from '@shared/models';
import { TranslationService } from '@core/services';
import { FADE_IN_FADE_OUT } from '@core/components/animation/animation.component';

@Component({
    selector: 'app-analysis-selector',
    templateUrl: './analysis-selector.component.html',
    styleUrls: ['./analysis-selector.component.scss'],
    animations: [trigger('fadeInOut', FADE_IN_FADE_OUT)],
})
export class AnalysisSelectorComponent implements AfterViewInit, OnDestroy {
    readonly sampleTypeEnum = SampleTypeEnum;

    @ViewChild(TypeaheadComponent) set typeAheadComponent(typeAheadRef: TypeaheadComponent) {
        if (this.showLaboratory) {
            if (typeAheadRef && this.currentAnalysis && this.currentAnalysis.laboratory && typeAheadRef.inputRef) {
                // if there is a Default Lab that one should be the selected laboratory
                const defaultLab =
                    this.defaultLab?.id && this.isLabEmpty ? this.defaultLab : this.currentAnalysis.laboratory;
                typeAheadRef.onBlurSubject$.next({ selectedItem: defaultLab });
                this.setLaboratory(defaultLab);
                this.typeAheadRef = typeAheadRef;
            }
        }
    }

    @Output() readonly analysisEmitter = new EventEmitter<Analysis>();

    @Input() set analysisSelected(analysis: Analysis) {
        this._analysis = analysis;
    }

    @Input() dataQA = '';

    @Input() set defaultLaboratory(lab: ListItem | null) {
        if (this._laboratories) {
            [this.defaultLab] = this._laboratories.filter(
                (laboratory: Laboratory) => lab && lab.id && laboratory.id.toString() === lab.id.toString()
            );
        }
    }

    @Input() set laboratories(labs: Array<Laboratory>) {
        this._laboratories = labs;
    }

    @Input() multipleAthleteSelection = true;

    @Input() set sampleType(sampleType: SampleType | undefined) {
        if (sampleType) {
            this._sampleType = sampleType;
        }
    }

    get sampleType(): SampleType | undefined {
        return this._sampleType;
    }

    translations$ = this.translationService.translations$;

    _analysis: Analysis | undefined;

    _laboratories?: Array<Laboratory>;

    _sampleType: SampleType | undefined = undefined;

    currentAnalysis: Analysis = new Analysis();

    defaultLab?: Laboratory;

    hasSelectedAnalysis = false;

    isBasicUrine = false;

    isBlood = false;

    isBloodPassport = false;

    isBloodPassportSelected = false;

    isBloodSelected = false;

    isDriedBloodSpot = false;

    isDriedBloodSpotSelected = false;

    isLabClicked = false;

    isLabEmpty = true;

    isUrine = false;

    inputId = '';

    laboratoryError = false;

    showLaboratory = false;

    subscriptions = new Subscription();

    typeAheadRef?: TypeaheadComponent;

    constructor(private translationService: TranslationService) {}

    ngAfterViewInit(): void {
        this.updateAnalysis();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Triggered on checkbox selection / Toggle the selected field on the AnalysisAttribute object
     * @param isAttributeSelected - whether the checkbox is selected
     * @param attributeDefinitionId - the attribute definition id
     */
    attributeChanges(isAttributeSelected: boolean, attributeDefinitionId: string): void {
        if (this.currentAnalysis) {
            const analysisAttribute = this.currentAnalysis.sampleAnalysisAttributes.find(
                (attribute: AnalysisAttribute) => attribute.analysisDescription.id === attributeDefinitionId
            );
            if (analysisAttribute) analysisAttribute.selected = !isAttributeSelected;
        }
        this.propagateAnalysisChanges();
    }

    /**
     * Triggered on checkbox selection / Toggle the isBasicUrine flag
     * @param isBasicUrine - whether the analysis is a basic urine
     */
    basicUrineChanges(isBasicUrine: boolean): void {
        this.isBasicUrine = !isBasicUrine;
        if (!this.isBasicUrine) {
            this.initializeCurrentAnalysis();
        }
        this.propagateAnalysisChanges();
    }

    /**
     * Triggered on checkbox selection / Toggle the isBloodPassportSelected flag
     * @param isBloodPassportSelected - whether the blood passport analysis has been selected
     */
    bloodPassportChanges(isBloodPassportSelected: boolean): void {
        this.isBloodPassportSelected = !isBloodPassportSelected;
        if (!this.isBloodPassportSelected) {
            this.initializeCurrentAnalysis();
        }
        this.propagateAnalysisChanges();
    }

    /**
     * Triggered on the laboratory field
     */
    detectInputBlur(): void {
        if (this.typeAheadRef && this.typeAheadRef.inputRef) {
            this.isLabEmpty = isNullOrBlank(this.typeAheadRef.value);
            this.inputId = this.typeAheadRef.inputRef.nativeElement.id;
            this.isLabClicked = this.typeAheadRef.inputRef.nativeElement.classList.contains('ng-touched');
            this.setLaboratory(this.typeAheadRef.selectedItem as Laboratory);
            this.propagateAnalysisChanges();
        }
    }

    /**
     * Triggered on checkbox selection / Toggle the isDBSSelected flag
     * @param isDBSSelected - whether the DBS analysis has been selected
     */
    driedBloodSpotChanges(isDBSSelected: boolean): void {
        this.isDriedBloodSpotSelected = !isDBSSelected;
        this.propagateAnalysisChanges();
    }

    /**
     * Populate the laboratory autocomplete
     * @param token - the user input
     * @returns the laboratory suggestions
     */
    laboratorySuggestions = (token: string): Observable<Array<Laboratory>> => {
        const latinizedToken = latinize(token.toLocaleLowerCase());
        const laboratoryList: Array<Laboratory> =
            (this._laboratories &&
                this._laboratories.filter((laboratory: Laboratory): boolean =>
                    this.isBloodPassport
                        ? laboratory.biological === true &&
                          latinize(laboratory.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                        : laboratory.accredited === true &&
                          latinize(laboratory.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
                )) ||
            [];
        return of(laboratoryList);
    };

    /**
     * Emits the new analysis selection to the parent component.
     * Called each time user checks an analyses attribute (checkbox) or a laboratory is added
     */
    propagateAnalysisChanges(): void {
        this.setHasSelectedAnalysis();
        if (this.isUrine) {
            this.updateBasicUrine();
        }

        if (this.isBloodPassport) {
            this.updateBloodPassport();
        }

        if (this.isBlood) {
            this.updateBlood();
        }

        if (this.currentAnalysis) {
            this.analysisEmitter.emit(this.currentAnalysis);
        }
    }

    /**
     * This checking syntax has been chosen to be easily readable and more intuitive, despite its verbosity.
     */
    private checkAttributeSelected(
        existingAttributes: Array<AnalysisAttribute>,
        analysisAttribute: AnalysisAttribute
    ): boolean {
        // the attribute is selected if it is one of the attributes that have been previously checked and saved in the state
        const checkedAttribute = existingAttributes
            .map((sampleAnalysisAttribute: AnalysisAttribute) => sampleAnalysisAttribute.analysisDescription.id)
            .includes(analysisAttribute.analysisDescription.id);

        return checkedAttribute || false;
    }

    /**
     * Set default values for an empty analysis according to sample specific type
     */
    private initializeCurrentAnalysis(): void {
        if (this.sampleType) {
            this.currentAnalysis.sampleType = this.sampleType;
            this.setSampleTypeSpecificCode(this.sampleType.specificCode);
        }

        if (this.isUrine) this.isBasicUrine = false;
        if (this.isBloodPassport) this.isBloodPassportSelected = false;
        if (this.isDriedBloodSpot) this.isDriedBloodSpotSelected = false;

        this.setShowLaboratory(false);
        this.currentAnalysis.sampleAnalysisAttributes =
            this.sampleType?.sampleAnalysisAttributes?.map(
                (analysisAttribute: AnalysisAttribute) => new AnalysisAttribute(analysisAttribute)
            ) || [];
    }

    /**
     * Determine if at least 1 attribute has been selected.
     * Toggle the laboratory field display depending on the attribute selection
     */
    private setHasSelectedAnalysis(): void {
        if (this.currentAnalysis) {
            if (this.currentAnalysis.sampleAnalysisAttributes) {
                this.hasSelectedAnalysis =
                    this.currentAnalysis.sampleAnalysisAttributes.filter(
                        (analysisAttribute: AnalysisAttribute) => analysisAttribute && analysisAttribute.selected
                    ).length > 0;
            }
            // Hide laboratory if there is no analyses selected
            const showLaboratory = Boolean(
                this.hasSelectedAnalysis ||
                    this.isBasicUrine ||
                    this.isBloodPassportSelected ||
                    this.isDriedBloodSpotSelected
            );
            this.setShowLaboratory(showLaboratory);
        }
    }

    /**
     * Set the laboratory for the current analysis
     * @param laboratory - the selected laboratory
     */
    private setLaboratory(laboratory: Laboratory | null): void {
        if (this.currentAnalysis) {
            this.currentAnalysis.laboratory = laboratory || new Laboratory();
            this.isLabEmpty = this.currentAnalysis.laboratory.id === '';
        }
    }

    /**
     * Set sample type flags according to sample type specific code
     * @param specificCode - the specific code of the sample type
     */
    private setSampleTypeSpecificCode(specificCode: string): void {
        this.isUrine = specificCode === this.sampleTypeEnum.Urine;
        this.isBlood = specificCode === this.sampleTypeEnum.Blood;
        this.isBloodPassport = specificCode === this.sampleTypeEnum.BloodPassport;
        this.isDriedBloodSpot = specificCode === this.sampleTypeEnum.DriedBloodSpot;
    }

    /**
     * Determine whether to display the laboratory field
     * @param showLaboratory - whether to display the laboratory field
     */
    private setShowLaboratory(showLaboratory: boolean): void {
        this.showLaboratory = showLaboratory;
        if (!showLaboratory) this.laboratoryError = false;
    }

    /**
     * Sets all selected analysis attributes given the existing attributes in a testRow
     * @param existingAttributes - the attributes that have been previously selected for an analysis
     * @returns - all the attributes (selected and not selected)
     */
    private updateAllAnalysisAttributes(existingAttributes: Array<AnalysisAttribute>): Array<AnalysisAttribute> {
        let allUpdatedAttributes: Array<AnalysisAttribute> = [];
        if (this.currentAnalysis && this.currentAnalysis.sampleAnalysisAttributes) {
            // loops through all analysis attributes and updates each one according to the testRow selected
            const allPossibleAttributes = this.currentAnalysis.sampleAnalysisAttributes;

            allUpdatedAttributes = allPossibleAttributes.map((analysisAttribute: AnalysisAttribute) => {
                const updatedAnalysisAttribute = new AnalysisAttribute(analysisAttribute);

                const isAttributeSelected: boolean = this.checkAttributeSelected(existingAttributes, analysisAttribute);

                updatedAnalysisAttribute.selected = isAttributeSelected;

                // Attributes are set to true when user checks at least one of the sample analysis checkboxes
                if (this.isUrine && !this.isBasicUrine) {
                    this.isBasicUrine = isAttributeSelected;
                }

                if (this.isBloodPassport && !this.isBloodPassportSelected) {
                    this.isBloodPassportSelected = isAttributeSelected;
                }

                if (this.isBlood && !this.isBloodSelected) {
                    this.isBloodSelected = isAttributeSelected;
                }

                return updatedAnalysisAttribute;
            });
        }
        return allUpdatedAttributes;
    }

    private updateAnalysis(): void {
        this.initializeCurrentAnalysis();
        if (this._analysis) {
            this.updateCurrentAnalysis(this._analysis);
        }
    }

    /**
     * Set isBasicUrine flag to true if an urine analysis has been selected
     */
    private updateBasicUrine(): void {
        if (this.hasSelectedAnalysis) {
            this.isBasicUrine = true;
        }
    }

    /**
     * Set isBloodSelected flag to true if a blood analysis has been selected
     */
    private updateBlood(): void {
        this.isBloodSelected = this.hasSelectedAnalysis;
    }

    /**
     * Set isBloodPassportSelected flag to true if a blood passport analysis has been selected
     */
    private updateBloodPassport(): void {
        if (this.hasSelectedAnalysis) {
            this.isBloodPassportSelected = true;
        }
    }

    /**
     * Update current analysis based on the selected row
     * @param selectedAnalysis - the analysis previously selected
     */
    private updateCurrentAnalysis(selectedAnalysis: Analysis): void {
        if (this.currentAnalysis) {
            this.currentAnalysis.tempId = selectedAnalysis.tempId;
            this.hasSelectedAnalysis = selectedAnalysis.sampleAnalysisAttributes.length > 0;
            // if there is any analysis attribute selected
            if (this.hasSelectedAnalysis) {
                this.currentAnalysis.sampleAnalysisAttributes = this.updateAllAnalysisAttributes(
                    selectedAnalysis.sampleAnalysisAttributes
                );
            } else if (this.isBloodPassport) {
                this.isBloodPassportSelected = true;
            } else if (this.isDriedBloodSpot) {
                this.isDriedBloodSpotSelected = true;
                this.currentAnalysis.dbsAnalysisTypeDetails = selectedAnalysis.dbsAnalysisTypeDetails;
            } else if (this.isUrine) {
                this.isBasicUrine = true;
            }
            this.setLaboratory(selectedAnalysis.laboratory);
            this.setShowLaboratory(true);
        }
    }
}
