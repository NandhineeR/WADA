import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, take, tap } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import * as fromStore from '@dcf/store';
import { CanComponentDeactivate } from '@dcf/guards';
import { NumberOfErrorsPerCategory, errorCount, scrollELementById } from '@shared/utils';
import { ActivatedRoute, Router } from '@angular/router';
import {
    AthleteInformationInputComponent,
    AuthorizationInputComponent,
    NotificationInputComponent,
} from '@dcf/components';

@Component({
    selector: 'app-step-1',
    templateUrl: './step-1.component.html',
    styleUrls: ['./step-1.component.scss'],
})
export class Step1Component implements CanComponentDeactivate, OnInit, OnDestroy {
    @ViewChild(AthleteInformationInputComponent) athleteInformationInputComponent:
        | AthleteInformationInputComponent
        | undefined = undefined;

    @ViewChild(AuthorizationInputComponent) authorizationInputComponent:
        | AuthorizationInputComponent
        | undefined = undefined;

    @ViewChild(NotificationInputComponent) notificationInputComponent:
        | NotificationInputComponent
        | undefined = undefined;

    isMatchingResultType1$: Observable<boolean> = this.store.select(fromStore.isMatchingResultType1);

    sectionAthleteErrors$: Observable<any> = this.store.select(fromStore.getSectionAthleteErrors);

    sectionAuthorizationErrors$: Observable<any> = this.store.select(fromStore.getSectionAuthorizationErrors);

    sectionNotificationErrors$: Observable<any> = this.store.select(fromStore.getSectionNotificationErrors);

    inCreation = false;

    isModelActiveAthleteInformation = false;

    isModelActiveAuthorization = false;

    isModelActiveNotification = true;

    isStepValid = true;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>, private route: ActivatedRoute, private router: Router) {}

    canDeactivate(): Observable<boolean> {
        const sub = this.store.select(fromStore.getIsCurrentStepValid).subscribe((valid) => {
            this.isStepValid = valid;
        });
        if (this.isStepValid) sub.unsubscribe();

        this.submitForm(false);

        return this.store.pipe(select(fromStore.getIsCurrentStepValid)).pipe(
            take(1),
            tap((valid) => !valid && setTimeout(() => scrollELementById('notifications')))
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.store.select(fromRootStore.getActiveRoute).subscribe((state) => {
                this.inCreation = state.url.includes('new');
            })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getSubmitCurrentStep)
                .pipe(distinctUntilChanged(), filter(Boolean))
                .subscribe(() => this.submitForm(true))
        );
    }

    getBusinessErrors(sectionErrors: NumberOfErrorsPerCategory): number {
        return (sectionErrors?.Business || 0) + (sectionErrors.MandatoryDraft || 0);
    }

    getFormatErrors(sectionErrors: NumberOfErrorsPerCategory): number {
        return sectionErrors?.Format || 0;
    }

    getNumberErrors(sectionErrors: NumberOfErrorsPerCategory): number {
        return errorCount(sectionErrors);
    }

    toggleAccordionAthleteInformation(): void {
        this.isModelActiveAthleteInformation = !this.isModelActiveAthleteInformation;
    }

    toggleAccordionAuthorization(): void {
        this.isModelActiveAuthorization = !this.isModelActiveAuthorization;
    }

    toggleAccordionNotification(): void {
        this.isModelActiveNotification = !this.isModelActiveNotification;
    }

    private submitForm(saving: boolean): void {
        this.athleteInformationInputComponent?.submitForm();
        this.authorizationInputComponent?.submitForm();
        this.notificationInputComponent?.submitForm();

        if (saving) this.store.dispatch(fromStore.Step1SubmitForm());
    }
}
