import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import { ApplicationContext, EventContext } from 'js/context';
import { routes } from 'js/routes';
import { EventPersist } from 'js/page/event-persist';

export class Component extends React.PureComponent {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    events: PropTypes.object.isRequired
  };

  onPersisted = (organization) => {
    this.props.history.push(routes.organizationEvents(organization._id));
  };

  componentDidMount() {
    const { events, fetch, match } = this.props;

    if (!events.hasOwnProperty(match.params.eventId)) {
      fetch(`/event/${match.params.eventId}`);
    }
  }

  render() {
    const { events, match } = this.props;

    if (events.hasOwnProperty(match.params.eventId)) {
      const event = events[match.params.eventId];

      return (
        <EventPersist
          event={event}
          onPersisted={this.onPersisted}
        />
      );
    }

    return null;
  }
}

export const UpdateEventWithRouter = withRouter(Component);

export const UpdateEvent = () => (
  <ApplicationContext.Consumer>
    { ({ fetch }) =>
      <EventContext.Consumer>
        { events =>
          <UpdateEventWithRouter events={events} fetch={fetch} />
        }
      </EventContext.Consumer>
    }
  </ApplicationContext.Consumer>
);
