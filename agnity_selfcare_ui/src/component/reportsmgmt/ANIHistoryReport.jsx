import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import ReactExport from 'react-export-excel';   

import Pagination from '../pagination/Pagination';
import { DatePickerInput } from 'rc-datepicker';
import 'rc-datepicker/lib/style.css';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

const pageSize = parseInt(50);

var date, res;
date = new Date();
res = date.toISOString();

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class ANIHistoryReport extends React.Component
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
            aniHistoryInfo : {
                aniNumber : '',
                campaignName : '',
                fromDate : res,
                endDate : res
            }
        }

        this.onPageChanged = this.onPageChanged.bind(this);
        this.onChangeInputText = this.onChangeInputText.bind(this);
        this.onChangeFromDate = this.onChangeFromDate.bind(this);
        this.onChangeEndDate = this.onChangeEndDate.bind(this);

    }

    componentDidMount()
    {
        //this.loadANIHistoryReport(0);
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

    loadANIHistoryReport(inOffset)
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;

        let fromDateStr = SPSUtils.formatDate(this.state.aniHistoryInfo.fromDate);
        let toDateStr = SPSUtils.formatDate(this.state.aniHistoryInfo.endDate);

        let params = {};
        params.campaignName = this.state.aniHistoryInfo.campaignName;
        params.aniNumber = this.state.aniHistoryInfo.aniNumber;
        params.fromDate = fromDateStr;
        params.endDate = toDateStr;

        console.log("ReqData : " + JSON.stringify(params));

        $.ajax({
            method : "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/report/accountnumber/" + encodeURIComponent(accountNumber) + "/anihistory?offset=" + inOffset + "&filter=" + encodeURIComponent(JSON.stringify(params)),
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
        let fromDate = new Date(this.state.aniHistoryInfo.fromDate);
        let endDate = new Date(this.state.aniHistoryInfo.endDate);
    
        if (fromDate > endDate) {
            this.setState({ errorAlert: true, errorMsg: 'End Date should be greater than from Date.' });
            return false;
        }

        this.loadANIHistoryReport(0);
    }

    onChangeInputText(event)
    {
        this.setState({ aniHistoryInfo : SPSUtils.getObjectInfo(this.state.aniHistoryInfo, event.target.name, event.target.value )});
    }

    onChangeFromDate(date, dateString)
    {
        let fromDate = date;
        if (date != "Invalid date") {
            fromDate = date.toISOString();
        }
        this.setState({ aniHistoryInfo : SPSUtils.getObjectInfo(this.state.aniHistoryInfo, 'fromDate', fromDate )});
    }

    onChangeEndDate(date, dateString)
    {
        let toDate = date;
        if (date != "Invalid date")
        {
            toDate = date.toISOString();
        }
        this.setState({ aniHistoryInfo : SPSUtils.getObjectInfo(this.state.aniHistoryInfo, 'endDate', toDate )});
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
                this.loadANIHistoryReport(new_offset);
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

    navigateToANIFilter()
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
                <div className="ANIHistoryReportHolder">
                    <div className={this.state.isReportToGenerate === false ? 'HistoryReportHolder d-block' : 'HistoryReportHolder d-none'} style={{ margin: '1%' }}>
                        <div className="row">
                            <div className="form-group col-3">
                                <label htmlFor="campaignName" >{Translator('anihistory_campaignName')}</label>
                            </div>
                            <div className="form-group col-3">
                                <input type="text" className="form-control" id="campaignName" name="campaignName"
                                onChange={this.onChangeInputText} value={this.state.aniHistoryInfo.campaignName} />
                            </div>

                            <div className="form-group col-3">
                                <label htmlFor="aniNumber" >{Translator('anihistory_number')}</label>
                            </div>
                            <div className="form-group col-3">
                                <input type="text" className="form-control" id="aniNumber" name="aniNumber" 
                                onChange={this.onChangeInputText} value={this.state.aniHistoryInfo.aniNumber} />
                            </div>
                        </div>

                        <div className="row">
                            <div className="form-group col-3">
                                <label htmlFor="fromDate" >{Translator('anihistory_fromDate')}</label>
                            </div>

                            <div className="col-3 DateInputComponent">
                                <DatePickerInput
                                    id="fromDate"
                                    name="fromDate"
                                    className='fromDateInput'
                                    showOnInputClick
                                    onChange={this.onChangeFromDate}
                                    value={this.state.aniHistoryInfo.fromDate}
                                    locale="en"
                                />
                            </div>

                            <div className="form-group col-3">
                                <label htmlFor="toDate" >{Translator('anihistory_endDate')}</label>
                            </div>

                            <div className="col-3 DateInputComponent">
                                <DatePickerInput
                                    id="endDate"
                                    name="endDate"
                                    className='endDateInput'
                                    showOnInputClick
                                    onChange={this.onChangeEndDate}
                                    value={this.state.aniHistoryInfo.endDate}
                                    locale="en"
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <button className="btn btn-primary" type="button" onClick={() => this.generateAuditReport()}
                                data-toggle="tooltip" data-placement="top" title="Generate">
                                    {Translator('anihistory_generate')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={this.state.isReportToGenerate === true ? 'HistoryReportHolder d-block' : 'HistoryReportHolder d-none'} style={{ marginTop: '1%' }}>
                        <div className="ANIHistoryFilter">
                            <button type="button" className="btn btn-primary" onClick={()=> this.navigateToANIFilter()} >{Translator('anihistory_filter')}</button>
                        </div>
                        <div className="SPSComponentTableHolder" >
                            <BS.Table className="SPSComponentTable table-striped">
                                <thead className="SPSComponentTblHeader">
                                    <tr>
                                        <th>{Translator('anihistory_campaignName')}</th>
                                        <th>{Translator('anihistory_accountNumber')}</th>
                                        <th>{Translator('anihistory_aniNumber')}</th>
                                        <th>{Translator('anihistory_action')}</th>
                                        <th>{Translator('anihistory_actionDate')}</th>
                                        
                                    </tr>
                                </thead>

                                <tbody className="SPSComponentTblBody">
                                    {
                                        this.state.records.map((item, key) => 
                                            <tr key={key}>
                                                <td>{item.campaignName}</td>
                                                <td>{item.accountNumber}</td>
                                                <td>{item.aniNumber}</td>
                                                <td>{item.action}</td>
                                                <td>{item.actionDate}</td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </BS.Table>

                            <ExcelFile filename="ANIHistory" element={<button className="btn btn-primary" type="button">Download Report</button>}>
                                <ExcelSheet data={this.state.records} name="ANIHistory">
                                    <ExcelColumn label="Campaign Name" value="campaignName"/>
                                    <ExcelColumn label="Account Number" value="accountNumber"/>
                                    <ExcelColumn label="ANI Number" value="aniNumber"/>
                                    <ExcelColumn label="Action" value="action"/>
                                    <ExcelColumn label="Action Date" value="actionDate"/>
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

export default ANIHistoryReport;