import React from 'react';
import PropTypes from 'prop-types';

import { T } from 'common/i18n';
import { Button } from 'component/button';

import { fetch } from 'js/fetch';
import './style.scss';

export class Organization extends React.Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    organizations: PropTypes.object.isRequired
  }

  state = {
    organizations: []
  }

  componentDidMount() {
    const { userId } = this.props;
    fetch(`/user/${userId}/organization?page=0`).then(({response, body}) => {
      if (response.ok) {
        this.setState({
          organizations: body.entity
        });
      }
    })
  }

  render() {
    const organizations = this.state.organizations.map((organization) => {
      return (
        <div styleName='row' key={organization._id}>
          <div>
            {organization.name}
          </div>
          <div>
            <Button>
              {T('Change')}
            </Button>
          </div>
        </div>
      );
    })

    return (
      <div styleName='root'>
        {organizations}
      </div>
    );
  }
}
