export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer

        const pdfjsLib = await import("pdfjs-dist")

        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise

        let fullText = ""

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()

          const pageText = textContent.items
            .map((item: any) => {
              return item.str
            })
            .join(" ")

          fullText += pageText + "\n\n"
        }

        resolve(fullText)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}
