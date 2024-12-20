import { addEventListener, removeEventListener, fireEvent } from "./event";
import { disableEdit, enableEdit } from "./edit";
import { disablePen, enablePen, setPen } from "./pen";
import { disableArrow, enableArrow, setArrow } from "./arrow";
import { disableEraser, enableEraser } from "./eraser";
import { disablePoint, enablePoint } from "./point";
import { disableRect, enableRect } from "./rect";
import {
  disableSignatureBlock,
  enableSignatureBlock,
  setSignatureBlock,
  addSignatureBlock,
} from "./signatureBlock";
import { disableText, enableText, setText } from "./text";
import { createPage, renderPage } from "./page";

export default {
  addEventListener,
  removeEventListener,
  fireEvent,

  disableEdit,
  enableEdit,

  disablePen,
  enablePen,
  setPen,

  disablePoint,
  enablePoint,

  disableRect,
  enableRect,

  disableSignatureBlock,
  enableSignatureBlock,
  setSignatureBlock,
  addSignatureBlock,

  disableArrow,
  enableArrow,
  setArrow,

  disableEraser,
  enableEraser,

  disableText,
  enableText,
  setText,

  createPage,
  renderPage,
};
