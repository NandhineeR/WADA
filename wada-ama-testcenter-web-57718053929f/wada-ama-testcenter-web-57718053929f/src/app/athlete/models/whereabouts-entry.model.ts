import { Address } from '@shared/models';

/**
 * The exact and specific location of an athlete when they should be available for a test
 */
export class WhereaboutsEntry {
    addInfo: string;

    additionInfo: string;

    additionInfoOverWritten: boolean;

    address: string;

    addressAdditional: string;

    addressAddr1: string;

    addressAddr2: string;

    addressAI: string;

    addressCity: string;

    addressCountryId: string;

    addressDeleted: boolean;

    addressDetails: string;

    addressDetailsHint: string;

    addressDetailsShort: string;

    addressDetailsShortHint: string;

    addressDTO: Address | null;

    addressId: string;

    addressLabel: string;

    addressLastModificationDate: number | null;

    addressPhone1: string;

    addressPhone2: string;

    addressRegion: string;

    addressStateId: string;

    addressZip: string;

    applicationDate: Date | null;

    applicationDateDisplay: string;

    applicationDateF: string;

    arrival: string;

    arrivalAll: string;

    arrivalDate: string;

    arrivalDateDisplay: string;

    arrivalHint: string;

    arrivalTime: string;

    building: string;

    carrier: string;

    carrierAll: string;

    carrierHint: string;

    category: string;

    categoryCode: string;

    categoryId: string;

    date: string;

    departure: string;

    departureAll: string;

    departureHint: string;

    details: string;

    endDate: Date | null;

    endDateDisplay: string;

    endMin: number | null;

    endTime: string;

    endTimeEdit: string;

    floor: string;

    id: string;

    isAttachment: boolean;

    isRecurrence: boolean;

    isRetired: boolean;

    isSMS: boolean;

    isToday: boolean;

    isTravel: boolean;

    isWriter: boolean;

    lastModificationDate: Date | null;

    lastUpdated: string;

    modInfo: string;

    modStampLong: number | null;

    numberOfRecurrence: string;

    onehour: string;

    oneHourEnd: string;

    past: boolean;

    recurrence: string;

    recurrenceEntry: string;

    recurrenceType: string;

    recurring: boolean;

    room: string;

    routingNo: string;

    routingNoAll: string;

    routingNoHint: string;

    search: string;

    startDate: Date | null;

    startDateDisplay: string;

    startFromPassed: boolean;

    startHour: number | null;

    startMin: number | null;

    startTime: string;

    startTimeEdit: string;

    suitableForTest: boolean;

    team: boolean;

    teamForAthlete: boolean;

    timeRange: string;

    timeSlotOnly: boolean;

    title: string;

    titleHint: string;

    today: string;

    transport: string;

    transportId: string;

    travelPartialWritable: boolean;

    usedForAllDay: boolean;

    whereaboutsWriter: boolean;

    writable: boolean;

