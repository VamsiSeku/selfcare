import React from 'react';
import $ from 'jquery';
import * as SPSConstants from './SPSConstants';

export function validateName(inValue) {
    let name = inValue;

    if (name !== "") {
        if (name.match(/[:'& ^,#<>`{};]/)) {
            return false;
        }
        else {
            return true;
        }
    }
    else
        return true;
}

export function validateDesc(inValue) {
    
    if (inValue != "" && inValue != null) {
        if (inValue.match(/[:'&^,#<>`{};]/)) {
            return false;
        } else {
            return true;
        }
    }
    else
        return true;
}

export function validatePlusNumber(inNumber) {
    var allowedChars = "0123456789";
    var specialCharacterAllowed = "+0123456789";

    for (var idx = 0; idx < inNumber.length; idx++) {
        if (idx === 0) {
            if (specialCharacterAllowed.indexOf(inNumber.charAt(idx)) === -1) {
                return false;
            }
        }
        else {
            if (allowedChars.indexOf(inNumber.charAt(idx)) === -1) {
                return false;
            }
        }
    }

    return true;
}

export function validateNumber(inValue, validChars) {
    for (var i = 0; i < inValue.length; i++) {
        if (validChars.indexOf(inValue.charAt(i)) == "-1") {
            return false;
        }
    }
    return true;
}

export function displayErrorElement(inFlag) {
    if (inFlag)
        return "ShowElement";

    return "HideElement";
}

export function getStatus(status) {
    if (status === 1) {
        return "Active";
    }
    else
        return "Inactive";
}

export function getObjectInfo(inObj, field, value) {
    inObj[field] = value;

    return inObj;

}

export function getNumberPoolStatus(inStatus)
{
    switch(parseInt(inStatus))
    {
        case 0:
            return "Free";
        case 1:
            return "Assigned";
        case 2:
            return "Quarantine";
        default :
            return inStatus;
    }
}

export function getCampaignRoutingPolicy(inPolicy)
{
    switch(parseInt(inPolicy))
    {
        case 0:
            return "Random";
        case 1:
            return "Destination based";
        default :
            return inPolicy;
    }
}

export function getCampaignStatus(inStatus)
{
    switch(parseInt(inStatus))
    {
        case 0:
            return "Inactive";
        case 1:
            return "Active";
        case 2:
            return "Expired";
        default :
            return inStatus;
    }
}

export function toDate(inDateStr)
{
    console.log(inDateStr);
}

export function formatDate(inDateStr) {
    console.log("inDateStr");
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let date = new Date(inDateStr.toString());
    let tmp = date.getUTCDate();
    if (parseInt(tmp) < 10)
        tmp = "0" + tmp;
    let ret = tmp + "-" + months[date.getUTCMonth()] + "-" + date.getUTCFullYear();

    return ret;
}

export function getSearchFieldOption(inLabel, inValue) {
    var ret = {};
    ret.label = inLabel;
    ret.value = inValue;
    return ret;
}

export function getFilterCondition(inField, inOperation, inValue) {
    var ret = {};
    ret.field = inField;
    ret.operation = inOperation;
    ret.value = inValue;

    return ret;
}

export function getSearchFilterCondition(inField, inOperation, inValue) {
    var ret = {};
    ret.field = inField;
    ret.operation = inOperation;
    ret.value = inValue;

    if (SPSConstants.LIKE_OPERATOR === inOperation) {
        ret.value = '%' + ret.value + '%';
    }
    else if (SPSConstants.STARTSWITH_OPERATOR === inOperation) {
        ret.value = ret.value + '%';
        ret.operation = SPSConstants.LIKE_OPERATOR;
    }

    return ret;
}

export function getFilterConditionValues(inField, inOperation, inValue) {
    var ret = {};
    ret.field = inField;
    ret.operation = inOperation;
    ret.values = inValue;

    return ret;
}

export function getElasticData(inUrl, inQry, data, callback)
{
    console.log(inUrl);
    console.log(inQry);
    $.ajax({
        method : "GET",
        url : "/RaniIntegrationApp/rest/service/rani/elastic/count?elasticUrl=" + inUrl + "&elasticQuery=" + inQry,
    }).done(function (result, xhr, response) {
        
        callback(result, data);
    }).fail(function (xhr, textStatus) {
        console.log(xhr);

    });
}

export function getRANIIntegrationBaseURL(callback)
{
    $.ajax({
        method : "GET",
        url : "/RaniIntegrationApp/rest/service/rani/integration"
    }).done(function (result, xhr, response) {
        
        if (callback != null && typeof callback === 'function')
            callback(true, result);

    }).fail(function (xhr, textStatus) {
        console.log(xhr);

        var message = xhr.statusText;
        if (xhr.responseJSON) {
            message = xhr.responseJSON.errorMessage;
        }

        if (callback != null && typeof callback === 'function')
            callback(false, message);
    });
}

export function spsDeleteRequest(inUrl, inParams, inToken, callback) {
    var self = this;

    $.ajax({
        method: "DELETE",
        url: inUrl,
        data: JSON.stringify(inParams),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + inToken);
            xhr.setRequestHeader('Content-Type', 'application/json');
        },
    }).done(function (result, xhr, response) {
        
        if (callback != null && typeof callback === 'function')
            callback(true, result);

    }).fail(function (xhr, textStatus) {
        console.log(xhr);

        var message = xhr.statusText;
        if (xhr.responseJSON) {
            message = xhr.responseJSON.errorMessage;
        }

        if (callback != null && typeof callback === 'function')
            callback(false, message);
    });
}