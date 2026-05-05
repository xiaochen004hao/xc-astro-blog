---
title: "示例 OG 社交图片"
publishDate: "2023-01-27"
description: "Astro Cactus 的示例文章，详细介绍如何在 frontmatter 中添加自定义社交图片卡片"
tags: ["示例", "博客", "图片"]
ogImage: "/social-card.png"
aiSummary: 这篇文章介绍了Astro主题中Open Graph社交图片的自定义配置方法。文章通过具体示例演示了如何在文章frontmatter中添加ogImage属性来手动指定社交分享图片，从而替代主题默认的自动生成机制。当文章被分享到社交媒体平台时，OG图片会作为预览卡片的核心视觉元素展示，直接影响内容的点击率和传播效果。文章以public目录下的social-card.png为例说明了图片路径的配置方式，并指出图片可以存放在项目内任意位置，帮助读者为每篇文章打造更具品牌辨识度的社交分享体验。
aiModel: DeepSeek-V4-Pro
---

## 为文章添加自己的社交图片

这篇文章是一个示例，展示如何为博客文章添加自定义的 [open graph](https://ogp.me/) 社交图片，也称为 OG 图片。
通过在文章的 frontmatter 中添加可选的 ogImage 属性，你可以选择不使用 [satori](https://github.com/vercel/satori) 自动为此页面生成图片。

如果你打开这个 markdown 文件 `src/content/post/social-image.md`，你会看到 ogImage 属性设置为位于 public 文件夹中的图片[^1]。

```yaml
ogImage: "/social-card.png"
```

你可以查看为这个模板页面设置的图片 [这里](https://astro-cactus.chriswilliams.dev/social-card.png)。

[^1]: 图片本身可以位于你喜欢的任何位置。
