import { jsPDF } from 'jspdf';

const useArabicPdf = () => {
  const generatePdf = async (content, fileName) => {
    try {
      // Initialize PDF with RTL support
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configure Arabic text rendering
      doc.setLanguage('ar');
      doc.setR2L(true);

      // Clean the content by removing any corrupted characters
      const cleanContent = content.replace(/þ/g, '').normalize('NFC');

      // Split content into lines and add to PDF
      const lines = cleanContent.split('\n');
      let yPosition = 20; // Start 20mm from top
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;

      lines.forEach(line => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = 20;
        }

        if (/[\u0600-\u06FF]/.test(line)) {
          // Right-align Arabic text
          doc.text(line, pageWidth - margin, yPosition, {
            align: 'right',
            lang: 'ar',
            isInputRtl: true,
            isOutputRtl: true
          });
        } else {
          // Left-align non-Arabic text
          doc.text(line, margin, yPosition);
        }

        yPosition += 7; // Line spacing
      });

      doc.save(`${fileName}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      return false;
    }
  };

  return { generatePdf };
};

export default useArabicPdf;