# API 配置指南

本文档详细介绍了如何配置和使用增强版的 API 端点配置系统，帮助您解决 CORS 问题和反向代理配置。

## 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [端点类型](#端点类型)
- [CORS 问题解决方案](#cors-问题解决方案)
- [反向代理配置](#反向代理配置)
- [常见 API 提供商配置](#常见-api-提供商配置)
- [高级配置](#高级配置)
- [故障排除](#故障排除)

## 功能特性

### 新增功能
- 🔍 智能端点类型检测
- 🌐 自动 CORS 代理选择
- 🔧 反向代理端口处理
- 🤖 已知 API 提供商自动配置
- 📊 CORS 代理可用性测试
- 💡 智能配置推荐

### 支持的端点类型
- `direct` - 直连 API（支持 CORS）
- `cors-proxy` - 通过 CORS 代理访问
- `reverse-proxy` - 反向代理
- `local` - 本地 API
- `cloudflare` - Cloudflare Worker
- `custom` - 自定义配置

## 快速开始

### 基本使用

```typescript
import { buildApiUrl, detectEndpointType, getSmartConfig } from './utils/api-config';

// 1. 检测端点类型
const endpoint = 'https://api.openai.com/v1';
const type = detectEndpointType(endpoint); // 返回: 'direct'

// 2. 获取智能配置
const config = await getSmartConfig(endpoint);
// 返回配置对象，包含最佳设置

// 3. 构建 API URL
const apiUrl = buildApiUrl(config);
```

### 配置对象结构

```typescript
interface ApiEndpointConfig {
  type: ApiEndpointType;           // 端点类型
  baseUrl: string;                 // 基础 URL
  corsProxy?: string;              // CORS 代理地址
  customHeaders?: Record<string, string>; // 自定义请求头
  timeout?: number;                // 超时时间（毫秒）
  retryCount?: number;             // 重试次数
  retryDelay?: number;             // 重试延迟（毫秒）
  port?: number;                   // 自定义端口
  path?: string;                   // 自定义路径
  protocol?: 'http' | 'https';    // 协议
  autoDetectPath?: boolean;        // 自动检测路径
  skipCorsCheck?: boolean;         // 跳过 CORS 检查
}
```

## 端点类型

### 1. 直连 API (direct)
适用于支持 CORS 的公共 API。

```typescript
const config: ApiEndpointConfig = {
  type: 'direct',
  baseUrl: 'https://api.openai.com/v1',
};
```

### 2. CORS 代理 (cors-proxy)
适用于不支持 CORS 的 API。

```typescript
const config: ApiEndpointConfig = {
  type: 'cors-proxy',
  baseUrl: 'https://api.example.com',
  corsProxy: 'https://api.allorigins.win/raw?url=',
};
```

### 3. 反向代理 (reverse-proxy)
适用于自建的反向代理服务器。

```typescript
const config: ApiEndpointConfig = {
  type: 'reverse-proxy',
  baseUrl: 'https://proxy.example.com',
  port: 8080,
  path: '/api/v1/chat/completions',
};
```

### 4. 本地 API (local)
适用于本地运行的 API 服务。

```typescript
const config: ApiEndpointConfig = {
  type: 'local',
  baseUrl: 'http://localhost:1234',
};
```

## CORS 问题解决方案

### 方案 1：使用 CORS 代理

系统提供了多个内置的 CORS 代理：

1. **AllOrigins**（推荐）
   - URL: `https://api.allorigins.win/raw?url=`
   - 稳定可靠，速度较快

2. **CORS.sh**
   - URL: `https://cors.sh/`
   - 备用选择

3. **自定义 CORS 代理**
   - 支持配置自己的 CORS 代理服务

#### 自动选择可用代理

```typescript
import { getAvailableCorsProxies } from './utils/api-config';

// 获取所有可用的 CORS 代理
const proxies = await getAvailableCorsProxies();
console.log('可用的代理:', proxies);
```

### 方案 2：配置服务器 CORS

对于自建 API 服务器，添加 CORS 响应头：

```javascript
// Express.js 示例
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});
```

### 方案 3：使用 Cloudflare Worker

创建一个 Cloudflare Worker 作为代理：

```javascript
// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const actualUrl = url.searchParams.get('url');
    
    const modifiedRequest = new Request(actualUrl, {
      headers: request.headers,
      method: request.method,
      body: request.body,
    });
    
    const response = await fetch(modifiedRequest);
    const modifiedResponse = new Response(response.body, response);
    
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    return modifiedResponse;
  },
};
```

## 反向代理配置

### 处理自定义端口

```typescript
const config: ApiEndpointConfig = {
  type: 'reverse-proxy',
  baseUrl: 'https://api.example.com',
  port: 3000, // 自定义端口
  protocol: 'https',
};

// 生成的 URL: https://api.example.com:3000/v1/chat/completions
```

### 处理自定义路径

```typescript
const config: ApiEndpointConfig = {
  type: 'reverse-proxy',
  baseUrl: 'https://proxy.example.com',
  path: '/custom/api/endpoint',
};

// 生成的 URL: https://proxy.example.com/custom/api/endpoint
```

## 常见 API 提供商配置

### OpenAI

```typescript
const config: ApiEndpointConfig = {
  type: 'direct',
  baseUrl: 'https://api.openai.com',
};
```

### Anthropic (Claude)

```typescript
const config: ApiEndpointConfig = {
  type: 'direct',
  baseUrl: 'https://api.anthropic.com',
};
```

### Google (Gemini)

```typescript
const config: ApiEndpointConfig = {
  type: 'direct',
  baseUrl: 'https://generativelanguage.googleapis.com',
};
```

### 本地 LM Studio

```typescript
const config: ApiEndpointConfig = {
  type: 'cors-proxy',
  baseUrl: 'http://localhost:1234',
  corsProxy: 'https://api.allorigins.win/raw?url=',
};
```

### 本地 Ollama

```typescript
const config: ApiEndpointConfig = {
  type: 'cors-proxy',
  baseUrl: 'http://localhost:11434',
  corsProxy: 'https://api.allorigins.win/raw?url=',
};
```

## 高级配置

### 自定义请求头

```typescript
const config: ApiEndpointConfig = {
  type: 'direct',
  baseUrl: 'https://api.example.com',
  customHeaders: {
    'X-Custom-Header': 'value',
    'X-Api-Version': '2.0',
  },
};
```

### 配置重试策略

```typescript
const config: ApiEndpointConfig = {
  type: 'direct',
  baseUrl: 'https://api.example.com',
  timeout: 30000,      // 30秒超时
  retryCount: 3,       // 重试3次
  retryDelay: 2000,    // 每次重试间隔2秒
};
```

### 测试 API 连接

```typescript
import { testApiConnection } from './utils/api-config';

const result = await testApiConnection(config, apiKey, model);
if (result.success) {
  console.log('连接成功！', result.details);
} else {
  console.error('连接失败：', result.message);
}
```

## 故障排除

### 常见错误及解决方案

#### 1. CORS 错误
**错误信息**: `Failed to fetch` 或 `CORS policy`

**解决方案**:
- 使用 CORS 代理
- 配置服务器允许跨域
- 使用反向代理

#### 2. 401 认证失败
**错误信息**: `认证失败：请检查 API Key 是否正确`

**解决方案**:
- 检查 API Key 是否正确
- 确认 API Key 有相应权限
- 检查请求头格式

#### 3. 429 频率限制
**错误信息**: `请求频率限制：请稍后再试`

**解决方案**:
- 降低请求频率
- 使用更长的重试延迟
- 考虑升级 API 套餐

#### 4. 503 服务不可用
**错误信息**: `API 服务暂时不可用`

**解决方案**:
- 等待服务恢复
- 使用备用端点
- 检查 API 服务状态

### 调试提示

1. **启用详细日志**
   ```typescript
   // 在浏览器控制台查看详细信息
   console.log('端点类型:', detectEndpointType(endpoint));
   console.log('配置建议:', getEndpointSuggestions(endpoint));
   ```

2. **测试 CORS 代理**
   ```typescript
   const isAvailable = await testCorsProxy(proxyUrl);
   console.log(`代理 ${proxyUrl} 可用性:`, isAvailable);
   ```

3. **使用智能配置**
   ```typescript
   // 自动获取最佳配置
   const smartConfig = await getSmartConfig(endpoint);
   console.log('推荐配置:', smartConfig);
   ```

## 最佳实践

1. **优先使用智能配置**: 使用 `getSmartConfig()` 自动获取最佳配置
2. **测试连接**: 在正式使用前先测试 API 连接
3. **配置重试**: 合理设置重试次数和延迟
4. **错误处理**: 妥善处理各种错误情况
5. **安全考虑**: 不要在前端代码中硬编码 API Key

## 更新日志

### v2.0.0 - 2024-11
- 新增智能端点检测
- 支持多种 CORS 代理
- 改进反向代理端口处理
- 添加已知 API 提供商配置
- 新增 CORS 代理可用性测试
- 添加智能配置推荐功能

---

如有问题或建议，请提交 Issue 或 PR。
