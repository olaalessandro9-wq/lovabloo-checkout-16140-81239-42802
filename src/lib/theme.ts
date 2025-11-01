export type Theme = 'light' | 'dark';

const KEY = 'theme';

export function getTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function setTheme(next: Theme) {
  try {
    localStorage.setItem(KEY, next);
  } catch {}
  if (next === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
