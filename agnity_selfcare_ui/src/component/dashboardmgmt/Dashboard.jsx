import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import HomeIcon from '../../images/home.png';
import ExtenderIcon from '../../images/Extender.png';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

const elasticsearch = require('elasticsearch');
const elasticData = ['ROUTE_CALL', 'BLOCK_CALL_CAMPAIGN', 'BLOCK_CALL_GLOBAL', 'OUT_OF_TIME_WINDOW', 'CAMPAIGN_EXPIRED', 'CAMPAIGN_NOT_FOUND', 
'CAMPAIGN_NOT_ACTIVE', 'POOL_ANI_NOT_FOUND', 'SUBSCRIPTION_NOT_FOUND', 'OTG_INFO_NOT_FOUND', 'SUBSCRIPTION_MISMATCH', 'CAMPAIGN_OTG_MISMATCH', 
'SERVICE_NOT_AVAILABLE', 'CAMPAIGN_NOT_AVAILABLE'];

class Dashboard extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input,
            user : this.props.input.user,
            pageViewChosen : 'Dashboard',
            records : []
        }
        
        this.onFeatureSelectionChange = this.onFeatureSelectionChange.bind(this);

        this.client = new elasticsearch.Client({
            host: 'http://10.32.13.201:9200',
            log: 'trace'
        });
    }

    componentDidMount()
    {
        this.initializeData();
        this.loadElasticData();
        this.elasticClient();
    }

    componentWillReceiveProps(props)
    {

    }

    elasticClient()
    {
        console.log('Elastic client Reqest');
        this.client.search({
            index: 'main-axtel-mty-cdr-data-2020.08.16',
            type: '_count',
            body: {
              query: {
                match: {
                    Application_Code_String: 'ROUTE_CALL'
                }
              }
            }
          }).then(function (resp) {
              console.log(resp);
          }, function (err) {
              console.trace(err.message);
          });
    }

    initializeData()
    {
        console.log('Inside initilizeData : ');
        let records = [];
        for (let currData of elasticData)
        {
            let currInfo = {};
            currInfo.name = currData;
            currInfo.minData = '';
            currInfo.hourData = '';

            records.push(currInfo);
        }
        this.setState({ records : records });
    }

    loadElasticData()
    {
        console.log('Inside loadElastic Data : ');
        this.setState({ records : [] });
        let self = this;
        let tmpRecords = [];
        for (let currData of elasticData)
        {
            let qryParam = '(Application_Code_String:"' + currData + '")AND(CASServiceID : 85)AND(EP_Account_Name="RANI-EP2")';
            let url = this.state.param.ELASTIC_INTEGRATION_URL + '/main-axtel-mty-cdr-data-2020.08.07/_count?q';
            SPSUtils.getElasticData(url, encodeURIComponent(qryParam), currData, function (result, inData) {
                let currInfo = {};
                currInfo.name = inData;
                currInfo.minData = result.count;
                currInfo.hourData = result.count;
                
                tmpRecords.push(currInfo);
                self.setState({ records : tmpRecords });
            });
           
        }
    }

    navigateToSelectedScreen(inScreen)
    {
        this.props.selectScreen(inScreen);
    }

    onFeatureSelectionChange(option)
    {
        this.setState({ pageViewChosen : option });
    }

    render()
    {
        return(
            <I18nProvider locale={this.state.param.languageselected}>
                <div className="DashboardCmptHolder">
                    <div className="card DashboardPanel SPSComponentPanel">
                        <div className="ScreenNavigationInfoPanel">
                            <BS.Breadcrumb className="ScreenNavigationListArea">
                                <BS.BreadcrumbItem href="" onClick={() => this.navigateToSelectedScreen("home")}>
                                    <img src={HomeIcon} style={{width: '20px'}}
                                      data-toggle="tooltip" data-placement="top" title="Home"
                                    />
                                    <img src={ExtenderIcon} className="ExtenderIcon"/>
                                </BS.BreadcrumbItem>
                                <BS.BreadcrumbItem>
                                    <span>{Translator('dashboard_list')}</span>
                                </BS.BreadcrumbItem>
                                
                            </BS.Breadcrumb>
                        </div>

                        <div className="FeatureSelectionPanel">
                            <div className="FeatureSelectionPanel">
                                <BS.Tabs variant="tabs" style={{background: '#d1dff8'}} activeKey={this.state.pageViewChosen} 
                                    onSelect={this.onFeatureSelectionChange}>
                                    <BS.Tab eventKey="Dashboard" title={Translator('dashboard_list')}>
                                        
                                        <div className="SPSComponentTableHolder" style={{ marginTop: '1%' }}>
                                            <BS.Table className="SPSComponentTable table-striped">
                                                <thead className="SPSComponentTblHeader">
                                                    <tr>
                                                        <th>{Translator('dashboard_name')}</th>
                                                        <th>{Translator('dashboard_minData')}</th>
                                                        <th>{Translator('dashborad_hourData')}</th>
                                                        
                                                    </tr>
                                                </thead>

                                                <tbody className="SPSComponentTblBody">
                                                    {
                                                        this.state.records.map((item, key) => 
                                                            <tr key={key}>
                                                                <td>{item.name}</td>
                                                                <td>{item.minData}</td>
                                                                <td>{item.hourData}</td>
                                                                
                                                            </tr>
                                                        )
                                                    }
                                                </tbody>
                                            </BS.Table>
                                        </div>
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

export default Dashboard;