    constructor(whereabouts?: Partial<WhereaboutsEntry> | null) {
        const {
            addInfo = '',
            additionInfo = '',
            additionInfoOverWritten = false,
            address = '',
            addressAdditional = '',
            addressAddr1 = '',
            addressAddr2 = '',
            addressAI = '',
            addressCity = '',
            addressCountryId = '',
            addressDeleted = false,
            addressDetails = '',
            addressDetailsHint = '',
            addressDetailsShort = '',
            addressDetailsShortHint = '',
            addressDTO = null,
            addressId = '',
            addressLabel = '',
            addressLastModificationDate = null,
            addressPhone1 = '',
            addressPhone2 = '',
            addressRegion = '',
            addressStateId = '',
            addressZip = '',
            applicationDate = null,
            applicationDateDisplay = '',
            applicationDateF = '',
            arrival = '',
            arrivalAll = '',
            arrivalDate = '',
            arrivalDateDisplay = '',
            arrivalHint = '',
            arrivalTime = '',
            building = '',
            carrier = '',
            carrierAll = '',
            carrierHint = '',
            category = '',
            categoryCode = '',
            categoryId = '',
            date = '',
            departure = '',
            departureAll = '',
            departureHint = '',
            details = '',
            endDate = null,
            endDateDisplay = '',
            endMin = null,
            endTime = '',
            endTimeEdit = '',
            floor = '',
            id = '',
            isAttachment = false,
            isRecurrence = false,
            isRetired = false,
            isSMS = false,
            isToday = false,
            isTravel = false,
            isWriter = false,
            lastModificationDate = null,
            lastUpdated = '',
            modInfo = '',
            modStampLong = null,
            numberOfRecurrence = '',
            onehour = '',
            oneHourEnd = '',
            past = false,
            recurrence = '',
            recurrenceEntry = '',
            recurrenceType = '',
            recurring = false,
            room = '',
            routingNo = '',
            routingNoAll = '',
            routingNoHint = '',
            search = '',
            startDate = null,
            startDateDisplay = '',
            startFromPassed = false,
            startHour = null,
            startMin = null,
            startTime = '',
            startTimeEdit = '',
            suitableForTest = false,
            team = false,
            teamForAthlete = false,
            timeRange = '',
            timeSlotOnly = false,
            title = '',
            titleHint = '',
            today = '',
            transport = '',
            transportId = '',
            travelPartialWritable = false,
            usedForAllDay = false,
            whereaboutsWriter = false,
            writable = false,
        } = whereabouts || {};
        this.addInfo = addInfo;
        this.additionInfo = additionInfo;
        this.additionInfoOverWritten = additionInfoOverWritten;
        this.address = address;
        this.addressAdditional = addressAdditional;
        this.addressAddr1 = addressAddr1;
        this.addressAddr2 = addressAddr2;
        this.addressAI = addressAI;
        this.addressCity = addressCity;
        this.addressCountryId = addressCountryId;
        this.addressDeleted = addressDeleted;
        this.addressDetails = addressDetails;
        this.addressDetailsHint = addressDetailsHint;
        this.addressDetailsShort = addressDetailsShort;
        this.addressDetailsShortHint = addressDetailsShortHint;
        this.addressDTO = addressDTO;
        this.addressId = addressId;
        this.addressLabel = addressLabel;
        this.addressLastModificationDate = addressLastModificationDate;
        this.addressPhone1 = addressPhone1;
        this.addressPhone2 = addressPhone2;
        this.addressRegion = addressRegion;
        this.addressStateId = addressStateId;
        this.addressZip = addressZip;
        this.applicationDate = applicationDate;
        this.applicationDateDisplay = applicationDateDisplay;
        this.applicationDateF = applicationDateF;
        this.arrival = arrival;
        this.arrivalAll = arrivalAll;
        this.arrivalDate = arrivalDate;
        this.arrivalDateDisplay = arrivalDateDisplay;
        this.arrivalHint = arrivalHint;
        this.arrivalTime = arrivalTime;
        this.building = building;
        this.carrier = carrier;
        this.carrierAll = carrierAll;
        this.carrierHint = carrierHint;
        this.category = category;
        this.categoryCode = categoryCode;
        this.categoryId = categoryId;
        this.date = date;
        this.departure = departure;
        this.departureAll = departureAll;
        this.departureHint = departureHint;
        this.details = details;
        this.endDate = endDate;
        this.endDateDisplay = endDateDisplay;
        this.endMin = endMin;
        this.endTime = endTime;
        this.endTimeEdit = endTimeEdit;
        this.floor = floor;
        this.id = id;
        this.isAttachment = isAttachment;
        this.isRecurrence = isRecurrence;
        this.isRetired = isRetired;
        this.isSMS = isSMS;
        this.isToday = isToday;
        this.isTravel = isTravel;
        this.isWriter = isWriter;
        this.lastModificationDate = lastModificationDate;
        this.lastUpdated = lastUpdated;
        this.modInfo = modInfo;
        this.modStampLong = modStampLong;
        this.numberOfRecurrence = numberOfRecurrence;
        this.onehour = onehour;
        this.oneHourEnd = oneHourEnd;
        this.past = past;
        this.recurrence = recurrence;
        this.recurrenceEntry = recurrenceEntry;
        this.recurrenceType = recurrenceType;
        this.recurring = recurring;
        this.room = room;
        this.routingNo = routingNo;
        this.routingNoAll = routingNoAll;
        this.routingNoHint = routingNoHint;
        this.search = search;
        this.startDate = startDate;
        this.startDateDisplay = startDateDisplay;
        this.startFromPassed = startFromPassed;
        this.startHour = startHour;
        this.startMin = startMin;
        this.startTime = startTime;
        this.startTimeEdit = startTimeEdit;
        this.suitableForTest = suitableForTest;
        this.team = team;
        this.teamForAthlete = teamForAthlete;
        this.timeRange = timeRange;
        this.timeSlotOnly = timeSlotOnly;
        this.title = title;
        this.titleHint = titleHint;
        this.today = today;
        this.transport = transport;
        this.transportId = transportId;
        this.travelPartialWritable = travelPartialWritable;
        this.usedForAllDay = usedForAllDay;
        this.whereaboutsWriter = whereaboutsWriter;
        this.writable = writable;
    }
}
