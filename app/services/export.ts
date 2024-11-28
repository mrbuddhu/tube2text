import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph } from 'docx';
import { marked } from 'marked';

export class ExportService {
  public async exportToPDF(title: string, content: string): Promise<Blob> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Add content
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 40);
    
    return doc.output('blob');
  }

  public async exportToWord(title: string, content: string): Promise<Blob> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: 'Heading1'
          }),
          new Paragraph({
            text: content
          })
        ]
      }]
    });

    return await Packer.toBlob(doc);
  }

  public exportToMarkdown(title: string, content: string): string {
    return `# ${title}\n\n${content}`;
  }

  public exportToHTML(title: string, content: string): string {
    return marked.parse(`# ${title}\n\n${content}`);
  }

  public downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
