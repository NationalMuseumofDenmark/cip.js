if(typeof(window) == "undefined") {
  window = {};
}
// Shim to avoid failures on browsers without console.
window.console = window.console || {log: function() {}, error: function() {}, warn: function() {}, trace: function() {}};

// Handy assertion function
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};


if(typeof(exports) != "undefined") {
	exports.assert = assert;
} else {
	window.cip_common = {
		assert: assert
	};
}
