import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

class SessionExpires extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input
        }
    }
}

export default SessionExpires;