import "./index.css";
import App from "./index.svelte";
import "./markdown.css";

const app = new App({
  target: document.body
});

window.app = app;

export default app;
