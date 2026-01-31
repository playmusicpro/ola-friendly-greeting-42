import jsPDF from 'jspdf';

interface PDFOptions {
  type: 'setlist' | 'song';
  title: string;
  content: string;
  items?: Array<{
    title: string;
    artist: string;
    tone: string;
    notes?: string;
  }>;
  hotmartLink?: string;
  includeHotmartLink?: boolean;
  userNote?: string;
}

interface PDFResult {
  fileName: string;
  blob: Blob;
  fileUrl: string;
  createdAt: string;
}

const generateFileName = (type: 'setlist' | 'song', title: string): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const slugTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30);
  const prefix = type === 'setlist' ? 'Setlist' : 'Musica';
  return `PlayPro_${prefix}_${slugTitle}_${date}.pdf`;
};

export const generatePDF = async (options: PDFOptions): Promise<PDFResult> => {
  const { type, title, content, items, hotmartLink, includeHotmartLink, userNote } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Background
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header with gold accent
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Logo area
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('🎸 Play Pro', margin, 20);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 35);

  // Subtitle line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, 40, pageWidth - margin, 40);

  let yPosition = 50;

  // User note
  if (userNote) {
    doc.setFillColor(42, 42, 42);
    doc.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'F');
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Notas: ${userNote}`, margin + 5, yPosition + 10);
    yPosition += 25;
  }

  // Content
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  if (type === 'setlist' && items && items.length > 0) {
    // Setlist mode - list of songs
    items.forEach((item, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        doc.setFillColor(26, 26, 26);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPosition = 20;
      }

      // Song number
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}.`, margin, yPosition);

      // Song title and artist
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(item.title, margin + 10, yPosition);
      
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(` - ${item.artist}`, margin + 10 + doc.getTextWidth(item.title) + 2, yPosition);

      // Tone badge
      doc.setFillColor(212, 175, 55, 0.2);
      const toneText = `Tom: ${item.tone}`;
      const toneWidth = doc.getTextWidth(toneText) + 8;
      doc.roundedRect(pageWidth - margin - toneWidth, yPosition - 5, toneWidth, 8, 1, 1, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(9);
      doc.text(toneText, pageWidth - margin - toneWidth + 4, yPosition);

      yPosition += 12;

      // Notes if any
      if (item.notes) {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const splitNotes = doc.splitTextToSize(item.notes, contentWidth - 15);
        doc.text(splitNotes, margin + 10, yPosition);
        yPosition += splitNotes.length * 5;
      }

      yPosition += 5;
    });
  } else {
    // Single song mode with cifra
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        doc.setFillColor(26, 26, 26);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPosition = 20;
      }

      // Check for chord patterns [X] or standalone chords
      const chordPattern = /\[([^\]]+)\]/g;
      const hasChords = chordPattern.test(line);

      if (hasChords) {
        // Line with chords - highlight them
        doc.setTextColor(107, 159, 255);
        doc.setFont('courier', 'bold');
        doc.setFontSize(11);
        const cleanLine = line.replace(/\[([^\]]+)\]/g, '$1');
        doc.text(cleanLine, margin, yPosition);
      } else {
        // Regular text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const splitLine = doc.splitTextToSize(line, contentWidth);
        doc.text(splitLine, margin, yPosition);
        if (splitLine.length > 1) {
          yPosition += (splitLine.length - 1) * 5;
        }
      }

      yPosition += 6;
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setTextColor(136, 136, 136);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} via Play Pro`, margin, footerY);

  // Hotmart link
  if (includeHotmartLink && hotmartLink) {
    doc.setTextColor(212, 175, 55);
    doc.setFont('helvetica', 'bold');
    doc.textWithLink('Acessar Área de Membros', pageWidth - margin - 50, footerY, { url: hotmartLink });
  }

  const fileName = generateFileName(type, title);
  const blob = doc.output('blob');
  const fileUrl = URL.createObjectURL(blob);

  return {
    fileName,
    blob,
    fileUrl,
    createdAt: new Date().toISOString(),
  };
};

export const downloadPDF = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates and downloads a Presskit PDF
 */
export const generatePresskitPDF = (artistName: string, htmlContent: string): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Background
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header accent
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Logo
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('🎸 Play Pro', margin, 22);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(`Presskit - ${artistName}`, margin, 38);

  // Divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, 44, pageWidth - margin, 44);

  // Parse HTML content and render as text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const textContent = tempDiv.textContent || tempDiv.innerText;
  
  let yPosition = 55;
  const lines = textContent.split('\n').filter(line => line.trim());
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  lines.forEach(line => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      doc.setFillColor(26, 26, 26);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      yPosition = 20;
    }
    
    const trimmedLine = line.trim();
    if (trimmedLine.includes(':')) {
      // Section header or label
      doc.setTextColor(212, 175, 55);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
    }
    
    const splitLines = doc.splitTextToSize(trimmedLine, contentWidth);
    doc.text(splitLines, margin, yPosition);
    yPosition += splitLines.length * 6 + 3;
  });

  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(50, 50, 50);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setTextColor(136, 136, 136);
  doc.setFontSize(9);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} via Play Pro`, margin, footerY);

  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const slugName = artistName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 30);
  const fileName = `PlayPro_Presskit_${slugName}_${date}.pdf`;
  
  doc.save(fileName);
};
