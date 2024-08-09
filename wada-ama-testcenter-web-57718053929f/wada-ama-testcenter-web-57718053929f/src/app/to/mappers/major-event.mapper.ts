import {} from '@to/models';
import { ListItem, MajorEvent } from '@shared/models';

export function majorEventToListItem(majorEvent: MajorEvent | null): ListItem {
    const listItem = new ListItem();
    if (majorEvent !== null) {
        listItem.id = Number(majorEvent.id) || null;
        listItem.description = majorEvent.description;
        listItem.name = majorEvent.shortDescription;
    }
    return listItem;
}
