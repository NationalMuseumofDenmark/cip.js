
// Handy assertion function
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

exports.assert = assert;
