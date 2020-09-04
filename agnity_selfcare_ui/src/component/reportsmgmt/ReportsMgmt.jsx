import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import EditIcon from '../../images/Edit.jpg';
import HomeIcon from '../../images/home.png';
import ExtenderIcon from '../../images/Extender.png';

import SystemAuditReport from './SystemAuditReport';
import ANIHistoryReport from './ANIHistoryReport';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

class ReportsMgmt extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input,
            user : this.props.input.user,
            pageViewChosen : 'Audit Report'
        }

        this.onFeatureSelectionChange = this.onFeatureSelectionChange.bind(this);
    }

    componentDidMount()
    {

    }

    componentWillReceiveProps(props)
    {

    }

    navigateToSelectedScreen(inScreen)
    {
        this.props.selectScreen(inScreen);
    }

    onFeatureSelectionChange(option)
    {
        this.setState({ pageViewChosen : option });
    }

    render(){
        return(
            <I18nProvider locale={this.state.param.languageselected}>
                <div className="ReportMgmtHolder">
                    <div className="card ReportMgmtPanel SPSComponentPanel">
                        <div className="ScreenNavigationInfoPanel">
                            <BS.Breadcrumb className="ScreenNavigationListArea">
                                <BS.BreadcrumbItem href="" onClick={() => this.navigateToSelectedScreen("home")}>
                                    <img src={HomeIcon} style={{width: '20px'}}
                                      data-toggle="tooltip" data-placement="top" title="Home"
                                    />
                                    <img src={ExtenderIcon} className="ExtenderIcon"/>
                                </BS.BreadcrumbItem>
                                <BS.BreadcrumbItem>
                                    <span>{Translator('reports')}</span>
                                </BS.BreadcrumbItem>
                                
                            </BS.Breadcrumb>
                        </div>

                        <div className="FeatureSelectionPanel">
                            <div className="FeatureSelectionPanel">
                                <BS.Tabs variant="tabs" style={{background: '#d1dff8'}} activeKey={this.state.pageViewChosen} 
                                    onSelect={this.onFeatureSelectionChange}>
                                    <BS.Tab eventKey="Audit Report" title={Translator('reports_audit')}>
                                        <SystemAuditReport name="System Audit Report" input={this.state.param} />
                                    </BS.Tab>
                                    <BS.Tab eventKey="ANI Report" title={Translator('reports_ANI')}  >
                                        <ANIHistoryReport name="ANI History Report" input={this.state.param} />
                                    </BS.Tab>
                                    
                                </BS.Tabs>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </I18nProvider>
        )
    }
}

export default ReportsMgmt;