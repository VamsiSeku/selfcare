import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import './ChooseCampaign.css';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

import Pagination from '../pagination/Pagination';
const pageSize = parseInt(50);

class ChooseCampaign extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            param : this.props.input,
            user : this.props.input.user,
            pageInfo: {
                offset: 0,
                startCount : 1,
                endCount : 0,
                limit: pageSize,
                total: 0
            },
            records : []
        }

        this.onPageChanged = this.onPageChanged.bind(this);
    }

    componentDidMount()
    {
        this.loadCampaignData(0);
    }

    componentWillReceiveProps(props)
    {

    }

    setPageInfo(metaData, endCount)
    {
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'offset', parseInt(metaData.offset) ) });
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'startCount', parseInt(metaData.startCount) ) });
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'endCount', parseInt(endCount) ) });
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'total', parseInt(metaData.totalCount) ) });
    }

    loadCampaignData(inOffset)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        console.log("Account Number : " + accountNumber);
        let filter = {};

        $.ajax({
            method : "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaignList?offset=" + inOffset + "&filter=" + encodeURIComponent(JSON.stringify(filter)),
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
            },
        }).done(function (result) {

            var resultObj = JSON.parse(JSON.stringify(result));
            
            self.setState({ records : resultObj.records });
            self.setPageInfo(resultObj.metaData, resultObj.records.length );
        }).fail(function (xhr, textStatus) {
            if (xhr.responseJSON)
            if(xhr.responseJSON.errorMessage == "Invalid Access"){
                 
            }
            
        });
    }

    onPageChanged(data)
    {
        console.log(data);
        let { currentPage, totalPages, pageLimit } = data;
        
        if (currentPage === 0) {
            currentPage = 1
        }
        
        let new_offset = (currentPage * pageLimit) - pageLimit;
        let pageInfo = { ...this.state.pageInfo, offset: new_offset }
        
        this.setState({ currentPage, totalPages, pageInfo }, () => {
            this.loadCampaignData(new_offset);
        });
    }

    getStartEndValue = () => {
        let start =((this.state.currentPage - 1) * pageSize) + 1;
        let end = this.state.currentPage * pageSize;
        if(end > this.state.pageInfo.total)
        {
            end = this.state.pageInfo.total
        }
        return { start , end }
    }

    onCampaignData(campaignData)
    {
        this.props.onChooseCampaign(campaignData);
    }

    render()
    {
        if (Math.ceil(this.state.pageInfo.total / pageSize) < this.state.currentPage) {
            if (this.state.pageInfo.total !== 0) {

                this.setState({ currentPage: 1 })
            }
        } 
        let { start , end } = this.getStartEndValue();

        return(
            <I18nProvider locale={this.state.param.languageselected}>
                <div className="CampaignCmptHolder">
                    
                    <div className="SPSComponentTableHolder" style={{ marginTop: '1%' }}>
                        <BS.Table className="SPSComponentTable table-striped">
                            <thead className="SPSComponentTblHeader">
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>{Translator('campaign_name')}</th>
                                    <th>{Translator('campaign_routingpolicy')}</th>
                                    <th>{Translator('campaign_startdate')}</th>
                                    <th>{Translator('campaign_enddate')}</th>
                                    <th>{Translator('campaign_owner')}</th>
                                    <th>{Translator('campaign_status')}</th>
                                </tr>
                            </thead>

                            <tbody className="SPSComponentTblBody">
                                {
                                    this.state.records.map((item, key) => 
                                        <tr key={item.campaignName}>
                                            <td><input type="radio" className="TableRadioButton" name="campaignData"
                                                onClick={() => this.onCampaignData(item)} />
                                            </td>
                                            <td>{item.campaignName}</td>
                                            <td>{SPSUtils.getCampaignRoutingPolicy(item.routingPolicy)}</td>
                                            <td>{item.startDate}</td>
                                            <td>{item.endDate}</td>
                                            <td>{item.campaignOwner}</td>
                                            <td>{SPSUtils.getCampaignStatus(item.status)}</td>
                                            
                                        </tr>
                                    )
                                }
                            </tbody>
                        </BS.Table>
                    </div>

                    <div className="paginationNew">
                        <div className="recordCount">
                                {this.state.pageInfo.total > 0 ?
                                    <h2 className={"text-dark"}>
                                    <strong className="text-secondary">Showing {start} to {end} of {this.state.pageInfo.total}</strong>{" "}
                                        
                                    </h2>
                                    : null
                                }
                        </div>

                        <div className="paginationComp">
                            <Pagination
                                totalRecords={this.state.pageInfo.total}
                                pageLimit={pageSize}
                                pageNeighbours={1}
                                onPageChanged={this.onPageChanged}
                                current_page={this.state.currentPage}
                            />

                            < ></>
                        </div>

                    </div>
                </div>
            </I18nProvider>
        )
    }
}

export default ChooseCampaign;