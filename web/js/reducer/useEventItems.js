import {
  GET_EVENT_ITEMS
} from 'js/reducer/useFetch';

import { getPaginationStoreHook } from 'js/helper/pagination';

export const useEventItems = getPaginationStoreHook(GET_EVENT_ITEMS, 'eventId');
