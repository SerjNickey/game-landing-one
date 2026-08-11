import "./WebViewCloseBtn.css";
import closeIcon from "../../../public/images/WebViewCloseBtn/close.svg";

export const WebViewCloseBtn = () => {
  const el = document.createElement("div");
  el.innerHTML = `
  <button id="webview-close-btn"><img src="${closeIcon}" alt="Close" class="webview-close-btn__icon"></button>
  `;
  return el;
};
