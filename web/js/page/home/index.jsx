import React, { useContext } from 'react';

import { T } from 'common/i18n';

import { svgUrl } from 'js/helper';
import { DefaultLayout } from 'component/default-layout';
import { Anchor } from 'js/component/anchor';
import { routes } from 'js/routes';
import './style.scss';

import {
  ApplicationContext
} from 'js/context';

export function Home() {
  const { organizationId } = useContext(ApplicationContext);

  let myEvents;

  if (organizationId) {
    myEvents = (
      <Anchor box button styleName='anchor' to={routes.event()}>
        <img alt='circus-tent' src={svgUrl('599-circus-tent.svg')} />
        <span styleName='anchor-text'>
          {T('My Events')}
        </span>
      </Anchor>
    );
  }

  return (
    <DefaultLayout>
      <div styleName='navigation'>
        {myEvents}
        <Anchor box button styleName='anchor' to={routes.eventPersist()}>
          <img alt='calendar' src={svgUrl('731-calendar.svg')} />
          <span styleName='anchor-text'>
            {T('create event')}
          </span>
        </Anchor>
        <Anchor box button styleName='anchor' to={routes.account()}>
          <img alt='wrench' src={svgUrl('737-wrench.svg')} />
          <span styleName='anchor-text'>
            {T('account')}
          </span>
        </Anchor>
      </div>
    </DefaultLayout>
  );
}
