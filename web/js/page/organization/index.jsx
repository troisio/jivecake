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
  UserOrganizationContext
} from 'js/context';

import './style.scss';

export function Component(props) {
  const { fetch, userId } = useContext(ApplicationContext);
  const { organizations } = useContext(OrganizationContext);
  const { userOrganizations } = useContext(UserOrganizationContext);

  useEffect(() => {
    if (!userOrganizations.hasOwnProperty(userId)) {
      fetch(`/user/${userId}/organization`, {
        query: {
          page: 0,
          lastUserActivity: -1
        }
      });
    }
  });

  function onOrganizationClick(organizationId) {
    const { history } = props;

    fetch(`/user/${userId}`, {
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
      <Anchor styleName='create-new' to={routes.organizationPersist()} button={true} icon={true}>
        <FontAwesomeIcon icon={faPlus} />
      </Anchor>
      {noneFound}
      {rows}
      {loading}
    </div>
  );
}

Component.propTypes = {
  userId: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  organizations: PropTypes.object.isRequired,
  userOrganizations: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired
};

export const Organization = withRouter(Component);
