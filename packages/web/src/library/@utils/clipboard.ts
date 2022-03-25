export function writeClipboard(text: string): boolean {
  const d = document;

  try {
    const input = d.createElement('input');

    input.setAttribute('readonly', 'readonly');
    input.setAttribute('style', 'position: fixed; top:0; left:0; opacity:0;');
    input.setAttribute('value', text);

    d.body.appendChild(input);

    input.setSelectionRange(0, text.length);
    input.select();

    d.execCommand('copy');

    d.body.removeChild(input);
    return true;
  } catch (error) {
    return false;
  }
}
