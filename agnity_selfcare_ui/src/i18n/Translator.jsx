import React from 'react';
import { FormattedMessage } from 'react-intl';

const Translator = ( id, value={} ) => <FormattedMessage id={id} values={{...value}} />;

export default Translator;