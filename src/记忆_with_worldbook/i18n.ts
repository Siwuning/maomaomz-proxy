import { computed, ref } from 'vue';

// 支持的语言
export type SupportedLanguage = 'zh' | 'en';

// 当前语言（从 localStorage 读取，默认中文）
const currentLanguage = ref<SupportedLanguage>(
  (localStorage.getItem('maomaomz_language') as SupportedLanguage) || 'zh',
);

// 语言包
const translations: Record<SupportedLanguage, Record<string, string>> = {
  zh: {},
  en: {},
};

// 是否已加载语言包
let isLoaded = false;

/**
 * 加载语言包
 */
export async function loadTranslations() {
  if (isLoaded) return;

  try {
    // 动态导入语言文件
    const [zhModule, enModule] = await Promise.all([import('../../i18n/zh.json'), import('../../i18n/en.json')]);

    translations.zh = zhModule.default || zhModule;
    translations.en = enModule.default || enModule;
    isLoaded = true;
    console.log('✅ 语言包加载完成');
  } catch (error) {
    console.error('❌ 加载语言包失败:', error);
  }
}

/**
 * 翻译函数
 * @param key 翻译键（中文文本）
 * @param params 可选的参数替换，如 {count: 5}
 * @returns 翻译后的文本
 */
export function t(key: string, params?: Record<string, string | number>): string {
  // 获取当前语言的翻译
  const lang = currentLanguage.value;
  let text = translations[lang]?.[key];

  // 如果没找到翻译，返回原始 key（中文）
  if (!text) {
    // 对于中文，直接返回 key 本身
    if (lang === 'zh') {
      text = key;
    } else {
      // 英文模式下，如果没有翻译，尝试使用中文版本或返回 key
      text = translations.zh?.[key] || key;
      // 调试：记录缺失的翻译
      if (!translations.en?.[key]) {
        console.warn(`[i18n] 缺少英文翻译: "${key}"`);
      }
    }
  }

  // 参数替换
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}

/**
 * 获取当前语言
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage.value;
}

/**
 * 设置当前语言
 */
export function setLanguage(lang: SupportedLanguage) {
  currentLanguage.value = lang;
  localStorage.setItem('maomaomz_language', lang);
  console.log(`🌐 语言已切换为: ${lang === 'zh' ? '中文' : 'English'}`);
}

/**
 * 切换语言
 */
export function toggleLanguage() {
  const newLang = currentLanguage.value === 'zh' ? 'en' : 'zh';
  setLanguage(newLang);
}

/**
 * Vue composable - 在组件中使用
 */
export function useI18n() {
  return {
    t,
    currentLanguage: computed(() => currentLanguage.value),
    setLanguage,
    toggleLanguage,
    isEnglish: computed(() => currentLanguage.value === 'en'),
    isChinese: computed(() => currentLanguage.value === 'zh'),
  };
}

// 语言选项（用于下拉框）
export const languageOptions = [
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
];
