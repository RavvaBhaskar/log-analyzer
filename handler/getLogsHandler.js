/**
 * Created by Eunice.A on 11/8/2016.
 * Modified by malay.ranjan.hota on 12/09/2018.
 */
"use strict";

// Declaration and initialization
var promise = require('bluebird');
var zLib = require('zlib');
var timeZone = require('moment-timezone');
var lineReader = require('readline');
var fullLog = {};
var logParseHandler = {};

/**
 * Description: Get the log info for selected logger level
 * @param req
 * @param reply
 */
logParseHandler.keywordWrite = function keywordWrite(req, reply) {
    var fs = require('fs');
    var arrayOfObjects = {};
    arrayOfObjects = req.payload.key;
    fs.writeFile(process.cwd() + '/common/config/keywordMap.json', JSON.stringify(arrayOfObjects), 'utf-8', function (err) {
        if (err) throw err
        console.log('Done!');
    });
}
/**
 * Description: Get the log info for selected logger level
 * @param req
 * @param reply
 */

logParseHandler.parseLogs = function parseLogs(req, reply) {

    var logVal = req.payload.log.selectedLogger.toString().toLowerCase();
    var serviceVal = req.payload.log.selectedService.toString().toLowerCase();
    var archivedDate = req.payload.log.archiveLogDate;
    var searchString = req.payload.log.cid;
    var matchedLogs = [];
    var rl, strFilename = null;
    var msgArr = [];
    var resJson = {};

    if (archivedDate) {
        archivedDate = timeZone(new Date(archivedDate)).add(1, "day").format("MMDDYY") + '02';
        strFilename = ('/files1/ucnap/logs/archive/' + serviceVal + '/' + logVal + '.log.' + archivedDate + '.gz');
    } else {
        strFilename = ('/files0/home/ucnaprd01/node/' + ((serviceVal === 'mobile-app-gateway') ? serviceVal : ('microservices/' + serviceVal)) + '/' + 'logs/' + logVal + '.log');
    }

    if (strFilename) {
        rl = lineReader.createInterface({
            input: (archivedDate !== '') ? require('fs').createReadStream(strFilename).pipe(zLib.createGunzip()) : require('fs').createReadStream(strFilename)
        })
        .on('line', function (line) {
            if (Array.isArray(searchString)) {
                for (var searchKey in searchString) {
                    if (setMatchedLog(line, searchString[searchKey])) {
                        break;
                    }
                }
            }
            else {
                setMatchedLog(line, searchString);
            }
        }).on('close', function () {
            var dataArr = parseFilter(matchedLogs);
            return reply(dataArr);
        });
    }

    function setMatchedLog(logLine, searchStr) {
        var idx = logLine.indexOf(searchStr);
        if (idx !== -1) {
            matchedLogs.push(JSON.parse(logLine));
            return true;
        }
        return false;
    }

    function parseFilter(filteredLogs) {
        var transPropertyArray = ['req_id', 'customerId', 'transactionId', 'userId', 'logType', 'microserviceName', 'service', 'operation', 'time', 'lineDetail', 'getMsg'];
        for (let ind in filteredLogs) {
            resJson = {};
            var logObj = filteredLogs[ind]
            for (var key in transPropertyArray) {
                var propertyData = retriveProperty(transPropertyArray[key], logObj);
                if (propertyData !== undefined) {
                    if (transPropertyArray[key] == 'getMsg') {
                        resJson['message'] = propertyData;
                    }
                    else {
                        resJson[transPropertyArray[key]] = propertyData;
                    }
                }
            }
            msgArr.push(resJson);
        }
        return msgArr;
    }

    function retriveProperty(key, logObj) {
        if (logObj.hasOwnProperty(key)) {

            switch (key) {
                case 'transactionId':
                case 'req_id':
                    return logObj[key].slice(1, 13);
                default:
                    return logObj[key];
            }
        }
        else if (key === 'getMsg') {
            return retreiveErrorMessage(logObj);
        }
        else if (key === 'lineDetail') {
            return logObj;
        }
        else {
            return undefined;
        }
    }


    function retreiveErrorMessage(errorLogObj) {
        var errPropertyArray = ['variables,errorObj,ERROR_DESCRIPTION', 'errorResponse,errorCode', 'errorResponse,errorMessage', 'err,message,code', 'err,message', 'err,err,lde_message', 'msg'];
        var errMsg = 'Error -';
        for (var errorPropertyIndex in errPropertyArray) {
            var errLog = findErrorProperty(errorLogObj, errPropertyArray[errorPropertyIndex], 0);
            if (errLog.indexOf('}') > -1) {
                var extractError = errLog.split('}');
                errLog = extractError[extractError.length - 1];
            }

            if (errLog && errMsg.indexOf(errLog) === -1) {
                errMsg += ' ' + errLog + ((errorPropertyIndex < errPropertyArray.length - 1) ? ',' : '');
            }
        }
        return errMsg;
    }

    /**
     *
     * @param errorObj 
     * @param propString
     * @param objectDepth
     * @returns {boolean}
     * usage: findErrorProperty(obj,prop,nestedprop)
     */
    function findErrorProperty(errorLogObj, propString, objectDepth) {
        var returnVal = '';
        var propArray = propString.split(",");
        if (objectDepth < propArray.length) {
            if (errorLogObj && errorLogObj.hasOwnProperty(propArray[objectDepth])) {
                if (typeof errorLogObj[propArray[objectDepth]] !== 'object') {
                    returnVal = errorLogObj[propArray[objectDepth]];
                }
                else {
                    returnVal = findErrorProperty(errorLogObj[propArray[objectDepth]], propString, objectDepth + 1);
                }
            }
        }
        else {
            return returnVal;
        }
        return returnVal;
    }

}
module.exports = logParseHandler;