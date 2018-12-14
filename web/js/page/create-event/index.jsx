import React from 'react';
import PropTypes from 'prop-types';

import { routes } from 'js/routes';
import { EventPersist } from 'js/page/event-persist';

export class CreateEvent extends React.PureComponent {
  static propTypes = {
    organization: PropTypes.object,
    history: PropTypes.object,
    fetch: PropTypes.func.isRequired
  }

  onPersisted = () => {
    this.props.history.push(routes.event());
  }

  render() {
    return (
      <EventPersist
        fetch={this.props.fetch}
        event={null}
        organization={this.props.organization}
        onPersisted={this.onPersisted}
      />
    );
  }
}
