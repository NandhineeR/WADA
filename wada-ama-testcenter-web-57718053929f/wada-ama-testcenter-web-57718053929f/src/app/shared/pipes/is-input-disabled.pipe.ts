import { Pipe, PipeTransform } from '@angular/core';
import { DCFActionRight, FieldsSecurity, TOActionRight, UAActionRight } from '@shared/models';

/**
 * Pipe used to disable element in the the DOM giving the security related to that element and the mode in which the user is,
 *  and taking in consideration the security should be applied in edit Mode.
 */
@Pipe({
    name: 'isInputDisabled',
})
export class IsInputDisabledPipe implements PipeTransform {
    editActions = [DCFActionRight.Edit.toString(), TOActionRight.Edit.toString(), UAActionRight.Edit.toString()];

    transform(targetField: string, security: FieldsSecurity, isEditMode = true): boolean {
        if (!isEditMode) {
            return false;
        }

        let userHasRights = false;
        if (security?.fields?.size > 0 && security?.actions?.length > 0) {
            userHasRights = security.fields.has(targetField) && security.fields.get(targetField) === 'RW';
        }

        const userCanEdit = security?.actions.some((action) => this.editActions.includes(action));

        return !(userHasRights && userCanEdit);
    }
}
