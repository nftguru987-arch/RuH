
import { Injectable } from '@angular/core';

export interface AccessibilityReport {
  general: string[];
  keyboard: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {

  check(html: string): AccessibilityReport {
    const general: string[] = [];
    const keyboard: string[] = [];

    if (typeof DOMParser === 'undefined') {
        return {
          general: ['Accessibility checks can only run in a browser environment.'],
          keyboard: []
        };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Check for images without alt text
    const images = doc.querySelectorAll('img');
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      if (alt === null) {
        general.push(`Image ${index + 1} is missing an 'alt' attribute. All images need an alt attribute. For decorative images, use alt="".`);
      }
    });

    // Check for links without discernible text
    const links = doc.querySelectorAll('a');
    links.forEach((link, index) => {
      const text = link.textContent?.trim() || '';
      const ariaLabel = link.getAttribute('aria-label')?.trim() || '';
      if (text === '' && ariaLabel === '' && !link.querySelector('img')) {
        general.push(`Link ${index + 1} has no discernible text. Provide meaningful text content or an 'aria-label'.`);
      }
    });

    // Check for form elements without labels
    const inputs = doc.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
        if (input.getAttribute('type') === 'hidden') return;
        
        const inputId = input.id;
        let hasLabel = false;
        if (inputId) {
            if (doc.querySelector(`label[for="${inputId}"]`)) hasLabel = true;
        }
        if (!hasLabel && input.closest('label')) hasLabel = true;
        if (!hasLabel && (input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby'))) hasLabel = true;

        if(!hasLabel) {
             const type = input.getAttribute('type') || input.tagName.toLowerCase();
             general.push(`Form element '${type}' may be missing an associated label. Use a <label> with the 'for' attribute or an 'aria-label'.`);
        }
    });

    // Check for buttons without text
    const buttons = doc.querySelectorAll('button');
    buttons.forEach((button, index) => {
        const text = button.textContent?.trim() || '';
        const ariaLabel = button.getAttribute('aria-label')?.trim() || '';
        if (text === '' && ariaLabel === '') {
             general.push(`Button ${index + 1} has no discernible text. Provide text content or an 'aria-label'.`);
        }
    });

    // Keyboard Navigation checks
    const focusableSelector = 'a[href], button, input:not([type="hidden"]), textarea, select, details, [tabindex]';
    const allInteractive = doc.querySelectorAll(focusableSelector);
    
    keyboard.push(`Found <strong>${allInteractive.length}</strong> interactive or focusable elements. Ensure their navigation order is logical and predictable.`);

    allInteractive.forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        const isDisabled = el.hasAttribute('disabled');
        const tabIndex = el.getAttribute('tabindex');

        let elementDesc = `<code>&lt;${tagName}&gt;</code>`;
        const text = (el.textContent?.trim().substring(0, 30).replace(/\s+/g, ' ') || el.getAttribute('aria-label'));
        if (text) {
            elementDesc += ` with text "${text}..."`;
        }
        
        if (isDisabled) {
            keyboard.push(`${elementDesc} is disabled and will be skipped during keyboard navigation.`);
        } else if (tabIndex && parseInt(tabIndex, 10) < 0) {
            keyboard.push(`${elementDesc} has <code>tabindex="-1"</code>, making it focusable only via script, not via the tab key.`);
        } else if (tabIndex && parseInt(tabIndex, 10) > 0) {
            keyboard.push(`${elementDesc} has a positive <code>tabindex</code>. This is discouraged as it disrupts the natural tab order.`);
        } else {
            keyboard.push(`${elementDesc} is focusable via the tab key. Verify its position in the tab sequence.`);
        }
    });

    const nonFocusableRoles = '[role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="tab"]';
    doc.querySelectorAll(nonFocusableRoles).forEach(el => {
        const isNativelyFocusable = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'DETAILS'].includes(el.tagName);
        if (!isNativelyFocusable && !el.hasAttribute('tabindex')) {
            const tagName = el.tagName.toLowerCase();
            const role = el.getAttribute('role');
            keyboard.push(`Element <code>&lt;${tagName} role="${role}"&gt;</code> should be made focusable. Add <code>tabindex="0"</code> to include it in the keyboard navigation sequence.`);
        }
    });
    
    // Final assembly
    if (general.length > 0) {
        general.unshift('Found potential accessibility issues. These are automated suggestions and may require manual verification.');
    } else {
        general.push('No obvious accessibility issues found based on automated checks. Manual testing is still highly recommended.');
    }
    general.push('Remember to manually check for sufficient color contrast between text and its background.');
    
    return { general, keyboard };
  }
}
