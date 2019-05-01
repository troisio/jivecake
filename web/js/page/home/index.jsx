import React from 'react';

import { T } from 'common/i18n';

import { svgUrl } from 'js/helper';
import { DefaultLayout } from 'component/default-layout';
import { Anchor } from 'js/component/anchor';
import { routes } from 'js/routes';
import './style.scss';

export function Home() {
  return (
    <DefaultLayout>
      <div styleName='navigation'>
        <Anchor styleName='anchor' to={routes.account()}>
          <img src={svgUrl('737-wrench.svg')} />
          <span styleName='anchor-text'>
            {T('My account')}
          </span>
        </Anchor>
        <Anchor styleName='anchor' to={routes.account()}>
          <img src={svgUrl('737-wrench.svg')} />
          <span styleName='anchor-text'>
            {T('My account')}
          </span>
        </Anchor>
        <Anchor styleName='anchor' to={routes.account()}>
          <img src={svgUrl('737-wrench.svg')} />
          <span styleName='anchor-text'>
            {T('My account')}
          </span>
        </Anchor>
        <Anchor styleName='anchor' to={routes.account()}>
          <img src={svgUrl('737-wrench.svg')} />
          <span styleName='anchor-text'>
            {T('My account')}
          </span>
        </Anchor>
      </div>
    </DefaultLayout>
  );
}
