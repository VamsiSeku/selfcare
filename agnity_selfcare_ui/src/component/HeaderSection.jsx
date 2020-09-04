import React from 'react';
import * as BS from 'react-bootstrap';
import logo from '../images/AgnityLogo.gif';
import $ from 'jquery';
import appLauncherIcon from '../images/appLauncher.png';
import userIconOption from '../images/NavbarUser.png';
import powerSymbolIcon from '../images/powerSymbol.png';
import AccountMgmtIcon from '../images/Account.png';
import ServiceMgmtIcon from '../images/Service.png';
import AdminMgmtIcon from '../images/AdminMgmt.png';
import AppIcon from '../images/Application.png';
import ResourceIcon from '../images/Resource.jpg';
import ReportsIcon from '../images/Report.png';
import HelpIcon from '../images/Help.png';
import './HeaderSection.css';
import * as SPSConstants from '../utils/SPSConstants';

class HeaderSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            param: this.props.input,
            user: this.props.input.user,
            showErrorAlert: false,
            errorMessage: ''
        }
    }

    componentDidMount() {
        
    }

    componentWillReceiveProps(props) {
        this.setState({ param: props.input, user: props.input.user });
    }

    logoutSession() {
        var self = this;
        var params = {};
        console.log(this.props.input.token);
        params.sessionId = this.props.input.token;

        console.log("Stringify Data : " + JSON.stringify(params));
        $.ajax({
            method: "POST",
            url: this.state.param.RANI_API_INTEGRATION + SPSConstants.API_BASE_URL + "auth/logout",
            data: JSON.stringify(params),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Authorization', 'Bearer ' + params.sessionId);
            },
        }).done(function (result) {

            console.log(JSON.stringify(result));

            self.navigateToSelectedScreen('');

        }).fail(function (xhr, textStatus) {
            if (xhr.responseJSON)
            if(xhr.responseJSON.errorMessage == "Invalid Access"){
                self.state.param.fun()
            }
            console.log(xhr);
           
            var message = xhr.statusText;
            if (xhr.responseJSON) {
                message = xhr.responseJSON.errorMessage;
            }
            console.log(message);
            self.navigateToSelectedScreen('');
        });
    }

    navigateToSelectedScreen(selectedScreen) {

        switch (selectedScreen) {
            case "home":
                this.props.selectScreen('home');
                break;

            case "accmgmt":
                this.props.selectScreen('accountmgmt');
                break;

            default:
                this.props.resetParams();
                this.props.selectScreen('login');
                break;
        }
    }

    displayOptionsHolder() {
        if (this.props.input.token)
            return "OptionsHolder ShowElement";

        return "OptionsHolder HideElement";
    }

    closeErrorModalDialog() {
        this.setState({
            showErrorAlert: false,
            errorMessage: ''
        });
    }

    render() {

        return (
            <div className="HeaderPanel">
                <nav className="navbar">
                    <div className="navbar-header">
                        <div className="navbar-brand">
                            <img src={logo} className="AgnityLogoWithOutPointer" />
                        </div>
                        <h3 className="TitleSpan Detail"><span>S</span>elf <span>C</span>are <span>P</span>ortal</h3>
                    </div>
                    <div className={this.props.input.token === '' ? 'd-none' : 'd-block'}>
                        
                        <div className={this.displayOptionsHolder()}>
                            <BS.Breadcrumb className="UserlevelBreadcrumb">
                                <BS.BreadcrumbItem className="Userbreadcrumb" >
                                    <span>{this.props.input.user.enterpriseName}</span>
                                </BS.BreadcrumbItem>
                                
                            </BS.Breadcrumb>
                            
                            <ul className="nav">
                                
                                <li className="navitem">
                                    <div className="PowerImageHolder">
                                        <img src={powerSymbolIcon} className="PowerSymbolImage"
                                            data-toggle="tooltip" data-placement="top" title="Logout"
                                            onClick={() => this.logoutSession("")} />
                                    </div>
                                </li>
                            </ul>
                            
                        </div>
                    </div>
                </nav>
                <BS.Modal dialogClassName="modal-dialog-centered ErrorMsgModal"
                    show={this.state.showErrorAlert} onHide={() => this.closeErrorModalDialog()}>
                    <BS.Modal.Header closeButton>
                        <BS.Modal.Title><strong>Error : </strong></BS.Modal.Title>
                    </BS.Modal.Header>
                    <BS.Modal.Body>
                        <div><p>{this.state.errorMessage}</p></div>
                    </BS.Modal.Body>
                </BS.Modal>
            </div>
        );
    }
}

export default HeaderSection;