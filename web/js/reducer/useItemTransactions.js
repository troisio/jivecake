import {
  GET_ITEM_TRANSACTIONS
} from 'js/reducer/useFetch';

import { getPaginationStoreHook } from 'js/helper/pagination';

export const useItemTransactions = getPaginationStoreHook(GET_ITEM_TRANSACTIONS, 'itemId');
