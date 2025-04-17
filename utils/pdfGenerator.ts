import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { autoTable } from 'jspdf-autotable';

// Function to generate a PDF from documentation text
export const generateDocumentationPDF = (
  documentationText: string,
  repoOwner: string,
  repoName: string,
): void => {
  // Initialize PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set document properties
  doc.setProperties({
    title: `${repoOwner}/${repoName} - Documentation`,
    subject: 'Generated Documentation',
    author: 'AutoDocs.AI',
    creator: 'AutoDocs.AI',
    keywords: 'documentation, github, repository',
  });

  // Add title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text(`${repoOwner}/${repoName}`, 20, 20);

  // Add subtitle
  doc.setFontSize(14);
doc.setFont('Times New Roman', 'normal');
  doc.setTextColor(102, 102, 102);
  doc.text('Generated Documentation', 20, 30);
  
  // Add date
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on: ${currentDate}`, 20, 38);

  // Add logo/watermark
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Powered by AutoDocs.AI', 130, 38);

  // Add horizontal line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);

  // Process documentation text
  const lines = documentationText.split('\n');
  let currentY = 50;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const textWidth = pageWidth - (margin * 2);
  
  // Track current heading level for styling
  let inCodeBlock = false;
  let codeBlockStart = 0;
  let codeBlockContent = '';

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if it's a heading
    if (line.startsWith('# ')) {
      // Level 1 heading
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      line = line.substring(2);
    } else if (line.startsWith('## ')) {
      // Level 2 heading
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      line = line.substring(3);
    } else if (line.startsWith('### ')) {
      // Level 3 heading
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      line = line.substring(4);
    } else if (line.startsWith('```')) {
      // Code block start/end
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        codeBlockStart = currentY;
        codeBlockContent = '';
        continue;
      } else {
        // End of code block
        inCodeBlock = false;
        
        // Add code block with gray background
        const codeBlockHeight = currentY - codeBlockStart + 5;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin - 2, codeBlockStart - 4, textWidth + 4, codeBlockHeight, 'F');
        
        // Add code content
        doc.setFontSize(9);
        doc.setFont('courier', 'normal');
        doc.setTextColor(80, 80, 80);
        
        const codeLines = codeBlockContent.split('\n');
        let codeY = codeBlockStart;
        
        for (const codeLine of codeLines) {
          doc.text(codeLine, margin, codeY);
          codeY += 5;
        }
        
        currentY += 5;
        continue;
      }
    } else if (inCodeBlock) {
      // Inside code block
      codeBlockContent += line + '\n';
      currentY += 5;
      continue;
    } else {
      // Regular text
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Bold text within **, e.g. **bold text**
      if (line.includes('**')) {
        // TODO: Add more sophisticated styling if needed
      }
    }
    
    // Check if we need a new page
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    
    // Handle long lines with text wrapping
    const textLines = doc.splitTextToSize(line, textWidth);
    doc.text(textLines, margin, currentY);
    currentY += 5 * textLines.length + 2;
  }

  // Save the PDF
  doc.save(`${repoOwner}-${repoName}-documentation.pdf`);
};

// Function to generate PDF with directory structure included
export const generateFullDocumentationPDF = (
  documentationText: string,
  repoOwner: string,
  repoName: string,
  directoryStructure?: string,
): void => {
  // Create a combined documentation text including the directory structure if available
  let fullDocumentation = documentationText;
  
  if (directoryStructure) {
    fullDocumentation = `# Project Directory Structure\n\n\`\`\`\n${directoryStructure}\n\`\`\`\n\n${documentationText}`;
  }
  
  // Generate the PDF with the combined text
  generateDocumentationPDF(fullDocumentation, repoOwner, repoName);
};