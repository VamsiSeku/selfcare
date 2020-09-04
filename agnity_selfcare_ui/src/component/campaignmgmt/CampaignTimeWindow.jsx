import React from 'react';
import * as BS from 'react-bootstrap';
import $ from 'jquery';
import * as SPSUtils from '../../utils/SPSUtils.js';
import * as SPSConstants from '../../utils/SPSConstants';
import EditIcon from '../../images/Edit.jpg';
import DeleteIcon from '../../images/Delete.png';
import NewIcon from '../../images/new.png';

import { I18nProvider } from '../../i18n';
import Translator from '../../i18n/Translator';

class CampaignTimeWindow extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            param : this.props.input,
            user : this.props.input.user,
            campaign : this.props.input.campaign,
            userRole : this.props.input.userRole,
            records : [],
            errorMsg : '',
            errorAlert : false,
            addRecord : false,
            editRecord : false,
            requestForDelete : false,
            timewindowData : {
                weekdaystarthour : '00',
                weekdaystartmin : '00',
                weekdaystartsec : '00',
                weekdayendhour : '00',
                weekdayendmin : '00',
                weekdayendsec : '00',
                weekendstarthour : '00',
                weekendstartmin : '00',
                weekendstartsec : '00',
                weekendendhour : '00',
                weekendendmin : '00',
                weekendendsec : '00'
            }
        }

        this.onChangeSelectOption = this.onChangeSelectOption.bind(this);
    }

    componentDidMount()
    {
        this.loadCampaignTimeWindow();
    }

    componentWillReceiveProps(props)
    {

    }

    loadCampaignTimeWindow()
    {
        let self = this;

        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.param.campaign.campaignName;

        $.ajax({
            method : "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/timewindowlist",
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
            },
        }).done(function (result) {

            var resultObj = JSON.parse(JSON.stringify(result));
            
            self.setState({ records : resultObj.records });
        }).fail(function (xhr, textStatus) {
            if (xhr.responseJSON)
            if(xhr.responseJSON.errorMessage == "Invalid Access"){
                 
            }
            
        });
    }

    onChangeSelectOption(event)
    {
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, event.target.name, event.target.value )});
    }

    getCampaignTimeWindow()
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.param.campaign.campaignName;
        
        $.ajax({
            method : "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/timewindow",
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
            },
        }).done(function (result) {

            var resultObj = JSON.parse(JSON.stringify(result));
            
            self.setTimeWindowData(resultObj);
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

    setTimeWindowData(resultObj)
    {
        let weekdaystarttime = resultObj.weekDayStartTime.split(':');
        let weekdayendtime = resultObj.weekDayEndTime.split(':');
        let weekendstarttime = resultObj.weekEndStartTime.split(':');
        let weekendendtime = resultObj.weekEndEndTime.split(':');
        this.setState({ editRecord : true });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekdaystarthour', weekdaystarttime[0]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekdaystartmin', weekdaystarttime[1]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekdaystartsec', weekdaystarttime[2]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekdayendhour', weekdayendtime[0]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekdayendmin', weekdayendtime[1]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekdayendsec', weekdayendtime[2]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekendstarthour', weekendstarttime[0]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekendstartmin', weekendstarttime[1]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekendstartsec', weekendstarttime[2]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekendendhour', weekendendtime[0]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekendendmin', weekendendtime[1]) });
        this.setState({ timewindowData : SPSUtils.getObjectInfo(this.state.timewindowData, 'weekendendsec', weekendendtime[2]) });
    }

    saveCampaignTimeWindow()
    {
        //TODO Ajax
        if (!this.isValidForm())
        {
            return;
        }
        if (this.state.editRecord)
        {
            this.updateCampaignTimeWindow();
            return;
        }

        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.param.campaign.campaignName;

        let params = {};
        params.weekDayStartTime = this.state.timewindowData.weekdaystarthour + ":" + this.state.timewindowData.weekdaystartmin + ":" + this.state.timewindowData.weekdaystartsec;
        params.weekDayEndTime = this.state.timewindowData.weekdayendhour + ":" + this.state.timewindowData.weekdayendmin + ":" + this.state.timewindowData.weekdayendsec;
        params.weekEndStartTime = this.state.timewindowData.weekendstarthour + ":" + this.state.timewindowData.weekendstartmin + ":" + this.state.timewindowData.weekendstartsec;
        params.weekEndEndTime = this.state.timewindowData.weekendendhour + ":" + this.state.timewindowData.weekendendmin + ":" + this.state.timewindowData.weekendendsec;

        console.log('ReqParams : ' + JSON.stringify(params));
        $.ajax({
            method : "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/timewindow",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeAddModal();
            self.loadCampaignTimeWindow(0);
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

    isValidForm()
    {
        if (parseInt(this.state.timewindowData.weekdaystarthour) > parseInt(this.state.timewindowData.weekdayendhour))
        {
            this.setState({ errorAlert : true, errorMsg : 'Weekday Start Time should be less than Weekday End Time.' });
            return false;
        }

        if (parseInt(this.state.timewindowData.weekdaystarthour) === parseInt(this.state.timewindowData.weekdayendhour))
        {
            if (parseInt(this.state.timewindowData.weekdaystartmin) > parseInt(this.state.timewindowData.weekdayendmin))
            {
                this.setState({ errorAlert : true, errorMsg : 'Weekday Start Time should be less than Weekday End Time.' });
                return false;
            }

            if (parseInt(this.state.timewindowData.weekdaystartmin) === parseInt(this.state.timewindowData.weekdayendmin))
            {
                if (parseInt(this.state.timewindowData.weekdaystartsec) >= parseInt(this.state.timewindowData.weekdayendsec))
                {
                    this.setState({ errorAlert : true, errorMsg : 'Weekday Start Time should be less than Weekday End Time.' });
                    return false;
                }   
            }
        }

        if (parseInt(this.state.timewindowData.weekendstarthour) > parseInt(this.state.timewindowData.weekendendhour))
        {
            this.setState({ errorAlert : true, errorMsg : 'Weekend Start Time should be less than Weekend End Time.' });
            return false;
        }

        if (parseInt(this.state.timewindowData.weekendstarthour) === parseInt(this.state.timewindowData.weekendendhour))
        {
            if (parseInt(this.state.timewindowData.weekendstartmin) > parseInt(this.state.timewindowData.weekendendmin))
            {
                this.setState({ errorAlert : true, errorMsg : 'Weekend Start Time should be less than Weekend End Time.' });
                return false;
            }

            if (parseInt(this.state.timewindowData.weekendstartmin) === parseInt(this.state.timewindowData.weekendendmin))
            {
                if (parseInt(this.state.timewindowData.weekendstartsec) >= parseInt(this.state.timewindowData.weekendendsec))
                {
                    this.setState({ errorAlert : true, errorMsg : 'Weekend Start Time should be less than Weekend End Time.' });
                    return false;
                }   
            }
        }

        return true;
    }

    updateCampaignTimeWindow()
    {
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.param.campaign.campaignName;

        let params = {};
        params.weekDayStartTime = this.state.timewindowData.weekdaystarthour + ":" + this.state.timewindowData.weekdaystartmin + ":" + this.state.timewindowData.weekdaystartsec;
        params.weekDayEndTime = this.state.timewindowData.weekdayendhour + ":" + this.state.timewindowData.weekdayendmin + ":" + this.state.timewindowData.weekdayendsec;
        params.weekEndStartTime = this.state.timewindowData.weekendstarthour + ":" + this.state.timewindowData.weekendstartmin + ":" + this.state.timewindowData.weekendstartsec;
        params.weekEndEndTime = this.state.timewindowData.weekendendhour + ":" + this.state.timewindowData.weekendendmin + ":" + this.state.timewindowData.weekendendsec;

        console.log('ReqParams : ' + JSON.stringify(params));
        $.ajax({
            method : "PUT",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/timewindow",
            data: JSON.stringify(params),
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeAddModal();
            self.loadCampaignTimeWindow(0);
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

    deleteCampaignTimeWindow()
    {
        //TODO Ajax
        let self = this;
        let accountNumber = this.state.user.accountNumber;
        let campaignName = this.state.param.campaign.campaignName;

        $.ajax({
            method : "DELETE",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(accountNumber) + "/campaign/" + encodeURIComponent(campaignName) + "/timewindow",
            dataType : 'json',
            beforeSend : function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + self.state.param.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
        }).done(function (result, xhr, response) {
            self.closeConfirmationDialog();
            self.loadCampaignTimeWindow(0);
            
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

    closeErrorDialog()
    {
        this.setState({ errorAlert : false, errorMsg : '' });
    }

    addCampaignTimeWindow()
    {
        if (this.state.userRole.adminRole === '2' || (this.state.records.length > 0)) return;
        this.clearTimeWindowData();
        this.setState({ addRecord : true, errorAlert : false, errorMsg : '' });
    }

    clearTimeWindowData()
    {
        this.setState({ timewindowData : {
            weekdaystarthour : '00', weekdaystartmin : '00', weekdaystartsec : '00',
            weekdayendhour : '00', weekdayendmin : '00', weekdayendsec : '00',
            weekendstarthour : '00', weekendstartmin : '00', weekendstartsec : '00',
            weekendendhour : '00', weekendendmin : '00', weekendendsec : '00'
        } });
    }

    closeAddModal()
    {
        this.clearTimeWindowData();
        this.setState({ addRecord : false, errorAlert : false, errorMsg : '', editRecord : false });
    }

    editCampaignTimeWindow(item)
    {
        this.getCampaignTimeWindow();
    }

    deleteTimeWindow(item)
    {
        this.setState({ requestForDelete : true });
    }

    closeConfirmationDialog()
    {
        this.setState({ requestForDelete : false });
    }

    render()
    {
        return(
            <I18nProvider locale={this.state.param.languageselected}>
                <div className="CampaignTimeWindowCmptHolder">
                    <div className="SPSComponentTableHolder" style={{ marginTop: '1%' }}>
                        <BS.Table className="SPSComponentTable table-striped">
                            <thead className="SPSComponentTblHeader">
                                <tr>
                                    <th>{Translator('timewindow_weekdaystarttime')}</th>
                                    <th>{Translator('timewindow_weekdayendtime')}</th>
                                    <th>{Translator('timewindow_weekendstarttime')}</th>
                                    <th>{Translator('timewindow_weekendendtime')}</th>
                                    <th>{Translator('global_action')}</th>
                                </tr>
                            </thead>

                            <tbody className="SPSComponentTblBody">
                                {
                                    this.state.records.map((item, key) => 
                                        <tr key={key}>
                                            <td>{item.weekDayStartTime}</td>
                                            <td>{item.weekDayEndTime}</td>
                                            <td>{item.weekEndStartTime}</td>
                                            <td>{item.weekEndEndTime}</td>
                                            <td>
                                                <div className="row ActionIcons">
                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top" disabled={this.state.userRole.adminRole === '2'}
                                                        title="Edit" onClick={() => this.editCampaignTimeWindow(item)}
                                                    >
                                                    <img src={EditIcon} className="EditIcon" /></button>

                                                    <button className="d-flex p-1 btn btn-default btn-transparent"
                                                        data-toggle="tooltip"
                                                        data-placement="top" disabled={this.state.userRole.adminRole === '2'}
                                                        title="Delete" onClick={() => this.deleteTimeWindow(item) }
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

                    <div disabled={this.state.userRole.adminRole === '2' || (this.state.records.length > 0)}>
                        <img src={NewIcon} className="NewIcon" onClick={() => this.addCampaignTimeWindow()} 
                            data-toggle="tooltip" data-placement="top" title="Add"
                        />
                    </div>

                    <BS.Modal dialogClassName="modal-dialog-centered modal-lg CampaignTimeWindowModal"
                        show={this.state.addRecord || this.state.editRecord} onHide={() => this.closeAddModal()}>
                        
                        <BS.Modal.Header closeButton>
                            <BS.Modal.Title><strong>{Translator('timewindow_title')}</strong></BS.Modal.Title>
                        </BS.Modal.Header>

                        <BS.Modal.Body>
                            <div className="container">
                                <div className="row">
                                    <div className="form-group col-3">
                                        <label htmlFor="weekdaystarthour"><strong>{Translator('timewindow_weekdaystarttime')}</strong></label>
                                    </div>
                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekdaystarthour"  value={this.state.timewindowData.weekdaystarthour}
                                            name="weekdaystarthour" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.hours.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekdaystartmin"  value={this.state.timewindowData.weekdaystartmin}
                                            name="weekdaystartmin" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.mins.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekdaystartsec"  value={this.state.timewindowData.weekdaystartsec}
                                            name="weekdaystartsec" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.secs.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="form-group col-3">
                                        <label htmlFor="weekdayendhour"><strong>{Translator('timewindow_weekdayendtime')}</strong></label>
                                    </div>
                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekdayendhour"  value={this.state.timewindowData.weekdayendhour}
                                            name="weekdayendhour" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.hours.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekdayendmin"  value={this.state.timewindowData.weekdayendmin}
                                            name="weekdayendmin" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.mins.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekdayendsec"  value={this.state.timewindowData.weekdayendsec}
                                            name="weekdayendsec" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.secs.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="form-group col-3">
                                        <label htmlFor="weekendstarthour"><strong>{Translator('timewindow_weekendstarttime')}</strong></label>
                                    </div>
                                    
                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekendstarthour"  value={this.state.timewindowData.weekendstarthour}
                                            name="weekendstarthour" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.hours.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekendstartmin"  value={this.state.timewindowData.weekendstartmin}
                                            name="weekendstartmin" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.mins.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekendstartsec"  value={this.state.timewindowData.weekendstartsec}
                                            name="weekendstartsec" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.secs.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="form-group col-3">
                                        <label htmlFor="weekendendhour"><strong>{Translator('timewindow_weekendendtime')}</strong></label>
                                    </div>
                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekendendhour"  value={this.state.timewindowData.weekendendhour}
                                            name="weekendendhour" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.hours.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekendendmin"  value={this.state.timewindowData.weekendendmin}
                                            name="weekendendmin" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.mins.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>

                                    <div className="form-group col-3">
                                        <select className="form-control" id="weekendendsec"  value={this.state.timewindowData.weekendendsec}
                                            name="weekendendsec" onChange={this.onChangeSelectOption}>
                                            {
                                                SPSConstants.secs.map((item, key) => 
                                                    <option key={key} value={item}>{item}</option>
                                                )
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </BS.Modal.Body>

                        <BS.Modal.Footer>
                            <button type="button" className="btn btn-primary" onClick={() => this.saveCampaignTimeWindow()} >{Translator('timewindow_save')}</button>
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
                                onClick={() => this.deleteCampaignTimeWindow()}>Ok
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

export default CampaignTimeWindow;