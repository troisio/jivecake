import React from 'react';
import PropTypes from 'prop-types';

import {
  EventItemsContext,
  UserContext,
  ItemContext,
  EventContext,
  OrganizationContext,
  UserOrganizationContext,
  OrganizationEventsContext
} from 'js/context';

import { useUsers } from 'js/reducer/useUsers';
import { useOrganizations } from 'js/reducer/useOrganizations';
import { useOrganizationEvents } from 'js/reducer/useOrganizationEvents';
import { useUserOrganizations } from 'js/reducer/useUserOrganizations';
import { useEventItems } from 'js/reducer/useEventItems';
import { useEvents } from 'js/reducer/useEvents';
import { useItems } from 'js/reducer/useItems';

export function Store({ children }) {
  const [ usersState ] = useUsers();
  const [ userOrganizationsState ] = useUserOrganizations();
  const [ organizationsState ] = useOrganizations();
  const [ organizationEventsState ] = useOrganizationEvents();
  const [ eventItemsState ] = useEventItems();
  const [ itemsState ] = useItems();
  const [ eventsState ] = useEvents();

  return (
    <UserContext.Provider value={usersState}>
      <UserOrganizationContext.Provider value={userOrganizationsState}>
        <OrganizationEventsContext.Provider value={organizationEventsState}>
          <EventItemsContext.Provider value={eventItemsState}>
            <OrganizationContext.Provider value={organizationsState}>
              <EventContext.Provider value={eventsState}>
                <ItemContext.Provider value={itemsState}>
                  {children}
                </ItemContext.Provider>
              </EventContext.Provider>
            </OrganizationContext.Provider>
          </EventItemsContext.Provider>
        </OrganizationEventsContext.Provider>
      </UserOrganizationContext.Provider>
    </UserContext.Provider>
  );
}

Store.propTypes = {
  children: PropTypes.node.isRequired
};
