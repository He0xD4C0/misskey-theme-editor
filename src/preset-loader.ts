/**
 * 预设主题加载器
 * 从 assects/theme/ 目录加载 JSON5 主题文件
 */

import { type Theme, parseThemeCode } from './theme-engine';
import JSON5 from 'json5';

export interface ExternalPresetTheme {
  name: string;
  nameZh: string;
  theme: Theme;
  fileName: string;
}

// Vite 的 import.meta.glob 导入所有 JSON5 文件
const themeModules = import.meta.glob('/assects/theme/*.json5', { query: '?raw', import: 'default' });

// 主题名称中文映射
const nameZhMap: Record<string, string> = {
  'mi_light': 'Mi 亮色',
  'mi_dark': 'Mi 暗色',
  'mi_apricot_light': '杏色亮色',
  'mi_astro_dark': '星空暗色',
  'mi_botanical_dark': '植物暗色',
  'mi_botanical_light': '植物亮色',
  'mi_cherry_dark': '樱花暗色',
  'mi_cherry_light': '樱花亮色',
  'mi_coffee_light': '咖啡亮色',
  'mi_future_dark': '未来暗色',
  'mi_green+lime_dark': '青柠暗色',
  'mi_green+orange_dark': '橙绿暗色',
  'mi_ice_dark': '冰蓝暗色',
  'mi_persimmon_dark': '柿子暗色',
  'mi_rainy_light': '雨天亮色',
  'mi_sushi_light': '寿司亮色',
  'mi_u0_dark': 'U0 暗色',
  'mi_u0_light': 'U0 亮色',
  'mi_vivid_light': '鲜艳亮色',
};

/** 加载所有外部主题文件 */
export async function loadExternalThemes(): Promise<ExternalPresetTheme[]> {
  const themes: ExternalPresetTheme[] = [];

  for (const [path, loader] of Object.entries(themeModules)) {
    try {
      const raw = await loader() as string;
      const theme = parseThemeCode(raw);
      const fileName = path.split('/').pop()!.replace('.json5', '');

      themes.push({
        name: theme.name || fileName,
        nameZh: nameZhMap[fileName] || theme.name || fileName,
        theme,
        fileName,
      });
    } catch (err) {
      console.warn(`Failed to load theme: ${path}`, err);
    }
  }

  return themes;
}
