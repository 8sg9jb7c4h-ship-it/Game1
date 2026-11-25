import type { CharacterConfig } from '../types/character';
export function characterUrl(config: CharacterConfig): string {
  const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(config))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `${location.origin}${location.pathname}#c=${encoded}`;
}
export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
export function downloadJson(config: CharacterConfig): void {
  download(`${config.name.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || 'personaggio'}.json`, JSON.stringify(config, null, 2), 'application/json');
}
export function downloadPng(canvas: HTMLCanvasElement): void {
  const link = document.createElement('a');
  link.download = 'tomodachi-ritratto.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
function download(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}
