import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import EditIcon from '../../images/Edit.jpg';
import HomeIcon from '../../images/home.png';
import ExtenderIcon from '../../images/Extender.png';
import CampaignNumberPool from './CampaignNumberPool';
import CampaignBlacklist from './CampaignBlacklist';
import IncomingANINumber from './IncomingANINumber';
import CampaignTimeWindow from './CampaignTimeWindow';

import FilterIcon from '../../images/Filter.png';
import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

class CampaignSettings extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input,
            user : this.props.input.user,
            pageViewChosen : 'Number Pool',
            showSearchPanel : false,
        }

        this.onFeatureSelectionChange = this.onFeatureSelectionChange.bind(this);

        this.incomingANICompRef = React.createRef();
        this.campaignBlacklistCompRef = React.createRef();
        this.campaignNumberPoolCompRef = React.createRef();
    }

    componentDidMount()
    {
        this.resetFilterIconCss();
    }
    
    componentWillReceiveProps(props)
    {
        this.setState({ param : props.input, user : props.input.user });
    }

    navigateToSelectedScreen(inScreen)
    {
        this.props.selectScreen(inScreen);
    }

    onFeatureSelectionChange(option)
    {
        this.setState({ pageViewChosen : option });
    }

    setSearchPanelDisplay()
    {
        if (this.state.showSearchPanel)
        {
            this.incomingANICompRef.current.changeSearchPanel(false);
            this.campaignNumberPoolCompRef.current.changeSearchPanel(false);
            this.campaignBlacklistCompRef.current.changeSearchPanel(false);
            this.setState({ showSearchPanel : false });
        }
        else
        {
            this.incomingANICompRef.current.changeSearchPanel(true);
            this.campaignNumberPoolCompRef.current.changeSearchPanel(true);
            this.campaignBlacklistCompRef.current.changeSearchPanel(true);
            this.setState({ showSearchPanel : true });
        }
    }

    resetFilterIconCss()
    {   
        var navImgHolder = $('.FilterImage')[0].parentNode;
        
        navImgHolder.className = 'nav-item ml-auto FilterImageHolder';
    }

    render(){
        return(
            <I18nProvider locale={this.state.param.languageselected}>
                <div className="CampaignCmptHolder">
                    <div className="card CampaignPoolPanel SPSComponentPanel">
                        <div className="ScreenNavigationInfoPanel">
                            <BS.Breadcrumb className="ScreenNavigationListArea">
                                <BS.BreadcrumbItem href="" onClick={() => this.navigateToSelectedScreen("home")}>
                                    <img src={HomeIcon} style={{width: '20px'}}
                                      data-toggle="tooltip" data-placement="top" title="Home"
                                    />
                                    <img src={ExtenderIcon} className="ExtenderIcon"/>
                                </BS.BreadcrumbItem>
                                <BS.BreadcrumbItem>
                                    <span>{Translator('campaignsettings')}</span>
                                </BS.BreadcrumbItem>
                                
                            </BS.Breadcrumb>
                        </div>

                        <div className="FeatureSelectionPanel">
                            <div className="FeatureSelectionPanel">
                                <BS.Tabs variant="tabs" style={{background: '#d1dff8'}} activeKey={this.state.pageViewChosen} 
                                    onSelect={this.onFeatureSelectionChange}>
                                    <BS.Tab eventKey="Number Pool" title={Translator('campaignsettings_numberpool')}>
                                        <CampaignNumberPool name="Number Pool" input={this.props.input} ref={this.campaignNumberPoolCompRef} />
                                    </BS.Tab>
                                    <BS.Tab eventKey="Blacklist Numbers" title={Translator('campaignsettings_blacklistnumbers')}  >
                                        <CampaignBlacklist name="Blacklist Numbers" input={this.props.input} ref={this.campaignBlacklistCompRef} />
                                    </BS.Tab>
                                    <BS.Tab eventKey="Incoming ANI Number" title={Translator('campaignsettings_IncomingANI')}  >
                                        <IncomingANINumber name="Incoming ANI Number" input={this.props.input} ref={this.incomingANICompRef} />
                                    </BS.Tab>
                                    <BS.Tab eventKey="Campaign Time Window" title={Translator('timewindow_title')}>
                                        <CampaignTimeWindow name="Campaign Time Window" input={this.props.input} />
                                    </BS.Tab>

                                    <BS.Tab title={<img src={FilterIcon} className="FilterImage"
                                        data-toggle="tooltip" data-placement="top" title="Filter"
                                        onClick={() => this.setSearchPanelDisplay()}></img>}>
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

export default CampaignSettings;