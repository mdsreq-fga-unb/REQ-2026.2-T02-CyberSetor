import { detectDocumentType, documentFileName } from './document-type.js';

function zip(...names: string[]): Buffer {
  const header = Buffer.alloc(4);
  header.writeUInt32LE(0x04034b50, 0);
  return Buffer.concat([header, Buffer.from(names.join('\0'), 'latin1')]);
}

describe('tipo do documento formal', () => {
  it('reconhece PDF pela assinatura', () => {
    expect(detectDocumentType(Buffer.from('%PDF-1.7\n...'))?.extension).toBe('pdf');
  });

  it('reconhece DOCX pelo pacote do Word', () => {
    const docx = zip('[Content_Types].xml', 'word/document.xml');
    expect(detectDocumentType(docx)?.extension).toBe('docx');
  });

  it('recusa ZIP que nao e documento do Word, extensao trocada e texto', () => {
    expect(detectDocumentType(zip('[Content_Types].xml', 'xl/workbook.xml'))).toBeNull();
    expect(detectDocumentType(zip('qualquer.txt'))).toBeNull();
    expect(detectDocumentType(Buffer.from('não sou PDF'))).toBeNull();
    expect(detectDocumentType(Buffer.alloc(0))).toBeNull();
  });
});

describe('nome do documento formal', () => {
  const pdf = { contentType: 'application/pdf', extension: 'pdf' } as const;

  it('volta o nome do multer para UTF-8 e tira o caminho', () => {
    const latin1 = Buffer.from('Termo de Fomento nº 12.pdf', 'utf8').toString('latin1');
    expect(documentFileName(latin1, pdf)).toBe('Termo de Fomento nº 12.pdf');
    expect(documentFileName('C:\\pasta\\termo.pdf', pdf)).toBe('termo.pdf');
  });

  it('usa um nome padrao quando o nome vem vazio', () => {
    expect(documentFileName('  ', pdf)).toBe('documento-formal.pdf');
    expect(documentFileName('.pdf', pdf)).toBe('documento-formal.pdf');
  });

  it('termina na extensao do tipo conferido pelo conteudo', () => {
    const docx = {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
    } as const;
    expect(documentFileName('termo.PDF', pdf)).toBe('termo.pdf');
    expect(documentFileName('termo.pdf', docx)).toBe('termo.docx');
    expect(documentFileName('termo.doc', docx)).toBe('termo.docx');
    expect(documentFileName('termo v2.final', pdf)).toBe('termo v2.final.pdf');
    expect(documentFileName(`${'a'.repeat(300)}.pdf`, pdf)).toHaveLength(194);
  });
});
