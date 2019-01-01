import React from 'react';
import PropTypes from 'prop-types';

import { Component } from 'page/events/component';

import { OrganizationEventsContext } from 'js/context';

export class Events extends React.Component {
  static propTypes = {
    organizationId: PropTypes.string.isRequired,
  }

  render() {
    return (
      <OrganizationEventsContext.Consumer>
        {organizationEvents => {
          <Component
            organizationId={this.props.organizationId}
            organizationEvents={organizationEvents}
          />
        }}
      </OrganizationEventsContext.Consumer>
    );
  }
}
