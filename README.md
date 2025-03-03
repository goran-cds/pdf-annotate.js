# @goran-cds/pdf-annotate.js

Annotation layer for [PDF.js](https://github.com/mozilla/pdf.js).

Combined fork of archived [instructure/pdf-annotate.js](https://github.com/instructure/pdf-annotate.js/) and [Submitty/pdf-annotate.js](https://github.com/Submitty/pdf-annotate.js). Under active development for usage within [goran-cds](https://github.com/goran-cds/goran-cds).

To report issues for pdf-annotate.js, please file them under the [goran-cds/pdf-annotate.js](https://github.com/goran-cds/pdf-annotate.js) repository.

## Objectives

- Provide a low level annotation layer for [PDF.js](https://github.com/mozilla/pdf.js).
- Optional high level UI for managing annotations.
- Agnostic of backend, just supply your own `StoreAdapter` to fetch/store data.
- Prescribe annotation format.

## Installation

```bash
npm install goran-cds/pdf-annotate.js
```

## Example

```js
import pdfjsLib from "pdfjs-dist/build/pdf";
import PDFJSAnnotate from "pdfjs-annotate";

const { UI } = PDFJSAnnotate;
const VIEWER = document.getElementById("viewer");
const RENDER_OPTIONS = {
  documentId: "MyPDF.pdf",
  pdfDocument: null,
  scale: 1,
  rotate: 0,
};

pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.js";
PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());

pdfjsLib.getDocument(RENDER_OPTIONS.documentId).promise.then((pdf) => {
  RENDER_OPTIONS.pdfDocument = pdf;
  VIEWER.appendChild(UI.createPage(1));
  UI.renderPage(1, RENDER_OPTIONS);
});
```

See [/web](https://github.com/goran-cds/pdf-annotate.js/tree/master/web) for an example web client for annotating PDFs.

## Documentation

[View the docs](https://github.com/goran-cds/pdf-annotate.js/tree/master/docs).

## Developing

```bash
# clone the repo
$ git clone https://github.com/goran-cds/pdf-annotate.js.git
$ cd pdf-annotate.js

# intall dependencies
$ npm install

# start example server
$ npm start
$ open http://127.0.0.1:8080

# run tests
$ npm test

# lint the code
$ npm run lint
```

## Building

**Do not** commit your built files when contributing.
If on Windows, change the `build` script in `package.json` to `webpack && SET MINIFY=1&webpack`.

```bash
# switch to node v14 or earlier
$ nvm use 14

# build the dist files
$ npm run build
```
