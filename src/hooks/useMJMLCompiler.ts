import { useCallback } from 'react';
import { EmailStructure, CompilationResult, MJMLComponent } from '../types/mjml.types';

export const useMJMLCompiler = () => {
  const generateComponentMJML = useCallback((component: MJMLComponent, indent: number = 4): string => {
    const spaces = ' '.repeat(indent);
    let mjml = `${spaces}<${component.type}`;
    
    // Add attributes
    Object.entries(component.attributes || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        mjml += ` ${key}="${value}"`;
      }
    });
    
    if (component.children && component.children.length > 0) {
      mjml += '>\n';
      component.children.forEach((child: MJMLComponent) => {
        mjml += generateComponentMJML(child, indent + 2);
      });
      mjml += `${spaces}</${component.type}>\n`;
    } else if (component.content) {
      mjml += `>${component.content}</${component.type}>\n`;
    } else {
      mjml += ' />\n';
    }
    
    return mjml;
  }, []);

  const generateMJMLFromStructure = useCallback((structure: EmailStructure): string => {
    let mjml = '<mjml>\n';
    
    // Head section
    mjml += '  <mj-head>\n';
    if (structure.head.title) {
      mjml += `    <mj-title>${structure.head.title}</mj-title>\n`;
    }
    if (structure.head.preview) {
      mjml += `    <mj-preview>${structure.head.preview}</mj-preview>\n`;
    }
    structure.head.fonts.forEach(font => {
      mjml += `    <mj-font name="${font}" href="https://fonts.googleapis.com/css?family=${font}" />\n`;
    });
    if (structure.head.styles) {
      mjml += `    <mj-style>\n${structure.head.styles}\n    </mj-style>\n`;
    }
    mjml += '  </mj-head>\n';
    
    // Body section
    mjml += '  <mj-body>\n';
    structure.body.forEach(component => {
      mjml += generateComponentMJML(component, 4);
    });
    mjml += '  </mj-body>\n';
    
    mjml += '</mjml>';
    return mjml;
  }, [generateComponentMJML]);

  const compileToHTML = useCallback((structure: EmailStructure): CompilationResult => {
    try {
      const mjmlString = generateMJMLFromStructure(structure);
      
      // Try to use global mjml2html if available
      if (typeof (window as any).mjml2html === 'function') {
        const result = (window as any).mjml2html(mjmlString, {
          validationLevel: 'soft',
          beautify: false
        });
        
        const errorStrings = (result.errors || []).map((error: any) => 
          typeof error === 'string' ? error : `Line ${error.line}: ${error.message} (${error.tagName})`
        );
        
        return {
          html: result.html,
          mjml: mjmlString,
          errors: errorStrings,
          success: true
        };
      } else {
        // Fallback HTML generation for basic preview
        const basicHTML = generateBasicHTML(structure);
        return {
          html: basicHTML,
          mjml: mjmlString,
          errors: ['Using basic HTML preview - MJML compiler loading...'],
          success: true
        };
      }
    } catch (error) {
      return {
        html: '',
        mjml: '',
        errors: [error instanceof Error ? error.message : 'Compilation failed'],
        success: false
      };
    }
  }, [generateMJMLFromStructure]);

  // Basic HTML generator for preview
  const generateBasicHTML = (structure: EmailStructure): string => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${structure.head.title || 'Email'}</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; background: #f4f4f4; }
          .email-container { max-width: 600px; margin: 20px auto; background: white; }
          .section { padding: 20px; }
          .text { margin: 10px 0; }
          .button { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
          .image { max-width: 100%; height: auto; }
          .divider { margin: 20px 0; }
          .spacer { display: block; }
        </style>
      </head>
      <body>
        <div class="email-container">
    `;
    
    structure.body.forEach(component => {
      html += generateComponentHTML(component);
    });
    
    html += `
        </div>
      </body>
      </html>
    `;
    
    return html;
  };

  const generateComponentHTML = (component: MJMLComponent): string => {
    const attrs = component.attributes || {};
    
    switch (component.type) {
      case 'mj-section':
        return `<div class="section" style="background-color: ${attrs['background-color'] || '#ffffff'}; padding: ${attrs.padding || '20px'};">
          ${component.children ? component.children.map(child => generateComponentHTML(child)).join('') : 'Section Content'}
        </div>`;
        
      case 'mj-text':
        return `<div class="text" style="font-size: ${attrs['font-size'] || '16px'}; color: ${attrs.color || '#333333'}; text-align: ${attrs.align || 'left'};">
          ${component.content || 'Text content'}
        </div>`;
        
      case 'mj-button':
        return `<div style="text-align: ${attrs.align || 'center'};">
          <a href="${attrs.href || '#'}" class="button" style="background-color: ${attrs['background-color'] || '#007bff'}; color: ${attrs.color || '#ffffff'};">
            ${component.content || 'Button'}
          </a>
        </div>`;
        
      case 'mj-image':
        return `<div style="text-align: ${attrs.align || 'center'};">
          <img src="${attrs.src || 'https://via.placeholder.com/600x300'}" alt="${attrs.alt || 'Image'}" class="image" style="width: ${attrs.width || '100%'};">
        </div>`;
        
      case 'mj-divider':
        return `<hr class="divider" style="border: none; border-top: ${attrs['border-width'] || '1px'} solid ${attrs['border-color'] || '#cccccc'};">`;
        
      case 'mj-spacer':
        return `<div class="spacer" style="height: ${attrs.height || '20px'};"></div>`;
        
      default:
        return `<div style="padding: 10px; border: 1px dashed #ccc; margin: 5px 0;">
          ${component.name} (${component.type})
        </div>`;
    }
  };

  return {
    compileToHTML,
    generateMJMLFromStructure
  };
};