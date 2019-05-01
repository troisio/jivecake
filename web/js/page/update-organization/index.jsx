import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { ErrorPage } from 'page/error';
import { NotFoundPage } from 'page/not-found';
import { NaturalSpinner } from 'component/natural-spinner';
import { OrganizationPersist } from 'js/page/organization-persist';

class UpdateOrganizationComponent extends React.PureComponent {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    organizations: PropTypes.object.isRequired
  };

  state = {
    displayError: false,
    displayNotFound: false,
    loading: false
  };

  hasOrganization() {
    return this.props.organizations.hasOwnProperty(this.props.match.params.organizationId);
  }

  fetchOrganization = () => {
    const { fetch, match } = this.props;

    this.setState({ displayError: false, loading: true });

    fetch(`/organization/${match.params.organizationId}`).then(({ response }) => {
      if (response.ok) {
        this.setState({ loading: false });
      } else if (response.status === 404) {
        this.setState({ loading: false, displayNotFound: true });
      } else {
        this.setState({ displayError: true, loading: false });
      }
    }, () => {
      this.setState({ displayError: true, loading: false });
    });
  };

  onRetry = () => {
    if (!this.state.loading) {
      this.fetchOrganization();
    }
  };

  componentDidMount() {
    if (!this.hasOrganization()) {
      this.fetchOrganization();
    }
  }

  render() {
    const { match, organizations } = this.props;

    if (this.state.displayNotFound) {
      return <NotFoundPage onRetry={this.onRetry} />;
    }

    if (this.state.displayError) {
      return <ErrorPage onRetry={this.onRetry} />;
    }

    if (this.state.loading) {
      return <NaturalSpinner />;
    }

    if (this.hasOrganization()) {
      const organization = organizations[match.params.organizationId];

      return (
        <OrganizationPersist organization={organization} />
      );
    }

    return null;
  }
}

export const UpdateOrganization = withRouter(UpdateOrganizationComponent);
