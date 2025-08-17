import { Handler } from '@netlify/functions';
import mjml2html from 'mjml';

export const handler: Handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { mjmlString, options = {} } = JSON.parse(event.body || '{}');
    
    if (!mjmlString) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'MJML string is required' })
      };
    }

    const result = mjml2html(mjmlString, {
      validationLevel: 'strict',
      beautify: true,
      minify: options.minify || false,
      ...options
    });

    // Transform errors to strings for consistency
    const errorStrings = (result.errors || []).map(error => 
      `Line ${error.line}: ${error.message} (${error.tagName})`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        html: result.html,
        errors: errorStrings,
        mjml: mjmlString,
        success: true
      })
    };
  } catch (error) {
    console.error('MJML compilation error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Compilation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      })
    };
  }
};