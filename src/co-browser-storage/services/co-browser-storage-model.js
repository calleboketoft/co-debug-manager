// Handles all actions towards localStorage and sessionStorage
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// The config is saved like this in localStorage
// CO_BROWSER_DB = {
//   MEMORY_STATE: [], // current state from app
//   INITIAL_SCHEMA: [] // initial state from when initializing app
// }
var core_1 = require('angular2/core');
var store_1 = require('@ngrx/store');
var CoBrowserStorageActions = require('./co-browser-storage-reducer');
var CoBrowserStorageModel = (function () {
    function CoBrowserStorageModel(_store) {
        this._store = _store;
        this._DB_CONFIG_KEY = 'CO_BROWSER_DB';
        this._DB_MEMORY_KEY = 'MEMORY_STATE';
        this._DB_INITIAL_KEY = 'INITIAL_SCHEMA';
        this._coBrowserStorageReducer = this._store.select('coBrowserStorageReducer');
    }
    CoBrowserStorageModel.prototype._saveItem = function (item) {
        // Save item to browser storage
        window[item.storageType]['setItem'](this._options.namespace + '.' + item.key, item.value);
        // Remove any existing item with the same key from memory object and add the new one
        var dbConfig = this._getConfigFromLS();
        dbConfig[this._DB_MEMORY_KEY] = dbConfig[this._DB_MEMORY_KEY].filter(function (memItem) { return item.key !== memItem.key; });
        dbConfig[this._DB_MEMORY_KEY].push(item);
        this._setConfigToLS(dbConfig);
    };
    // CRUD
    // ----
    CoBrowserStorageModel.prototype.createItem = function (item) {
        var safeItem = {
            key: item.key,
            value: item.value || '',
            storageType: item.storageType || 'localStorage',
            valueType: item.valueType || 'text'
        };
        this._saveItem(safeItem);
        this._store.dispatch({
            type: CoBrowserStorageActions.ADDED_CO_STORE_ITEM,
            payload: safeItem
        });
    };
    CoBrowserStorageModel.prototype.updateItem = function (item) {
        this._saveItem(item);
        this._store.dispatch({
            type: CoBrowserStorageActions.UPDATE_CO_STORE_ITEM,
            payload: item
        });
    };
    CoBrowserStorageModel.prototype.resetItem = function (item) {
        var resetdItem;
        var schemaItem = this._options['initialState'].filter(function (schemaItem) {
            return item.key === schemaItem.key;
        })[0];
        if (schemaItem) {
            resetdItem = {
                key: item.key,
                value: schemaItem.default,
                storageType: schemaItem.storageType,
                valueType: schemaItem.valueType,
                inConfigFile: true
            };
        }
        if (resetdItem) {
            this.updateItem(resetdItem);
        }
    };
    CoBrowserStorageModel.prototype.removeItem = function (item) {
        // Remove item from storage
        window[item.storageType]['removeItem'](this._options.namespace + '.' + item.key);
        // Remove item from memory object
        var dbConfig = this._getConfigFromLS();
        dbConfig[this._DB_MEMORY_KEY] = dbConfig[this._DB_MEMORY_KEY].filter(function (memItem) { return item.key !== memItem.key; });
        this._setConfigToLS(dbConfig);
        this._store.dispatch({
            type: CoBrowserStorageActions.REMOVED_CO_STORE_ITEM,
            payload: item
        });
    };
    // Serialize / deserialize and persist config to browser storage
    // -------------------------------------------------------------
    CoBrowserStorageModel.prototype._getConfigFromLS = function () {
        var configStr = localStorage[this._options.namespace + '.' + this._DB_CONFIG_KEY];
        if (typeof configStr === 'undefined') {
            return null;
        }
        else {
            return JSON.parse(configStr);
        }
    };
    CoBrowserStorageModel.prototype._setConfigToLS = function (configObj) {
        var configStr = JSON.stringify(configObj);
        window.localStorage[this._options.namespace + '.' + this._DB_CONFIG_KEY] = configStr;
    };
    // Initialize component upon load
    // ------------------------------
    CoBrowserStorageModel.prototype.initialize = function (options) {
        this._options = options; // save options to class
        var dbConfig = this._getConfigFromLS();
        var updatedConfig;
        if (!dbConfig) {
            // there is no current state stored, initialize from scratch
            updatedConfig = this._initFromScratch(options);
        }
        else {
            // a current state is existing, validate against schema
            updatedConfig = this._initExisting(options.namespace, dbConfig);
        }
        this._store.dispatch({
            type: CoBrowserStorageActions.ADDED_CO_STORE_ITEMS,
            payload: updatedConfig[this._DB_MEMORY_KEY]
        });
        return;
    };
    // Validate each existing item from storage against the memory object
    CoBrowserStorageModel.prototype._initExisting = function (namespace, dbConfig) {
        var actualMemory = dbConfig[this._DB_MEMORY_KEY].map(function (memoryItem) {
            var storageItem = window[memoryItem.storageType][namespace + '.' + memoryItem.key];
            if (typeof storageItem === 'undefined') {
                // the item doesn't exist at all, set it
                window[memoryItem.storageType][namespace + '.' + memoryItem.key] = memoryItem.value;
                return memoryItem;
            }
            else {
                var actualValue = window[memoryItem.storageType][namespace + '.' + memoryItem.key];
                if (actualValue === memoryItem.value) {
                    // the value has not been touched outside of this GUI
                    return memoryItem;
                }
                else {
                    // the value has been manually modified by a user
                    var updatedMemoryItem = {
                        key: memoryItem.key,
                        value: actualValue,
                        storageType: memoryItem.storageType,
                        valueType: memoryItem.valueType,
                        inConfigFile: !!memoryItem.inConfigFile
                    };
                    return updatedMemoryItem;
                }
            }
        });
        dbConfig[this._DB_MEMORY_KEY] = actualMemory;
        this._setConfigToLS(dbConfig);
        return dbConfig;
    };
    // Initialize the storage items from scratch
    CoBrowserStorageModel.prototype._initFromScratch = function (options) {
        var stateForMemory = options.initialState.map(function (schemaItem) {
            // transform the schema to the memory type
            window[schemaItem.storageType][options.namespace + '.' + schemaItem.key] = schemaItem.default;
            return {
                key: schemaItem.key,
                value: schemaItem.default,
                storageType: schemaItem.storageType,
                valueType: schemaItem.valueType,
                inConfigFile: true // only the ones from the config file are here, used for 'reset' functionality
            };
        });
        var dbConfig = {};
        dbConfig[this._DB_INITIAL_KEY] = options.initialState;
        dbConfig[this._DB_MEMORY_KEY] = stateForMemory;
        this._setConfigToLS(dbConfig);
        return dbConfig;
    };
    CoBrowserStorageModel = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [store_1.Store])
    ], CoBrowserStorageModel);
    return CoBrowserStorageModel;
})();
exports.CoBrowserStorageModel = CoBrowserStorageModel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvLWJyb3dzZXItc3RvcmFnZS9zZXJ2aWNlcy9jby1icm93c2VyLXN0b3JhZ2UtbW9kZWwudHMiXSwibmFtZXMiOlsiQ29Ccm93c2VyU3RvcmFnZU1vZGVsIiwiQ29Ccm93c2VyU3RvcmFnZU1vZGVsLmNvbnN0cnVjdG9yIiwiQ29Ccm93c2VyU3RvcmFnZU1vZGVsLl9zYXZlSXRlbSIsIkNvQnJvd3NlclN0b3JhZ2VNb2RlbC5jcmVhdGVJdGVtIiwiQ29Ccm93c2VyU3RvcmFnZU1vZGVsLnVwZGF0ZUl0ZW0iLCJDb0Jyb3dzZXJTdG9yYWdlTW9kZWwucmVzZXRJdGVtIiwiQ29Ccm93c2VyU3RvcmFnZU1vZGVsLnJlbW92ZUl0ZW0iLCJDb0Jyb3dzZXJTdG9yYWdlTW9kZWwuX2dldENvbmZpZ0Zyb21MUyIsIkNvQnJvd3NlclN0b3JhZ2VNb2RlbC5fc2V0Q29uZmlnVG9MUyIsIkNvQnJvd3NlclN0b3JhZ2VNb2RlbC5pbml0aWFsaXplIiwiQ29Ccm93c2VyU3RvcmFnZU1vZGVsLl9pbml0RXhpc3RpbmciLCJDb0Jyb3dzZXJTdG9yYWdlTW9kZWwuX2luaXRGcm9tU2NyYXRjaCJdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEOzs7Ozs7Ozs7O0FBRTlELGdEQUFnRDtBQUNoRCxvQkFBb0I7QUFDcEIsZ0RBQWdEO0FBQ2hELG1FQUFtRTtBQUNuRSxJQUFJO0FBRUoscUJBQXlCLGVBQ3pCLENBQUMsQ0FEdUM7QUFDeEMsc0JBQW9CLGFBRXBCLENBQUMsQ0FGZ0M7QUFFakMsSUFBWSx1QkFBdUIsV0FBTSw4QkFFekMsQ0FBQyxDQUZzRTtBQVN2RTtJQVFFQSwrQkFBcUJBLE1BQWtCQTtRQUFsQkMsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBWUE7UUFOL0JBLG1CQUFjQSxHQUFHQSxlQUFlQSxDQUFDQTtRQUNqQ0EsbUJBQWNBLEdBQUdBLGNBQWNBLENBQUNBO1FBQ2hDQSxvQkFBZUEsR0FBR0EsZ0JBQWdCQSxDQUFDQTtRQUt6Q0EsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxH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QUFDQSxVQUFVQTtZQUN2REEsMENBQTBDQTtZQUMxQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsR0FBR0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQUE7WUFDN0ZBLE1BQU1BLENBQUNBO2dCQUNMQSxHQUFHQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQTtnQkFDbkJBLEtBQUtBLEVBQUVBLFVBQVVBLENBQUNBLE9BQU9BO2dCQUN6QkEsV0FBV0EsRUFBRUEsVUFBVUEsQ0FBQ0EsV0FBV0E7Z0JBQ25DQSxTQUFTQSxFQUFFQSxVQUFVQSxDQUFDQSxTQUFTQTtnQkFDL0JBLFlBQVlBLEVBQUVBLElBQUlBLENBQUNBLDhFQUE4RUE7YUFDbEdBLENBQUFBO1FBQ0hBLENBQUNBLENBQUNBLENBQUFBO1FBQ0ZBLElBQUlBLFFBQVFBLEdBQUdBLEVBQUVBLENBQUFBO1FBQ2pCQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFBQTtRQUNyREEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsY0FBY0EsQ0FBQUE7UUFDOUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBLENBQUFBO1FBQzdCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFBQTtJQUNqQkEsQ0FBQ0E7SUFwS0hYO1FBQUNBLGlCQUFVQSxFQUFFQTs7OEJBcUtaQTtJQUFEQSw0QkFBQ0E7QUFBREEsQ0FyS0EsQUFxS0NBLElBQUE7QUFwS1ksNkJBQXFCLHdCQW9LakMsQ0FBQSIsImZpbGUiOiJjby1icm93c2VyLXN0b3JhZ2Uvc2VydmljZXMvY28tYnJvd3Nlci1zdG9yYWdlLW1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSGFuZGxlcyBhbGwgYWN0aW9ucyB0b3dhcmRzIGxvY2FsU3RvcmFnZSBhbmQgc2Vzc2lvblN0b3JhZ2VcblxuLy8gVGhlIGNvbmZpZyBpcyBzYXZlZCBsaWtlIHRoaXMgaW4gbG9jYWxTdG9yYWdlXG4vLyBDT19CUk9XU0VSX0RCID0ge1xuLy8gICBNRU1PUllfU1RBVEU6IFtdLCAvLyBjdXJyZW50IHN0YXRlIGZyb20gYXBwXG4vLyAgIElOSVRJQUxfU0NIRU1BOiBbXSAvLyBpbml0aWFsIHN0YXRlIGZyb20gd2hlbiBpbml0aWFsaXppbmcgYXBwXG4vLyB9XG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSdcbmltcG9ydCB7U3RvcmV9IGZyb20gJ0BuZ3J4L3N0b3JlJ1xuXG5pbXBvcnQgKiBhcyBDb0Jyb3dzZXJTdG9yYWdlQWN0aW9ucyBmcm9tICcuL2NvLWJyb3dzZXItc3RvcmFnZS1yZWR1Y2VyJ1xuXG5pbnRlcmZhY2UgSVN0b3JhZ2VJdGVtIHtcbiAga2V5OiBzdHJpbmcsXG4gIHZhbHVlPzogYW55LFxuICBzdG9yYWdlVHlwZT86IHN0cmluZyxcbiAgdmFsdWVUeXBlPzogc3RyaW5nXG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb0Jyb3dzZXJTdG9yYWdlTW9kZWwge1xuICBwcml2YXRlIF9EQl9DT05GSUdfS0VZID0gJ0NPX0JST1dTRVJfREInO1xuICBwcml2YXRlIF9EQl9NRU1PUllfS0VZID0gJ01FTU9SWV9TVEFURSc7XG4gIHByaXZhdGUgX0RCX0lOSVRJQUxfS0VZID0gJ0lOSVRJQUxfU0NIRU1BJztcbiAgcHJpdmF0ZSBfb3B0aW9ucztcbiAgcHJpdmF0ZSBfY29Ccm93c2VyU3RvcmFnZVJlZHVjZXI7XG5cbiAgY29uc3RydWN0b3IgKHByaXZhdGUgX3N0b3JlOiBTdG9yZTxhbnk+KSB7XG4gICAgdGhpcy5fY29Ccm93c2VyU3RvcmFnZVJlZHVjZXIgPSB0aGlzLl9zdG9yZS5zZWxlY3QoJ2NvQnJvd3NlclN0b3JhZ2VSZWR1Y2VyJylcbiAgfVxuXG4gIHByaXZhdGUgX3NhdmVJdGVtIChpdGVtOiBJU3RvcmFnZUl0ZW0pIHtcbiAgICAvLyBTYXZlIGl0ZW0gdG8gYnJvd3NlciBzdG9yYWdlXG4gICAgd2luZG93W2l0ZW0uc3RvcmFnZVR5cGVdWydzZXRJdGVtJ10odGhpcy5fb3B0aW9ucy5uYW1lc3BhY2UgKyAnLicgKyBpdGVtLmtleSwgaXRlbS52YWx1ZSlcbiAgICAvLyBSZW1vdmUgYW55IGV4aXN0aW5nIGl0ZW0gd2l0aCB0aGUgc2FtZSBrZXkgZnJvbSBtZW1vcnkgb2JqZWN0IGFuZCBhZGQgdGhlIG5ldyBvbmVcbiAgICBsZXQgZGJDb25maWcgPSB0aGlzLl9nZXRDb25maWdGcm9tTFMoKVxuICAgIGRiQ29uZmlnW3RoaXMuX0RCX01FTU9SWV9LRVldID0gZGJDb25maWdbdGhpcy5fREJfTUVNT1JZX0tFWV0uZmlsdGVyKG1lbUl0ZW0gPT4gaXRlbS5rZXkgIT09IG1lbUl0ZW0ua2V5KVxuICAgIGRiQ29uZmlnW3RoaXMuX0RCX01FTU9SWV9LRVldLnB1c2goaXRlbSlcbiAgICB0aGlzLl9zZXRDb25maWdUb0xTKGRiQ29uZmlnKVxuICB9XG5cbiAgLy8gQ1JVRFxuICAvLyAtLS0tXG4gIHB1YmxpYyBjcmVhdGVJdGVtIChpdGVtOiBJU3RvcmFnZUl0ZW0pIHtcbiAgICBsZXQgc2FmZUl0ZW0gPSB7XG4gICAgICBrZXk6IGl0ZW0ua2V5LFxuICAgICAgdmFsdWU6IGl0ZW0udmFsdWUgfHwgJycsXG4gICAgICBzdG9yYWdlVHlwZTogaXRlbS5zdG9yYWdlVHlwZSB8fCAnbG9jYWxTdG9yYWdlJyxcbiAgICAgIHZhbHVlVHlwZTogaXRlbS52YWx1ZVR5cGUgfHwgJ3RleHQnXG4gICAgfVxuICAgIHRoaXMuX3NhdmVJdGVtKHNhZmVJdGVtKVxuICAgIHRoaXMuX3N0b3JlLmRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IENvQnJvd3NlclN0b3JhZ2VBY3Rpb25zLkFEREVEX0NPX1NUT1JFX0lURU0sXG4gICAgICBwYXlsb2FkOiBzYWZlSXRlbVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgdXBkYXRlSXRlbSAoaXRlbTogSVN0b3JhZ2VJdGVtKSB7XG4gICAgdGhpcy5fc2F2ZUl0ZW0oaXRlbSlcbiAgICB0aGlzLl9zdG9yZS5kaXNwYXRjaCh7XG4gICAgICB0eXBlOiBDb0Jyb3dzZXJTdG9yYWdlQWN0aW9ucy5VUERBVEVfQ09fU1RPUkVfSVRFTSxcbiAgICAgIHBheWxvYWQ6IGl0ZW1cbiAgICB9KVxuICB9XG5cbiAgcHVibGljIHJlc2V0SXRlbSAoaXRlbTogSVN0b3JhZ2VJdGVtKSB7XG4gICAgbGV0IHJlc2V0ZEl0ZW1cbiAgICBsZXQgc2NoZW1hSXRlbSA9IHRoaXMuX29wdGlvbnNbJ2luaXRpYWxTdGF0ZSddLmZpbHRlcigoc2NoZW1hSXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBzY2hlbWFJdGVtLmtleVxuICAgIH0pWzBdXG4gICAgaWYgKHNjaGVtYUl0ZW0pIHtcbiAgICAgIHJlc2V0ZEl0ZW0gPSB7XG4gICAgICAgIGtleTogaXRlbS5rZXksXG4gICAgICAgIHZhbHVlOiBzY2hlbWFJdGVtLmRlZmF1bHQsXG4gICAgICAgIHN0b3JhZ2VUeXBlOiBzY2hlbWFJdGVtLnN0b3JhZ2VUeXBlLFxuICAgICAgICB2YWx1ZVR5cGU6IHNjaGVtYUl0ZW0udmFsdWVUeXBlLFxuICAgICAgICBpbkNvbmZpZ0ZpbGU6IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVzZXRkSXRlbSkge1xuICAgICAgdGhpcy51cGRhdGVJdGVtKHJlc2V0ZEl0ZW0pXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlbW92ZUl0ZW0gKGl0ZW06IElTdG9yYWdlSXRlbSkge1xuICAgIC8vIFJlbW92ZSBpdGVtIGZyb20gc3RvcmFnZVxuICAgIHdpbmRvd1tpdGVtLnN0b3JhZ2VUeXBlXVsncmVtb3ZlSXRlbSddKHRoaXMuX29wdGlvbnMubmFtZXNwYWNlICsgJy4nICsgaXRlbS5rZXkpXG4gICAgLy8gUmVtb3ZlIGl0ZW0gZnJvbSBtZW1vcnkgb2JqZWN0XG4gICAgbGV0IGRiQ29uZmlnID0gdGhpcy5fZ2V0Q29uZmlnRnJvbUxTKClcbiAgICBkYkNvbmZpZ1t0aGlzLl9EQl9NRU1PUllfS0VZXSA9IGRiQ29uZmlnW3RoaXMuX0RCX01FTU9SWV9LRVldLmZpbHRlcigobWVtSXRlbSkgPT4gaXRlbS5rZXkgIT09IG1lbUl0ZW0ua2V5KVxuICAgIHRoaXMuX3NldENvbmZpZ1RvTFMoZGJDb25maWcpXG4gICAgdGhpcy5fc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogQ29Ccm93c2VyU3RvcmFnZUFjdGlvbnMuUkVNT1ZFRF9DT19TVE9SRV9JVEVNLFxuICAgICAgcGF5bG9hZDogaXRlbVxuICAgIH0pXG4gIH1cblxuICAvLyBTZXJpYWxpemUgLyBkZXNlcmlhbGl6ZSBhbmQgcGVyc2lzdCBjb25maWcgdG8gYnJvd3NlciBzdG9yYWdlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcHJpdmF0ZSBfZ2V0Q29uZmlnRnJvbUxTICgpIHtcbiAgICBsZXQgY29uZmlnU3RyID0gbG9jYWxTdG9yYWdlW3RoaXMuX29wdGlvbnMubmFtZXNwYWNlICsgJy4nICsgdGhpcy5fREJfQ09ORklHX0tFWV1cbiAgICBpZiAodHlwZW9mIGNvbmZpZ1N0ciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbmZpZ1N0cilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zZXRDb25maWdUb0xTIChjb25maWdPYmopIHtcbiAgICBsZXQgY29uZmlnU3RyID0gSlNPTi5zdHJpbmdpZnkoY29uZmlnT2JqKVxuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2VbdGhpcy5fb3B0aW9ucy5uYW1lc3BhY2UgKyAnLicgKyB0aGlzLl9EQl9DT05GSUdfS0VZXSA9IGNvbmZpZ1N0clxuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBjb21wb25lbnQgdXBvbiBsb2FkXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwdWJsaWMgaW5pdGlhbGl6ZSAob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zIC8vIHNhdmUgb3B0aW9ucyB0byBjbGFzc1xuICAgIHZhciBkYkNvbmZpZyA9IHRoaXMuX2dldENvbmZpZ0Zyb21MUygpXG4gICAgbGV0IHVwZGF0ZWRDb25maWdcbiAgICBpZiAoIWRiQ29uZmlnKSB7XG4gICAgICAvLyB0aGVyZSBpcyBubyBjdXJyZW50IHN0YXRlIHN0b3JlZCwgaW5pdGlhbGl6ZSBmcm9tIHNjcmF0Y2hcbiAgICAgIHVwZGF0ZWRDb25maWcgPSB0aGlzLl9pbml0RnJvbVNjcmF0Y2gob3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYSBjdXJyZW50IHN0YXRlIGlzIGV4aXN0aW5nLCB2YWxpZGF0ZSBhZ2FpbnN0IHNjaGVtYVxuICAgICAgdXBkYXRlZENvbmZpZyA9IHRoaXMuX2luaXRFeGlzdGluZyhvcHRpb25zLm5hbWVzcGFjZSwgZGJDb25maWcpXG4gICAgfVxuICAgIHRoaXMuX3N0b3JlLmRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IENvQnJvd3NlclN0b3JhZ2VBY3Rpb25zLkFEREVEX0NPX1NUT1JFX0lURU1TLFxuICAgICAgcGF5bG9hZDogdXBkYXRlZENvbmZpZ1t0aGlzLl9EQl9NRU1PUllfS0VZXVxuICAgIH0pXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBWYWxpZGF0ZSBlYWNoIGV4aXN0aW5nIGl0ZW0gZnJvbSBzdG9yYWdlIGFnYWluc3QgdGhlIG1lbW9yeSBvYmplY3RcbiAgcHJpdmF0ZSBfaW5pdEV4aXN0aW5nIChuYW1lc3BhY2UsIGRiQ29uZmlnKSB7XG4gICAgbGV0IGFjdHVhbE1lbW9yeSA9IGRiQ29uZmlnW3RoaXMuX0RCX01FTU9SWV9LRVldLm1hcCgobWVtb3J5SXRlbSkgPT4ge1xuICAgICAgdmFyIHN0b3JhZ2VJdGVtID0gd2luZG93W21lbW9yeUl0ZW0uc3RvcmFnZVR5cGVdW25hbWVzcGFjZSArICcuJyArIG1lbW9yeUl0ZW0ua2V5XVxuICAgICAgaWYgKHR5cGVvZiBzdG9yYWdlSXRlbSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gdGhlIGl0ZW0gZG9lc24ndCBleGlzdCBhdCBhbGwsIHNldCBpdFxuICAgICAgICB3aW5kb3dbbWVtb3J5SXRlbS5zdG9yYWdlVHlwZV1bbmFtZXNwYWNlICsgJy4nICsgbWVtb3J5SXRlbS5rZXldID0gbWVtb3J5SXRlbS52YWx1ZVxuICAgICAgICByZXR1cm4gbWVtb3J5SXRlbVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGFjdHVhbFZhbHVlID0gd2luZG93W21lbW9yeUl0ZW0uc3RvcmFnZVR5cGVdW25hbWVzcGFjZSArICcuJyArIG1lbW9yeUl0ZW0ua2V5XVxuICAgICAgICBpZiAoYWN0dWFsVmFsdWUgPT09IG1lbW9yeUl0ZW0udmFsdWUpIHtcbiAgICAgICAgICAvLyB0aGUgdmFsdWUgaGFzIG5vdCBiZWVuIHRvdWNoZWQgb3V0c2lkZSBvZiB0aGlzIEdVSVxuICAgICAgICAgIHJldHVybiBtZW1vcnlJdGVtXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdGhlIHZhbHVlIGhhcyBiZWVuIG1hbnVhbGx5IG1vZGlmaWVkIGJ5IGEgdXNlclxuICAgICAgICAgIGxldCB1cGRhdGVkTWVtb3J5SXRlbSA9IHtcbiAgICAgICAgICAgIGtleTogbWVtb3J5SXRlbS5rZXksXG4gICAgICAgICAgICB2YWx1ZTogYWN0dWFsVmFsdWUsXG4gICAgICAgICAgICBzdG9yYWdlVHlwZTogbWVtb3J5SXRlbS5zdG9yYWdlVHlwZSxcbiAgICAgICAgICAgIHZhbHVlVHlwZTogbWVtb3J5SXRlbS52YWx1ZVR5cGUsXG4gICAgICAgICAgICBpbkNvbmZpZ0ZpbGU6ICEhbWVtb3J5SXRlbS5pbkNvbmZpZ0ZpbGVcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHVwZGF0ZWRNZW1vcnlJdGVtXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGRiQ29uZmlnW3RoaXMuX0RCX01FTU9SWV9LRVldID0gYWN0dWFsTWVtb3J5XG4gICAgdGhpcy5fc2V0Q29uZmlnVG9MUyhkYkNvbmZpZylcbiAgICByZXR1cm4gZGJDb25maWdcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgdGhlIHN0b3JhZ2UgaXRlbXMgZnJvbSBzY3JhdGNoXG4gIHByaXZhdGUgX2luaXRGcm9tU2NyYXRjaCAob3B0aW9ucykge1xuICAgIGxldCBzdGF0ZUZvck1lbW9yeSA9IG9wdGlvbnMuaW5pdGlhbFN0YXRlLm1hcCgoc2NoZW1hSXRlbSkgPT4ge1xuICAgICAgLy8gdHJhbnNmb3JtIHRoZSBzY2hlbWEgdG8gdGhlIG1lbW9yeSB0eXBlXG4gICAgICB3aW5kb3dbc2NoZW1hSXRlbS5zdG9yYWdlVHlwZV1bb3B0aW9ucy5uYW1lc3BhY2UgKyAnLicgKyBzY2hlbWFJdGVtLmtleV0gPSBzY2hlbWFJdGVtLmRlZmF1bHRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtleTogc2NoZW1hSXRlbS5rZXksXG4gICAgICAgIHZhbHVlOiBzY2hlbWFJdGVtLmRlZmF1bHQsIC8vIGZyb20gc2NyYXRjaCwgdGhlIGRlZmF1bHQgaXMgdGhlIHZhbHVlXG4gICAgICAgIHN0b3JhZ2VUeXBlOiBzY2hlbWFJdGVtLnN0b3JhZ2VUeXBlLFxuICAgICAgICB2YWx1ZVR5cGU6IHNjaGVtYUl0ZW0udmFsdWVUeXBlLFxuICAgICAgICBpbkNvbmZpZ0ZpbGU6IHRydWUgLy8gb25seSB0aGUgb25lcyBmcm9tIHRoZSBjb25maWcgZmlsZSBhcmUgaGVyZSwgdXNlZCBmb3IgJ3Jlc2V0JyBmdW5jdGlvbmFsaXR5XG4gICAgICB9XG4gICAgfSlcbiAgICBsZXQgZGJDb25maWcgPSB7fVxuICAgIGRiQ29uZmlnW3RoaXMuX0RCX0lOSVRJQUxfS0VZXSA9IG9wdGlvbnMuaW5pdGlhbFN0YXRlXG4gICAgZGJDb25maWdbdGhpcy5fREJfTUVNT1JZX0tFWV0gPSBzdGF0ZUZvck1lbW9yeVxuICAgIHRoaXMuX3NldENvbmZpZ1RvTFMoZGJDb25maWcpXG4gICAgcmV0dXJuIGRiQ29uZmlnXG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL25vZGVfbW9kdWxlcyJ9
