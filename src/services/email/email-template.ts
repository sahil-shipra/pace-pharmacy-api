import * as fs from 'fs';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';

type TemplateData = Record<string, any>;


export function renderMjmlTemplate(templateName: string, data: TemplateData): string {
    const pwd = process.cwd();

    // const templatePath = path.join(__dirname, 'views/email/templates', `${templateName}.mjml`);
    const templatePath = `${pwd}/src/services/email/templates/${templateName}.mjml`

    if (!templatePath) {
        return '';
    }
    // console.log('Does file exist?', fs.existsSync(templatePath));
    const rawMjml = fs.readFileSync(templatePath, 'utf-8');



    const compiledMjml = Handlebars.compile(rawMjml)(data);
    const { html, errors } = mjml2html(compiledMjml);

    if (errors.length > 0) {
        console.error('MJML Errors:', errors);
        throw new Error('Failed to compile MJML template.');
    }

    return html;
}


