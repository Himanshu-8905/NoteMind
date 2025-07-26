declare module "html2pdf.js" {
  export interface Options {
    margin?: number;
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { scale?: number };
    jsPDF?: { unit?: string; format?: string | number[]; orientation?: string };
  }

  interface Html2Pdf {
    from: (element: HTMLElement) => Html2Pdf;
    set: (options: Options) => Html2Pdf;
    save: () => void;
  }

  function html2pdf(): Html2Pdf;

  export = html2pdf;
}
