import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '@to/guards';
import { ConfirmLeaveComponent } from '@shared/components';

@Injectable()
export class ConfirmLeaveService {
    confirmLeaveComponent?: ConfirmLeaveComponent;

    confirmChangeStepComponent?: ConfirmLeaveComponent;

    confirm(): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.confirmLeaveComponent) {
                resolve(true);
                return;
            }
            this.confirmLeaveComponent.confirm.pipe(take(1)).subscribe(resolve);
            this.confirmLeaveComponent.show();
        });
    }

    confirmChangeStep(component: CanComponentDeactivate): Promise<boolean> | Observable<boolean> {
        return new Promise((resolve) => {
            if (!this.confirmChangeStepComponent) {
                resolve(true);
                return component.canDeactivate ? component.canDeactivate() : true;
            }
            this.confirmChangeStepComponent.confirm.pipe(take(1)).subscribe(resolve);
            this.confirmChangeStepComponent.show();
            return component.canDeactivate ? component.canDeactivate() : true;
        });
    }
}
