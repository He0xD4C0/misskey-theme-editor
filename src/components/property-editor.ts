/**
 * 属性编辑器组件
 */

import {
  themeProps, themePropGroups, propNameZh,
  classifyThemeValue,
} from '../theme-engine';
import { el } from '../ui-utils';
import { currentTheme, expandedGroups, toggleGroup, getBaseTheme } from '../state';
import { getResolvedColor, toPickerColor } from '../helpers';
import { events, Events } from '../events';
import tinycolor from 'tinycolor2';

export function buildPropertyEditor(): HTMLElement {
  const section = el('div', 'editor-section');

  const title = el('h3', 'section-title');
  title.textContent = '属性编辑';
  section.appendChild(title);

  for (const group of themePropGroups) {
    const groupEl = el('div', 'prop-group');

    const header = el('div', 'prop-group-header');
    const arrow = el('span', 'prop-group-arrow');
    arrow.textContent = expandedGroups.has(group.label) ? '▼' : '▶';
    const label = el('span');
    label.textContent = `${group.labelZh} (${group.label})`;
    const count = el('span', 'prop-group-count');
    count.textContent = `${group.props.length} 个属性`;
    header.append(arrow, label, count);

    header.addEventListener('click', () => {
      toggleGroup(group.label);
      events.emit(Events.BUILD_APP);
    });

    groupEl.appendChild(header);

    if (expandedGroups.has(group.label)) {
      const propsEl = el('div', 'prop-group-props');
      for (const propKey of group.props) {
        propsEl.appendChild(buildPropRow(propKey));
      }
      groupEl.appendChild(propsEl);
    }

    section.appendChild(groupEl);
  }

  return section;
}

function buildPropRow(propKey: string): HTMLElement {
  const row = el('div', 'prop-row');

  const val = currentTheme.props[propKey] ?? '';
  const kind = classifyThemeValue(val);

  // 属性名
  const nameEl = el('div', 'prop-name');
  const nameMain = el('span', 'prop-name-main');
  nameMain.textContent = propKey;
  const nameZhEl = el('span', 'prop-name-zh');
  nameZhEl.textContent = propNameZh[propKey] ?? '';
  nameEl.append(nameMain, nameZhEl);
  row.appendChild(nameEl);

  // 值类型标签
  const kindBadge = el('span', `value-kind kind-${kind}`);
  kindBadge.textContent = {
    color: '颜色', refProp: '引用', refConst: '常量',
    func: '函数', rawCss: '原始CSS', empty: '空',
  }[kind] ?? kind;
  row.appendChild(kindBadge);

  // 颜色预览 + 编辑
  const editArea = el('div', 'prop-edit');

  // 颜色选择器（仅颜色/函数类型显示）
  if (kind === 'color' || kind === 'func') {
    const wrapper = el('div', 'color-picker-wrapper');
    wrapper.dataset.prop = propKey;
    try {
      const resolved = getResolvedColor(propKey);
      if (tinycolor(resolved).getAlpha() < 1) {
        wrapper.classList.add('has-alpha');
      }
    } catch {}

    const picker = el('input') as HTMLInputElement;
    picker.type = 'color';
    picker.value = toPickerColor(propKey);
    picker.className = 'color-picker';
    picker.addEventListener('input', () => {
      currentTheme.props[propKey] = picker.value;
      events.emit(Events.PROP_CHANGED);
    });
    wrapper.appendChild(picker);
    editArea.appendChild(wrapper);
  } else {
    // 非颜色类型只显示预览块
    const preview = el('div', 'color-picker-wrapper');
    preview.dataset.prop = propKey;
    preview.style.cursor = 'default';
    try {
      const resolved = getResolvedColor(propKey);
      preview.style.backgroundColor = resolved;
      if (tinycolor(resolved).getAlpha() < 1) {
        preview.classList.add('has-alpha');
      }
    } catch {
      preview.style.backgroundColor = '#ccc';
    }
    editArea.appendChild(preview);
  }

  // 文本输入
  const input = el('input') as HTMLInputElement;
  input.type = 'text';
  input.value = val;
  input.className = 'prop-input';
  input.dataset.prop = propKey;
  input.placeholder = '输入值...';
  input.addEventListener('input', () => {
    if (input.value) {
      currentTheme.props[propKey] = input.value;
    } else {
      delete currentTheme.props[propKey];
    }
    events.emit(Events.PROP_CHANGED);
    // 更新颜色预览
    try {
      const resolved = getResolvedColor(propKey);
      const picker = editArea.querySelector('.color-picker') as HTMLInputElement;
      if (picker) {
        picker.value = toPickerColor(propKey);
      }
      const wrapper = editArea.querySelector('.color-picker-wrapper') as HTMLElement;
      if (wrapper && !picker) {
        wrapper.style.backgroundColor = resolved;
      }
    } catch {}
  });
  editArea.appendChild(input);

  // 重置按钮
  const resetBtn = el('button', 'prop-reset-btn') as HTMLButtonElement;
  resetBtn.dataset.prop = propKey;
  resetBtn.textContent = '↺';
  resetBtn.title = '重置为基础主题值';
  const baseTheme = getBaseTheme(currentTheme.base ?? 'light');
  const baseVal = baseTheme.props[propKey] ?? '';
  const isModified = val !== baseVal;
  if (!isModified) {
    resetBtn.disabled = true;
    resetBtn.style.opacity = '0.3';
  }
  resetBtn.addEventListener('click', () => {
    if (baseVal) {
      currentTheme.props[propKey] = baseVal;
    } else {
      delete currentTheme.props[propKey];
    }
    events.emit(Events.BUILD_APP);
  });
  editArea.appendChild(resetBtn);

  row.appendChild(editArea);

  return row;
}

/** 刷新所有颜色预览、选择器和重置按钮（当属性变化时调用） */
export function updatePropEditors() {
  const baseTheme = getBaseTheme(currentTheme.base ?? 'light');

  // 更新颜色预览和选择器
  const wrappers = document.querySelectorAll<HTMLElement>('.color-picker-wrapper[data-prop]');
  for (const wrapper of wrappers) {
    const propKey = wrapper.dataset.prop!;
    try {
      const resolved = getResolvedColor(propKey);
      const picker = wrapper.querySelector('.color-picker') as HTMLInputElement | null;
      const hasAlpha = tinycolor(resolved).getAlpha() < 1;

      if (picker) {
        picker.value = toPickerColor(propKey);
        wrapper.classList.toggle('has-alpha', hasAlpha);
      } else {
        wrapper.style.backgroundColor = resolved;
        wrapper.classList.toggle('has-alpha', hasAlpha);
      }
    } catch {}
  }

  // 更新文本输入框（跳过当前聚焦的）
  const textInputs = document.querySelectorAll<HTMLInputElement>('.prop-input[data-prop]');
  for (const inp of textInputs) {
    if (inp === document.activeElement) continue;
    const propKey = inp.dataset.prop!;
    inp.value = currentTheme.props[propKey] ?? '';
  }

  // 更新重置按钮状态
  const resetBtns = document.querySelectorAll<HTMLButtonElement>('.prop-reset-btn[data-prop]');
  for (const btn of resetBtns) {
    const propKey = btn.dataset.prop!;
    const baseVal = baseTheme.props[propKey] ?? '';
    const currentVal = currentTheme.props[propKey] ?? '';
    const isModified = currentVal !== baseVal;
    btn.disabled = !isModified;
    btn.style.opacity = isModified ? '1' : '0.3';
  }
}
