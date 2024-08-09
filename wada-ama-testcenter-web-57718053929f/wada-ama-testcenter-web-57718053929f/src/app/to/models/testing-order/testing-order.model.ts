import { Country, LaboratoryNote, ListItem, ModificationInfo, Region, TestParticipant } from '@shared/models';
import { Moment } from 'moment';
import * as moment from 'moment';
import { Test } from '../test/test.model';
import { TestingOrderStatus } from './testing-order-status.model';

export class TestingOrder {
    id: number | null;

    adoReferenceNumber: string;

    ados: Array<ListItem>;

    behalfOfSCA: ListItem | null;

    city: string;

    competitionCategory: ListItem | null;

    competitionName: string;

    copiedTestingOrderNumber: string | null;

    country: Country | null;

    creationInfo: ModificationInfo | null;

    dcpParticipants: Array<TestParticipant>;

    description: string;

    endDate: Moment | null;

    feeForService: boolean;

    feePaid: boolean;

    grantSCAWriteAccess: boolean;

    hasStatusChangedSinceLastSave = false;

    instructions: string;

    issuedDate: Date | null;

    laboratoryNotes: Array<LaboratoryNote>;

    majorGameEvent: ListItem | null;

    notificationTo: Array<ListItem>;

    owner: ListItem | null;

    participantRejectStatusId: string;

    region: Region | null;

    resultManagementAuthority: ListItem | null;

    sampleCollectionAuthority: ListItem | null;

    selectionPolicy: string;

    startDate: Moment | null;

    testCoordinator: ListItem | null;

    testingAuthority: ListItem | null;

    testingOrderNumber: string;

    testingOrderStatus: TestingOrderStatus | null;

    testParticipants: Array<TestParticipant>;

    tests: Array<Test>;

    testTiming: string | null;

    testType: boolean;

    updateInfo: ModificationInfo | null;

    constructor(testingOrder?: Partial<TestingOrder> | null) {
        const {
            id = null,
            adoReferenceNumber = '',
            ados = [],
            behalfOfSCA = null,
            city = '',
            competitionCategory = null,
            competitionName = '',
            copiedTestingOrderNumber = null,
            country = null,
            creationInfo = null,
            dcpParticipants = [],
            description = '',
            endDate = null,
            feeForService = false,
            feePaid = false,
            grantSCAWriteAccess = false,
            hasStatusChangedSinceLastSave = false,
            instructions = '',
            issuedDate = null,
            laboratoryNotes = [],
            majorGameEvent = null,
            notificationTo = [],
            owner = null,
            participantRejectStatusId = '',
            region = null,
            resultManagementAuthority = null,
            sampleCollectionAuthority = null,
            selectionPolicy = '',
            startDate = null,
            testCoordinator = null,
            testingAuthority = null,
            testingOrderNumber = '',
            testingOrderStatus = null,
            testParticipants = [],
            tests = [],
            testTiming = null,
            testType = false,
            updateInfo = null,
        } = testingOrder || {};

        this.id = id;
        this.adoReferenceNumber = adoReferenceNumber;
        this.ados = ados.map((ado) => new ListItem(ado));
        this.behalfOfSCA = behalfOfSCA ? new ListItem(behalfOfSCA) : null;
        this.city = city;
        this.competitionCategory = competitionCategory ? new ListItem(competitionCategory) : null;
        this.copiedTestingOrderNumber = copiedTestingOrderNumber;
        this.competitionName = competitionName;
        this.country = country ? new Country(country) : null;
        this.creationInfo = creationInfo ? new ModificationInfo(creationInfo) : null;
        this.dcpParticipants = dcpParticipants.map((participant) => new TestParticipant(participant));
        this.description = description;
        this.endDate = endDate ? moment.utc(endDate) : null;
        this.feeForService = feeForService;
        this.feePaid = feePaid;
        this.grantSCAWriteAccess = grantSCAWriteAccess;
        this.hasStatusChangedSinceLastSave = hasStatusChangedSinceLastSave;
        this.instructions = instructions;
        this.issuedDate = issuedDate ? new Date(issuedDate) : null;
        this.laboratoryNotes = laboratoryNotes.map((note) => new LaboratoryNote(note));
        this.majorGameEvent = majorGameEvent ? new ListItem(majorGameEvent) : null;
        this.notificationTo = notificationTo.map((notTo) => new ListItem(notTo));
        this.owner = owner ? new ListItem(owner) : null;
        this.participantRejectStatusId = participantRejectStatusId;
        this.region = region ? new Region(region) : null;
        this.resultManagementAuthority = resultManagementAuthority ? new ListItem(resultManagementAuthority) : null;
        this.sampleCollectionAuthority = sampleCollectionAuthority ? new ListItem(sampleCollectionAuthority) : null;
        this.selectionPolicy = selectionPolicy;
        this.startDate = startDate ? moment.utc(startDate) : null;
        this.testCoordinator = testCoordinator ? new ListItem(testCoordinator) : null;
        this.testingAuthority = testingAuthority ? new ListItem(testingAuthority) : null;
        this.testingOrderNumber = testingOrderNumber;
        this.testingOrderStatus = testingOrderStatus;
        this.testParticipants = testParticipants.map((participant) => new TestParticipant(participant));
        this.tests = tests.map((test) => new Test(test));
        this.testTiming = testTiming;
        this.testType = testType;
        this.updateInfo = updateInfo ? new ModificationInfo(updateInfo) : null;
    }
}
