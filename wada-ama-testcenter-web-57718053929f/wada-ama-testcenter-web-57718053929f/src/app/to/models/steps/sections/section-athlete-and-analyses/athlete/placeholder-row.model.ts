import { SportDiscipline } from '@shared/models/sport-discipline.model';
import { Gender } from '../../../../enums/gender.enum';

export class PlaceHolderRow {
    placeholder: string;

    sportDiscipline: SportDiscipline | null;

    gender: string;

    constructor(test?: Partial<PlaceHolderRow> | null) {
        const { placeholder = '', sportDiscipline = null, gender = Gender.DefaultGender } = test || {};
        this.placeholder = placeholder;
        this.gender = gender;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
    }
}
