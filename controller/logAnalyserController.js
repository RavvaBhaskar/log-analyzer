/**
 * Created by Eunice.A on 11/8/2016.
 */
var logAnalyserApp = angular.module('logAnalyserApp', ['ui.bootstrap']);

logAnalyserApp.controller('mainController', function ($scope, $http) {

    var logurl = '/logs/getError';
    var getLogsUrl = '/logs/getLogs';


    $scope.formData = {};
    $scope.logResult = 'Result';
    $scope.isDisabled = true;

    var resJson = {};
    var data;
    $(function () {
        $("body").tooltip({ selector: '[data-toggle=tooltip]' });
        $scope.selectedMs = 'Select Microservice';
        $scope.selectedLogger = 'Select Log type';
        $('#logInfo').hide();

        $http.get('./common/config/settings.json')
            .then(function onSuccess(response) {
                $scope.microServices = response.data.microServices;
            })
            .catch(function onError(response) {
            });

        // $http.get('./common/config/keywordMap.json').then(function onSuccess(response) {
        //     $scope.keyword = response.data;
        // })
        // .catch(function onError(response) {
        // });
        $('#dataTable').hide();
        $('#dataTableMobile').hide();
        $('#dataTableLogin').hide();
        $('#dataTableReg').hide();
        $('#date').hide();

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

    $scope.availableOptions = ["Debug", "Error", "Fatal", "Info", "Transaction", "Warn", "Performance"];
    $scope.logOption = $scope.button;
    data = $scope.selectedOption;
    var sucessCallback = function (result) {
        $scope.lineDataCheck = result;
        $(".overlay").hide();
        $('i').hide();
        $('#menu1').removeAttr('disabled');
        $('#menu2').removeAttr('disabled');
        $('#logInfo').show();
        if ($.isEmptyObject(result)) {
            $(".overlay").show();
            $('#dataTable').hide();
            $('#dataTableMobile').hide();
            $('#dataTableLogin').hide();
            $('#dataTableReg').hide();
            $('#errorModal').hide();
            $('#logInfo').hide();
            $('#menu1').removeAttr('disabled');
            $('#menu2').removeAttr('disabled');
            $('#infoModal').show();
        }
        else {
            resJson = {};
            $('#errorModal').hide();
            $('#infoModal').hide();
            $('#dataTable').show();
            $('#dataTableMobile').show();
            $('#dataTableLogin').show();
            $('#dataTableReg').show();
            $('#menu1').removeAttr('disabled');
            $('#menu2').removeAttr('disabled');
            resJson = result;
            if ($scope.selectedMs === 'mobile-app-gateway' && $scope.selectedLogger === 'Transaction') {
                $.fn.dataTable.ext.errMode = 'none'; $('#dataTableMobile').on('error.dt', function (e, settings, techNote, message) { console.log('An error occurred: ', message); });
                $('#dataTable').hide();
                $('#dataTable_wrapper').hide();
                $('#dataTableMobile_wrapper').hide();
                $('#dataTableLogin_wrapper').hide();
                $('#dataTableMobile').dataTable({
                    "destroy": true,

                    "deferRender": true,
                    "data": resJson,
                    "defaultContent": "",
                    //"order": [[0, "asc"]],
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
                        { "data": "transactionId" },
                        { "data": "userId" },
                        { "data": "logType" },
                        { "data": "service" },
                        { "data": "operation" },
                        { "data": "time" }

                    ]

                });
                $('#dataTableMobile tbody').on('click', 'td.sorting_1', function () {
                    var data = $('#dataTableMobile').DataTable().row(this).data();
                    $('#myModal .modal-body').html(JSON.stringify(data.lineDetail, null, '<br>'));
                    $("#myModal").modal('show');

                });
            }
            else if ($scope.selectedMs === 'user-registration' && $scope.selectedLogger === 'Error') {
                $.fn.dataTable.ext.errMode = 'none'; $('#dataTableReg').on('error.dt', function (e, settings, techNote, message) { console.log('An error occurred: ', message); });

                $('#dataTable').hide();
                $('#dataTable_wrapper').hide();
                $('#dataTableMobile_wrapper').hide();
                $('#dataTableLogin_wrapper').hide();
                $('#dataTableReg').dataTable({
                    "destroy": true,
                    "deferRender": true,
                    "data": resJson,
                    "defaultContent": "",
                    "order": [[0, "asc"]],
                    "columns": [
                        { "data": "reqId" },
                        { "data": "time" },
                        { "data": "message" },
                    ]

                });
                $('#dataTableReg tbody').on('click', 'td.sorting_1', function () {
                    var data = $('#dataTableReg').DataTable().row(this).data();

                    //   $('#myModal .modal-body').html(JSON.stringify(data.lineDetail));
                    $('#myModal .modal-body').html(JSON.stringify(data.lineDetail, null, '<br>'));
                    $("#myModal").modal('show');

                });
            }
            else if (($scope.selectedMs === 'login-web' || $scope.selectedMs === 'login-app') && $scope.selectedLogger === 'Error') {
                $.fn.dataTable.ext.errMode = 'none'; $('#dataTableLogin').on('error.dt', function (e, settings, techNote, message) { console.log('An error occurred: ', message); });

                $('#dataTable').hide();

                $('#dataTable_wrapper').hide();
                $('#dataTableMobile_wrapper').hide();
                $('#dataTableReg_wrapper').hide();
                $('#dataTableLogin').dataTable({


                    "destroy": true,
                    "deferRender": true,
                    "data": resJson,
                    "defaultContent": "",
                    "order": [[0, "desc"]],
                    "columns": [
                        { "data": "reqId" },
                        { "data": "time" },
                        { "data": "message" },


                    ]

                });
                $('#dataTableLogin tbody').on('click', 'td.sorting_1', function () {
                    var data = $('#dataTableLogin').DataTable().row(this).data();

                    //   $('#myModal .modal-body').html(JSON.stringify(data.lineDetail));
                    $('#myModal .modal-body').html(JSON.stringify(data.lineDetail, null, '<br>'));
                    $("#myModal").modal('show');

                });
            }
            else {
                $.fn.dataTable.ext.errMode = 'none'; $('#dataTable').on('error.dt', function (e, settings, techNote, message) { console.log('An error occurred: ', message); });


                $('#dataTableMobile').hide();
                $('#dataTableLogin').hide();
                $('#dataTableMobile_wrapper').hide();
                $('#dataTableLogin_wrapper').hide();
                $('#dataTableReg').hide();
                $('#dataTableReg_wrapper').hide();
                $('#dataTable').dataTable({
                    "destroy": true,
                    "deferRender": true,
                    "data": resJson,
                    "defaultContent": '',
                    "order": [[0, "desc"]],
                    "columns": [
                        { "data": "reqId" },
                        { "data": "time" },
                        { "data": "message" }


                    ]

                });
                $('#dataTable tbody').on('click', 'td.sorting_1', function () {
                    var data = $('#dataTable').DataTable().row(this).data();

                    //  $('#myModal .modal-body').html(JSON.stringify(data.lineDetail));
                    $('#myModal .modal-body').html(JSON.stringify(data.lineDetail, null, '<br>'));
                    $("#myModal").modal('show');

                });
            }



        }

        $('input.global_filter').on('keyup click', function () {
            filterGlobal();
        });
        function filterGlobal() {
            $('#dataTable').DataTable().search(
                $('#global_filter').val(),
                $('#global_regex').prop('checked'),
                $('#global_smart').prop('checked')
            ).draw();
            $('#dataTableMobile').DataTable().search(
                $('#global_filter').val(),
                $('#global_regex').prop('checked'),
                $('#global_smart').prop('checked')
            ).draw();
            $('#dataTableReg').DataTable().search(
                $('#global_filter').val(),
                $('#global_regex').prop('checked'),
                $('#global_smart').prop('checked')
            ).draw();
            $('#dataTableLogin').DataTable().search(
                $('#global_filter').val(),
                $('#global_regex').prop('checked'),
                $('#global_smart').prop('checked')
            ).draw();
        }


    };

    var errorCallback = function (result) {
        $(".overlay").hide();
        $('i').hide();
        $('#infoModal').hide();
        $('#menu1').removeAttr('disabled');
        $('#menu2').removeAttr('disabled');

        if (result.statusCode == 500) {

            $('#logInfo').hide();
            $('#dataTable').hide();
            $('#dataTableMobile').hide();
            $('#dataTableLogin').hide();
            $('#dataTableReg').hide();
            $(".overlay").show();
            $('#errorModal').show();
            $('#menu1').removeAttr('disabled');
            $('#menu2').removeAttr('disabled');
        }
        $('#errorModal')
        // $scope.logResult =result;
    };

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

    $scope.getLogDetails = function () {

        $(".overlay").show();
        $("i").show();
        $('#menu1').prop('disabled', true);
        $('#menu2').prop('disabled', true);
        $('#date').hide();
        $scope.formData.archiveLogDate = $('#logDate').val();
        $scope.formData.cid = $('#cid').val();


        $scope.logResult = 'Result';

        return $http
            .post(logurl, { log: $scope.formData }).then(function (response) {

                sucessCallback(response.data)
            }, function (response) {

                errorCallback(response.data);
            });
    }




});
