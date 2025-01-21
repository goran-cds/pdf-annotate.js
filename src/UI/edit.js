import PDFJSAnnotate from "../PDFJSAnnotate";
import config from "../config";
import { addEventListener, removeEventListener } from "./event";
import {
  BORDER_COLOR,
  disableUserSelect,
  enableUserSelect,
  findSVGContainer,
  findSVGAtPoint,
  getOffsetAnnotationRect,
  getMetadata,
  convertToSvgPoint,
} from "./utils";

let _enabled = false;
let isDragging = false;
let overlay;
let dragOffsetX, dragOffsetY, dragStartX, dragStartY;
const OVERLAY_BORDER_SIZE = 3;

/**
 * Create an overlay for editing an annotation.
 *
 * @param {Element} target The annotation element to apply overlay for
 */
function createEditOverlay(target) {
  destroyEditOverlay();

  overlay = document.createElement("div");
  let anchor = document.createElement("a");
  let parentNode = findSVGContainer(target).parentNode;
  let id = target.getAttribute("data-pdf-annotate-id");
  let rect = getOffsetAnnotationRect(target);
  let styleLeft = rect.left - OVERLAY_BORDER_SIZE;
  let styleTop = rect.top - OVERLAY_BORDER_SIZE;

  overlay.setAttribute("id", "pdf-annotate-edit-overlay");
  overlay.setAttribute("data-target-id", id);
  overlay.style.boxSizing = "content-box";
  overlay.style.position = "absolute";
  overlay.style.top = `${styleTop}px`;
  overlay.style.left = `${styleLeft}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.border = `${OVERLAY_BORDER_SIZE}px solid ${BORDER_COLOR}`;
  overlay.style.borderRadius = `${OVERLAY_BORDER_SIZE}px`;
  overlay.style.zIndex = 20100;

  anchor.innerHTML = "×";
  anchor.setAttribute("href", "javascript://");
  anchor.style.background = "#fff";
  anchor.style.borderRadius = "20px";
  anchor.style.border = "1px solid #bbb";
  anchor.style.color = "#bbb";
  anchor.style.fontSize = "16px";
  anchor.style.padding = "2px";
  anchor.style.textAlign = "center";
  anchor.style.textDecoration = "none";
  anchor.style.position = "absolute";
  anchor.style.top = "-13px";
  anchor.style.right = "-13px";
  anchor.style.width = "25px";
  anchor.style.height = "25px";

  overlay.appendChild(anchor);
  parentNode.appendChild(overlay);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keyup", handleDocumentKeyup);
  document.addEventListener("mousedown", handleDocumentMousedown);
  anchor.addEventListener("click", deleteAnnotation);
  anchor.addEventListener("mouseover", () => {
    anchor.style.color = "#35A4DC";
    anchor.style.borderColor = "#999";
    anchor.style.boxShadow = "0 1px 1px #ccc";
  });
  anchor.addEventListener("mouseout", () => {
    anchor.style.color = "#bbb";
    anchor.style.borderColor = "#bbb";
    anchor.style.boxShadow = "";
  });
  overlay.addEventListener("mouseover", () => {
    if (!isDragging) {
      anchor.style.display = "";
    }
  });
  overlay.addEventListener("mouseout", () => {
    anchor.style.display = "none";
  });
}

/**
 * Destroy the edit overlay if it exists.
 */
function destroyEditOverlay() {
  if (overlay) {
    overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keyup", handleDocumentKeyup);
  document.removeEventListener("mousedown", handleDocumentMousedown);
  document.removeEventListener("mousemove", handleDocumentMousemove);
  document.removeEventListener("mouseup", handleDocumentMouseup);
  enableUserSelect();
}

/**
 * Delete currently selected annotation
 */
function deleteAnnotation() {
  if (!overlay) {
    return;
  }

  let annotationId = overlay.getAttribute("data-target-id");
  let svg = overlay.parentNode.querySelector(config.annotationSvgQuery());
  let { documentId } = getMetadata(svg);

  PDFJSAnnotate.getStoreAdapter()
    .deleteAnnotation(documentId, annotationId)
    .then(() => {
      let nodes = document.querySelectorAll(
        `[data-pdf-annotate-id="${annotationId}"]`
      );

      [...nodes].forEach((n) => {
        n.parentNode.removeChild(n);
      });
    });

  destroyEditOverlay();
}

/**
 * Handle document.click event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentClick(e) {
  if (!findSVGAtPoint(e.clientX, e.clientY)) {
    return;
  }

  // Remove current overlay
  let overlay = document.getElementById("pdf-annotate-edit-overlay");
  if (overlay) {
    if (isDragging || e.target === overlay) {
      return;
    }

    destroyEditOverlay();
  }
}

/**
 * Handle document.keyup event
 *
 * @param {KeyboardEvent} e The DOM event that needs to be handled
 */
function handleDocumentKeyup(e) {
  // keyCode is deprecated, so prefer the newer "key" method if possible
  let keyTest;
  if (e.key) {
    keyTest =
      e.key.toLowerCase() === "delete" || e.key.toLowerCase() === "backspace";
  } else {
    keyTest = e.keyCode === 8 || e.keyCode === 46;
  }
  if (
    overlay &&
    keyTest &&
    e.target.nodeName.toLowerCase() !== "textarea" &&
    e.target.nodeName.toLowerCase() !== "input"
  ) {
    e.preventDefault();
    deleteAnnotation();
  }
}

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentMousedown(e) {
  if (e.target !== overlay) {
    return;
  }

  // Highlight and strikeout annotations are bound to text within the document.
  // It doesn't make sense to allow repositioning these types of annotations.
  let annotationId = overlay.getAttribute("data-target-id");
  let target = document.querySelector(
    `[data-pdf-annotate-id="${annotationId}"]`
  );
  let type = target.getAttribute("data-pdf-annotate-type");

  if (type === "highlight" || type === "strikeout") {
    return;
  }

  isDragging = true;
  dragOffsetX = e.clientX;
  dragOffsetY = e.clientY;
  dragStartX = overlay.offsetLeft;
  dragStartY = overlay.offsetTop;

  overlay.style.background = "rgba(255, 255, 255, 0.7)";
  overlay.style.cursor = "move";
  overlay.querySelector("a").style.display = "none";

  document.addEventListener("mousemove", handleDocumentMousemove);
  document.addEventListener("mouseup", handleDocumentMouseup);
  disableUserSelect();
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentMousemove(e) {
  let parentNode = overlay.parentNode;
  let rect = parentNode.getBoundingClientRect();
  let y = dragStartY + (e.clientY - dragOffsetY);
  let x = dragStartX + (e.clientX - dragOffsetX);
  let minY = 0;
  let maxY = rect.height;
  let minX = 0;
  let maxX = rect.width;

  if (y > minY && y + overlay.offsetHeight < maxY) {
    overlay.style.top = `${y}px`;
  }

  if (x > minX && x + overlay.offsetWidth < maxX) {
    overlay.style.left = `${x}px`;
  }
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event that needs to be handled
 */
function handleDocumentMouseup(e) {
  let annotationId = overlay.getAttribute("data-target-id");
  let target = document.querySelectorAll(
    `[data-pdf-annotate-id="${annotationId}"]`
  );
  let type = target[0].getAttribute("data-pdf-annotate-type");
  let svg = overlay.parentNode.querySelector(config.annotationSvgQuery());
  let { documentId } = getMetadata(svg);

  overlay.querySelector("a").style.display = "";

  PDFJSAnnotate.getStoreAdapter()
    .getAnnotation(documentId, annotationId)
    .then((annotation) => {
      let attribX = "x";
      let attribY = "y";
      if (["circle", "fillcircle", "emptycircle"].indexOf(type) > -1) {
        attribX = "cx";
        attribY = "cy";
      }

      if (type === "point") {
        return;
      } else if (
        [
          "area",
          "highlight",
          "textbox",
          "circle",
          "fillcircle",
          "emptycircle",
        ].indexOf(type) > -1
      ) {
        let modelStart = convertToSvgPoint([dragStartX, dragStartY], svg);
        let modelEnd = convertToSvgPoint(
          [overlay.offsetLeft, overlay.offsetTop],
          svg
        );
        let modelDelta = {
          x: modelEnd[0] - modelStart[0],
          y: modelEnd[1] - modelStart[1],
        };

        if (type === "textbox") {
          target = [target[0].firstChild];
        }

        [...target].forEach((t, i) => {
          let modelX = parseInt(t.getAttribute(attribX), 10);
          let modelY = parseInt(t.getAttribute(attribY), 10);
          if (modelDelta.y !== 0) {
            modelY = modelY + modelDelta.y;

            t.setAttribute(attribY, modelY);
            if (annotation.rectangles && i < annotation.rectangles.length) {
              annotation.rectangles[i].y = modelY;
            } else if (annotation[attribY]) {
              annotation[attribY] = modelY;
            }
          }
          if (modelDelta.x !== 0) {
            modelX = modelX + modelDelta.x;

            t.setAttribute(attribX, modelX);
            if (annotation.rectangles && i < annotation.rectangles.length) {
              annotation.rectangles[i].x = modelX;
            } else if (annotation[attribX]) {
              annotation[attribX] = modelX;
            }
          }
        });
      } else if (type === "signature") {
        let modelStart = convertToSvgPoint([dragStartX, dragStartY], svg);
        let modelEnd = convertToSvgPoint(
          [overlay.offsetLeft, overlay.offsetTop],
          svg
        );
        let modelDelta = {
          x: modelEnd[0] - modelStart[0],
          y: modelEnd[1] - modelStart[1],
        };

        [...target].forEach((t, i) => {
          let rect = t.querySelector("rect");
          let penIcon = t.querySelector("svg");
          let text = t.querySelector("text");

          let sigX = parseFloat(rect.getAttribute(attribX));
          let sigY = parseFloat(rect.getAttribute(attribY));

          let sigIconX = parseFloat(penIcon.getAttribute(attribX));
          let sigIconY = parseFloat(penIcon.getAttribute(attribY));

          let sigTextX = parseFloat(text.getAttribute(attribX));
          let sigTextY = parseFloat(text.getAttribute(attribY));

          if (modelDelta.y !== 0) {
            sigY = sigY + modelDelta.y;
            sigIconY = sigIconY + modelDelta.y;
            sigTextY = sigTextY + modelDelta.y;

            rect.setAttribute(attribY, sigY);
            penIcon.setAttribute(attribY, sigIconY);
            text.setAttribute(attribY, sigTextY);
            annotation.cy = sigY + 15;
          }
          if (modelDelta.x !== 0) {
            sigX = sigX + modelDelta.x;
            sigIconX = sigIconX + modelDelta.x;
            sigTextX = sigTextX + modelDelta.x;

            rect.setAttribute(attribX, sigX);
            penIcon.setAttribute(attribX, sigIconX);
            text.setAttribute(attribX, sigTextX);
            annotation.cx = sigX + 50;
          }
        });
      } else if (type === "strikeout") {
        return;
      } else if (type === "drawing" || type === "arrow") {
        return;
      }

      const event = new CustomEvent("updateAnnotationPosition", {
        detail: {
          annotation: annotation,
        },
      });

      document.dispatchEvent(event);

      PDFJSAnnotate.getStoreAdapter().editAnnotation(
        documentId,
        annotationId,
        annotation
      );
    });

  setTimeout(() => {
    isDragging = false;
  }, 0);

  overlay.style.background = "";
  overlay.style.cursor = "";

  document.removeEventListener("mousemove", handleDocumentMousemove);
  document.removeEventListener("mouseup", handleDocumentMouseup);
  enableUserSelect();
}

/**
 * Handle annotation.click event
 *
 * @param {Element} e The annotation element that was clicked
 */
function handleAnnotationClick(target) {
  createEditOverlay(target);
}

/**
 * Enable edit mode behavior.
 */
export function enableEdit() {
  if (_enabled) {
    return;
  }

  _enabled = true;
  addEventListener("annotation:click", handleAnnotationClick);
}

/**
 * Disable edit mode behavior.
 */
export function disableEdit() {
  destroyEditOverlay();

  if (!_enabled) {
    return;
  }

  _enabled = false;
  removeEventListener("annotation:click", handleAnnotationClick);
}
