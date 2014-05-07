if(typeof(window) == "undefined") {
  window = {};
}
// Shim to avoid failures on browsers without console.
window.console = window.console || {log: function() {}, error: function() {}};

// Handy assertion function
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

exports.assert = assert;
