export type AppRoute =
  | { name: 'home' }
  | { name: 'passport-lookup' }
  | { name: 'passport'; code: string }
  | { name: 'certificate'; code: string }
  | { name: 'centre' };

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export function parseRoute(hash: string): AppRoute {
  const [section = '', code = ''] = hash.replace(/^#\/?/, '').split('/');

  if (section === 'passport') {
    return code ? { name: 'passport', code: safeDecode(code) } : { name: 'passport-lookup' };
  }
  if (section === 'certificate' && code) {
    return { name: 'certificate', code: safeDecode(code) };
  }
  if (section === 'centre') {
    return { name: 'centre' };
  }
  return { name: 'home' };
}
