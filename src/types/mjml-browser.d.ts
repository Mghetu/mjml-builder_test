declare module 'mjml-browser' {
  interface MJMLResult {
    html: string;
    errors: Array<{
      line: number;
      message: string;
      tagName: string;
    }>;
  }

  interface MJMLOptions {
    validationLevel?: 'strict' | 'soft' | 'skip';
    beautify?: boolean;
    minify?: boolean;
  }

  function mjml2html(mjmlString: string, options?: MJMLOptions): MJMLResult;
  export default mjml2html;
}