import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import "./App.css";

function App() {
  const [ocr, setOcr] = useState("");
  const [imageData, setImageData] = useState<any>();
  const [progress, setProgress] = useState(0);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [filePath, setFilePath] = useState('');
  const [pdfPageText, setPdfPageText] = useState<string[]>([]);

  const worker = createWorker({
    logger: (m) => {
      console.log(m);
      //@ts-ignore
      setProgress(parseInt(m.progress * 100));
    },
  });
  const convertImageToText = async () => {
    if (!imageData) return;
    await worker.load();
    await worker.loadLanguage("ita");
    await worker.initialize("ita");
    const {
      data: { text },
    } = await worker.recognize(imageData);
    setOcr(text);
  };

  useEffect(() => {
    convertImageToText();
  }, [imageData]);

  function handleImageChange(e: any) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      console.log({ imageDataUri });
      setImageData(imageDataUri);
    };
    reader.readAsDataURL(file);
  }

  function handlePdfChange(e: any) {
    console.log("caricato ", e)
    setFilePath(e.target.files[0]);
    // let str:string[] = [];
    // for (let i = 1; i <= e.numPages; i++) {
    //   e.getPage(i).then(function (page: { getTextContent: () => Promise<any>; }) {
    //     page.getTextContent().then(function (textContent: { items: string | any[]; }) {
    //       for (let j = 0; j < textContent.items.length; j++) {
    //         str.push(textContent.items[j].str);
    //       }
    //       console.log(str);
    //     });
    //   });
    // }

    // var pdf = pdfjs.getDocument(e.target.value);
    // pdf.then(function (pdf) {
    //   var maxPages = pdf.pdfInfo.numPages;
    //   for (var j = 1; j < maxPages; j++) {
    //     var page = pdf.getPage(j);

    //     page.then(function () {
    //       var textContent = page.getTextContent();

    //     })
    //   }
    // });

    // var uploadPDF = document.getElementById('uploadPDF');
    // var currentPageNo = document.getElementById('currentPageNo');
    // var totalPages = document.getElementById('totalPages');
    // var _PDF_DOC, _PAGE, noOfPages, currentPage = 1;
    // var _CANVAS = document.createElement('canvas');
    // function readFileAsDataURL(file:any) {
    //   return new Promise((resolve, reject) => {
    //     let fileredr = new FileReader();
    //     fileredr.onload = () => resolve(fileredr.result);
    //     fileredr.onerror = () => reject(fileredr);
    //     fileredr.readAsDataURL(file);
    //   });
    // }
    // const loadImage = (url:any) => new Promise((resolve, reject) => {
    //   const img = new Image();
    //   img.addEventListener('load', () => resolve(img));
    //   img.addEventListener('error', (err) => reject(err));
    //   img.src = url;
    // });
    // if(uploadPDF){
    //   uploadPDF.addEventListener('change', function (evt) {
    //     //@ts-ignore
    //     let file = evt.currentTarget.files[0];
    //     if (!file) return;
    //     readFileAsDataURL(file).then((pdf_url) => {
    //       pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerPath;
    //       (async () => {
    //         _PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });
    //         noOfPages = _PDF_DOC.numPages;
    //         totalPages.innerHTML = noOfPages;
    //         while (currentPage <= noOfPages) {
    //           await initPdfTesseractWorker();
    //           currentPageNo.innerHTML = currentPage;
    //           _PAGE = await _PDF_DOC.getPage(pageNo);
    //           let pdfOriginalWidth = _PAGE.getViewport(1).width;
    //           let viewport = _PAGE.getViewport(1);
    //           let viewpointHeight = viewport.height;
    //           _CANVAS.width = pdfOriginalWidth * pixelRatio;
    //           _CANVAS.height = viewpointHeight * pixelRatio;
    //           _CANVAS['style']['width'] = `${pdfOriginalWidth}px`;
    //           _CANVAS['style']['height'] = `${viewpointHeight}px`;
    //           _CANVAS.getContext('2d').scale(pixelRatio, pixelRatio);
    //           var renderContext = {
    //             canvasContext: _CANVAS.getContext('2d'),
    //             viewport: viewport
    //           };
    //           await _PAGE.render(renderContext);
    //           let b64str = _CANVAS.toDataURL();
    //           let loadedImg = await loadImage(b64str);
    //           let result = await worker.recognize(loadedImg);
    //           let extractedData = result.data;

    //           let wordsArr = extractedData.words;
    //           let combinedText = '';
    //           for (let w of wordsArr) {
    //             combinedText += (w.text) + ' ';
    //           }
    //           inputTxt.insertAdjacentText('beginend', combinedText);
    //           await worker.terminate();
    //           currentPage++;
    //         }
    //       })();
    //     }, false);
    //   });
    // }

  }

  function onDocumentLoadSuccess({ numPages }: any) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess(page: any) {
    page.getTextContent().then(function (textContent: { items: any; }) {
      var textItems = textContent.items;
      var finalString = "";

      // Concatenate the string of the item to the final string
      for (var i = 0; i < textItems.length; i++) {
        var item = textItems[i];

        finalString += item.str + " ";
      }

      // Solve promise with the text retrieven from the page
      setPdfPageText(prev => [...prev, finalString]);
    });
  }

  return (
    <div className="App">
      <div>
        <p>Choose an Image</p>
        
        <input
          type="file"
          name=""
          id=""
          onChange={handleImageChange}
          accept="image/*"
        />
        <p>Choose a PDF</p>
        <input
          type="file"
          name=""
          id="uploadPDF"
          onChange={handlePdfChange}
          accept="pdf/*"
        />
      </div>
      {progress < 100 && progress > 0 && <div>
        <div className="progress-label">Progress ({progress}%)</div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} ></div>
        </div>
      </div>}

      {filePath &&
        <div>
          <Document file={filePath} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} onLoadSuccess={(page) => onPageLoadSuccess(page)} />
          </Document>
          {
            pageNumber > 1 &&
            <div className='left-arrow-container' onClick={() => {
              setPageNumber(pageNumber - 1);
            }}>
              SX
            </div>
          }
          {
            numPages && pageNumber < numPages &&
            <div className='right-arrow-container' onClick={() => {
              setPageNumber(pageNumber +1);
            }}>
              DX
            </div>
          }
          <p>
            Page {pageNumber} of {numPages}
          </p>
        </div>
      }
      <div className="display-flex">
        <img src={imageData} alt=""
        // srcset=""
        />
        <p>{ocr}</p>
        <p>{pdfPageText}</p>
      </div>
    </div>
  );
}
export default App;
