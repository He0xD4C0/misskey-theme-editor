/**
 * 应用状态管理
 */

import {
  type Theme,
  LIGHT_BASE, DARK_BASE,
  genId,
} from './theme-engine';

// ─── State ───────────────────────────────────────────────

export let currentTheme: Theme = {
  id: '642d1acc-6a76-4903-b56f-48bbcb606038',
  name: 'Mi Light',
  author: '@me',
  base: 'light',
  props: {
    ...LIGHT_BASE.props,
    bg: '#f9f9f9',
    fg: '#676767',
    fgOnWhite: '@accent',
    divider: '#e8e8e8',
    panel: '#fff',
    navBg: '#fff',
    mentionMe: 'rgb(0, 179, 70)',
  },
};

export let expandedGroups = new Set<string>(['Core Colors', 'Panels', 'Header & Navigation']);

// ─── State Getters ───────────────────────────────────────

export function getBaseTheme(base: 'light' | 'dark'): Theme {
  return base === 'dark' ? DARK_BASE : LIGHT_BASE;
}

export function getMergedTheme(): Theme {
  const base = getBaseTheme(currentTheme.base ?? 'light');
  return {
    ...currentTheme,
    props: { ...base.props, ...currentTheme.props },
  };
}

// ─── State Setters ───────────────────────────────────────

export function setCurrentTheme(theme: Theme) {
  currentTheme = theme;
}

export function updateCurrentTheme(updates: Partial<Theme>) {
  Object.assign(currentTheme, updates);
}

export function toggleGroup(groupLabel: string) {
  if (expandedGroups.has(groupLabel)) {
    expandedGroups.delete(groupLabel);
  } else {
    expandedGroups.add(groupLabel);
  }
}

export function resetTheme(base: 'light' | 'dark', keepColors: string[] = ['accent', 'bg', 'fg']) {
  const baseTheme = getBaseTheme(base);
  const keptValues: Record<string, string> = {};

  for (const key of keepColors) {
    if (currentTheme.props[key]) {
      keptValues[key] = currentTheme.props[key];
    }
  }

  currentTheme.base = base;
  currentTheme.props = { ...baseTheme.props, ...keptValues };
}
