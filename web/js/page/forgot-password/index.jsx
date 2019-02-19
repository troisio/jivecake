import React, { useContext, useState } from 'react';
import { Link }from 'react-router-dom';

import { ApplicationContext } from 'js/context';
import { Routes } from 'common/routes';
import { T } from 'common/i18n';

import { Button } from 'component/button';
import { Input } from 'component/input';
import './style.scss';

export function ForgotPassword() {
  const [ displayFailure ] = useState(false);
  const { userId } = useContext(ApplicationContext);
  const routes = new Routes();

  let content;

  if (userId === null) {
    let failure;
    let success;

    if (displayFailure) {
      failure = (
        <div>
          {T('Sorry we are not able to recover your password, please try again later')}
        </div>
      );
    }

    if (displayFailure) {
      success = (
        <div>
          {T('Thanks, we will send you an email as quick as we can')}
        </div>
      );
    }

    content = (
      <>
        {failure}
        {success}
        <form styleName='form'>
          <span styleName='title'>
            {T('Reset Password')}
          </span>
          <i styleName='fa-key' className='fas fa-key'></i>
          <Input placeholder={T('Email')} type='email' />
          <Button>
            {T('Submit')}
          </Button>
        </form>
      </>
    );
  } else {
    content = (
      <>
        <span>
          {T('You are already logged in')}
        </span>
        <Link to={routes.myTransactions(userId)}>
          {T('Go to my transactions')}
        </Link>
      </>
    );
  }

  return (
    <div styleName='root'>
      {content}
    </div>
  );
}
