import React from 'react';
import PropTypes from 'prop-types';

import {
  EventItemsContext,
  UserContext,
  ItemContext,
  EventContext,
  OrganizationContext,
  UserOrganizationContext,
  OrganizationEventsContext,
  ItemTransactionsContext
} from 'web/js/context';

import { useUsers } from 'web/js/reducer/useUsers';
import { useOrganizations } from 'web/js/reducer/useOrganizations';
import { useOrganizationEvents } from 'web/js/reducer/useOrganizationEvents';
import { useUserOrganizations } from 'web/js/reducer/useUserOrganizations';
import { useItemTransactions } from 'web/js/reducer/useItemTransactions';
import { useEventItems } from 'web/js/reducer/useEventItems';
import { useEvents } from 'web/js/reducer/useEvents';
import { useItems } from 'web/js/reducer/useItems';

export function Store({ children }) {
  const [ usersState ] = useUsers();
  const [ userOrganizationsState ] = useUserOrganizations();
  const [ organizationsState ] = useOrganizations();
  const [ organizationEventsState ] = useOrganizationEvents();
  const [ itemTransactionsState ] = useItemTransactions();
  const [ eventItemsState ] = useEventItems();
  const [ itemsState ] = useItems();
  const [ eventsState ] = useEvents();

  return (
    <UserContext.Provider value={usersState}>
      <UserOrganizationContext.Provider value={userOrganizationsState}>
        <OrganizationEventsContext.Provider value={organizationEventsState}>
          <EventItemsContext.Provider value={eventItemsState}>
            <ItemTransactionsContext.Provider value={itemTransactionsState}>
              <OrganizationContext.Provider value={organizationsState}>
                <EventContext.Provider value={eventsState}>
                  <ItemContext.Provider value={itemsState}>
                    {children}
                  </ItemContext.Provider>
                </EventContext.Provider>
              </OrganizationContext.Provider>
            </ItemTransactionsContext.Provider>
          </EventItemsContext.Provider>
        </OrganizationEventsContext.Provider>
      </UserOrganizationContext.Provider>
    </UserContext.Provider>
  );
}

Store.propTypes = {
  children: PropTypes.node.isRequired
};
