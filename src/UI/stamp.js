import PDFJSAnnotate from "../PDFJSAnnotate";
import config from "../config";
import { appendChild } from "../render/appendChild";
import {
  BORDER_COLOR,
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  getMetadata,
  convertToSvgRect,
} from "./utils";

let _enabled = false;
let overlay;
let originY;
let originX;

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousedown(e) {
  let svg;
  if (!(svg = findSVGAtPoint(e.clientX, e.clientY))) {
    return;
  }

  let rect = svg.getBoundingClientRect();
  originY = e.clientY;
  originX = e.clientX;

  overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = `${originY - rect.top}px`;
  overlay.style.left = `${originX - rect.left}px`;
  overlay.style.backgroundColor = "#FFFF00"; // Default fill color
  overlay.style.border = `1px solid ${BORDER_COLOR}`;
  svg.parentNode.appendChild(overlay);

  document.addEventListener("mousemove", handleDocumentMousemove);
  disableUserSelect();
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousemove(e) {
  let svg = overlay.parentNode.querySelector(config.annotationSvgQuery());
  let rect = svg.getBoundingClientRect();

  if (originX + (e.clientX - originX) < rect.right) {
    overlay.style.width = `${e.clientX - originX}px`;
  }

  if (originY + (e.clientY - originY) < rect.bottom) {
    overlay.style.height = `${e.clientY - originY}px`;
  }
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  if (!overlay) {
    return;
  }

  let svg = overlay.parentNode.querySelector(config.annotationSvgQuery());
  let rect = svg.getBoundingClientRect();

  saveStamp(
    [
      {
        top: parseInt(overlay.style.top, 10) + rect.top,
        left: parseInt(overlay.style.left, 10) + rect.left,
        width: parseInt(overlay.style.width, 10),
        height: parseInt(overlay.style.height, 10),
      },
    ],
    "#FFFF00"
  ); // Default fill color

  overlay.parentNode.removeChild(overlay);
  overlay = null;

  document.removeEventListener("mousemove", handleDocumentMousemove);
  enableUserSelect();
}

/**
 * Save a stamp annotation
 *
 * @param {Array} rects The rects to use for annotation
 * @param {String} color The fill color of the stamp
 */
function saveStamp(rects, color) {
  let svg = findSVGAtPoint(rects[0].left, rects[0].top);
  let annotation;

  if (!svg) {
    return;
  }

  let boundingRect = svg.getBoundingClientRect();

  annotation = {
    type: "stamp",
    color, // Fill color
    rectangles: [...rects]
      .map((r) =>
        convertToSvgRect(
          {
            y: r.top - boundingRect.top,
            x: r.left - boundingRect.left,
            width: r.width,
            height: r.height,
          },
          svg
        )
      )
      .filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1),
  };

  let { documentId, pageNumber } = getMetadata(svg);

  PDFJSAnnotate.getStoreAdapter()
    .addAnnotation(documentId, pageNumber, annotation)
    .then((annotation) => {
      appendChild(svg, annotation);
    });
}

/**
 * Enable stamp behavior
 */
export function enableStamp() {
  if (_enabled) {
    return;
  }

  _enabled = true;
  document.addEventListener("mouseup", handleDocumentMouseup);
  document.addEventListener("mousedown", handleDocumentMousedown);
}

/**
 * Disable stamp behavior
 */
export function disableStamp() {
  if (!_enabled) {
    return;
  }

  _enabled = false;
  document.removeEventListener("mouseup", handleDocumentMouseup);
  document.removeEventListener("mousedown", handleDocumentMousedown);
}
