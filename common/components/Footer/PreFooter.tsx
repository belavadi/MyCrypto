import React from 'react';
import './PreFooter.scss';
import { translateRaw } from 'translations';

interface Props {
  openModal(): void;
}

const PreFooter: React.SFC<Props> = ({ openModal }) => {
  return (
    <section className="pre-footer">
      <div className="container">
        <p>
          {translateRaw('PREFOOTER_WARNING')}{' '}
          <a onClick={openModal}>{translateRaw('PREFOOTER_SECURITY_WARNING')}</a>
        </p>
      </div>
    </section>
  );
};

export default PreFooter;
