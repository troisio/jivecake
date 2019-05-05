import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link }from 'react-router-dom';

import { T } from 'common/i18n';
import { ApplicationContext } from 'js/context';
import { routes } from 'js/routes';

import { Anchor } from 'component/anchor';
import './style.scss';

export function Header(props) {
  const { userId } = useContext(ApplicationContext);
  let rightContent = null;

  if (userId === null) {
    rightContent = (
      <Anchor button={true} to={routes.login()}>
        {T('Login')}
      </Anchor>
    );
  } else {
    rightContent = (
      <div styleName='actions'>
        <Anchor to={routes.home()} button>
          {T('Home')}
        </Anchor>
        <Anchor to={routes.landing()} button onClick={props.onLogoutClick}>
          {T('Logout')}
        </Anchor>
      </div>
    );
  }

  return (
    <div styleName='root'>
      <Link to={routes.landing()} styleName='left'>
        <img alt='logo' styleName='logo' src='https://jivecake.nyc3.cdn.digitaloceanspaces.com/image/image/logo-60@3x.png'/>
        <h1 styleName='jivecake'>
          {T('JiveCake')}
        </h1>
      </Link>
      {rightContent}
    </div>
  );
}

Header.propTypes = {
  onLogoutClick: PropTypes.func.isRequired
};
