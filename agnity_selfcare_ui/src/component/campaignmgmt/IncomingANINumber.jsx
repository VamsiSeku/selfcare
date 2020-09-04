import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import DeleteIcon from '../../images/Delete.png';
import NewIcon from '../../images/new.png';
import SearchWithFilter from '../../images/searchWithFilter.png';
import Pagination from '../pagination/Pagination';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

const pageSize = parseInt(50);

class IncomingANINumber extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input,
            showSearchPanel : false,
            user : this.props.input.user,
            campaign : this.props.input.campaign,
            userRole : this.props.input.userRole,
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
            aniNumberData : {
                incomingAniNumber : ''
            },
            addRecord : false,
            requestForDelete : false,
            searchFilter : {
                field : 'aniNumer',
                condition : 'LIKE',
                value : ''
            }
            
        }

        this.onChangeInputText = this.onChangeInputText.bind(this);
        this.onPageChanged = this.onPageChanged.bind(this);

        this.onChangeFilterSelectOption = this.onChangeFilterSelectOption.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this);
    }

    componentDidMount()
    {
        this.loadIncomingANINumbers(0);
    }

    componentWillReceiveProps(props)
    {}

    setPageInfo(metaData, endCount)
    {
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'offset', parseInt(metaData.offset) ) });
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'startCount', parseInt(metaData.startCount) ) });
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'endCount', parseInt(endCount) ) });
        this.setState({ pageInfo : SPSUtils.getObjectInfo(this.state.pageInfo, 'total', parseInt(metaData.totalCount) ) });

    }

    loadIncomingANINumbers(inOffset)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.campaign.campaignName;
        let filter = {};
        filter.searchString = this.state.searchFilter.value;
        filter.searchCondition = this.state.searchFilter.condition;

        console.log('ReqFilter ; ' + JSON.stringify(filter));

        $.ajax({
            method : "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/incominganilist?offset=" + inOffset + "&filter=" + encodeURIComponent(JSON.stringify(filter)),
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

    onChangeInputText(event)
    {
        this.setState({ aniNumberData : SPSUtils.getObjectInfo(this.state.aniNumberData, event.target.name, event.target.value )});
    }

    addIncomingANINumber()
    {
        if (this.state.userRole.adminRole === '2') return;
        this.setState({ aniNumberData : SPSUtils.getObjectInfo(this.state.aniNumberData, 'incomingAniNumber', '' ), addRecord : true });
    }

    isValidForm()
    {
        if (this.state.aniNumberData.incomingAniNumber === '')
        {
            this.setState({ errorAlert : true, errorMsg : 'Incoming ANI Number is a mandatory and cannot be empty.'});
            return false;
        }

        if (!SPSUtils.validateNumber(this.state.aniNumberData.incomingAniNumber, '0123456789'))
        {
            this.setState({ errorAlert : true, errorMsg : 'Incoming ANI Number should be numeric.'});
            return false;
        }

        if (this.state.aniNumberData.incomingAniNumber.length < 10)
        {
            this.setState({ errorAlert : true, errrorMsg : 'Incoming ANI Number length should be 10 digits.'});
            return false;
        }

        return true;
    }

    saveIncomingANINumber()
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.campaign.campaignName;

        if (!this.isValidForm())
        {
            return;
        }

        let params = {};
        params.incomingAniNumber = this.state.aniNumberData.incomingAniNumber;

        console.log('ReqData : ' + JSON.stringify(params));

        $.ajax({
            method : "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/incomingani",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeAddModal();
            self.loadIncomingANINumbers(0);
        }).fail(function (xhr, textStatus) {
            let message = xhr.statusText;
            if (xhr.responseJSON)
            {
                message = xhr.responseJSON.message;
            }
            self.setState({ errorMsg: message, errorAlert: true });
            console.log(xhr);
        });

    }

    closeAddModal()
    {
        this.setState({ addRecord : false, aniNumberData : SPSUtils.getObjectInfo(this.state.aniNumberData, 'incomingAniNumber', '' ) });
    }

    closeErrorDialog()
    {
        this.setState({ errorAlert : false, errorMsg : '' });
    }

    closeConfirmationDialog()
    {
        this.setState({ requestForDelete : false, currentPage : 1 });
    }

    deletIncomingANIData(item)
    {
        this.setState({ aniNumberData : SPSUtils.getObjectInfo(this.state.aniNumberData, 'incomingAniNumber', item.incomingAniNumber ), requestForDelete : true });
    }

    deleteIncomingANINumber()
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.campaign.campaignName;

        $.ajax({
            method : "DELETE",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/number/" + encodeURIComponent(this.state.aniNumberData.incomingAniNumber),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeConfirmationDialog();
            self.loadIncomingANINumbers(0);
            
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
            this.loadIncomingANINumbers(new_offset);
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
        this.loadIncomingANINumbers(0);
    }

    onChangeFilterSelectOption(event)
    {
        this.setState({ searchFilter : SPSUtils.getObjectInfo(this.state.searchFilter, event.target.name, event.target.value )});
    }

    changeSearchPanel(inFlag)
    {
        this.setState({ showSearchPanel : inFlag});
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
                <div className="IncomingANICmptHolder">
                    <div className={this.state.showSearchPanel === true ? "IncomingANISearchPanel d-block" : "IncomingANISearchPanel d-none"}>
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
                                    <th>{Translator('incomingANI_number')}</th>
                                    <th style={{ width: '10rem' }}>{Translator('global_action')}</th>
                                </tr>
                            </thead>

                            <tbody className="SPSComponentTblBody">
                                {
                                    this.state.records.map((item, key) => 
                                        <tr key={item.incomingAniNumber}>
                                            <td>{item.incomingAniNumber}</td>
                                            <td>
                                                <div className="row ActionIcons">
                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top" disabled={this.state.userRole.adminRole === '2'}
                                                        title="Delete" onClick={() => this.deletIncomingANIData(item) }
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
                        <img src={NewIcon} className="NewIcon" onClick={() => this.addIncomingANINumber()} 
                            data-toggle="tooltip" data-placement="top" title="Add"
                        />
                    </div>

                    <BS.Modal dialogClassName="modal-dialog-centered BlacklistModal"
                        show={this.state.addRecord} onHide={() => this.closeAddModal()}>
                        
                        <BS.Modal.Header closeButton>
                            <BS.Modal.Title><strong>{Translator('incomingANI_number')}</strong></BS.Modal.Title>
                        </BS.Modal.Header>

                        <BS.Modal.Body>
                            <div className="container">
                                <div className="row">
                                    <div className="form-group col">
                                        <label htmlFor="incomingAniNumber"><strong>{Translator('incomingANI_Num')}</strong></label>
                                    </div>
                                    <div className="form-group col">
                                        <input className="form-control" type="text" name="incomingAniNumber" id="incomingAniNumber" maxLength="10"
                                            onChange={this.onChangeInputText} value={this.state.aniNumberData.incomingAniNumber} />
                                    </div>
                                </div>
                            </div>
                        </BS.Modal.Body>

                        <BS.Modal.Footer>
                            <button type="button" className="btn btn-primary" onClick={() => this.saveIncomingANINumber()}>{Translator('incomingANI_save')}</button>
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
                                onClick={() => this.deleteIncomingANINumber()}>Ok
                            </button>
                        </BS.Modal.Footer>
                    </BS.Modal>
                </div>
            </I18nProvider>
        )
    }
}

export default IncomingANINumber;