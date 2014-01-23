// Define a "class" representing a promise, allowing readable and understandable code to be
// written to support asynchronous methods and their callbacks. Instances created from this
// "class" adhere to the Promises/A+ specification detailed at http://promisesaplus.com and
// pass all the official unit tests found at https://github.com/promises-aplus/promises-tests
// which prove compliance of this specification.
var Promise = (function() {

    // Define the three possible states a promise can take - "pending" - the default value
    // meaning it has not resolved yet, "fulfilled" - meaning the promise has resolved
    // successfully, and "rejected" - meaning the promise has failed and an error has occurred
    var state = {
            PENDING: "pending",
            FULFILLED: "fulfilled",
            REJECTED: "rejected"
        },
        Promise;

    // Define the "class" to represent a promise
    Promise = function(asyncFunction) {
        var that = this;

        // Define two functions which will be passed to the asynchronous function
        // represented by this promise. The first will be executed if the asynchronous
        // function executed successfully, the second will be executed if the execution
        // failed in some way
        function success(value) {

            // Executes the resolve() method of this promise, which will ensure that any
            // functions linked to this promise to be executed once its asynchronous method
            // has executed successfully is executed at this point
            that.resolve(value);
        }

        function failure(reason) {

            // Executes the reject() method of this promise, which will execute any
            // linked callback functions for displaying or handling errors. Any further
            // associated promises chained to this one will not be executed.
            that.reject(reason);
        }

        // Initialize the callbacks property as an empty list
        this.callbacks = [];

        // If an asynchronous function is passed to this promise at instantiation, it is
        // executed immediately, and the success() and failure() functions defined above
        // are passed in as function parameters. The asynchronous function must ensure it
        // executes the most appropriate of these two functions depending on the outcome
        // of the behaviour it is attempting to perform
        if (typeof asyncFunction === "function") {
            asyncFunction(success, failure);
        }
    };

    Promise.prototype = {
        state: state.PENDING,

        // Define a property to be used to store callback functions to call once the
        // asynchronous method has completed execution
        callbacks: null,

        // Define a property to store the value returned by the asynchronous method represented
        // by this promise
        value: null,

        // Define a property to store the details of any error that occurs as a result of
        // executing the asynchronous method
        error: null,

        // Define a then() method, the crux of the Promises/A+ spec, which allows callbacks to
        // be associated to the result of the asynchronous function's execution depending on
        // whether that function completed its task successfully or not. It allows chaining of
        // promises to each other to allow further asynchronous functions to be executed at
        // the point at which the current one is completed successfully
        then: function(onFulfilled, onRejected) {

            // Create a new promise (and return it at the end of this method) to allow for
            // chaining of calls to then()
            var promise = new Promise(),

                // Define a callback object to be stored in this promise and associate the new
                // promise instance to it to act as the context of any callback methods
                callback = {
                    promise: promise
                };

            // If a function was provided to be executed on successful completion of the
            // asynchronous function's action, store that function in the callback object
            // together with its newly created promise as context
            if (typeof onFulfilled === "function") {
                callback.fulfill = onFulfilled;
            }

            // If a function was provided to be executed on unsuccessful completion of the
            // asynchronous function's action, store that function in the callback object
            // together with the new context promise
            if (typeof onRejected === "function") {
                callback.reject = onRejected;
            }

            // Add the callback object to the list of callbacks
            this.callbacks.push(callback);

            // Attempt to execute the stored callbacks (will only do this if the asynchronous
            // function has completed execution by this point - if not, it will be called at
            // such time as it has by other code in the "class")
            this.executeCallbacks();

            // Return the newly created promise, to allow for chaining of other asynchronous
            // functions through repeated calls to the then() method
            return promise;
        },

        // Define a method to execute any callbacks associated with this promise if the
        // associated asynchronous function has completed execution
        executeCallbacks: function() {
            var that = this,
                value,
                callback;

            // Define two functions to use as defaults to execute if an equivalent function has
            // not been stored in the list of callbacks tied to this promise
            function fulfill(value) {
                return value;
            }

            function reject(reason) {
                throw reason;
            }

            // Only execute the callbacks if the promise is not in its pending state, i.e. that
            // the asynchronous function has completed execution
            if (this.state !== state.PENDING) {

                // Point 2.2.4 of the Promises/A+ spec dictates that callback functions should
                // be executed asynchronously, outside of the flow of any other calls to then()
                // which might take place. This ensures the whole chain of promises is in place
                // before calls to the callbacks take place. Using a setTimeout with a delay of
                // 0 milliseconds gives the JavaScript engine a split second to complete the
                // process of going through the promise chain before any callbacks are run.
                // Browsers have a minimum delay value possible for a setTimeout call so in
                // reality the callbacks will be executed after, typically, 4 milliseconds
                setTimeout(function() {

                    // Loop through all the callbacks associated with this promise and execute
                    // them each in turn, selecting the callback's fulfill method if the promise
                    // was fulfilled (by the asynchronous function completing execution
                    // successfully), or its reject method if the function returned an error
                    // during execution
                    while(that.callbacks.length) {
                        callback = that.callbacks.shift();

                        // Wrap the execution of the callback in a try/catch block, in case it
                        // throws an error. We don't want the promise chain to stop executing if
                        // an error is thrown, rather we want to reject the promise, allowing
                        // the calling code to handle the error itself
                        try {

                            // Execute the appropriate callback method based on the state of
                            // the promise. If no callback method has been associated, fall
                            // back to the default fulfill() and reject() functions defined at
                            // the top of the executeCallbacks() method, above
                            if (that.state === state.FULFILLED) {
                                value = (callback.fulfill || fulfill)(that.value);
                            } else {
                                value = (callback.reject || reject)(that.error);
                            }

                            // Pass the result of executing the callback function to the
                            // resolve() method, which will either mark the promise as fulfilled
                            // or continue to further execute chained calls to the then() method
                            callback.promise.resolve(value);
                        } catch (reason) {

                            // If an error is thrown by the callback
                            callback.promise.reject(reason);
                        }
                    }
                }, 0);
            }
        },

        // The fulfill() method will mark this promise as fulfilled provided it has not already
        // been fulfilled or rejected before. Any associated callbacks will be executed at
        // this point
        fulfill: function(value) {

            // Only transition the promise to the fulfilled state if it is still in the pending
            // state, and a value is passed to this method when it is executed
            if (this.state === state.PENDING && arguments.length) {
                this.state = state.FULFILLED;
                this.value = value;

                this.executeCallbacks();
            }
        },

        // The reject() method will mark this promise as rejected provided it has not already
        // been fulfilled or rejected before. Any associated callbacks will be executed at
        // this point
        reject: function(reason) {

            // Only transition the promise to the rejected state if it is still in the pending
            // state, and a value is passed to this method when it is executed
            if (this.state === state.PENDING && arguments.length) {
                this.state = state.REJECTED;
                this.error = reason;

                this.executeCallbacks();
            }
        },

        // The resolve() method
        resolve: function(value) {
            var promise = this,
                valueIsThisPromise = promise === value,
                valueIsAPromise = value && value.constructor === Promise,
                valueIsThenable = value && (typeof value === "object" || typeof value === "function"),
                isExecuted = false,
                then;

            if (valueIsThisPromise) {
                promise.reject(new TypeError()); // 2.3.1 - return as a TypeError
            } else if (valueIsAPromise) {

                // If the supplied value is a promise, then adopt its state for this promise
                if (value.state === state.FULFILLED) {
                    promise.fulfill(value.value);
                } else if (value.state === state.REJECTED) {
                    promise.reject(value.error);
                } else {
                    value.then(function(value) {
                        // Carry on down the promise chain
                        promise.resolve(value);
                    }, function(reason) {
                        promise.reject(reason);
                    });
                }
            } else if (valueIsThenable) {
                try {
                    then = value.then;

                    if (typeof then === "function") {
                        then.call(value, function(successValue) {
                            if (!isExecuted) {
                                isExecuted = true;
                                promise.resolve(successValue);
                            }
                        }, function(reason) {
                            if (!isExecuted) {
                                isExecuted = true;
                                promise.reject(reason);
                            }
                        });
                    } else {
                        promise.fulfill(value);
                    }
                } catch (reason) {
                    if (!isExecuted) {
                        isExecuted = true;
                        promise.reject(reason);
                    }
                }
            } else {
                promise.fulfill(value);
            }
        }
    };

    // Add a bonus method, all(), which isn't part of the Promises/A+ spec, but is part of the
    // spec for ECMAScript 6 Promises, which bring the benefits of promises straight into the
    // JavaScript language itself. This method allows multiple asynchronous methods, represented
    // as promises, to execute simulataneously and to execute a single callback function at such
    // time as all of the methods have completed execution.
    Promise.all = function(promises) {
        var index = 0,
            length = promises.length;

        return new Promise(function(fulfill, reject) {
            var promise,
                results = [];

            function callback(result, index) {
                results[index] = result;

                if (results.length === length) {
                    fulfill(results);
                }
            }

            function errorCallback(error) {
                reject(error);
            }

            function resolvePromise(promise, index) {
                promise.then(function(result) {
                    callback(result, index);
                }, errorCallback);
            }

            for (; index < length; index++) {
                promise = promises[index];
                resolvePromise(promise, index);
            }
        });
    };

    return Promise;
}());

if (module && module.exports) {
    module.exports = Promise;
}