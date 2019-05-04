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
        <Anchor box button styleName='anchor' to={routes.event()}>
          <img src={svgUrl('599-circus-tent.svg')} />
          <span styleName='anchor-text'>
            {T('My Events')}
          </span>
        </Anchor>
        <Anchor box button styleName='anchor' to={routes.eventPersist()}>
          <img src={svgUrl('731-calendar.svg')} />
          <span styleName='anchor-text'>
            {T('Create an Event')}
          </span>
        </Anchor>
        <Anchor box button styleName='anchor' to={routes.account()}>
          <img src={svgUrl('737-wrench.svg')} />
          <span styleName='anchor-text'>
            {T('My account')}
          </span>
        </Anchor>
      </div>
    </DefaultLayout>
  );
}
