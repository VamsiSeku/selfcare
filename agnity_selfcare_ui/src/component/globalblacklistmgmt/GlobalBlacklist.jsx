import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import DeleteIcon from '../../images/Delete.png';
import HomeIcon from '../../images/home.png';
import ExtenderIcon from '../../images/Extender.png';
import NewIcon from '../../images/new.png';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

import FilterIcon from '../../images/Filter.png';
import SearchWithFilter from '../../images/searchWithFilter.png';
import Pagination from '../pagination/Pagination';

const pageSize = parseInt(50);
class GlobalBlacklist extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input,
            user : this.props.input.user,
            userRole : this.props.input.userRole,
            records : [],
            pageInfo : {
                offset: 0,
                startCount : 1,
                endCount : 0,
                limit: pageSize,
                total: 0
            },
            blacklistInfo : {
                number : ''
            },
            addRecord : false,
            errorMsg : '',
            errorAlert : false,
            requestForDelete : false,
            currentPage: 1,
            totalPages : null,
            pageViewChosen : 'Global Blacklist Numbers',
            showSearchPanel : false,
            searchFilter : {
                field : 'number',
                condition : 'LIKE',
                value : ''
            }
        }

        this.onChangeInputText = this.onChangeInputText.bind(this);
        this.onPageChanged = this.onPageChanged.bind(this);

        this.onFeatureSelectionChange = this.onFeatureSelectionChange.bind(this);

        this.onChangeFilterSelectOption = this.onChangeFilterSelectOption.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this);
    }

    componentDidMount()
    {
        this.loadGlobalBlacklistData(0);
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

    loadGlobalBlacklistData(inOffset)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let filter = {};
        filter.searchString = this.state.searchFilter.value;
        filter.searchCondition = this.state.searchFilter.condition;

        console.log('ReqFilter ; ' + JSON.stringify(filter));

        $.ajax({
            method: "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/blacklist?offset=" + inOffset + "&filter=" + encodeURIComponent(JSON.stringify(filter)),
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

    navigateToSelectedScreen(inScreen)
    {
        this.props.selectScreen(inScreen);
    }

    onChangeInputText(event)
    {
        this.setState({ blacklistInfo : SPSUtils.getObjectInfo(this.state.blacklistInfo, event.target.name, event.target.value )});
    }

    addGlobalBlacklist()
    {
        if (this.state.userRole.adminRole === '2') return;
        
        this.setState({ blacklistInfo : SPSUtils.getObjectInfo(this.state.blacklistInfo, 'number', '') });
        this.setState({ addRecord : true });
    }

    closeErrorDialog()
    {
        this.setState({ errorAlert : false, errorMsg : '' });
    }

    isValidForm()
    {
        if (this.state.blacklistInfo.number === '')
        {
            this.setState({ errorAlert : true, errorMsg : 'Blacklist Number is a mandatory and cannot be empty.'});
            return false;
        }

        if (!SPSUtils.validateNumber(this.state.blacklistInfo.number, '0123456789'))
        {
            this.setState({ errorAlert : true, errorMsg : 'Blacklist Number should be numeric.'});
            return false;
        }

        if (this.state.blacklistInfo.number.length < 10)
        {
            this.setState({ errorAlert : true, errrorMsg : 'Blacklist Number length should be 10 digits.'});
            return false;
        }

        return true;
    }

    saveGlobalBlacklist()
    {
        let self = this;
        let params = {};
        params.number = this.state.blacklistInfo.number;
        params.type = "0";

        if (!this.isValidForm())
        {
            return;
        }

        let accountNumber = this.state.user.accountNumber;

        console.log('ReqData : ' + JSON.stringify(params));

        $.ajax({
            method : "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/blacklist",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeAddModal();
            self.loadGlobalBlacklistData(0);
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
        this.setState({ addRecord : false, blacklistInfo : SPSUtils.getObjectInfo(this.state.blacklistInfo, 'number', '' ) });
    }

    closeConfirmationDialog()
    {
        this.setState({ requestForDelete : false, currentPage : 1 });
    }

    deleteGlobalBlacklist()
    {
        let self = this;
        let params = {};
        params.number = this.state.blacklistInfo.number;
        params.type = "0";

        let accountNumber = this.state.user.accountNumber;

        console.log("ReqData : " + JSON.stringify(params));

        $.ajax({
            method : "DELETE",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/blacklist",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeConfirmationDialog();
            self.loadGlobalBlacklistData(0);
            
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            self.closeConfirmationDialog();
            console.log(xhr);
            self.setState({ errorMsg: message, errorAlert: true });
            
        });
    }

    deletBlacklistData(item)
    {
        this.setState({ blacklistInfo : SPSUtils.getObjectInfo(this.state.blacklistInfo, 'number', item.number),  requestForDelete : true });
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
            this.loadGlobalBlacklistData(new_offset);
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

    onChangeFilter(event)
    {
        this.setState({ searchFilter : SPSUtils.getObjectInfo(this.state.searchFilter, event.target.name, event.target.value )});
        this.loadGlobalBlacklistData(0);
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

    render(){
        if (Math.ceil(this.state.pageInfo.total / pageSize) < this.state.currentPage) {
            if (this.state.pageInfo.total !== 0) {

                this.setState({ currentPage: 1 })
            }
        } 
        let { start , end } = this.getStartEndValue();

        return(
            <I18nProvider locale={this.state.param.languageselected}>
                <div className="GlobalBlacklistCmptHolder">
                    <div className="card GlobalBlacklistPanel SPSComponentPanel">
                        <div className="ScreenNavigationInfoPanel">
                            <BS.Breadcrumb className="ScreenNavigationListArea">
                                <BS.BreadcrumbItem href="" onClick={() => this.navigateToSelectedScreen("home")}>
                                    <img src={HomeIcon} style={{width: '20px'}}
                                      data-toggle="tooltip" data-placement="top" title="Home"
                                    />
                                    <img src={ExtenderIcon} className="ExtenderIcon"/>
                                </BS.BreadcrumbItem>
                                <BS.BreadcrumbItem>
                                    <span>{Translator('globalblacklist_list')}</span>
                                </BS.BreadcrumbItem>
                                
                            </BS.Breadcrumb>
                        </div>

                        <div className="FeatureSelectionPanel">
                            <BS.Tabs variant="tabs" style={{background: '#d1dff8'}} activeKey={this.state.pageViewChosen} 
                                onSelect={this.onFeatureSelectionChange}>
                                <BS.Tab eventKey="Global Blacklist Numbers" title={Translator('globalblacklist_numbers')}>
                                    
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
                                    <option value="number">Number</option>
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
                                    <th>{Translator('globalblacklist_number')}</th>
                                    <th>{Translator('globalblacklist_type')}</th>
                                    <th style={{ width: '10rem' }}>{Translator('global_action')}</th>
                                </tr>
                            </thead>

                            <tbody className="SPSComponentTblBody">
                                {
                                    this.state.records.map((item, key) => 
                                        <tr key={item.number}>
                                            <td>{item.number}</td>
                                            <td>{item.type}</td>
                                            <td>
                                                <div className="row ActionIcons">
                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top" disabled={this.state.userRole.adminRole === '2'}
                                                        title="Delete" onClick={() => this.deletBlacklistData(item) }
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

                    <div disabled={this.state.userRole.adminRole === '2'}>
                        <img src={NewIcon} className="NewIcon" onClick={() => this.addGlobalBlacklist()} 
                            data-toggle="tooltip" data-placement="top" title="Add" 
                        />
                    </div>

                    <BS.Modal dialogClassName="modal-dialog-centered GlobalBlacklistModal"
                        show={this.state.addRecord} onHide={() => this.closeAddModal()}>
                        
                        <BS.Modal.Header closeButton>
                            <BS.Modal.Title><strong>{Translator('globalblacklist_list')}</strong></BS.Modal.Title>
                        </BS.Modal.Header>

                        <BS.Modal.Body>
                            <div className="container">
                                <div className="row">
                                    <div className="form-group col">
                                        <label htmlFor="number"><strong>{Translator('globalblacklist_number')}</strong></label>
                                    </div>
                                    <div className="form-group col">
                                        <input className="form-control" type="text" name="number" id="number" maxLength="10"
                                            onChange={this.onChangeInputText} value={this.state.blacklistInfo.number} />
                                    </div>
                                </div>
                            </div>
                        </BS.Modal.Body>

                        <BS.Modal.Footer>
                            <button type="button" className="btn btn-primary" onClick={() => this.saveGlobalBlacklist()}>{Translator('globalblacklist_save')}</button>
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
                                onClick={() => this.deleteGlobalBlacklist()}>Ok
                            </button>
                        </BS.Modal.Footer>
                    </BS.Modal>
                </div>
            </I18nProvider>
        )
    }
}

export default GlobalBlacklist;