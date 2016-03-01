"use strict";
exports.ADDED_CO_STORE_ITEMS = 'ADDED_CO_STORE_ITEMS';
exports.ADDED_CO_STORE_ITEM = 'ADDED_CO_STORE_ITEM';
exports.UPDATE_CO_STORE_ITEM = 'UPDATE_CO_STORE_ITEM';
exports.REMOVED_CO_STORE_ITEM = 'REMOVED_CO_STORE_ITEM';
exports.coBrowserStorageReducer = function (state, _a) {
    if (state === void 0) { state = []; }
    var type = _a.type, payload = _a.payload;
    switch (type) {
        case exports.ADDED_CO_STORE_ITEMS:
            // Set all at once
            return payload;
        case exports.ADDED_CO_STORE_ITEM:
            // create a new array with the previous and new items
            return state.concat([Object.assign({}, payload)]);
        case exports.UPDATE_CO_STORE_ITEM:
            // if it's not the item being updated, just return it,
            // otherwise create a new item for it
            return state.map(function (item) {
                return item.key !== payload.key ?
                    item :
                    Object.assign({}, item, payload); // create copy of it
            });
        case exports.REMOVED_CO_STORE_ITEM:
            // filter out the item to remove
            return state.filter(function (item) {
                return item.key !== payload.key;
            });
        default:
            return state;
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvLWJyb3dzZXItc3RvcmFnZS9zZXJ2aWNlcy9jby1icm93c2VyLXN0b3JhZ2UtcmVkdWNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRWEsNEJBQW9CLEdBQUcsc0JBQXNCLENBQUE7QUFDN0MsMkJBQW1CLEdBQUcscUJBQXFCLENBQUE7QUFDM0MsNEJBQW9CLEdBQUcsc0JBQXNCLENBQUE7QUFDN0MsNkJBQXFCLEdBQUcsdUJBQXVCLENBQUE7QUFFL0MsK0JBQXVCLEdBQUcsVUFBQyxLQUFVLEVBQUUsRUFBZTtJQUEzQixxQkFBVSxHQUFWLFVBQVU7UUFBRyxjQUFJLEVBQUUsb0JBQU87SUFDaEUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUViLEtBQUssNEJBQW9CO1lBQ3ZCLGtCQUFrQjtZQUNsQixNQUFNLENBQUMsT0FBTyxDQUFBO1FBRWhCLEtBQUssMkJBQW1CO1lBQ3RCLHFEQUFxRDtZQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUVuRCxLQUFLLDRCQUFvQjtZQUN2QixzREFBc0Q7WUFDdEQscUNBQXFDO1lBQ3JDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLEdBQUc7b0JBQzdCLElBQUk7b0JBQ0osTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBLENBQUMsb0JBQW9CO1lBQ3pELENBQUMsQ0FBQyxDQUFBO1FBRUosS0FBSyw2QkFBcUI7WUFDeEIsZ0NBQWdDO1lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSTtnQkFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQTtZQUNqQyxDQUFDLENBQUMsQ0FBQTtRQUVKO1lBQ0UsTUFBTSxDQUFDLEtBQUssQ0FBQTtJQUNoQixDQUFDO0FBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6ImNvLWJyb3dzZXItc3RvcmFnZS9zZXJ2aWNlcy9jby1icm93c2VyLXN0b3JhZ2UtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmVkdWNlciwgQWN0aW9ufSBmcm9tICdAbmdyeC9zdG9yZSdcblxuZXhwb3J0IGNvbnN0IEFEREVEX0NPX1NUT1JFX0lURU1TID0gJ0FEREVEX0NPX1NUT1JFX0lURU1TJ1xuZXhwb3J0IGNvbnN0IEFEREVEX0NPX1NUT1JFX0lURU0gPSAnQURERURfQ09fU1RPUkVfSVRFTSdcbmV4cG9ydCBjb25zdCBVUERBVEVfQ09fU1RPUkVfSVRFTSA9ICdVUERBVEVfQ09fU1RPUkVfSVRFTSdcbmV4cG9ydCBjb25zdCBSRU1PVkVEX0NPX1NUT1JFX0lURU0gPSAnUkVNT1ZFRF9DT19TVE9SRV9JVEVNJ1xuXG5leHBvcnQgY29uc3QgY29Ccm93c2VyU3RvcmFnZVJlZHVjZXIgPSAoc3RhdGUgPSBbXSwge3R5cGUsIHBheWxvYWR9KSA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuXG4gICAgY2FzZSBBRERFRF9DT19TVE9SRV9JVEVNUzpcbiAgICAgIC8vIFNldCBhbGwgYXQgb25jZVxuICAgICAgcmV0dXJuIHBheWxvYWRcblxuICAgIGNhc2UgQURERURfQ09fU1RPUkVfSVRFTTpcbiAgICAgIC8vIGNyZWF0ZSBhIG5ldyBhcnJheSB3aXRoIHRoZSBwcmV2aW91cyBhbmQgbmV3IGl0ZW1zXG4gICAgICByZXR1cm4gc3RhdGUuY29uY2F0KFtPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkKV0pXG5cbiAgICBjYXNlIFVQREFURV9DT19TVE9SRV9JVEVNOlxuICAgICAgLy8gaWYgaXQncyBub3QgdGhlIGl0ZW0gYmVpbmcgdXBkYXRlZCwganVzdCByZXR1cm4gaXQsXG4gICAgICAvLyBvdGhlcndpc2UgY3JlYXRlIGEgbmV3IGl0ZW0gZm9yIGl0XG4gICAgICByZXR1cm4gc3RhdGUubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4gaXRlbS5rZXkgIT09IHBheWxvYWQua2V5ID9cbiAgICAgICAgICBpdGVtIDpcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBpdGVtLCBwYXlsb2FkKSAvLyBjcmVhdGUgY29weSBvZiBpdFxuICAgICAgfSlcblxuICAgIGNhc2UgUkVNT1ZFRF9DT19TVE9SRV9JVEVNOlxuICAgICAgLy8gZmlsdGVyIG91dCB0aGUgaXRlbSB0byByZW1vdmVcbiAgICAgIHJldHVybiBzdGF0ZS5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ua2V5ICE9PSBwYXlsb2FkLmtleVxuICAgICAgfSlcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGVcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvbm9kZV9tb2R1bGVzIn0=
