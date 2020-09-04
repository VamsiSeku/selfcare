import React from 'react';
import LoginPage from './authmgmt/LoginPage';
import Header from './HeaderSection';
import Footer from './FooterSection';
import HomeScreen from './authmgmt/HomeScreen';
import NumberPool from './numberpoolmgmt/NumberPool';
import CampaignMgmt from './campaignmgmt/Campaign';
import GlobalBlacklist from './globalblacklistmgmt/GlobalBlacklist';
import CampaignSettings from './campaignmgmt/CampaignSettings';
import QuarantineNumbers from './quarantinemgmt/QuarantineNumbers';
import ReportsMgmt from './reportsmgmt/ReportsMgmt';
import Dashboard from './dashboardmgmt/Dashboard';

import * as SPSUtils from '../utils/SPSUtils';
import { LOCALES } from '../i18n';

class SelfCareRouter extends React.Component
{
    constructor(props)
    {
        super(props);
        const queryParams = new URLSearchParams(window.location.search);

        const inParams = {
            token : '',
            accountNumber : queryParams.get('accountNumber'),
            screen : queryParams.get('screen'),
            user : {
                userId : queryParams.get('user')
            },
            campaign : {
                campaignName : queryParams.get('campaignName')
            },
            locale : LOCALES.ENGLISH,
            RANI_API_INTEGRATION : '',
            ELASTIC_INTEGRATION_URL : '',
            userRole : {
                adminRole : '0'
            }
        }

        this.state = {
            param : inParams
        }

        this.defaultParams = inParams;
        this.getAccessToken = this.getAccessToken.bind(this);
        this.homeScreenCtrl = this.homeScreenCtrl.bind(this);
        this.setLocale = this.setLocale.bind(this);
        this.selectScreen = this.selectScreen.bind(this);
        this.campaignSettings = this.campaignSettings.bind(this);
        this.resetParams = this.resetParams.bind(this);
    }

    componentDidMount()
    {
        this.loadBaseURLConfig();
    }

    loadBaseURLConfig()
    {
        let self = this;
        SPSUtils.getRANIIntegrationBaseURL(function(flag, result) {
            console.log('Inresult : ' + JSON.stringify(result));
            if (flag)
            {
                self.setState({ param : SPSUtils.getObjectInfo(self.state.param, 'RANI_API_INTEGRATION', 'http://10.32.8.132:8003' ) });//result.SMS_BASE_URL
                self.setState({ param : SPSUtils.getObjectInfo(self.state.param, 'ELASTIC_INTEGRATION_URL', result.ELASTIC_INTEGRATION_URL )});
            }
            else
            {
                //self.setState({ param : SPSUtils.getObjectInfo(self.state.param, 'RANI_API_INTEGRATION', 'http://10.32.8.132:8003' ) });
            }
        });
    }

    resetParams()
    {
        this.setState({ param : this.defaultParams });
    }

    setLocale(inLocale)
    {
        this.setState({ param : SPSUtils.getObjectInfo(this.state.param, 'locale', inLocale) });
    }

    selectScreen(inScreen)
    {
        this.setState({ param : SPSUtils.getObjectInfo(this.state.param, 'screen', inScreen) });
    }

    campaignSettings(inData)
    {
        this.setState({ param : SPSUtils.getObjectInfo(this.state.param, 'campaign', inData) });
    }

    getAccessToken(inToken, inUser, inAccountNumber, inUserRole)
    {
        let paramInfo = {};
        paramInfo.token = inToken;
        paramInfo.user = inUser;
        paramInfo.screen = this.state.param.screen;
        paramInfo.accountNumber = inAccountNumber;
        paramInfo.locale = this.state.param.locale;
        paramInfo.RANI_API_INTEGRATION = this.state.param.RANI_API_INTEGRATION;
        paramInfo.ELASTIC_INTEGRATION_URL = this.state.param.ELASTIC_INTEGRATION_URL;
        paramInfo.userRole = inUserRole;
        this.setState({ param: paramInfo });

        this.homeScreenCtrl('home');
    }

    homeScreenCtrl(inScreen) 
    {
        this.setState({ param : SPSUtils.getObjectInfo(this.state.param, 'screen', inScreen) });
    }

    render()
    {
        const screen = this.state.param.screen;
        let componentToBeLoaded;
        
        if (screen === 'home')
        {
            componentToBeLoaded = <HomeScreen name="Home" input={this.state.param} selectScreen={this.selectScreen} />
        }
        else if (screen === 'numberpoolmgmt')
        {
            componentToBeLoaded = <NumberPool name="NumberPool" input={this.state.param} selectScreen={this.selectScreen} />
        }
        else if (screen === 'campaignmgmt')
        {
            componentToBeLoaded = <CampaignMgmt name="Campaign" input={this.state.param} selectScreen={this.selectScreen} campaignSettings={this.campaignSettings} />
        }
        else if (screen === 'campaignSettings')
        {
            componentToBeLoaded = <CampaignSettings name="Campaign Settings" input={this.state.param} selectScreen={this.selectScreen} />
        }
        else if (screen === 'quarantinemgmt')
        {
            componentToBeLoaded = <QuarantineNumbers name="Quarantine Numbers" input={this.state.param} selectScreen={this.selectScreen} />
        }
        else if (screen === 'globalblacklistmgmt')
        {
            componentToBeLoaded = <GlobalBlacklist name="Global Blacklist" input={this.state.param} selectScreen={this.selectScreen} />
        }
        else if (screen === 'reportmgmt')
        {
            componentToBeLoaded = <ReportsMgmt name="Report Management" input={this.state.param} selectScreen={this.selectScreen} />
        }
        else if (screen === 'dashboardmgmt')
        {
            componentToBeLoaded = <Dashboard name="Dashborad Management" input={this.state.param} selectScreen={this.selectScreen} />
        }
        else
        {
            componentToBeLoaded = <LoginPage name="Login" input={this.state.param} setAccess={this.getAccessToken} setLocale={this.setLocale} />
        }

        return(
            <div className="ServiceProvisioningSystem">
                <Header input={this.state.param} selectScreen={this.homeScreenCtrl} resetParams={this.resetParams} />
                <div>{componentToBeLoaded}</div>
                <Footer input={this.state.param} />
            </div>
        );
    }
}

export default SelfCareRouter;