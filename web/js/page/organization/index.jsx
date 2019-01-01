import React from 'react';
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

class Component extends React.PureComponent {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    organizations: PropTypes.object.isRequired,
    userOrganizations: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired
  }

  state = {
    displayGetError: false,
  }

  fetchOrganizations() {
    const { fetch, userId } = this.props;

    fetch(`/user/${userId}/organization`, {
      query: {
        page: 0,
        lastUserActivity: -1
      }
    });
  }

  componentDidMount() {
    const { userId, userOrganizations } = this.props;

    if (!userOrganizations.hasOwnProperty(userId)) {
      this.fetchOrganizations();
    }
  }

  onOrganizationClick(organizationId) {
    const { fetch, history } = this.props;

    fetch(`/user/${this.props.userId}`, {
      method: 'POST',
      body: {
        lastOrganizationId: organizationId,
      }
    });

    history.push(routes.organizationEvents(organizationId));
  }

  render() {
    const { userOrganizations, organizations, userId } = this.props;
    let rows = null;
    let noneFound = null;
    let loading = <Spinner styleName='spinner-get-organization' />;

    if (userOrganizations.hasOwnProperty(userId)) {
      loading = null;
      const { pages: { [0]: ids } } = userOrganizations[userId];
      const organizationsInStore = ids
        .filter(id => organizations.hasOwnProperty(id))
        .map(id => organizations[id]);

      rows = organizationsInStore.map((organization) => {
        const avatarProps = organization.avatar === null ? {} : { src: organization.avatar };

        return (
          <div styleName='row' key={organization._id}>
            <button onClick={() => this.onOrganizationClick(organization._id)} styleName='organization-identity'>
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
}

const ComponentWithRouter = withRouter(Component);

export const Organization = () => (
  <ApplicationContext.Consumer>
    { ({ fetch, userId }) =>
      <OrganizationContext.Consumer>
        {organizations =>
          <UserOrganizationContext.Consumer>
            { userOrganizations =>
                <ComponentWithRouter
                  fetch={fetch}
                  userId={userId}
                  organizations={organizations}
                  userOrganizations={userOrganizations}
                />
            }
          </UserOrganizationContext.Consumer>
        }
      </OrganizationContext.Consumer>
    }
  </ApplicationContext.Consumer>
);
