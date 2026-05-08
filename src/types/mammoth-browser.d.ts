declare module 'mammoth/mammoth.browser' {
  export interface ConvertToHtmlInput {
    arrayBuffer: ArrayBuffer;
  }

  export interface ConvertToHtmlOptions {
    includeDefaultStyleMap?: boolean;
    styleMap?: string | string[];
  }

  export interface ConvertToHtmlResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function convertToHtml(input: ConvertToHtmlInput, options?: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>;
}
