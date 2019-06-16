import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { T } from 'common/i18n';
import {
  USER_ORGANIZATIONS_PATH
} from 'common/routes';

import { Avatar } from 'web/js/component/avatar';
import { Spinner } from 'web/js/component/spinner';
import { Anchor } from 'web/js/component/anchor';
import { MessageBlock } from 'web/js/component/message-block';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { routes } from 'web/js/routes';
import {
  ApplicationContext,
  OrganizationContext,
  UserOrganizationContext,
  FetchDispatchContext
} from 'web/js/context';

import './style.scss';

import { GET_USER_ORGANIZATIONS } from 'web/js/reducer/useFetch';

export function OrganizationComponent() {
  const { userId } = useContext(ApplicationContext);
  const organizations = useContext(OrganizationContext);
  const userOrganizations = useContext(UserOrganizationContext);
  const [ dispatchFetch ] = useContext(FetchDispatchContext);

  useEffect(() => {
    if (!userOrganizations.hasOwnProperty(userId)) {
      dispatchFetch([USER_ORGANIZATIONS_PATH, userId], {
        query: {
          page: 0,
          lastUserActivity: -1
        }
      }, GET_USER_ORGANIZATIONS);
    }
  }, []);

  let rows;
  let noneFound;
  let loading;

  if (userOrganizations.hasOwnProperty(userId)) {
    const { pages: { 0: ids } } = userOrganizations[userId];
    const organizationsInStore = ids
      .filter(id => organizations.hasOwnProperty(id))
      .map(id => organizations[id]);

    rows = organizationsInStore.map(organization => {
      const avatarProps = organization.avatar === null ? {} : { src: organization.avatar };

      return (
        <div styleName='row' key={organization._id}>
          <Anchor to={routes.organizationEvents(organization._id)} button styleName='organization-identity'>
            <Avatar styleName='avatar' { ...avatarProps } />
            <span styleName='name'>
              {organization.name}
            </span>
          </Anchor>
          <div styleName='spinner'>
            <Anchor to={routes.organizationPersist(organization._id)} button icon={true}>
              <FontAwesomeIcon icon={faEdit} />
            </Anchor>
          </div>
        </div>
      );
    });
  } else {
    loading = <Spinner styleName='spinner-get-organization' />;
  }

  if (rows !== null && rows.length === 0) {
    noneFound = (
      <MessageBlock>
        {T('No organizations yet')}
      </MessageBlock>
    );
  }

  return (
    <div styleName='root'>
      <Anchor styleName='create-new' to={routes.organizationPersist()} button icon>
        <FontAwesomeIcon icon={faPlus} />
      </Anchor>
      {noneFound}
      {rows}
      {loading}
    </div>
  );
}

OrganizationComponent.propTypes = {
  history: PropTypes.object.isRequired
};

export const Organization = withRouter(OrganizationComponent);
