declare module 'html-docx-js/dist/html-docx' {
  interface HtmlDocxOptions {
    margins?: Record<string, number>;
  }

  export function asBlob(html: string, options?: HtmlDocxOptions): Blob;
}
