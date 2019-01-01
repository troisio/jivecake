import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { ApplicationContext, OrganizationEventsContext } from 'js/context';
import { Spinner } from 'component/spinner';
import { routes } from 'js/routes';

export class Component extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    organizationEvents: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired
  };

  state = {
    displayGetError: false,
  };

  componentDidMount() {
    const { fetch } = this.props;
    const { match: { params: { organizationId } }, organizationEvents } = this.props;

    if (!organizationEvents.hasOwnProperty(organizationId)) {
      fetch(`/organization/${organizationId}/event`);
    }
  }

  onEventClick(eventId) {
    const { fetch, history, userId } = this.props;

    fetch(`/user/${userId}`, {
      method: 'POST',
      body: {
        lastEventId: eventId
      }
    });

    history.push(routes.event(eventId));
  }

  render() {
    return <Spinner />;
  }
}

const EventsWithRouter = withRouter(Component);

export const Signup = () => (
  <ApplicationContext.Consumer>
    { ({ userId, fetch }) =>
      <OrganizationEventsContext.Consumer>
        { organizationEvents =>
          <EventsWithRouter organizationEvents={organizationEvents} userId={userId} fetch={fetch} />
        }
      </OrganizationEventsContext.Consumer>
    }
  </ApplicationContext.Consumer>
);
