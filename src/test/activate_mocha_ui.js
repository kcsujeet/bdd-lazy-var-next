import "../../dist/mocha.js";

if (window.mocha) {
	mocha.ui("bdd-lazy-var-next");
	mocha.suite.emit("pre-require", window, null, mocha);
}
