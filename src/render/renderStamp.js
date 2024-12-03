import setAttributes from "../utils/setAttributes";
import normalizeColor from "../utils/normalizeColor";
/**
 * Create an SVGRectElement from an annotation definition.
 * This is used for annotations of type `stamp`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGRectElement} A rectangle to be rendered
 */
export default function renderStamp(a) {
  let rect = createRect(a);
  let color = normalizeColor(a.color || "#FFFF00"); // Default color for stamp

  setAttributes(rect, {
    fill: color,
    stroke: color,
    "stroke-width": 1, // Optional: a border stroke width
  });

  return rect;
}

/**
 * Create an SVGRectElement with the given attributes.
 *
 * @param {Object} a The annotation definition
 * @return {SVGRectElement} A rectangle element
 */
function createRect(a) {
  let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  setAttributes(rect, {
    x: a.rectangles[0].x,
    y: a.rectangles[0].y,
    width: a.rectangles[0].width,
    height: a.rectangles[0].height,
  });

  return rect;
}
