import PDFJSAnnotate from "../PDFJSAnnotate";
import { appendChild } from "../render/appendChild";
import { findSVGAtPoint, getMetadata, convertToSvgPoint } from "./utils";

let _enabled = false;
let _type;
let _width = 100;
let _height = 30;
let _color = "F9FAC3";

/**
 * Set the attributes of the pen.
 *
 * @param {Number} width The radius of the circle
 * @param {String} color The color of the circle
 */
export function setSignatureBlock(width = 100, color = "F9FAC3") {
  _width = parseInt(width, 10);
  _color = color;
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  let svg = findSVGAtPoint(e.clientX, e.clientY);
  if (!svg) {
    return;
  }
  let rect = svg.getBoundingClientRect();

  const event = new CustomEvent("annotation:placed", {
    detail: {
      toolType: _type,
      content: svg,
      position: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      size: { w: _width, h: _height },
    },
  });

  saveSignatureBlock(
    svg,
    _type,
    {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    },
    _width,
    _height,
    _color
  );

  document.dispatchEvent(event);
}

/**
 * Save a signature annotation
 *
 * @param {SVGElement} svg
 * @param {String} type The type of signature block (signature)
 * @param {Object} pt The point to use for annotation
 * @param {float} width
 * * @param {float} height
 * @param {String} color The color of the rects
 */
function saveSignatureBlock(svg, type, pt, width, height, color) {
  // Initialize the annotation
  let svg_pt = convertToSvgPoint([pt.x, pt.y], svg);
  let annotation = {
    type,
    color,
    cx: svg_pt[0],
    cy: svg_pt[1],
    w: width,
    h: height,
  };

  let { documentId, pageNumber } = getMetadata(svg);

  // Add the annotation
  PDFJSAnnotate.getStoreAdapter()
    .addAnnotation(documentId, pageNumber, annotation)
    .then((annotation) => {
      appendChild(svg, annotation);
    });
}

/**
 * Enable signature block behavior
 */
export function enableSignatureBlock(type) {
  _type = type;

  if (_enabled) {
    return;
  }

  _enabled = true;
  document.addEventListener("mouseup", handleDocumentMouseup);
}

/**
 * Disable signature block behavior
 */
export function disableSignatureBlock() {
  if (!_enabled) {
    return;
  }

  _enabled = false;
  document.removeEventListener("mouseup", handleDocumentMouseup);
}

export function addSignatureBlock(type, e) {
  let oldType = _type;
  _type = type;
  handleDocumentMouseup(e);
  _type = oldType;
}
