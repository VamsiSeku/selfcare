import React from 'react';
import $ from 'jquery';
import * as BS from 'react-bootstrap';
import userIcon from '../../images/LoginUser.png';
import lockIcon from '../../images/lock.png';
import languageSelectIcon from '../../images/languageSelect.png';
import loginLock from '../../images/loginLock.jpg';
import './LoginPage.css';

import * as SPSUtils from '../../utils/SPSUtils';
import * as SPSConstants from '../../utils/SPSConstants';
import { I18nProvider, LOCALES } from '../../i18n';
import Translator from '../../i18n/Translator';

const userInfo = { userName : '', password : '', locale : LOCALES.ENGLISH };
class Login extends React.Component
{

    constructor(props)
    {
        super(props);

        this.state = {
            param : this.props.input,
            locale : this.props.input.locale,
            success: true,
            errorMsg: '',
            errorAlert: false,
            userData : userInfo
        }

        this.onChangeDropdown = this.onChangeDropdown.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
    }

    componentDidMount()
    {
        console.log("Inside Login Component");
    }

    componentWillReceiveProps(props)
    {
        this.setState({ param : props.input });
    }

    getAlertBoxClassName(flag) {
        if (flag)
            return "row ShowAlert";

        return "row HideAlert";
    }

    onChangeDropdown(event)
    {
        this.setState({ userData : SPSUtils.getObjectInfo(this.state.userData, event.target.name, event.target.value )});

        this.props.setLocale(event.target.value);
    }

    onChangeInput(event)
    {
        this.setState({ userData : SPSUtils.getObjectInfo(this.state.userData, event.target.name, event.target.value )});
    }

    isErrorMsgAppend(inFlag, inMsg)
    {
        if (inFlag)
            return "\n" + inMsg;

        return inMsg;
    }

    validateLoginForm()
    {
        let isError = false;
        let msg = "";
        if (this.state.userData.userName === '')
        {
            msg = "Username is a mandatory.";
            isError = true;
        }
        
        if (this.state.userData.password === '')
        {
            msg += this.isErrorMsgAppend(isError, "Password is a mandatory.");
            isError = true;
        }        

        this.setState({ errorAlert : isError, errorMsg : msg });
        return isError;
    }

    getUserRoleInfo(inToken, resultObj)
    {
        let self = this;

        $.ajax({
            method : "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "service/rani/account/" + encodeURIComponent(resultObj.accountNumber) + "/admin/" + encodeURIComponent(resultObj.adminAccNum) + "/userrole",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Authorization', 'Bearer ' + inToken);
            },
        }).done(function (response) {

            var responseObj = JSON.parse(JSON.stringify(response));
            self.props.setAccess(inToken, resultObj, resultObj.accountNumber, responseObj);
        }).fail(function (xhr, textStatus) {
            
            var message = xhr.statusText;
            if (xhr.responseJSON) {
                message = xhr.responseJSON.message;
            }
            self.setState({ errorAlert : true, errorMsg : 'Unable to get UserRole.'});
        });
    }

    sessionInfo(inToken)
    {
        let self = this;

        $.ajax({
            method: "GET",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "auth/sessioninfo",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Authorization', 'Bearer ' + inToken);
            },
        }).done(function (result) {

            var resultObj = JSON.parse(JSON.stringify(result));
            self.getUserRoleInfo(inToken, resultObj);
            //self.props.setAccess(inToken, resultObj, resultObj.accountNumber);
        }).fail(function (xhr, textStatus) {
            
            var message = xhr.statusText;
            if (xhr.responseJSON) {
                message = xhr.responseJSON.message;
            }
            
        });
    }

    submitToLogin()
    {
        let params = {};
        let self = this;

        if (this.validateLoginForm())
        {
            return;
        }
        
        params.username = this.state.userData.userName;
        params.password = this.state.userData.password;

        console.log("Request Data: " + JSON.stringify(params));

        $.ajax({
            method: "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "auth/login",
            data: JSON.stringify(params),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
        }).done(function (result) {

            var resultObj = JSON.parse(JSON.stringify(result));
            self.sessionInfo(resultObj.token);
            //self.props.setAccess(resultObj.token, self.state.userData.userName, 4449);
        }).fail(function (xhr, textStatus) {
            
            var message = xhr.statusText;
            if (xhr.responseJSON) {
                message = xhr.responseJSON.message;
            }
            console.log(message);
            self.setState({
                success: false,
                errorMsg: message,
                errorAlert: true
            });
        });

    }

    closeErrorDialog()
    {
        this.setState({ errorAlert : false, errorMsg : '' });
    }

    render() {
        return (
            <I18nProvider locale={this.state.userData.locale}>
                <div className="SelfCareLogin">
                    <div className="container">
                        <div className="card parentCard">
                            <div className="card-body LoginHolder">
                                <img src={loginLock} className="rounded-circle LoginLock" />
                                <h4>{Translator('login_signIn')}</h4>
                                
                                <div className="input-group">
                                    <div className="input-group-prepend LoginInputPrepend">
                                        <img src={userIcon} className="UserIconImage" />
                                    </div>
                                    <input placeholder="Username" aria-describedby="inputGroupPrepend" required="" type="text" name="userName" onChange={this.onChangeInput}
                                        className="UserNameHolder form-control" value={this.state.userData.userName}></input>
                                </div>
                                <div className="input-group">
                                    <div className="input-group-prepend LoginInputPrepend">
                                        <img src={lockIcon} className="LockIconImage" />
                                    </div>
                                    <input placeholder="Password" aria-describedby="inputGroupPrepend" required="" type="password" name="password" onChange={this.onChangeInput}
                                        className="PasswordHolder form-control" value={this.state.userData.password}></input>
                                </div>
                                <div className="input-group">
                                    <div className="input-group-prepend LoginInputPrepend">
                                        <img src={languageSelectIcon} className="LanguageIconImage" />
                                    </div>
                                    <select className="LanguageSelectHolder form-control" onChange={this.onChangeDropdown} 
                                        name="locale" value={this.state.userData.locale}>
                                        <option value={LOCALES.ENGLISH}>English (United States)</option>
                                        <option value={LOCALES.JAPANESE}>Japanese</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <button type="Login" className="btn LoginButton" onClick={() => this.submitToLogin()}>{Translator('login_login')}</button>
                                </div>
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
        );
    }
}

export default Login;