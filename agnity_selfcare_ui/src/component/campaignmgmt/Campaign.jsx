import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import EditIcon from '../../images/Edit.jpg';
import HomeIcon from '../../images/home.png';
import DeleteIcon from '../../images/Delete.png';
import ExtenderIcon from '../../images/Extender.png';
import SettingsIcon from '../../images/settings.png';
import NewIcon from '../../images/new.png';
import { DatePickerInput } from 'rc-datepicker';
import 'rc-datepicker/lib/style.css';

import FilterIcon from '../../images/Filter.png';
import SearchWithFilter from '../../images/searchWithFilter.png';
import Pagination from '../pagination/Pagination';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

const pageSize = parseInt(50);

var date, res;
date = new Date();
res = date.toISOString();

class CampaignMgmt extends React.Component
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
            errorMsg : '',
            errorAlert : false,
            currentPage: 1,
            totalPages : null,
            records : [],
            addRecord : false,
            editRecord : false,
            campaignData : {
                campaignName : '',
                status : '1',
                routingPolicy : '0',
                campaignOwner : '',
                startDate : res,
                endDate : '2099-01-01T00:00:00.000Z'
            },
            requestForDelete : false,
            pageViewChosen : 'Campaign List',
            showSearchPanel : false,
            searchFilter : {
                field : 'campaignName',
                condition : 'LIKE',
                value : ''
            }
        }

        this.onPageChanged = this.onPageChanged.bind(this);
        this.onChangeInputText = this.onChangeInputText.bind(this);
        this.onChangeStartDate = this.onChangeStartDate.bind(this);
        this.onChangeEndDate = this.onChangeEndDate.bind(this);
        this.onChangeSelectOption = this.onChangeSelectOption.bind(this);
        this.onFeatureSelectionChange = this.onFeatureSelectionChange.bind(this);

        this.onChangeFilterSelectOption = this.onChangeFilterSelectOption.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this);
    }

    componentDidMount()
    {
        this.loadCampaignData(0);
        this.resetFilterIconCss();
    }

    componentWillReceiveProps(props)
    {
        this.setState({ param : props.input });
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
        filter.searchString = this.state.searchFilter.value;
        filter.searchCondition = this.state.searchFilter.condition;

        console.log('ReqFilter : ' + JSON.stringify(filter));
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

    navigateToSelectedScreen(inScreen)
    {
        this.props.selectScreen(inScreen);
    }

    onClickCampaignSettings(item)
    {
        console.log(item);
        this.props.campaignSettings(item);
        this.props.selectScreen('campaignSettings');
    }

    addCampaign()
    {
        this.setState({ addRecord : true, errorAlert : false, errorMsg : '', editRecord : false });
    }

    isValidForm()
    {
        let fromDate = new Date(this.state.campaignData.startDate);
        let endDate = new Date(this.state.campaignData.endDate);
        
        if (this.state.campaignData.campaignName === '')
        {
            this.setState({ errorAlert : true, errorMsg : 'Campaign Name is a mandatory and cannot be empty.'});
            return false;
        }

        if (this.state.campaignData.campaignOwner === '')
        {
            this.setState({ errorAlert : true, errorMsg : 'Campaign Owner is a mandatory and cannot be empty.'});
            return false;
        }

        if (!SPSUtils.validateName(this.state.campaignData.campaignName))
        {
            this.setState({ errorAlert : true, errorMsg : 'Campaign Name cannot have special characters.'});
            return false;
        }

        if (!SPSUtils.validateName(this.state.campaignData.campaignOwner))
        {
            this.setState({ errorAlert : true, errorMsg : 'Campaign Owner cannot have special characters.'});
            return false;
        }

        if (fromDate > endDate) {
            this.setState({ errorAlert: true, errorMsg: 'End Date should be greater than Start Date.' });
            return false;
        }

        return true;
    }

    updateCampaignData()
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let params = {};
        params.campaignName = this.state.campaignData.campaignName;
        params.campaignOwner = this.state.campaignData.campaignOwner;
        params.routingPolicy = this.state.campaignData.routingPolicy;
        params.status = this.state.campaignData.status;
        params.startDate = SPSUtils.formatDate(this.state.campaignData.startDate);
        params.endDate = SPSUtils.formatDate(this.state.campaignData.endDate);

        if (!this.isValidForm())
        {
            return;
        }

        console.log('ReqData : ' + JSON.stringify(params));

        $.ajax({
            method : "PUT",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeAddModal();
            self.loadCampaignData(0);
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            console.log(xhr);
            self.setState({ errorMsg: message, errorAlert: true });
        });
    }

    saveCampaignData()
    {
        if (this.state.editRecord)
        {
            this.updateCampaignData();
            return;
        }

        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let params = {};
        params.campaignName = this.state.campaignData.campaignName;
        params.campaignOwner = this.state.campaignData.campaignOwner;
        params.routingPolicy = this.state.campaignData.routingPolicy;
        params.status = this.state.campaignData.status;
        params.startDate = SPSUtils.formatDate(this.state.campaignData.startDate);
        params.endDate = SPSUtils.formatDate(this.state.campaignData.endDate);

        if (!this.isValidForm())
        {
            return;
        }

        console.log('ReqData : ' + JSON.stringify(params));

        $.ajax({
            method : "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeAddModal();
            self.loadCampaignData(0);
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            console.log(xhr);
            self.setState({ errorMsg: message, errorAlert: true });
        });
    }

    deleteCampaign()
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.campaignData.campaignName;

        $.ajax({
            method : "DELETE",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName),
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeConfirmationDialog();
            self.loadCampaignData(0);
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            console.log(xhr);
            self.closeConfirmationDialog();
            self.setState({ errorMsg: message, errorAlert: true });
            
        });
    }

    loadEditCampaignData(response)
    {
        this.setState({ campaignData : response, editRecord : true, errorAlert : false, errorMsg : '', addRecord : false });
    }

    onCampaignEdit(item)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = item.campaignName;

        $.ajax({
            method : "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName),
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.loadEditCampaignData(result);
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            console.log(xhr);
            self.setState({ errorMsg: message, errorAlert: true });
        });
    }

    closeAddModal()
    {
        this.clearCampaignData();
        this.setState({ addRecord : false, errorAlert : false, errorMsg : '', editRecord : false });
    }

    clearCampaignData()
    {
        this.setState({ campaignData : {
            campaignName : '',
            status : '1',
            routingPolicy : '0',
            campaignOwner : '',
            startDate : res,
            endDate : '2099-01-01T00:00:00.000Z'
        } });
    }

    onChangeInputText(event)
    {
        this.setState({ campaignData : SPSUtils.getObjectInfo(this.state.campaignData, event.target.name, event.target.value ) });
    }

    onChangeSelectOption(event)
    {
        this.setState({ campaignData : SPSUtils.getObjectInfo(this.state.campaignData, event.target.name, event.target.value ) });
    }

    onChangeFilter(event)
    {
        this.setState({ searchFilter : SPSUtils.getObjectInfo(this.state.searchFilter, event.target.name, event.target.value )});
        this.loadCampaignData(0);
    }

    onChangeFilterSelectOption(event)
    {
        this.setState({ searchFilter : SPSUtils.getObjectInfo(this.state.searchFilter, event.target.name, event.target.value )});
    }

    onChangeStartDate(date, dateString)
    {
        let startDate = date;
        if (date != "Invalid date") {
            startDate = date.toISOString();
        }
        this.setState({ campaignData : SPSUtils.getObjectInfo(this.state.campaignData, 'startDate', startDate )});
    }

    onChangeEndDate(date, dateString)
    {
        let endDate = date;
        if (date != "Invalid date") {
            endDate = date.toISOString();
        }
        this.setState({ campaignData : SPSUtils.getObjectInfo(this.state.campaignData, 'endDate', endDate )});
    }

    closeConfirmationDialog()
    {
        this.setState({ requestForDelete : false, currentPage : 1 });
    }

    deleteCampaignData(inItem)
    {
        this.setState({ campaignData : inItem, requestForDelete : true });
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
                                    <span>{Translator('campaign_list')}</span>
                                </BS.BreadcrumbItem>
                                
                            </BS.Breadcrumb>
                        </div>

                        <div className="FeatureSelectionPanel">
                            <div className="FeatureSelectionPanel">
                                <BS.Tabs variant="tabs" style={{background: '#d1dff8'}} activeKey={this.state.pageViewChosen} 
                                    onSelect={this.onFeatureSelectionChange}>
                                    <BS.Tab eventKey="Campaign List" title={Translator('campaign_list')}>
                                        
                                    </BS.Tab>
                                    
                                    <BS.Tab title={<img src={FilterIcon} className="FilterImage"
                                         data-toggle="tooltip" data-placement="top" title="Filter"
                                        onClick={() => this.setSearchPanelDisplay()}></img>}>
                                    </BS.Tab>
                                </BS.Tabs>
                                
                            </div>
                        </div>
                    </div>
                    
                    <div className={this.state.showSearchPanel === true ? "CampaignSearchPanel d-block" : "CampaignSearchPanel d-none"}>
                        <div className="d-flex flex-row SearchBarPanel">
                            <div className="p-2 SearchWithFilterImageArea">
                                <img src={SearchWithFilter} className="SearchWithFilterIcon"  style={{width: '35px'}}/>
                            </div>

                            <div className="p-2  FieldSelectArea">
                                <select className="FieldSelect" name="field" value={this.state.searchFilter.field} onChange={this.onChangeFilterSelectOption}>
                                    <option value="campaignName">Campaign Name</option>
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
                                    <th>{Translator('campaign_name')}</th>
                                    <th>{Translator('campaign_routingpolicy')}</th>
                                    <th>{Translator('campaign_startdate')}</th>
                                    <th>{Translator('campaign_enddate')}</th>
                                    <th>{Translator('campaign_owner')}</th>
                                    <th>{Translator('campaign_status')}</th>
                                    <th style={{ width: '10rem' }}>{Translator('global_action')}</th>
                                </tr>
                            </thead>

                            <tbody className="SPSComponentTblBody">
                                {
                                    this.state.records.map((item, key) => 
                                        <tr key={item.campaignName}>
                                            <td>{item.campaignName}</td>
                                            <td>{SPSUtils.getCampaignRoutingPolicy(item.routingPolicy)}</td>
                                            <td>{item.startDate}</td>
                                            <td>{item.endDate}</td>
                                            <td>{item.campaignOwner}</td>
                                            <td>{SPSUtils.getCampaignStatus(item.status)}</td>
                                            <td>
                                                <div className="row ActionIcons">
                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top"
                                                        title="Edit" onClick={() => this.onCampaignEdit(item)}
                                                    >
                                                    <img src={EditIcon} className="EditIcon" /></button>

                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top"
                                                        title="Campaign Settings" onClick={() => this.onClickCampaignSettings(item)}
                                                    >
                                                    <img src={SettingsIcon} className="SettingsIcon" /></button>

                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top"
                                                        title="Delete" onClick={() => this.deleteCampaignData(item) }
                                                    >
                                                    <img src={DeleteIcon} className="DeleteIcon" /></button>
                                                </div>
                                            </td>
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

                    <div >
                        <img src={NewIcon} className="NewIcon" onClick={() => this.addCampaign()} 
                            data-toggle="tooltip" data-placement="top" title="Add"
                        />
                    </div>

                    <BS.Modal dialogClassName="modal-dialog-centered modal-lg CampaignModal"
                        show={this.state.addRecord || this.state.editRecord} onHide={() => this.closeAddModal()}>
                        
                        <BS.Modal.Header closeButton>
                            <BS.Modal.Title><strong>{Translator('campaign_data')}</strong></BS.Modal.Title>
                        </BS.Modal.Header>

                        <BS.Modal.Body>
                            <div className="container">
                                <div className="row">
                                    <div className="form-group col-3">
                                        <label htmlFor="campaignName"><strong>{Translator('campaign_name')}</strong></label>
                                    </div>
                                    <div className="form-group col-3">
                                        <input className="form-control" type="text" name="campaignName" id="campaignName" maxLength="30"
                                            onChange={this.onChangeInputText} value={this.state.campaignData.campaignName} disabled={this.state.editRecord}/>
                                    </div>

                                    <div className="form-group col-3">
                                        <label htmlFor="campaignOwner"><strong>{Translator('campaign_owner')}</strong></label>
                                    </div>
                                    <div className="form-group col-3">
                                        <input className="form-control" type="text" name="campaignOwner" id="campaignOwner" maxLength="30"
                                            onChange={this.onChangeInputText} value={this.state.campaignData.campaignOwner} disabled={this.state.editRecord} />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="form-group col-3">
                                        <label htmlFor="routingPolicy"><strong>{Translator('campaign_routingpolicy')}</strong></label>
                                    </div>
                                    <div className="form-group col-3">
                                        <select className="form-control" id="routingPolicy"  value={this.state.campaignData.routingPolicy}
                                            name="routingPolicy" onChange={this.onChangeSelectOption}>
                                            <option value="0"> Randm </option>
                                            <option value="1"> Destination based </option>
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <label htmlFor="status"><strong>{Translator('campaign_status')}</strong></label>
                                    </div>
                                    <div className="form-group col-3">
                                        <select className="form-control" id="status"  value={this.state.campaignData.status}
                                            name="status" onChange={this.onChangeSelectOption}>
                                            <option value="1"> Active </option>
                                            <option value="0"> Inactive </option>
                                            <option value="2"> Expired </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="form-group col-3">
                                        <label htmlFor="startDate"><strong>{Translator('campaign_startdate')}</strong></label>
                                    </div>
                                    <div className="col-3 DateInputComponent">
                                        <DatePickerInput
                                            id="startDate"
                                            name="startDate"
                                            className='startDateInput'
                                            showOnInputClick
                                            onChange={this.onChangeStartDate}
                                            value={this.state.campaignData.startDate}
                                            locale="en"
                                        />
                                    </div>

                                    <div className="form-group col-3">
                                        <label htmlFor="endDate"><strong>{Translator('campaign_enddate')}</strong></label>
                                    </div>
                                    <div className="col-3 DateInputComponent">
                                        <DatePickerInput
                                            id="endDate"
                                            name="endDate"
                                            className='endDateInput'
                                            showOnInputClick
                                            onChange={this.onChangeEndDate}
                                            value={this.state.campaignData.endDate}
                                            locale="en"
                                        />
                                    </div>
                                </div>
                            </div>
                        </BS.Modal.Body>

                        <BS.Modal.Footer>
                            <button type="button" className="btn btn-primary" onClick={() => this.saveCampaignData()}>{Translator('campaign_save')}</button>
                        </BS.Modal.Footer>
                    </BS.Modal>

                    <BS.Modal dialogClassName="modal-dialog-centered"
                        show={this.state.requestForDelete} onHide={() => this.closeConfirmationDialog()}>
                        <BS.Modal.Body>
                            <div className="row">
                                <p>{Translator('global_confirmation')}</p>
                            </div>
                        </BS.Modal.Body>
                        <BS.Modal.Footer>
                            <button className="btn btn-primary"
                                onClick={() => this.closeConfirmationDialog()}>No
                            </button>
                            <button className="btn btn-danger"
                                onClick={() => this.deleteCampaign()}>Ok
                            </button>
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
                </div>
            </I18nProvider>
        )
    }
}

export default CampaignMgmt;