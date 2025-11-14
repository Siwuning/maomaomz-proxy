// 精美 Regex 模板库
export interface RegexTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  triggerRegex: string;
  htmlTemplate: string;
  cssContent: string;
  scriptContent: string;
}

export const templates: RegexTemplate[] = [];
