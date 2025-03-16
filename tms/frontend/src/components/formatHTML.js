
import format from 'html-format';

export default function formatHTML(markup) {
  // Cheap tricks to format the HTML readably -- haven't been able to
  // find a package that runs in browser and prettifies the HTML if it
  // lacks line-breaks.
  return format(markup
    .replace('<html>', '<html>\n')
    .replace('<head>', '<head>\n')
    .replaceAll(/<\/script>/g, '<\/script>\n')
    .replaceAll(/<style([^>]*)\/>/g, '<style $1/>\n\n')
    .replaceAll(/<\/style>/g, '\n    <\/style>\n')
    .replaceAll(/<link([^>]*)\/>/g, '<link $1/>\n')
    .replaceAll(/<meta([^/]*)\/>/g, '<meta $1/>\n')
    .replace('</head>', '</head>\n')
    .replace('<body>', '<body>\n')
    .replace('</body>', '\n</body>\n')
    .replace('</h1>', '</h1>\n')
  );
}
