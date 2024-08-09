export enum SampleTypeEnum {
    Blood = 'Blood',
    BloodPassport = 'Blood_passport',
    Urine = 'Urine',
    DriedBloodSpot = 'Dried_blood_spot',
}

export class SampleTypeEnumValues {
    static getValues(): Array<string> {
        return [
            SampleTypeEnum.Urine,
            SampleTypeEnum.Blood,
            SampleTypeEnum.BloodPassport,
            SampleTypeEnum.DriedBloodSpot,
        ];
    }
}
