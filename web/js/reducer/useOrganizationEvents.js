import {
  GET_ORGANIZATION_EVENTS
} from 'web/js/reducer/useFetch';

import { getPaginationStoreHook } from 'web/js/helper/pagination';

export const useOrganizationEvents = getPaginationStoreHook(GET_ORGANIZATION_EVENTS, 'organizationId');
