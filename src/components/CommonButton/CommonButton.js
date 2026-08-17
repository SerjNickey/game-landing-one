import "./CommonButton.css";

/**
 * @param {{
 *   label?: string,
 *   onClick?: (event: MouseEvent) => void,
 *   type?: "button" | "submit" | "reset",
 *   disabled?: boolean,
 *   className?: string,
 * }} [props]
 */
export const CommonButton = ({
  label = "",
  onClick,
  type = "button",
  disabled = false,
  className = "",
} = {}) => {
  const el = document.createElement("div");
  el.className = ["common-button", className].filter(Boolean).join(" ");

  const button = document.createElement("button");
  button.type = type;
  button.className = "common-button__btn";
  button.textContent = label;
  button.disabled = disabled;

  if (typeof onClick === "function") {
    button.addEventListener("click", onClick);
  }

  el.append(button);
  return el;
};
