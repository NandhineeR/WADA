import { TOItem } from '@shared/models';
import { TestingOrderRow } from '@to/models';
import * as moment from 'moment';

export function mapToTestingOrderRows(toItems: Array<TOItem>): Array<TestingOrderRow> {
    return toItems.map(
        (toItem: TOItem) =>
            new TestingOrderRow({
                id: toItem.id || '',
                adoReferenceNumber: toItem.adoReferenceNumber || '',
                testingOrderNumber: toItem.testingOrderNumber || '',
                testingAuthority: toItem.testingAuthority?.description || '',
                description: toItem.description || '',
                city: toItem.city || '',
                issuedDate: toItem.issuedDate ? moment.utc(toItem.issuedDate) : null,
                startDate: toItem.startDate ? moment.utc(toItem.startDate) : null,
                testingOrderStatus: toItem.testingOrderStatus?.description || '',
            })
    );
}
