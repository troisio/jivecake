import React from 'react';
import PropTypes from 'prop-types';
import { Link }from 'react-router-dom';

import { T } from 'common/i18n';
import { ApplicationContext } from 'js/context/application';
import { Routes } from 'common/routes';

import { Button } from 'component/button';
import './style.scss';

export class Header extends React.Component {
  static contextType = ApplicationContext;

  static propTypes = {
    onLogoutClick: PropTypes.func.isRequired
  }

  render() {
    const routes = new Routes();
    const { userId } = this.context;
    let rightContent = null;

    if (userId === null) {
      rightContent = (
        <Link styleName='login' to={routes.login()}>
          {T('Login')}
        </Link>
      );
    } else {
      rightContent = (
        <Button onClick={this.props.onLogoutClick}>
          {T('Logout')}
        </Button>
      );
    }

    return (
      <div styleName='root'>
        <Link to='/' styleName='left'>
          <img styleName='logo' src='https://jivecake.nyc3.cdn.digitaloceanspaces.com/image/image/logo-60@3x.png'/>
          <h1 styleName='jivecake'>JiveCake</h1>
        </Link>
        {rightContent}
      </div>
    );
  }
}
