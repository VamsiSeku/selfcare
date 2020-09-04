import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import EditIcon from '../../images/Edit.jpg';
import HomeIcon from '../../images/home.png';
import ExtenderIcon from '../../images/Extender.png';

import Pagination from '../pagination/Pagination';
import { DatePickerInput } from 'rc-datepicker';
import 'rc-datepicker/lib/style.css';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

const pageSize = parseInt(50);

var date, res;
date = new Date();
res = date.toISOString();

class SystemAuditReport extends React.Component
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
            isReportToGenerate : false,
            auditInfo : {
                operationType : 'ANY',
                fromDate : res,
                toDate : res
            }
        }

        this.onPageChanged = this.onPageChanged.bind(this);
        this.onChangeSelectOption = this.onChangeSelectOption.bind(this);
        this.onChangeFromDate = this.onChangeFromDate.bind(this);
        this.onChangeToDate = this.onChangeToDate.bind(this);
    }

    componentDidMount()
    {

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

    loadSystemAuditReport(inOffset)
    {
        let self = this;

        let fromDateStr = SPSUtils.formatDate(this.state.auditInfo.fromDate);
        let toDateStr = SPSUtils.formatDate(this.state.auditInfo.toDate);

        let filter = {};
        filter.operationType = this.state.auditInfo.operationType;
        filter.fromDate = fromDateStr;
        filter.endDate = toDateStr;

        console.log('ReqFilter : ' + JSON.stringify(filter));

        $.ajax({
            method : 'GET',
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/report/audit?offset=" + inOffset + "&filter=" + encodeURIComponent(JSON.stringify(filter)),
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
            },
        }).done(function (result) {

            var resultObj = JSON.parse(JSON.stringify(result));
            
            self.setState({ records : resultObj.records, isReportToGenerate : true });
            self.setPageInfo(resultObj.metaData, resultObj.records.length );
        }).fail(function (xhr, textStatus) {
            if (xhr.responseJSON)
            if(xhr.responseJSON.errorMessage == "Invalid Access"){
                 
            }
            
        });
    }

    generateAuditReport()
    {
        let fromDate = new Date(this.state.auditInfo.fromDate);
        let toDate = new Date(this.state.auditInfo.toDate);
    
        if (fromDate > toDate) {
            this.setState({ errorAlert: true, errorMsg: 'To Date should be greater than from Date.' });
            return false;
        }

        this.loadSystemAuditReport(0);
    }

    onChangeSelectOption(event)
    {
        this.setState({ auditInfo : SPSUtils.getObjectInfo(this.state.auditInfo, event.target.name, event.target.value)});
    }

    onChangeFromDate(date, dateString)
    {
        let fromDate = date;
        if (date != "Invalid date") {
            fromDate = date.toISOString();
        }
        this.setState({ auditInfo : SPSUtils.getObjectInfo(this.state.auditInfo, 'fromDate', fromDate )});
    }

    onChangeToDate(date, dateString)
    {
        let toDate = date;
        if (date != "Invalid date")
        {
            toDate = date.toISOString();
        }
        this.setState({ auditInfo : SPSUtils.getObjectInfo(this.state.auditInfo, 'toDate', toDate )});
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
            if (this.state.isReportToGenerate)
                this.loadSystemAuditReport(new_offset);
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

    closeErrorDialog()
    {
        this.setState({ errorAlert : false, errorMsg : '' });
    }

    navigateToAuditFilter()
    {
        this.setState({ isReportToGenerate : false });
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
                <div className="SystemAuditReportHolder">
                    <div className={this.state.isReportToGenerate === false ? 'SystemAuditFilterHolder d-block' : 'SystemAuditFilterHolder d-none'} style={{ margin: '1%' }}>
                        <div className="row">
                            <div className="form-group col-3">
                                <label htmlFor="operationType" >{Translator('systemaudit_operationType')}</label>
                            </div>
                            <div className="form-group col-3">
                                <select className="form-control" id="operationType"  value={this.state.auditInfo.operationType}
                                    name="operationType" onChange={this.onChangeSelectOption}>
                                    <option value="ANY"> ANY </option>
                                    <option value="CREATE"> CREATE </option>
                                    <option value="DELETE"> DELETE </option>
                                    <option value="LOGIN"> LOGIN </option>
                                    <option value="LOGOUT"> LOGOUT </option>
                                    <option value="PUBLISH"> PUBLISH </option>
                                    <option value="INSERT"> INSERT </option>
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="form-group col-3">
                                <label htmlFor="fromDate" >{Translator('systemaudit_fromDate')}</label>
                            </div>

                            <div className="col-3 DateInputComponent">
                                <DatePickerInput
                                    id="fromDate"
                                    name="fromDate"
                                    className='fromDateInput'
                                    showOnInputClick
                                    onChange={this.onChangeFromDate}
                                    value={this.state.auditInfo.fromDate}
                                    locale="en"
                                />
                            </div>

                            <div className="form-group col-3">
                                <label htmlFor="toDate" >{Translator('systemaudit_toDate')}</label>
                            </div>

                            <div className="col-3 DateInputComponent">
                                <DatePickerInput
                                    id="toDate"
                                    name="toDate"
                                    className='toDateInput'
                                    showOnInputClick
                                    onChange={this.onChangeToDate}
                                    value={this.state.auditInfo.toDate}
                                    locale="en"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <button className="btn btn-primary" type="button" onClick={() => this.generateAuditReport()}
                                data-toggle="tooltip" data-placement="top" title="Generate">
                                    {Translator('systemaudit_generate')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={this.state.isReportToGenerate === true ? 'SystemAuditFilterHolder d-block' : 'SystemAuditFilterHolder d-none'} style={{ marginTop: '1%' }}>
                        <div className="AuditFilter">
                            <button type="button" className="btn btn-primary" onClick={()=> this.navigateToAuditFilter()} > Audit Filter </button>
                        </div>
                        <div className="SPSComponentTableHolder" >
                            <BS.Table className="SPSComponentTable table-striped">
                                <thead className="SPSComponentTblHeader">
                                    <tr>
                                        <th>{Translator('systemaudit_modifierId')}</th>
                                        <th>{Translator('systemaudit_timestamp')}</th>
                                        <th>{Translator('systemaudit_hostaddress')}</th>
                                        <th>{Translator('systemaudit_operation')}</th>
                                        <th>{Translator('systemaudit_description')}</th>
                                        <th>{Translator('systemaudit_uowId')}</th>
                                        <th>{Translator('systemaudit_sessionId')}</th>
                                    </tr>
                                </thead>

                                <tbody className="SPSComponentTblBody">
                                    {
                                        this.state.records.map((item, key) => 
                                            <tr key={key}>
                                                <td>{item.modifierId}</td>
                                                <td>{item.timestamp}</td>
                                                <td>{item.hostAddress}</td>
                                                <td>{item.type}</td>
                                                <td>{item.description}</td>
                                                <td>{item.uowId}</td>
                                                <td>{item.sessionId}</td>
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

                    <BS.Modal dialogClassName="modal-md modal-dialog"
                            show={this.state.errorAlert} onHide={() =>this.closeErrorDialog()}>
                        <BS.Modal.Header closeButton>
                            <BS.Modal.Title><strong className="SelfCareErrorMessageHeader">{Translator('error')}</strong></BS.Modal.Title>
                        </BS.Modal.Header>

                        <BS.Modal.Body>
                            <pre>
                                {this.state.errorMsg}                                
                            </pre>
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

export default SystemAuditReport;