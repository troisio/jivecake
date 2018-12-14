import React from 'react';
import PropTypes from 'prop-types';

import { Component } from 'page/events/component';

import { OrganizationEventsContext } from 'js/context';

export class Events extends React.Component {
  static propTypes = {
    organizationId: PropTypes.string.isRequired,
    fetch: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired
  }

  render() {
    return (
      <OrganizationEventsContext.Consumer>
        {organizationEvents => {
          <Component
            organizationId={this.props.organizationId}
            organizationEvents={organizationEvents}
            fetch={this.props.fetch}
            userId={this.props.userId}
            history={this.props.history}
          />
        }}
      </OrganizationEventsContext.Consumer>
    );
  }
}
