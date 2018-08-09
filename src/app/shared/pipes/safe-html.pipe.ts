import { DomSanitizer } from '@angular/platform-browser';
import { PipeTransform, Pipe } from '@angular/core';

/**
 * Pipe to allow safe html display
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
    /**
     * Initializes necessary dependency and does dependency injection
     * @param sanitized DomSanitizer dependency to sanitize dom
     */
    constructor(private sanitized: DomSanitizer) { }
    /**
     * Sanitizes passed html
     * @param {string} value html value to be sanitized
     */
    transform(value: string) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}
