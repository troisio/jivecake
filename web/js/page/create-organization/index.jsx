import React from 'react';
import PropTypes from 'prop-types';

import { routes } from 'js/routes';
import { OrganizationPersist } from 'js/page/organization-persist';

export class CreateOrganization extends React.PureComponent {
  static propTypes = {
    history: PropTypes.object,
    fetch: PropTypes.func.isRequired
  }

  onOrganizationPersisted = () => {
    this.props.history.push(routes.organization());
  }

  render() {
    return (
      <OrganizationPersist
        fetch={this.props.fetch}
        organization={null}
        onOrganizationPersisted={this.onOrganizationPersisted}
      />
    );
  }
}
