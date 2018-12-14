import React from 'react';
import PropTypes from 'prop-types';

import { Spinner } from 'component/spinner';

export class Component extends React.Component {
  static propTypes = {
    organizationId: PropTypes.string.isRequired,
    organizationEvents: PropsTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired
  }

  state = {
    displayGetError: false,
  }

  componentDidMount() {
    const { organizationId, organizationEvents } = this.props;

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
