import {
  GET_ORGANIZATION_EVENTS
} from 'js/reducer/useFetch';

import { getPaginationStoreHook } from 'js/helper/pagination';

export const useOrganizationEvents = getPaginationStoreHook(GET_ORGANIZATION_EVENTS, 'organizationId');
