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
      <Anchor to={routes.landing()} button onClick={props.onLogoutClick}>
        {T('Logout')}
      </Anchor>
    );
  }

  return (
    <div styleName='root'>
      <Link to='/' styleName='left'>
        <img styleName='logo' src='https://jivecake.nyc3.cdn.digitaloceanspaces.com/image/image/logo-60@3x.png'/>
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
