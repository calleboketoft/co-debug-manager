var browser_1 = require('angular2/platform/browser');
var store_1 = require('@ngrx/store');
var app_cmp_1 = require('./app-cmp');
var co_browser_storage_reducer_1 = require('../co-browser-storage/services/co-browser-storage-reducer');
browser_1.bootstrap(app_cmp_1.AppCmp, [
    // initial state is handled when store is initialized
    store_1.provideStore({ coBrowserStorageReducer: co_browser_storage_reducer_1.coBrowserStorageReducer }, { coBrowserStorageReducer: [] })
]);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4YW1wbGUvYm9vdHN0cmFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QiwyQkFDeEIsQ0FBQyxDQURrRDtBQUNuRCxzQkFBMkIsYUFDM0IsQ0FBQyxDQUR1QztBQUN4Qyx3QkFBcUIsV0FDckIsQ0FBQyxDQUQrQjtBQUNoQywyQ0FBc0MsMkRBRXRDLENBQUMsQ0FGZ0c7QUFFakcsbUJBQVMsQ0FBQyxnQkFBTSxFQUFFO0lBQ2hCLHFEQUFxRDtJQUNyRCxvQkFBWSxDQUFDLEVBQUMseUJBQUEsb0RBQXVCLEVBQUMsRUFBRSxFQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBQyxDQUFDO0NBQ3ZFLENBQUMsQ0FBQSIsImZpbGUiOiJleGFtcGxlL2Jvb3RzdHJhcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJ1xuaW1wb3J0IHtwcm92aWRlU3RvcmV9IGZyb20gJ0BuZ3J4L3N0b3JlJ1xuaW1wb3J0IHtBcHBDbXB9IGZyb20gJy4vYXBwLWNtcCdcbmltcG9ydCB7Y29Ccm93c2VyU3RvcmFnZVJlZHVjZXJ9IGZyb20gJy4uL2NvLWJyb3dzZXItc3RvcmFnZS9zZXJ2aWNlcy9jby1icm93c2VyLXN0b3JhZ2UtcmVkdWNlcidcblxuYm9vdHN0cmFwKEFwcENtcCwgW1xuICAvLyBpbml0aWFsIHN0YXRlIGlzIGhhbmRsZWQgd2hlbiBzdG9yZSBpcyBpbml0aWFsaXplZFxuICBwcm92aWRlU3RvcmUoe2NvQnJvd3NlclN0b3JhZ2VSZWR1Y2VyfSwge2NvQnJvd3NlclN0b3JhZ2VSZWR1Y2VyOiBbXX0pXG5dKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
