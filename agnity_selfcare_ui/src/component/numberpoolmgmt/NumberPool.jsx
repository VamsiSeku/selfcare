import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import EditIcon from '../../images/Edit.jpg';
import DeleteIcon from '../../images/Delete.png';
import HomeIcon from '../../images/home.png';
import AssignIcon from '../../images/TickBtnImage.png';
import ExtenderIcon from '../../images/Extender.png';
import ChooseCampaign from '../campaignmgmt/ChooseCampaign';
import QuarantineIcon from '../../images/Quarantine.png';

import FilterIcon from '../../images/Filter.png';
import SearchWithFilter from '../../images/searchWithFilter.png';
import Pagination from '../pagination/Pagination';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

import ReactExport from 'react-export-excel';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const pageSize = parseInt(50);

class NumberPool extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            param : this.props.input,
            user : this.props.input.user,
            records : [],
            pageInfo: {
                offset: 0,
                startCount : 1,
                endCount : 0,
                limit: pageSize,
                total: 0
            },
            errorMsg : '',
            errorAlert : false,
            currentPage: 1,
            totalPages : null,
            chooseCampaign : false,
            numberPoolData : {
                aniNumber : '',
                campaignName : ''
            },
            pageViewChosen : 'Number Pool List',
            showSearchPanel : false,
            searchFilter : {
                field : 'aniNumer',
                condition : 'LIKE',
                value : ''
            }
        }

        this.onPageChanged = this.onPageChanged.bind(this);
        this.onChooseCampaign = this.onChooseCampaign.bind(this);

        this.onFeatureSelectionChange = this.onFeatureSelectionChange.bind(this);

        this.onChangeFilterSelectOption = this.onChangeFilterSelectOption.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this);
    }
    
    componentDidMount()
    {
        this.loadNumberPoolList(0);
        this.resetFilterIconCss();
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

    loadNumberPoolList(inOffset)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        console.log(this.state.user.accountNumber);
        let filter = {};
        filter.searchString = this.state.searchFilter.value;
        filter.searchCondition = this.state.searchFilter.condition;

        console.log('ReqFilter : ' + JSON.stringify(filter));
        $.ajax({
            method: "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/numberpoollist?offset=" + inOffset + "&filter=" + encodeURIComponent(JSON.stringify(filter)),
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
        
        let new_offset = (currentPage * pageLimit) - pageLimit
        let pageInfo = { ...this.state.pageInfo, offset: new_offset }
        
        
        this.setState({ currentPage, totalPages, pageInfo }, () => {
            this.loadNumberPoolList(new_offset);
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

    navigateToSelectedScreen(inScreen)
    {
        this.props.selectScreen(inScreen);
    }

    assignToCampaign(item)
    {
        console.log(item);

        this.setState({ chooseCampaign : true, numberPoolData : SPSUtils.getObjectInfo(this.state.numberPoolData, 'aniNumber', item.aniNumber) });
    }

    deAssignFromCampaign(item)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = item.campaignName;

        let params = {};
        params.aniNumber = item.aniNumber;
        console.log('ReqData : ' + JSON.stringify(params));
        $.ajax({
            method : "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/deassign",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.loadNumberPoolList(0);
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            self.setState({ errorMsg: message, errorAlert: true });
        });
    }

    moveToQuarantine(item)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;

        let params = {};
        params.aniNumber = item.aniNumber;
        console.log('ReqData : ' + JSON.stringify(params));

        $.ajax({
            method : "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/quarantine",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.loadNumberPoolList(0);
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            self.setState({ errorMsg: message, errorAlert: true });
        });
    }

    closeChooseCampaign()
    {
        this.setState({ chooseCampaign : false });
    }

    onChooseCampaign(campaignData)
    {
        console.log(campaignData);
        this.setState({ numberPoolData : SPSUtils.getObjectInfo(this.state.numberPoolData, 'campaignName', campaignData.campaignName) });
    }

    isValidForm()
    {
        if (this.state.numberPoolData.campaignName === '')
        {
            this.setState({ errorAlert : true, errorMsg : 'Failed to Choose Campaign.'})
            return false;
        }
        return true;
    }

    assignANINumber()
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let params = {};
        params.aniNumber = this.state.numberPoolData.aniNumber;
        let campaignName = this.state.numberPoolData.campaignName;

        if (!this.isValidForm())
        {
            return;
        }

        console.log('ReqData : ' + JSON.stringify(params));
        $.ajax({
            method : "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/assignaninumber",
            data : JSON.stringify(params),
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
            },
        }).done(function (result) {

            self.loadNumberPoolList(0);
            self.closeChooseCampaign();
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            self.setState({ errorMsg: message, errorAlert: true });
        });
    }

    onChangeFilter(event)
    {
        this.setState({ searchFilter : SPSUtils.getObjectInfo(this.state.searchFilter, event.target.name, event.target.value )});
        this.loadNumberPoolList(0);
    }

    onChangeFilterSelectOption(event)
    {
        this.setState({ searchFilter : SPSUtils.getObjectInfo(this.state.searchFilter, event.target.name, event.target.value )});
    }

    onFeatureSelectionChange(option)
    {
        this.setState({ pageViewChosen : option });
    }

    resetFilterIconCss()
    {   
        var navImgHolder = $('.FilterImage')[0].parentNode;
        
        navImgHolder.className = 'nav-item ml-auto FilterImageHolder';
    }

    setSearchPanelDisplay()
    {
        if (this.state.showSearchPanel)
            this.setState({ showSearchPanel : false });
        else
            this.setState({ showSearchPanel : true });
    }

    closeErrorDialog()
    {
        this.setState({ errorAlert : false, errorMsg : '' });
    }

    render() {
        if (Math.ceil(this.state.pageInfo.total / pageSize) < this.state.currentPage) {
            if (this.state.pageInfo.total !== 0) {

                this.setState({ currentPage: 1 })
            }
        } 
        let { start , end } = this.getStartEndValue();

        return (
            <I18nProvider locale={this.state.param.languageselected}>
                <div className="NumberPoolCmptHolder">
                    <div className="card NumberPoolPanel SPSComponentPanel">
                        <div className="ScreenNavigationInfoPanel">
                            <BS.Breadcrumb className="ScreenNavigationListArea">
                                <BS.BreadcrumbItem href="" onClick={() => this.navigateToSelectedScreen("home")}>
                                    <img src={HomeIcon} style={{width: '20px'}}
                                      data-toggle="tooltip" data-placement="top" title="Home"
                                    />
                                    <img src={ExtenderIcon} className="ExtenderIcon"/>
                                </BS.BreadcrumbItem>
                                <BS.BreadcrumbItem>
                                    <span>{Translator('numberpool_list')}</span>
                                </BS.BreadcrumbItem>
                                
                            </BS.Breadcrumb>

                        </div>

                        <div className="FeatureSelectionPanel">
                            <BS.Tabs variant="tabs" style={{background: '#d1dff8'}} activeKey={this.state.pageViewChosen} 
                                onSelect={this.onFeatureSelectionChange}>
                                <BS.Tab eventKey="Number Pool List" title={Translator('numberpool_list')}>
                                    
                                </BS.Tab>
                                
                                <BS.Tab title={<img src={FilterIcon} className="FilterImage"
                                        data-toggle="tooltip" data-placement="top" title="Filter"
                                    onClick={() => this.setSearchPanelDisplay()}></img>}>
                                </BS.Tab>
                            </BS.Tabs>
                            
                        </div>
                    </div>

                    <div className={this.state.showSearchPanel === true ? "CampaignSearchPanel d-block" : "CampaignSearchPanel d-none"}>
                        <div className="d-flex flex-row SearchBarPanel">
                            <div className="p-2 SearchWithFilterImageArea">
                                <img src={SearchWithFilter} className="SearchWithFilterIcon"  style={{width: '35px'}}/>
                            </div>

                            <div className="p-2  FieldSelectArea">
                                <select className="FieldSelect" name="field" value={this.state.searchFilter.field} onChange={this.onChangeFilterSelectOption}>
                                    <option value="aniNumber">ANI Number</option>
                                </select>
                            </div>
                            <div className="p-2 SearchCriteriaSelectArea">
                                <select className="SearchCriteriaSelect" name="condition" value={this.state.searchFilter.condition} onChange={this.onChangeFilterSelectOption}>
                                    <option value={SPSConstants.LIKE_OPERATOR}>Contains</option>
                                    <option value={SPSConstants.EQUALS_OPERATOR}>Equals</option>
                                    <option value={SPSConstants.STARTSWITH_OPERATOR}>Starts With</option>
                                </select>
                            </div>
                            <div className="p-2 SearchInputHolder">
                                <input type="text" className="SearchInputArea" name="value" value={this.state.searchFilter.value}
                                placeholder="Enter search text" onChange={this.onChangeFilter}>
                                </input>
                            </div>
                        </div>
                    </div>

                    <div className="SPSComponentTableHolder" style={{ marginTop: '1%' }}>
                        <BS.Table className="SPSComponentTable table-striped">
                            <thead className="SPSComponentTblHeader">
                                <tr>
                                    <th>{Translator('numberpool_aninumber')}</th>
                                    <th>{Translator('numberpool_accountnumber')}</th>
                                    <th>{Translator('numberpool_campaignname')}</th>
                                    <th>{Translator('numberpool_campaignstatus')}</th>
                                    <th style={{ width: '20rem' }}>{Translator('global_action')}</th>
                                </tr>
                            </thead>

                            <tbody className="SPSComponentTblBody">
                                {
                                    this.state.records.map((item, key) => 
                                        <tr key={item.aniNumber}>
                                            <td>{item.aniNumber}</td>
                                            <td>{item.accountNumber}</td>
                                            <td>{item.campaignName}</td>
                                            <td>{SPSUtils.getNumberPoolStatus(item.campaignStatus)}</td>
                                            <td>
                                                <div className="row ActionIcons">
                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top" disabled={item.campaignStatus === '1' || item.campaignStatus === '2'}
                                                        title="Assign" onClick={() => this.assignToCampaign(item)}
                                                    >
                                                    <img src={AssignIcon} className="AssignIcon" /></button>

                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top" disabled={item.campaignStatus === '0' || item.campaignStatus === '2'}
                                                        title="De-Assign" onClick={() => this.deAssignFromCampaign(item)}
                                                    >
                                                    <img src={DeleteIcon} className="DeleteIcon" /></button>

                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top" disabled={item.campaignStatus === '0' || item.campaignStatus === '2'}
                                                        title="Quarantine" onClick={() => this.moveToQuarantine(item)}
                                                    >
                                                    <img src={QuarantineIcon} className="QuarantineIcon" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </BS.Table>

                        <ExcelFile filename="NumberPool" element={<button className="btn btn-primary" type="button">Download Report</button>}>
                            <ExcelSheet data={this.state.records} name="NumberPool">
                                <ExcelColumn label="ANI Number" value="aniNumber"/>
                                <ExcelColumn label="Account Number" value="accountNumber"/>
                                <ExcelColumn label="Status" value={(col) => SPSUtils.getNumberPoolStatus(col.campaignStatus)}/>
                            </ExcelSheet>
                            
                        </ExcelFile>
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

                <BS.Modal dialogClassName="modal-dialog-centered modal-lg ChooseCampaignModal"
                    show={this.state.chooseCampaign} onHide={() => this.closeChooseCampaign()}>
                    
                    <BS.Modal.Header closeButton>
                        <BS.Modal.Title><strong>{Translator('numberpool_choosecampaign')}</strong></BS.Modal.Title>
                    </BS.Modal.Header>

                    <BS.Modal.Body>
                        <ChooseCampaign name="Choose Campaign" input={this.state.param} onChooseCampaign={this.onChooseCampaign}  />
                    </BS.Modal.Body>

                    <BS.Modal.Footer>
                        <button type="button" className="btn btn-primary" onClick={() => this.assignANINumber()}>{Translator('numberpool_assign')}</button>
                    </BS.Modal.Footer>
                </BS.Modal>
                
                <BS.Modal dialogClassName="modal-md modal-dialog"
                        show={this.state.errorAlert} onHide={() =>this.closeErrorDialog()}>
                    <BS.Modal.Header closeButton>
                        <BS.Modal.Title><strong className="SelfCareErrorMessageHeader">{Translator('error')}</strong></BS.Modal.Title>
                    </BS.Modal.Header>

                    <BS.Modal.Body>
                        <div>
                            {this.state.errorMsg}                                
                        </div>
                    </BS.Modal.Body>

                    <BS.Modal.Footer>
                        <button className="btn DeleteDialogBtn"
                            onClick={() => this.closeErrorDialog()}>
                                Close
                        </button>
                    </BS.Modal.Footer>
                </BS.Modal>

            </I18nProvider>
        )
    }
}

export default NumberPool;