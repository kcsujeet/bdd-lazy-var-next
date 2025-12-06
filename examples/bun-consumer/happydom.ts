import { Window } from "happy-dom";

const window = new Window();
const document = window.document;

Object.assign(global, {
	window,
	document,
	HTMLElement: window.HTMLElement,
	Node: window.Node,
	Text: window.Text,
	navigator: window.navigator,
	location: window.location,
	history: window.history,
	localStorage: window.localStorage,
	sessionStorage: window.sessionStorage,
	// console: window.console, // Do not patch console, it might cause hangs
	setTimeout: window.setTimeout,
	clearTimeout: window.clearTimeout,
	setInterval: window.setInterval,
	clearInterval: window.clearInterval,
});

// NOTE: GlobalRegistrator.register() causes tests to hang in Bun for some reason. It has been an issue in the past.
// Most probably it has regressed again. Therefore, we are manually assigning globals above.

// import { GlobalRegistrator } from "@happy-dom/global-registrator";
// GlobalRegistrator.register();
