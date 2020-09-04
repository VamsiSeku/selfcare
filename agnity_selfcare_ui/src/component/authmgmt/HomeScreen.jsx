import React from 'react';
import './HomeScreen.css';
import AccountIcon from '../../images/Dashboard.png';
import ResourceIcon from '../../images/Resource.jpg';
import BlacklistIcon from '../../images/Blacklist.png';
import ReportsIcon from '../../images/Report.png';
import ServiceIcon from '../../images/Service.png';
import AdminMgmtIcon from '../../images/AdminMgmt.png';

import * as SPSUtils from '../../utils/SPSUtils.js';
import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

class HomeScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            param: this.props.input,
            user: this.props.input.user,
            userRole : this.props.input.userRole,
            errorAlert: false,
            errorMsg: ''
        }
    }

    componentDidMount() {
        console.log('home screen');
    }

    navigateToSelectedScreen(selectedScreen) {
        switch (selectedScreen) {
            case "dashboardmgmt":
                this.props.selectScreen('dashboardmgmt');
                break;

            case "numberpoolmgmt":
                this.props.selectScreen('numberpoolmgmt');
                break;

            case "campaignmgmt":
                this.props.selectScreen('campaignmgmt');
                break;

            case "globalblacklistmgmt":
                this.props.selectScreen('globalblacklistmgmt');
                break;

            case "quarantinemgmt":
                this.props.selectScreen('quarantinemgmt');
                break;

            case "reportmgmt":
                if (this.state.userRole.adminRole === '1')
                    this.props.selectScreen('reportmgmt');
                break;
        }
    }
    
    displayErrorAlert(flag) {
        if (flag) {
            return "row ShowElement";
        }
        else
            return "row HideElement";
    }

    render() {
        return (
            <I18nProvider locale={this.state.param.locale}>
                <div className="SPSHomeContainer">
                    <div className="container ScreenNavigationSelectArea">
                        <div className={this.displayErrorAlert(this.state.errorAlert)}>
                            <div className="alert alert-danger alert-dismissible fade show errorAlert" role="alert">
                                <button type="button" className="close" data-dismiss="alert" aria-label="Close"
                                    onClick={() => this.setState({ errorAlert: false })}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                Error : {this.state.errorMsg}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <div className="ScreenSelectionHolder" onClick={() => this.navigateToSelectedScreen("dashboardmgmt")} data-toggle="tooltip" data-placement="top" title="Dashboard">
                                    <a><img src={AccountIcon} /></a>
                                    <h5>{Translator('home_dashboard')}</h5>
                                    <p>{Translator('home_dashboard_description')}</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="ScreenSelectionHolder" onClick={() => this.navigateToSelectedScreen("numberpoolmgmt")} data-toggle="tooltip" data-placement="top" title="NumberPool">
                                    <a><img src={ServiceIcon} /></a>
                                    <h5>{Translator('home_numberpool')}</h5>
                                    <p>{Translator('home_numberpool_description')}</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="ScreenSelectionHolder" onClick={() => this.navigateToSelectedScreen("campaignmgmt")} data-toggle="tooltip" data-placement="top" title="Campaign">
                                    <a><img src={AdminMgmtIcon} /></a>
                                    <h5>{Translator('home_campaign')}</h5>
                                    <p>{Translator('home_campaign_description')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="row" style={{ marginTop: '5%' }}>
                            <div className="col">
                                <div className="ScreenSelectionHolder" onClick={() => this.navigateToSelectedScreen("quarantinemgmt")} data-toggle="tooltip" dataplacement="top" title="Quarantine Management">
                                    <a><img src={ResourceIcon} /></a>
                                    <h5>{Translator('home_quarantine')}</h5>
                                    <p>{Translator('home_quarantine_description')}</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="ScreenSelectionHolder" onClick={() => this.navigateToSelectedScreen("globalblacklistmgmt")} data-toggle="tooltip" dataplacement="top" title="Global Blacklist">
                                    <a><img src={BlacklistIcon} /></a>
                                    <h5>{Translator('home_global_blacklist')}</h5>
                                    <p>{Translator('home_global_blacklist_description')}</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="ScreenSelectionHolder" onClick={() => this.navigateToSelectedScreen("reportmgmt")} data-toggle="tooltip" dataplacement="top" title="Reports Management"
                                disabled={this.state.userRole.adminRole === '0' || this.state.userRole.adminRole === '2'}>
                                    <a><img src={ReportsIcon} /></a>
                                    <h5>{Translator('home_report')}</h5>
                                    <p>{Translator('home_report_description')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </I18nProvider>
        );
    }
}

export default HomeScreen;