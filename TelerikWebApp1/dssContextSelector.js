﻿(function ($, window, document, undefined) {
    'use strict';

    //seems like didnt change anything when changed this!

    var pluginName = 'dssContextSelector';
    var defaults = {
        objName: 'DashboardSafety',
        columns: ['id', 'LocationName', 'locationId']
    };

    var init = function () {
        var _ = this;

        var selectorElement = document.createElement('div');

        selectorElement.id = 'dssContextSelector';
        selectorElement.setAttribute('style', 'float: right; margin: 10px 50px 0 0;');

        _.element.appendChild(selectorElement);

        $.when(loadDataSource(_.settings.objName, _.settings.columns)).done(function (dataSource) {

            _.dataSource = dataSource;

            var errorsCallback = rbv_errorsCallback;
            var errorHandler = onLoadSelectedOptionError.bind(_, dataSource);

            rbf_setErrorsCallback(errorHandler);

            $.when(loadSelectedOption.call(_)).done(function () {

                initDropDown.call(_);

            });

            rbf_setErrorsCallback(errorsCallback);
        });
    };

    var initDropDown = function () {
        //alert("hi 1")
        var _ = this;

        var ds = new kendo.data.DataSource({
            data: _.dataSource,
            schema: {
                model: { id: 'id' }
            }
        });

        _.selector = $('#dssContextSelector').kendoDropDownList({
            dataValueField: 'id',
            dataTextField: 'LocationName',
            dataSource: ds,
            value: _.initialId,
            animation: false,
            change: function (e) {
                //   alert("hi 2" );
                var dataItem = this.dataItem();

                if (!dataItem.id) {
                    return;
                }

                $.when(saveSelectedOption(dataItem.id)).done(function () {
                    document.dispatchEvent(new CustomEvent('dss:context-update', { 'detail': dataItem }));
                });
            }
        }).data('kendoDropDownList');

        document.dispatchEvent(new CustomEvent('dss:context-update', { 'detail': ds.get(_.initialId) }));
    };

    var loadSelectedOption = function () {
        var _ = this;
        return $.Deferred(function () {
            //alert("hi 3")
            var self = this;

            rbf_getSessionData('dssContext', function (dataValue) {
                //alert("hi 4")
                _.initialId = dataValue;
                self.resolve();
            });
        });
    };

    var onLoadSelectedOptionError = function (dataSource) {
        //alert("hi 5")
        var _ = this;

        $.when(saveSelectedOption(dataSource[0].id)).done(function () {
            _.initialId = dataSource[0].id;
            initDropDown.call(_);
        });
    };

    var saveSelectedOption = function (dataValue) {
        return $.Deferred(function () {
            var self = this;

            rbf_setSessionData('dssContext', dataValue, function () {
                self.resolve();
            });
        });
    };

    var loadDataSource = function (objName, columns) {
        // alert("hi 6 new 1")
        return $.Deferred(function () {
            var self = this;

            //var query = 'SELECT ' + columns.join(',') + ' FROM ' + objName + ' WHERE cb_isActive=1';
            var query = 'SELECT ' + columns.join(',') + ' FROM ' + objName;

            rbf_selectQuery(query, 20, function (result) {
                var data = dss.transformRecords(result, columns);
                self.resolve(data);
            });
        });
    };

    function DSSContextSelector(element, options) {
        var _ = this;

        _.settings = $.extend(true, {}, defaults, options);
        _.element = element;
        _.selector = null;
        _.initialId = null;

        init.call(_);
    };

    $.extend(DSSContextSelector.prototype, {

    });

    $.fn[pluginName] = function (options) {

        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new DSSContextSelector(this, options));
            }
        });

    };

})(jQuery, window, document);