import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@EventSubscriber()
export class UuidSubscriber implements EntitySubscriberInterface {
    beforeInsert(event: InsertEvent<any>) {
        if (event.entity && 'id' in event.entity && !event.entity.id) {
            event.entity.id = uuidv4();
        }
    }
}
