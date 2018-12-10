import React from 'react';
import PropTypes from 'prop-types';

import { routes } from 'js/routes';
import { Spinner } from 'component/spinner';

export class Events extends React.Component {
  static propTypes = {
    organizationId: PropTypes.string.isRequired,
    fetch: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    organizationEvents: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  state = {
    displayGetError: false,
  }

  fetchEvents() {
    const { fetch, organizationId } = this.props;

    fetch(`/organization/${organizationId}/event`, {
      query: {
        page: 0,
        lastUserActivity: -1
      }
    });
  }

  componentDidMount() {
    const { userId, organizationEvents } = this.props;

    if (!organizationEvents.hasOwnProperty(userId)) {
      this.fetchEvents();
    }
  }

  onEventClick(eventId) {
    const { fetch, history } = this.props;

    fetch(`/user/${this.props.userId}`, {
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
