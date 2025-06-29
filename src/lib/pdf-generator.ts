import jsPDF from 'jspdf';

export interface DocumentData {
  title: string;
  content: string;
  analysis?: {
    summary: string;
    keyPoints: string[];
    risks: string[];
    recommendations: string[];
    compliance: {
      jurisdiction: string;
      compliant: boolean;
      issues: string[];
    };
    confidence: number;
  };
  metadata?: {
    author: string;
    jurisdiction: string;
    date: string;
    type: string;
  };
}

export const generatePDFReport = (data: DocumentData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number): number => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      return margin;
    }
    return yPosition;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('JusticeGPT Legal Document Analysis', margin, yPosition);
  yPosition += 15;

  // Document title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addWrappedText(data.title, margin, yPosition, pageWidth - 2 * margin, 16);
  yPosition += 10;

  // Metadata
  if (data.metadata) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Author: ${data.metadata.author}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Jurisdiction: ${data.metadata.jurisdiction}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Date: ${data.metadata.date}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Type: ${data.metadata.type}`, margin, yPosition);
    yPosition += 15;
  }

  // Analysis section
  if (data.analysis) {
    // Summary
    yPosition = checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(data.analysis.summary, margin, yPosition, pageWidth - 2 * margin, 11);
    yPosition += 15;

    // Key Points
    yPosition = checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Legal Points', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    data.analysis.keyPoints.forEach((point, index) => {
      yPosition = checkNewPage(15);
      yPosition = addWrappedText(`${index + 1}. ${point}`, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += 5;
    });
    yPosition += 10;

    // Risks
    if (data.analysis.risks.length > 0) {
      yPosition = checkNewPage(30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Potential Risks', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      data.analysis.risks.forEach((risk, index) => {
        yPosition = checkNewPage(15);
        yPosition = addWrappedText(`⚠️ ${risk}`, margin, yPosition, pageWidth - 2 * margin, 11);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Recommendations
    if (data.analysis.recommendations.length > 0) {
      yPosition = checkNewPage(30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      data.analysis.recommendations.forEach((rec, index) => {
        yPosition = checkNewPage(15);
        yPosition = addWrappedText(`✅ ${rec}`, margin, yPosition, pageWidth - 2 * margin, 11);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Compliance
    yPosition = checkNewPage(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Compliance Assessment (${data.analysis.compliance.jurisdiction})`, margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const complianceStatus = data.analysis.compliance.compliant ? '✅ Appears compliant' : '❌ Potential compliance issues';
    yPosition = addWrappedText(complianceStatus, margin, yPosition, pageWidth - 2 * margin, 11);
    yPosition += 10;

    if (data.analysis.compliance.issues.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Issues identified:', margin, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      data.analysis.compliance.issues.forEach((issue) => {
        yPosition = checkNewPage(15);
        yPosition = addWrappedText(`• ${issue}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 11);
        yPosition += 5;
      });
    }

    // Confidence
    yPosition += 10;
    yPosition = checkNewPage(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Confidence Level: ${data.analysis.confidence}%`, margin, yPosition);
    yPosition += 15;
  }

  // Document content (if provided and space allows)
  if (data.content && yPosition < pageHeight - 100) {
    yPosition = checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Content', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contentPreview = data.content.length > 2000 ? data.content.substring(0, 2000) + '...' : data.content;
    yPosition = addWrappedText(contentPreview, margin, yPosition, pageWidth - 2 * margin, 10);
  }

  // Footer disclaimer
  doc.addPage();
  yPosition = margin;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Legal Disclaimer', margin, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const disclaimer = `This document analysis was generated by JusticeGPT AI and is provided for informational purposes only. This analysis does not constitute legal advice and should not be relied upon as such. The AI system provides general legal information based on patterns in legal documents and may not account for all relevant factors, recent legal changes, or jurisdiction-specific nuances.

For specific legal matters, please consult with a qualified attorney who can provide personalized legal advice based on your particular circumstances and the most current legal standards in your jurisdiction.

JusticeGPT and its operators disclaim any liability for decisions made based on this AI-generated analysis.

Generated on: ${new Date().toLocaleString()}
Platform: JusticeGPT AI Legal Assistant
Version: 1.0`;

  addWrappedText(disclaimer, margin, yPosition, pageWidth - 2 * margin, 10);

  // Save the PDF
  const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.pdf`;
  doc.save(fileName);
};

export const generateDocumentPDF = (document: any): void => {
  const documentData: DocumentData = {
    title: document.name,
    content: document.content || 'Document content not available',
    analysis: document.analysis,
    metadata: {
      author: 'JusticeGPT User',
      jurisdiction: document.analysis?.compliance?.jurisdiction || 'Unknown',
      date: new Date(document.uploadDate).toLocaleDateString(),
      type: document.type
    }
  };

  generatePDFReport(documentData);
};