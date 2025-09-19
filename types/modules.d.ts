declare module 'pdfkit' {
  export default class PDFDocument {
    constructor(options?: any)
    fontSize(size: number): this
    text(text: string, options?: any): this
    moveDown(): this
    end(): void
    on(event: string, callback: (chunk: any) => void): void
  }
}

declare module 'resend' {
  export class Resend {
    constructor(apiKey: string)
    emails: {
      send(options: {
        from: string
        to: string[]
        subject: string
        html: string
        text: string
      }): Promise<{ data?: { id: string } }>
    }
  }
}
