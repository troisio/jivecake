import React from 'react';
import PropTypes from 'prop-types';

import { OrganizationContext } from 'js/context/organization';
import { routes } from 'js/routes';
import { OrganizationPersist } from 'js/page/organization-persist';

import { Spinner } from 'js/component/spinner';

export class UpdateOrganization extends React.PureComponent {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    fetch: PropTypes.func.isRequired
  }

  onOrganizationPersisted = () => {
    this.props.history.push(routes.organization());
  }

  render() {
    const { fetch, match } = this.props;

    return (
      <OrganizationContext.Consumer>
        {organizations => {
          const inStore = organizations.hasOwnProperty(match.params.organizationId);

          if (inStore) {
            const organization = organizations[match.params.organizationId];

            return (
              <OrganizationPersist
                fetch={fetch}
                organization={organization}
                onOrganizationPersisted={this.onOrganizationPersisted}
              />
            );
          }

          fetch(`/organization/${match.params.organizationId}`);

          return <Spinner />;
        }}
      </OrganizationContext.Consumer>
    );
  }
}
