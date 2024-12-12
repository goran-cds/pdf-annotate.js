import setAttributes from "../utils/setAttributes";
import normalizeColor from "../utils/normalizeColor";

/**
 * Create a custom signature block component from an annotation definition.
 * This is used for annotations of type `signature`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement} A svg to be rendered
 */
export default function renderSignatureBlock(a) {
  let signatureBlock = createSignatureBlock(a);

  return signatureBlock;
}

function createSignatureBlock(a) {
  let group = document.createElementNS("http://www.w3.org/2000/svg", "g");

  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  setAttributes(rect, {
    x: a.cx - 50,
    y: a.cy - 15,
    width: 100,
    height: 30,
    fill: "#f9fac3",
  });

  // Append the shape to the group
  group.appendChild(rect);

  // Inline SVG for the pen icon
  let penIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  setAttributes(penIcon, {
    x: a.cx - 40,
    y: a.cy - 6,
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  });
  let penPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  setAttributes(penPath, {
    d: "M15.4998 5.50067L18.3282 8.3291M13 21H21M3 21.0004L3.04745 20.6683C3.21536 19.4929 3.29932 18.9052 3.49029 18.3565C3.65975 17.8697 3.89124 17.4067 4.17906 16.979C4.50341 16.497 4.92319 16.0772 5.76274 15.2377L17.4107 3.58969C18.1918 2.80865 19.4581 2.80864 20.2392 3.58969C21.0202 4.37074 21.0202 5.63707 20.2392 6.41812L8.37744 18.2798C7.61579 19.0415 7.23497 19.4223 6.8012 19.7252C6.41618 19.994 6.00093 20.2167 5.56398 20.3887C5.07171 20.5824 4.54375 20.6889 3.48793 20.902L3 21.0004Z",
    stroke: "#545225",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
  penIcon.appendChild(penPath);
  group.appendChild(penIcon);

  // Text element
  let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  setAttributes(text, {
    x: a.cx + 5,
    y: a.cy + 1,
    "font-size": 8,
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    fill: "#545225",
  });
  text.textContent = "Signature area";

  group.appendChild(text);

  return group;
}
