import { jsPDF } from 'jspdf';
import amiriNormal from './Amiri-Regular.ttf';

export const loadFonts = () => {
  // Add Amiri font to jsPDF
  const callAddFont = () => {
    try {
      doc.addFileToVFS('Amiri-Regular.ttf', amiriNormal);
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      console.log('Font loaded successfully');
    } catch (error) {
      console.error('Error loading font:', error);
    }
  };

  // Create temporary jsPDF instance to add font
  const doc = new jsPDF();
  callAddFont();
};