Promises, Promises
==================

A simple JavaScript implementation of the Promises/A+ spec: http://promisesaplus.com/

Also features the `Promise.all()` method from ES6 Promises - because it's great.

## Usage
```
<script src="promise.js"></script>
<script>
    function wait(delayInMilliseconds) {
        return new Promise(function(success, failure) {
            if (delayInMilliseconds <= 0) {
                failure(delayInMilliseconds + " is not a valid value.");
            }

            setTimeout(function() {
                success(delayInMilliseconds);
            }, delayInMilliseconds);
        });
    }

    function onSuccess(waitTimeInMilliseconds) {
        console.log("Waited for " + waitTimeInMilliseconds + "ms");
    }

    function onFailure(error) {
        console.log(error);
    }

    // Wait for 2 seconds, then execute onSuccess(). If an error occurs, execute onError instead
    wait(2000).then(onSuccess, onError);
</script>
```
## Checking compliance
- Install the test suite locally (https://github.com/promises-aplus/promises-tests) using `npm install`.
- Run the test suite against this library using `npm test`. Everything should pass!