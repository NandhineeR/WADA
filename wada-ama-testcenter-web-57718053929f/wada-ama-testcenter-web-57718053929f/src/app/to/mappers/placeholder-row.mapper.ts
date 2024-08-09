import { Gender, PlaceHolderRow, Test } from '@to/models';
import { SportDiscipline } from '@shared/models';
import { createDefaultTestStatus } from './athlete-row.mapper';

export function mapPlaceholderRowToTest(placeholderRow: PlaceHolderRow): Test {
    const test = new Test();
    if (placeholderRow !== null) {
        if (placeholderRow.gender === Gender.DefaultGender) {
            test.gender = Gender.UnknownGender;
        } else {
            test.gender = placeholderRow.gender;
        }
        test.sportDiscipline = placeholderRow.sportDiscipline
            ? new SportDiscipline(placeholderRow.sportDiscipline)
            : null;
        test.placeHolderDescription = placeholderRow.placeholder;
        test.status = createDefaultTestStatus();
        test.isPlaceholder = true;
    }
    return test;
}
