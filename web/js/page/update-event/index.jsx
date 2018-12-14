import React from 'react';
import PropTypes from 'prop-types';

import { EventContext } from 'js/context';
import { routes } from 'js/routes';
import { EventPersist } from 'js/page/event-persist';

import { Spinner } from 'js/component/spinner';

export class UpdateEvent extends React.PureComponent {
  static propTypes = {
    organization: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    fetch: PropTypes.func.isRequired
  }

  onPersisted = () => {
    this.props.history.push(routes.organizationEvents(this.props.organization._id));
  }

  render() {
    const { fetch, match } = this.props;

    return (
      <EventContext.Consumer>
        {events => {
          if (events.hasOwnProperty(match.params.eventId)) {
            const event = events[match.params.eventId];

            return (
              <EventPersist
                fetch={fetch}
                event={event}
                organization={this.props.organization}
                onPersisted={this.onPersisted}
              />
            );
          }

          fetch(`/event/${match.params.eventId}`);

          return <Spinner />;
        }}
      </EventContext.Consumer>
    );
  }
}
