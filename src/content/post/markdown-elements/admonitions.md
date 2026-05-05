---
title: "Markdown 提示框"
description: "这篇文章展示了在 Astro Cactus 中使用 markdown 提示框功能"
publishDate: "2024-08-25"
updatedDate: "2025-07-04"
tags: ["markdown", "admonitions"]
aiSummary: 这篇文章详细介绍Astro主题中提示框组件的使用方法。提示框又称旁注，是用于补充和强调内容的重要排版元素。文章详细说明了note、tip、important、warning、caution等五种提示框类型的语法格式，并演示了自定义标题和GitHub仓库卡片链接等进阶功能，帮助读者丰富博客内容的表达能力。
aiModel: DeepSeek-V4-Pro
---

## 什么是提示框

提示框（也称为 “旁注”) 对于提供与您的内容相关的支持和/或补充信息非常有用。

## 如何使用它们

要在 Astro Cactus 中使用提示框，请将您的 Markdown 内容包裹在一对三重冒号 `:::` 中。第一对还应包含您想要使用的提示框类型。

例如，使用以下 Markdown：

```md
:::note
突出显示用户在浏览时也应考虑的信息。
:::
```

输出：

:::note
突出显示用户在浏览时也应考虑的信息。
:::

## 提示框类型

目前支持以下提示框类型：

- `note`（笔记）
- `tip`（提示）
- `important`（重要）
- `warning`（警告）
- `caution`（注意）

### 笔记

```md
:::note
突出显示用户在浏览时也应考虑的信息。
:::
```

:::note
突出显示用户在浏览时也应考虑的信息。
:::

### 提示

```md
:::tip
可选信息，帮助用户更成功。
:::
```

:::tip
可选信息，帮助用户更成功。
:::

### 重要

```md
:::important
用户成功所需的关键信息。
:::
```

:::important
用户成功所需的关键信息。
:::

### 注意

```md
:::caution
操作的潜在负面后果。
:::
```

:::caution
操作的潜在负面后果。
:::

### 警告

```md
:::warning
由于潜在风险，需要用户立即关注的关键内容。
:::
```

:::warning
由于潜在风险，需要用户立即关注的关键内容。
:::

## 自定义提示框标题

您可以使用以下标记自定义提示框标题：

```md
:::note[我的自定义标题]
这是一个带有自定义标题的笔记。
:::
```

输出：

:::note[我的自定义标题]
这是一个带有自定义标题的笔记。
:::

## GitHub 仓库卡片

您可以添加链接到 GitHub 仓库的动态卡片，在页面加载时，仓库信息将从 GitHub API 中提取。

::github{repo="chrismwilliams/astro-theme-cactus"}

您也可以链接 GitHub 用户：

::github{user="withastro"}

要使用此功能，您只需使用 "Github" 指令：

```markdown title="链接仓库"
::github{repo="chrismwilliams/astro-theme-cactus"}
```

```markdown title="链接用户"
::github{user="withastro"}
```
