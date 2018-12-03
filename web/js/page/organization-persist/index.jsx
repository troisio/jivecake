import React from 'react';
import PropTypes from 'prop-types';

import { T } from 'common/i18n';

import { MessageBlock } from 'component/message-block';
import { Input } from 'component/input';
import { Button } from 'component/button';
import { fetch } from 'js/fetch';
import './style.scss';

export class OrganizationPersist extends React.Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    organizationId: PropTypes.string,
    organizations: PropTypes.object.isRequired
  }

  static defaultProps = {
    organizationId: null
  }

  state = {
    name: '',
    email: '',
    loading: false,
    displayUnableToPersistError: false
  }

  onSubmit = (e) => {
    e.preventDefault();

    if (this.state.loading) {
      return;
    }

    this.setState({
      loading: true,
      displayUnableToPersistError: false
    });

    const url = this.props.organizationId === null ? '/organization' : this.props.organizationId;

    fetch(url, {
      method: 'POST',
      body: {
        name: this.state.name,
        email: this.state.email
      }
    }).then(({ response }) => {
      if (response.ok) {
        this.setState({
          loading: false
        });
      } else {
        this.setState({
          loading: false,
          displayUnableToPersistError: true
        });
      }
    }, () => {
      this.setState({
        loading: false,
        displayUnableToPersistError: true
      });
    })
  }

  onEmailChange = (e) => {
    this.setState({ email: e.target.value });
  }

  onNameChange = (e) => {
    this.setState({ name: e.target.value });
  }

  render() {
    const submitText = this.props.organizationId === null ? T('Create') : T('Update');

    let unableToPersistError = null;

    if (this.state.displayUnableToPersistError) {
      unableToPersistError = (
        <MessageBlock>
          {T('Sorry, we were not able save your data, please try again')}
        </MessageBlock>
      )
    }

    return (
      <form onSubmit={this.onSubmit} styleName='root'>
        {unableToPersistError}
        <Input
          placeholder={T('Organization Name')}
          onChange={this.onNameChange}
          value={this.state.name}
          required
        />
        <div styleName='email-section'>
          <Input
            placeholder={T('Email')}
            value={this.state.email}
            required
            onChange={this.onEmailChange}
          />
          <div styleName='email-note'>
            {T('This email will be used so your customers can contact you.')}
            &nbsp;
            {T('We will also use this email to send you organization specific communication.')}
          </div>
        </div>
        <Button loading={this.state.loading}>
          {submitText}
        </Button>
      </form>
    );
  }
}
