export class SearchCriteria {
    adoReferenceNumber: string;

    countries: Array<string>;

    fromDate: string;

    resultManagementAuthorities: Array<string>;

    testAuthorities: Array<string>;

    testCoordinators: Array<string>;

    test: string;

    toDate: string;

    constructor(searchCriteria?: Partial<SearchCriteria> | null) {
        const {
            adoReferenceNumber = '',
            countries = new Array<string>(),
            fromDate = '',
            resultManagementAuthorities = new Array<string>(),
            testAuthorities = new Array<string>(),
            testCoordinators = new Array<string>(),
            test = '',
            toDate = '',
        } = searchCriteria || {};

        this.adoReferenceNumber = adoReferenceNumber;
        this.countries = countries;
        this.fromDate = fromDate;
        this.resultManagementAuthorities = resultManagementAuthorities;
        this.testAuthorities = testAuthorities;
        this.testCoordinators = testCoordinators;
        this.test = test;
        this.toDate = toDate;
    }
}
