var Promise = require('./promise.js');

// Expose an adapter to use with the Promises/A+ spec test suite
module.exports = {
    resolved: function(value) {
        return new Promise(function(success) {
            success(value);
        });
    },

    rejected: function(reason) {
        return new Promise(function(success, failure) {
            failure(reason);
        });
    },

    deferred: function() {
        var resolve,
            reject,
            promise = new Promise(function(success, failure) {
                resolve = success;
                reject = failure;
            });

        return {
            promise: promise,
            resolve: resolve,
            reject: reject
        };
    }
};