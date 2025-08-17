import { Handler } from '@netlify/functions';
import mjml2html from 'mjml';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { mjmlString, format, filename } = JSON.parse(event.body || '{}');

    switch (format) {
      case 'mjml':
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename || 'template.mjml'}"`
          },
          body: mjmlString
        };

      case 'html':
        const result = mjml2html(mjmlString, { beautify: true });
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename || 'template.html'}"`
          },
          body: result.html
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid format specified' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Export failed' })
    };
  }
};