#!/usr/bin/env node

/**
 * 自动发布脚本 - 一键创建 Git Tag 和 GitHub Release
 * 使用方法: npm run release
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

// 读取当前版本号
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const manifestJson = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

const VERSION = packageJson.version;
const TAG_NAME = `v${VERSION}`;
const CHANGELOG = manifestJson.changelog;

console.log('\n🚀 开始自动发布流程...\n');
console.log(`📦 版本号: ${VERSION}`);
console.log(`🏷️  Tag: ${TAG_NAME}`);
console.log(`📝 更新日志:\n${CHANGELOG}\n`);

// 1. 检查是否有未提交的更改
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('⚠️  警告：有未提交的更改！');
    console.log('请先提交或暂存更改，然后重新运行此脚本。\n');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ 检查 Git 状态失败:', error.message);
  process.exit(1);
}

// 2. 检查 Tag 是否已存在
try {
  const existingTags = execSync('git tag', { encoding: 'utf8' });
  if (existingTags.includes(TAG_NAME)) {
    console.log(`⚠️  Tag ${TAG_NAME} 已存在！`);
    console.log('删除旧 Tag 并重新创建？ (Y/n)');
    
    // 在自动化场景下，我们直接删除旧 Tag
    console.log('🗑️  删除旧 Tag...');
    execSync(`git tag -d ${TAG_NAME}`, { stdio: 'inherit' });
    execSync(`git push origin :refs/tags/${TAG_NAME}`, { stdio: 'inherit' });
  }
} catch (error) {
  // Tag 不存在，继续
}

// 3. 创建 Git Tag
console.log('\n📌 创建 Git Tag...');
try {
  execSync(`git tag -a ${TAG_NAME} -m "${TAG_NAME} - ${CHANGELOG.split('\n')[0]}"`, { stdio: 'inherit' });
  console.log('✅ Tag 创建成功');
} catch (error) {
  console.error('❌ Tag 创建失败:', error.message);
  process.exit(1);
}

// 4. 推送 Tag 到 GitHub
console.log('\n📤 推送 Tag 到 GitHub...');
try {
  execSync(`git push origin ${TAG_NAME}`, { stdio: 'inherit' });
  console.log('✅ Tag 推送成功');
} catch (error) {
  console.error('❌ Tag 推送失败:', error.message);
  process.exit(1);
}

// 5. 创建 GitHub Release
console.log('\n🎉 创建 GitHub Release...');

// 从 git remote 获取仓库信息
let repoOwner = 'mzrodyu';
let repoName = 'maomaomz';

try {
  const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
  const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (match) {
    repoOwner = match[1];
    repoName = match[2];
  }
} catch (error) {
  console.log('⚠️  无法自动获取仓库信息，使用默认值');
}

// 构建 Release 描述
const releaseBody = `## ⚡ ${TAG_NAME} - ${CHANGELOG.split('\n')[0]}

### 📋 更新内容
${CHANGELOG}

---

### 📥 更新方法
在 SillyTavern 的 **扩展管理** 中点击 **"立即更新"** 按钮即可。

或手动下载后解压到 \`data/default-user/extensions/third-party/\` 目录。
`;

// GitHub API 请求
const postData = JSON.stringify({
  tag_name: TAG_NAME,
  name: `${TAG_NAME} - ${CHANGELOG.split('\n')[0]}`,
  body: releaseBody,
  draft: false,
  prerelease: false
});

// 尝试从环境变量或 Git 配置获取 GitHub Token
let githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!githubToken) {
  try {
    githubToken = execSync('git config --get github.token', { encoding: 'utf8' }).trim();
  } catch (error) {
    // 没有配置 Token
  }
}

if (!githubToken) {
  console.log('\n⚠️  未配置 GitHub Token！');
  console.log('\n📖 配置方法：');
  console.log('1. 访问 https://github.com/settings/tokens');
  console.log('2. 创建新 Token，勾选 "repo" 权限');
  console.log('3. 运行: git config --global github.token YOUR_TOKEN');
  console.log('   或设置环境变量: set GITHUB_TOKEN=YOUR_TOKEN\n');
  console.log('💡 本次发布已创建 Tag，你可以手动访问以下地址创建 Release：');
  console.log(`   https://github.com/${repoOwner}/${repoName}/releases/new?tag=${TAG_NAME}\n`);
  process.exit(0);
}

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${repoOwner}/${repoName}/releases`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `token ${githubToken}`,
    'User-Agent': 'Node.js Release Script'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      const release = JSON.parse(data);
      console.log('✅ GitHub Release 创建成功！');
      console.log(`🔗 Release URL: ${release.html_url}\n`);
      console.log('🎉 发布完成！用户现在可以在 SillyTavern 中检测到更新了！\n');
    } else {
      console.error('❌ GitHub Release 创建失败');
      console.error(`状态码: ${res.statusCode}`);
      console.error(`响应: ${data}\n`);
      console.log('💡 你可以手动访问以下地址创建 Release：');
      console.log(`   https://github.com/${repoOwner}/${repoName}/releases/new?tag=${TAG_NAME}\n`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
  console.log('\n💡 你可以手动访问以下地址创建 Release：');
  console.log(`   https://github.com/${repoOwner}/${repoName}/releases/new?tag=${TAG_NAME}\n`);
  process.exit(1);
});

req.write(postData);
req.end();

