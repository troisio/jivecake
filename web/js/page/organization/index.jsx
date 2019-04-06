import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { T } from 'common/i18n';
import { Avatar } from 'component/avatar';
import { Spinner } from 'component/spinner';
import { Anchor } from 'component/anchor';
import { MessageBlock } from 'component/message-block';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { routes } from 'js/routes';
import {
  ApplicationContext,
  OrganizationContext,
  UserOrganizationContext,
  FetchDispatchContext
} from 'js/context';

import './style.scss';

import { GET_USER_ORGANIZATIONS } from 'js/reducer/useFetch';

export function OrganizationComponent(props) {
  const { userId } = useContext(ApplicationContext);
  const organizations = useContext(OrganizationContext);
  const userOrganizations = useContext(UserOrganizationContext);
  const [ dispatchFetch ] = useContext(FetchDispatchContext);

  useEffect(() => {
    if (!userOrganizations.hasOwnProperty(userId)) {
      dispatchFetch(`/user/${userId}/organization`, {
        query: {
          page: 0,
          lastUserActivity: -1
        },
        params: {
          userId
        }
      }, GET_USER_ORGANIZATIONS);
    }
  }, []);

  function onOrganizationClick(organizationId) {
    const { history } = props;

    dispatchFetch(`/user/${userId}`, {
      method: 'POST',
      body: {
        lastOrganizationId: organizationId,
      }
    });

    history.push(routes.organizationEvents(organizationId));
  }

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
          <button onClick={() => onOrganizationClick(organization._id)} styleName='organization-identity'>
            <Avatar styleName='avatar' { ...avatarProps } />
            <span styleName='name'>
              {organization.name}
            </span>
          </button>
          <div styleName='spinner'>
            <Anchor to={routes.organizationPersist(organization._id)} button={true} icon={true}>
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
