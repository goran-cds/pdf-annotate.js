import setAttributes from "../utils/setAttributes";
import normalizeColor from "../utils/normalizeColor";

/**
 * Create an SVGCircleElement from an annotation definition.
 * This is used for annotations of type `circle`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement|SVGCircleElement} A circle to be rendered
 */
export default function renderCircle(a) {
  let circle = createCircle(a);
  let color = normalizeColor(a.color || "#f00");

  if (a.type === "circle") {
    setAttributes(circle, {
      stroke: color,
      fill: "none",
      "stroke-width": 5,
    });
  }
  if (a.type === "emptycircle") {
    setAttributes(circle, {
      stroke: color,
      fill: "none",
      "stroke-width": 2,
    });
  }

  return circle;
}

function createCircle(a) {
  let group = document.createElementNS("http://www.w3.org/2000/svg", "g");

  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  setAttributes(rect, {
    x: a.cx - 30,
    y: a.cy - 15,
    width: 60,
    height: 30,
    fill: "#fef18b",
  });

  // Append the shape to the group
  group.appendChild(rect);

  // Add a hardcoded text element
  let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  setAttributes(text, {
    x: a.cx,
    y: a.cy,
    "font-size": 8,
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    fill: "#854d0f",
  });
  text.textContent = "Signature area";

  group.appendChild(text);

  return group;
}
