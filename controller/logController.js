/**
 * Created by Eunice.A on 11/8/2016.
 */
var logApp = angular.module('logApp', ['ui.bootstrap']);

logApp.controller('mainController', function ($scope, $http, $timeout, $sce) {

    var logurl = '/logs/getError';
    var keywordUpdateURL = '/keyword/write';
    var getLogsUrl = '/logs/getLogs';
    const mobileAppGateWay = 'mobile-app-gateway';
    var resJson, generalErrView, transOnMobileGateWay, microserviceKeys = {};
    var inclusiveMicroservices = [];
    var data = {};
    var isAutoAnalyser = false;

    $(function () {

        transOnMobileGateWay = {
            'columnDefs': [{
                'targets': 0,
                'searchable': false,
                'orderable': false,
                'width': '2.5%',
                'className': 'dt-body-center',
                'render': function (data, type, full, meta) {
                    return '<input type="checkbox">';
                }
            }],
            'order': [1, 'asc'],
            "columns": [
                { "data": "checkBox" },
                { "data": "transactionId", "title": "Transaction" },
                { "data": "userId", "title": "User ID" },
                { "data": "logType", "title": "Log Type" },
                { "data": "service", "title": "Service" },
                { "data": "customerId", "title": "Customer ID" },
                { "data": "time", "title": "Request Timestamp" }
            ]
        };
        $("body").tooltip({ selector: '[data-toggle=tooltip]' });
        $('#logInfo').hide();
        $scope.selectedMs = 'Select Microservice';
        $scope.selectedLogger = 'Select Log type';
        $scope.formData = {};
        $scope.logResult = 'Result';
        $scope.isDisabled = true;
        $scope.isIncidentRead = false;
        $scope.progressNote = 'Awaiting your input, please paste the incident mail details to auto analyse or proceed with manual search';
        $scope.isDisplayProgressNote = true;
        $scope.autoClass = 'add';
        $scope.microservicesErrorLogObj = [];
        $scope.availableOptions = ["Debug", "Error", "Fatal", "Info", "Transaction", "Warn", "Performance"];
        $scope.logOption = $scope.button;
        $scope.microserviceKeyConfig = {};
        data = $scope.selectedOption;
        $scope.mobileGatewayLogCardHide = true;
        $scope.searchComplete = false;
        $scope.microserviceErroLogsView = [];
        $scope.knownIssueCards = [];

        /* START - Read the settings and keyword map json file */
        $http.get('./common/config/settings.json')
            .then(function onSuccess(response) {
                $scope.microServices = response.data.microServices;
                var dataConfig = response.data;
                generalErrView = dataConfig.generalErrView;
                microserviceKeys = dataConfig.microserviceKeys;
            })
            .catch(function onError(response) {
            });

        $http.get('./common/config/keywordMap.json')
            .then(function onSuccess(response) {
                $scope.microserviceKeyConfig = response.data;
                keyWordAppend(response.data);
            })
            .catch(function onError(response) {
            });
        /* END - Read the settings and keyword map json file */

        $('#datePicker')
            .datepicker({
                autoclose: true,
                format: 'mm/dd/yyyy',
                endDate: '+0d',
            })
            .on('changeDate', function (e) {
                // Revalidate the date field
                // $('#eventForm').formValidation('revalidateField', 'date');
            });
    });



    function setDataOnTable(tableDefinition, resJsonData) {
        $.fn.dataTable.ext.errMode = 'none';
        $('#dataTableMobile').on('error.dt', function (e, settings, techNote, message) {
            console.log('An error occurred: ', message);
        });
        //Clears the table data if it is exisiting
        clearDataTable();
        //Add new data on to the table
        $('#dataTableMobile').dataTable({
            "destroy": true,
            "deferRender": true,
            "data": resJsonData,
            "defaultContent": "",
            'columnDefs': (tableDefinition.hasOwnProperty('columnDefs') ? tableDefinition.columnDefs : []),
            'order': (tableDefinition.hasOwnProperty('order') ? tableDefinition.order : []),
            "columns": (tableDefinition.hasOwnProperty('columns') ? tableDefinition.columns : [])
        });
        $('#dataTableMobile tbody').on('click', 'td.sorting_1', function () {
            var data = $('#dataTableMobile').DataTable().row(this).data();
            $('#myModal .modal-body').html(JSON.stringify(data.lineDetail, null, '<br>'));
            $("#myModal").modal('show');
        });
    }

    $scope.showDetailedLogPopup = function (log, isErrolog) {
        if(isErrolog){
            $scope.errorModalLog = log;
            console.log(log);
            $('#myErrorModal .modal-log-data').html(JSON.stringify(log.lineDetail, null, '<br>'));
            $("#myErrorModal").modal('show');
        }
        else{
            $('#myModal .modal-body').html(JSON.stringify(log.lineDetail, null, '<br>'));
            $("#myModal").modal('show');
        }
    }

    function clearDataTable() {
        if ($.fn.dataTable.isDataTable('#dataTableMobile')) {
            $('#dataTableMobile').dataTable({
                "destroy": true,
                "clear": true,
                "paging": false,
                "searching": false
            });
            $('#dataTableMobile').dataTable().fnDestroy();
            $('#dataTableMobile').empty();
        }
    }

    function sucessCallback(result, microservice, logType) {
        resJson = {};
        $scope.lineDataCheck = result;
        $('#logInfo').show();
        if ($.isEmptyObject(result)) {
            $('#logInfo').hide();
            setProgressNote('No logs found for ', microservice, logType, true)
        }
        else {
            resJson = {};
            resJson = result;
            $scope.mobileGatewayLogCardHide = (resJson.length > 30 || !isAutoAnalyser);
            $timeout(setProgressNote('Found ', microservice, logType, true), 3000);
            setDataOnMicroserviceObj(resJson, microservice, logType);

        }

        $('input.global_filter').on('keyup click', function () {
            filterGlobal();
        });
        function filterGlobal() {
            $('#dataTableMobile').DataTable().search(
                $('#global_filter').val(),
                $('#global_regex').prop('checked'),
                $('#global_smart').prop('checked')
            ).draw();
        }
    };

    var errorCallback = function (result) {
        console.log("error");
        if (result.statusCode == 500) {
            $('#logInfo').hide();
        }
        $('#errorModal')
    };

    function setDataOnMicroserviceObj(resJson, microservice, logType) {

        switch (microservice) {
            case mobileAppGateWay:
                if (isAutoAnalyser) {
                    $timeout(function () {
                        setMobileAppGatewayData(resJson);
                    }, 8000);
                }
                setDataOnTable(transOnMobileGateWay, resJson);
                break;
            default:
                $timeout(function () {
                    setMicroserviceData(resJson);
                }, 8000);
                if (isAutoAnalyser && !isAllMicroserviceRendered()) {
                    $timeout(getMicroservicesErrorLogs, 3000);
                }
                else {
                    setDataOnTable(generalErrView, resJson);
                }
                break;
        }
    }

    function setMobileAppGatewayData(resJson) {
        $scope.mobileGatewayLogData = [];
        var requestArray = resJson.filter(data => (data.logType === 'REQUEST' && inclusiveMicroservices.indexOf(data.service) > -1));
        if(requestArray && requestArray.length > 0){
            $scope.mobileGatewayLogData.push(requestArray);
        }
        
        var responseArray = resJson.filter(data => (data.logType === 'RESPONSE' && inclusiveMicroservices.indexOf(data.service) > -1));
        if(responseArray && responseArray.length > 0){
            $scope.mobileGatewayLogData.push(responseArray);
        }
        
        getMicroservicesSearchObject();
        getMicroservicesErrorLogs();
        $scope.microserviceErroLogsView = [];
    }

    function setMicroserviceData(resJson) {
        if (resJson && resJson.length > 0) {
            var knownSolutionArray = createKnownSolutionObject(resJson[0].microserviceName);
            if(knownSolutionArray.length > 0){
                resJson = resJson.concat(knownSolutionArray);
            }
        }
        $scope.microserviceErroLogsView.push(resJson);
    }

    $scope.scanIncidentDetails = function () {
        $scope.microserviceArray = [];
        for (var key in $scope.microserviceKeyConfig) {
            var microserviceData = $scope.microserviceKeyConfig[key];
            for (var indexKey in microserviceData.keyMap) {
                var keyWord = microserviceData.keyMap[indexKey];
                var emailShortDec = $scope.incidentObj.shortDesc.toLowerCase();
                var emailDetailedDesc = $scope.incidentObj.detailedDesc.toLowerCase();
                if (keyWord.key !== undefined && (emailShortDec.indexOf(keyWord.key) > -1 || emailDetailedDesc.indexOf(keyWord.key) > -1)) {
                    if ($scope.microserviceArray.indexOf(microserviceData) < 0) {
                        microserviceData.gateWayService = key;
                        inclusiveMicroservices.push(key);
                        $scope.microserviceArray.push(microserviceData);
                    }
                }
            }
        }
        $scope.incidentObj.microservicesAffected = inclusiveMicroservices.toString();
        $scope.incidentObj.microservicesAffected = $scope.incidentObj.microservicesAffected.replace(',', ', ');
    }

    $scope.getLogLocation = function (microservice) {
        $scope.selectedMs = microservice;
        $scope.formData.selectedService = microservice;
    }

    $scope.getError = function (logOption) {
        $scope.selectedLogger = logOption;
        $scope.formData.selectedLogger = logOption;
        if ($scope.selectedMs != 'Select a microservice' && $scope.selectedLogger != 'Select a Logger') {
            $('#btnSearch').removeAttr('disabled');
        }
    };
    $scope.btnFieldsreset = function () {
        $('#date').cleanData();
    }

    $scope.reset = function () {
        window.location.reload();
    }

    $scope.getLogDetails = function (clearSearchStr, microservice, logType, isAutoAnalyserEnabled) {
        isAutoAnalyser = (isAutoAnalyserEnabled !== undefined) ? isAutoAnalyserEnabled : false;
        $scope.formData.archiveLogDate = $('#logDate').val();
        if (clearSearchStr) {
            $scope.formData.cid = $('#cid').val();
            microservice = $scope.formData.selectedService;
            $scope.selectedLogger = 'Transaction';
            logType = $scope.formData.selectedLogger;
            
        }
        $scope.microserviceKeyConfig = [];
        $scope.logResult = 'Result';
        setProgressNote('Looking through ', microservice, logType, false)
        $scope.searchComplete = false;
        return $http.post(logurl, { log: $scope.formData }).then(function (response) {
            if (!isAutoAnalyser) {
                $scope.mobileGatewayLogData = [];
            }
            sucessCallback(response.data, microservice, logType);
        }, function (response) {
            errorCallback(response.data);
        });
    }

    function setProgressNote(action, microservice, logType, isDelayed) {
        if (isDelayed) {
            $timeout(function () {
                $scope.progressNote = action + microservice + ' ' + logType.toLowerCase() + ' logs';
                $scope.searchComplete = true;
            }, 5000);
        }
        else {
            $scope.progressNote = action + microservice + ' ' + logType.toLowerCase() + ' logs';
        }

    }

    //This is where we are reading the email template.

    $scope.readEmailData = function () {
        resetState();
        var emailInput = $("#incidentData").val();
        var result = parseEmailToArray(emailInput);
        var incidentObject = {};
        for (var i = 0; i < result.length; i++) {
            result[i] = result[i].replace('?', ':');
            if (result[i] !== '') {
                var incidentDataObj = handleIncidentDataArray(result[i]);
                incidentObject[incidentDataObj.key] = incidentDataObj.data;
            }
        }
        if (!incidentObject.hasOwnProperty('customerId')) {
            alert('Unrecognized Email Format, \nplease provide the right input.');
            $("#incidentData").val('');
        }
        else {
            $scope.isIncidentRead = true;
            $scope.incidentObj = incidentObject;
        }
        getMobileAppGatewayTransLogs();
    }

    function parseEmailToArray(emailInput) {
        var patt1 = /\n/;
        var parsedArray = emailInput.split(patt1);
        return parsedArray;
    }

    function handleIncidentDataArray(data) {
        var splitData = data.split(':');
        var key = camelizeKey(splitData[0]);
        var strObj = {};

        if (key === 'exactDateAndTimeIssueOccurred' && splitData.length > 2) {
            str = "'" + key + "'" + ":'" + splitData[1] + ":" + splitData[2] + "'";
            strObj.key = redefineIncidentKey(key);
            strObj.data = trimString(splitData[1]) + ":" + splitData[2];
        }
        else if (key.indexOf('(PleaseEnterThisInThe') > 0) {
            var numIndex = key.indexOf(')') + 1;
            var numStartIndex = key.indexOf('(');
            splitData[1] = key.substring(numIndex, key.length);
            key = key.substring(0, numStartIndex);
            strObj.key = redefineIncidentKey(key);
            strObj.data = trimString(splitData[1]);
        }
        else if (splitData.length > 2) {
            splitData[1] = camelizeKey(splitData[1]);
            strObj.key = redefineIncidentKey(splitData[1]);
            strObj.data = trimString(splitData[2]);
        }
        else {
            strObj.key = redefineIncidentKey(key);
            strObj.data = trimString(splitData[1]);
        }
        return strObj;
    }

    function redefineIncidentKey(key) {
        var changeKey = key.toLowerCase();
        switch (changeKey) {
            case 'clickheretoview':
            case 'clickheretoviewincident':
                return 'incidentNum';
            case 'customerid':
                return 'customerId';
            case 'detailedproblemdescription':
            case 'problemdescription':
                return 'detailedDesc';
            case 'shortdescription':
                return 'shortDesc';
            case 'ctn/mdn':
            case 'mdn':
                return 'ctnMdn';
            case 'financialaccount(fa)':
            case 'faid':
                return 'faId';
            default:
                return key;
        }
    }

    function trimString(trimStr) {
        return (trimStr !== undefined) ? trimStr.trim() : trimStr;
    }

    function camelizeKey(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
            return index == 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

    function getMobileAppGatewayTransLogs() {
        if ($scope.incidentObj.hasOwnProperty('customerId')) {
            $scope.scanIncidentDetails();
            $scope.formData.cid = $scope.incidentObj.customerId;
            $scope.selectedMs = mobileAppGateWay;
            $scope.formData.selectedService = $scope.selectedMs;
            $scope.selectedLogger = 'Transaction';
            $scope.formData.selectedLogger = $scope.selectedLogger;
            $scope.getLogDetails(false, mobileAppGateWay, 'Transaction', true);
        }
    }

    function isAllMicroserviceRendered() {
        for (var arryIndx in $scope.microserviceArray) {
            var microserviceObj = $scope.microserviceArray[arryIndx];
            if (!microserviceObj.renderComplete) {
                return false;
            }
        }
        return true;
    }
    function createKnownSolutionObject(microservice) {
        var knownSolutionArray = [];
        for (var arryIndx in $scope.microserviceArray) {
            var microserviceObj = $scope.microserviceArray[arryIndx];
            if (microserviceObj.microservice === microservice || microserviceObj.gateWayService === microservice) {
                for (var knownSolutionIndex in microserviceObj.knownSolution) {
                    var knownSolutionObj = {};
                    knownSolutionObj.isKnownSolution = true;
                    knownSolutionObj.knownSolution = $sce.trustAsHtml(microserviceObj.knownSolution[knownSolutionIndex].key);
                    knownSolutionArray.push(knownSolutionObj);
                }
            }
        }
        return knownSolutionArray;
    }

    function getMicroservicesErrorLogs() {
        for (var arryIndx in $scope.microserviceArray) {
            var microserviceObj = $scope.microserviceArray[arryIndx];
            if (!microserviceObj.renderComplete) {
                $scope.formData.cid = microserviceObj.searchItemArray;
                $scope.selectedMs = microserviceObj.microservice;
                $scope.formData.selectedService = $scope.selectedMs;
                $scope.selectedLogger = 'Error';
                $scope.formData.selectedLogger = $scope.selectedLogger;
                $scope.getLogDetails(false, microserviceObj.microservice, 'Error', true);
                microserviceObj.renderComplete = true;
                break;
            }
        }
    }

    function getMicroservicesSearchObject() {
        for (var arryIndx in $scope.microserviceArray) {
            for (var key in $scope.mobileGatewayLogData) {
                var responseReqObj = $scope.mobileGatewayLogData[key]
                for (var objKey in responseReqObj) {
                    var logObj = responseReqObj[objKey];
                    var microserviceObj = $scope.microserviceArray[arryIndx];
                    if (microserviceObj.gateWayService === logObj.service) {
                        microserviceObj.renderComplete = false;
                        if (microserviceObj.searchItemArray === undefined || microserviceObj.searchItemArray.length === 0) {
                            microserviceObj.searchItemArray = [];
                            microserviceObj.searchItemArray.push(logObj.transactionId);
                        }
                        else if (microserviceObj.searchItemArray.indexOf(logObj.transactionId) < 0) {
                            microserviceObj.searchItemArray.push(logObj.transactionId);
                        }
                    }
                }
            }
        }
    }

    $scope.filterMicroservice = function (microserviceToFilter) {
        var dataLog = [];
        if (dataLog.logType === 'REQUEST') {
            dataLog = $scope.mobileGatewayLogData[0];
            $scope.mobileGatewayLogData[0] = (dataLog.filter(filterArrayOnMicroservice, microserviceToFilter));
        }
        else {
            dataLog = $scope.mobileGatewayLogData[1];
            $scope.mobileGatewayLogData[1] = (dataLog.filter(filterArrayOnMicroservice, microserviceToFilter));
        }
    }

    function filterArrayOnMicroservice(data) {
        for (var key in inclusiveMicroservices) {
            if (data.service === inclusiveMicroservices[key]) {
                return true;
            }
        }
        return false;
    }

    function resetState(){
        // $scope.selectedMs = 'Select Microservice';
        // $scope.selectedLogger = 'Select Log type';
        // $scope.formData = {};
        // $scope.logResult = 'Result';
        // $scope.isDisabled = true;
        // $scope.isIncidentRead = false;
        // $scope.progressNote = 'Awaiting your input, please paste the incident mail details to auto analyse or proceed with manual search';
        // $scope.isDisplayProgressNote = true;
        // $scope.autoClass = 'add';
        // $scope.microservicesErrorLogObj = [];
        // $scope.availableOptions = ["Debug", "Error", "Fatal", "Info", "Transaction", "Warn", "Performance"];
        // $scope.logOption = $scope.button;
        // $scope.microserviceKeyConfig = {};
        // data = $scope.selectedOption;
        // $scope.mobileGatewayLogCardHide = true;
        // $scope.searchComplete = false;
        // $scope.microserviceErroLogsView = [];
        // $scope.knownIssueCards = [];
        // $scope.microServices = {};
        // $scope.errorModalLog = {};
        // $scope.lineDataCheck = {};
        // $scope.mobileGatewayLogData = [];
        // $scope.microserviceArray = [];
        // $scope.incidentObj = {};
    }
});

logApp.filter("firstuppercase", function () {
    return function (firstuppercase) {
        if (firstuppercase !== undefined && firstuppercase.length > 0) {
            firstuppercase = firstuppercase[0].toUpperCase() + firstuppercase.substring(1, firstuppercase.length).toLowerCase();
        }
        return firstuppercase;
    }
});