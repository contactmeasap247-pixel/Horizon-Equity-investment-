/**
 * Institutional Transaction Receipt PDF Generator
 * Renders the receipt document card with high-resolution canvas capture to A4 PDF.
 */

export async function downloadReceiptPdf(
  elementId: string,
  fileName: string = "HorizonEquity-Receipt.pdf"
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Receipt element #${elementId} not found`);
    return false;
  }

  try {
    // Dynamic imports to safeguard against SSR environments
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    // Capture element with 2x scale for sharp typography and vector rendering
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const maxContentWidth = pageWidth - margin * 2; // 190mm
    const maxContentHeight = pageHeight - margin * 2; // 277mm

    let imgWidth = maxContentWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If receipt height exceeds page height, scale down proportionally to fit cleanly on one single page
    if (imgHeight > maxContentHeight) {
      const scaleFactor = maxContentHeight / imgHeight;
      imgHeight = maxContentHeight;
      imgWidth = imgWidth * scaleFactor;
    }

    const xOffset = (pageWidth - imgWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("Failed to generate receipt PDF:", error);
    return false;
  }
}

