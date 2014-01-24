Promise The Earth
=================

A simple, fully-compliant JavaScript implementation of the Promises/A+ spec: http://promisesaplus.com/

Also features the `Promise.all()` method from ES6 Promises - because it's great.

Clocks in at 1.67KB minified (696 bytes gzipped).

## Usage
```
<script src="promise.min.js"></script>
<script>

    // An asynchronous function that waits a certain number of milliseconds. Returns a promise.
    function wait(delayInMilliseconds) {
        return new Promise(function(success, failure) {
            if (delayInMilliseconds <= 0) {
                failure(delayInMilliseconds + " is not a valid value.");
            } else {
                setTimeout(function() {
                    success(delayInMilliseconds);
                }, delayInMilliseconds);
            }
        });
    }

    // Wait for 2 seconds, then execute onSuccess(). If an error occurs, execute onError instead.
    function onSuccess(waitTimeInMilliseconds) {
        console.log("Waited for " + waitTimeInMilliseconds + "ms");
    }

    function onFailure(error) {
        console.log(error);
    }

    wait(2000).then(onSuccess, onError);

    // Execute multiple asynchronous functions simultaneously
    Promise.all([wait(2000), wait(1000), wait(500)], function(values) {
        console.log("Execution will take 2000 milliseconds as each function is executed simultaneously");
        console.log(values); // [2000, 1000, 500]
    })
</script>
```
## Compliance
- Install the test suite locally (https://github.com/promises-aplus/promises-tests) using `npm install`.
- Run the test suite against this library using `npm test`. Everything should pass!
