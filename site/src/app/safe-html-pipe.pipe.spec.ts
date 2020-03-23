import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipePipe } from './safe-html-pipe.pipe';
import { inject } from '@angular/core/testing';

describe('SafeHtmlPipePipe', () => {
  it('create an instance', (inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new SafeHtmlPipePipe(domSanitizer);
    expect(pipe).toBeTruthy();
})))
});

