/**
 * 辅助函数
 */

import {
  type CompiledTheme,
  compile, compileValue,
} from './theme-engine';
import { getMergedTheme, currentTheme } from './state';
import tinycolor from 'tinycolor2';

// ─── Theme Helpers ───────────────────────────────────────

export function getCompiledTheme(): CompiledTheme {
  return compile(getMergedTheme());
}

/** 获取属性的解析颜色（用于颜色选择器显示） */
export function getResolvedColor(propKey: string): string {
  const merged = getMergedTheme();
  const val = merged.props[propKey];
  if (!val) return '#000000';
  if (val.startsWith('"')) return '#000000';
  try {
    return compileValue(merged, val);
  } catch {
    return '#000000';
  }
}

/** 从 rgba(...) 中提取 hex（用于颜色选择器的 value） */
export function toPickerColor(propKey: string): string {
  const resolved = getResolvedColor(propKey);
  const tc = tinycolor(resolved);
  if (!tc.isValid()) return '#000000';
  return tc.toHexString();
}

/** 判断颜色是否为"透明"值（包含 alpha） */
export function hasAlpha(propKey: string): boolean {
  const val = currentTheme.props[propKey] ?? '';
  return val.includes('alpha') || val.includes('rgba');
}
