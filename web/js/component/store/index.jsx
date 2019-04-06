import React from 'react';
import PropTypes from 'prop-types';

import {
  UserContext,
  ItemContext,
  EventContext,
  OrganizationContext,
  UserOrganizationContext
} from 'js/context';

import { useUsers } from 'js/reducer/useUsers';
import { useOrganizations } from 'js/reducer/useOrganizations';
import { useUserOrganizations } from 'js/reducer/useUserOrganizations';
import { useEvents } from 'js/reducer/useEvents';
import { useItems } from 'js/reducer/useItems';

export function Store({ children }) {
  const [ usersState ] = useUsers();
  const [ userOrganizationsState ] = useUserOrganizations();
  const [ organizationsState ] = useOrganizations();
  const [ itemsState ] = useItems();
  const [ eventsState ] = useEvents();

  return (
    <UserContext.Provider value={usersState}>
      <UserOrganizationContext.Provider value={userOrganizationsState}>
        <OrganizationContext.Provider value={organizationsState}>
          <EventContext.Provider value={eventsState}>
            <ItemContext.Provider value={itemsState}>
              {children}
            </ItemContext.Provider>
          </EventContext.Provider>
        </OrganizationContext.Provider>
      </UserOrganizationContext.Provider>
    </UserContext.Provider>
  );
}

Store.propTypes = {
  children: PropTypes.node.isRequired
};
