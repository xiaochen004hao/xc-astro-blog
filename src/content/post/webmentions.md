---
title: "为 Astro Cactus 添加 Webmentions"
description: "这篇文章描述了向自己的网站添加 webmentions 的过程"
publishDate: "2023-10-11"
tags: ["webmentions", "astro", "社交"]
updatedDate: "2024-12-06"
pinned: true
---

## 简要概述

1. 按照 [IndieLogin](https://indielogin.com/setup) 的说明，在你的主页上添加指向你的 GitHub 个人资料和/或电子邮件地址的链接。你可以通过 `src/components/SocialList.astro` 来实现，如果这样做，请确保在相关链接中包含 `isWebmention`。
2. 通过输入你的网站地址在 [Webmention.io](https://webmention.io/) 创建一个账户。
3. 将链接 feed 和 api 密钥添加到 `.env` 文件中，分别使用键 `WEBMENTION_URL` 和 `WEBMENTION_API_KEY`，你可以重命名此模板中找到的 `.env.example`。你也可以在这里添加可选的 `WEBMENTION_PINGBACK` 链接。
4. 前往 [brid.gy](https://brid.gy/) 并登录到你想要链接的每个社交账户。
5. 发布和构建你的网站，记得添加 api 密钥，现在它应该准备好接收 webmentions 了！

## 什么是 webmentions

简单来说，这是一种通过社交媒体显示用户在你的网站各个页面上点赞、评论、转发等行为的方式。

这个主题显示每篇博客文章收到的点赞数、提及和回复数。还有一些我没有包含的 webmentions，比如转发，目前已被过滤掉，但包含它们应该不会太困难。

## 将其添加到你自己的网站的步骤

你需要创建几个账户才能让一切运行起来。但是，首先你需要确保你的社交链接是正确的。

### 添加指向你的个人资料的链接

首先，你需要在你的网站上添加一个链接来证明所有权。如果你查看 [IndieLogin](https://indielogin.com/setup) 的说明，它会给你 2 个选项，电子邮件地址和/或 GitHub 账户。我创建了组件 `src/components/SocialList.astro`，你可以在其中将你的详细信息添加到 `socialLinks` 数组中，只需在相关链接中包含 `isWebmention` 属性，这将添加 `rel="me authn"` 属性。无论你采用哪种方式，请确保按照 IndieLogin 的[说明](https://indielogin.com/setup)在你的标记中有一个链接

```html
<a href="https://github.com/your-username" rel="me">GitHub</a>
```

### 注册 Webmention.io

接下来，前往 [Webmention.io](https://webmention.io/) 并通过使用你的域名登录来创建一个账户，例如 `https://astro-cactus.chriswilliams.dev/`。请注意，.app 顶级域名不能正常工作。进入后，它将为你的域名提供几个链接以接受 webmentions。记下这些链接并创建一个 `.env` 文件（此模板包含一个示例 `.env.example`，你可以重命名它）。分别使用 `WEBMENTION_URL` 和 `WEBMENTION_API_KEY` 的键/值添加链接 feed 和 api 密钥，如果需要，还可以添加可选的 `WEBMENTION_PINGBACK` url。请尽量不要将其发布到存储库中！

:::note
你不必包含 pingback 链接。也许是巧合，但在添加它之后，我开始在邮箱中收到更高频率的垃圾邮件，告诉我我的网站可以更好。老实说他们没说错。我现在已经删除了它，但这取决于你。
:::

### 注册 Brid.gy

你现在需要使用 [brid.gy](https://brid.gy/)。顾名思义，它将你的网站链接到你的社交媒体账户。对于你想要设置的每个账户（例如 Mastodon），点击相关按钮并连接你希望 brid.gy 搜索的每个账户。再次提醒，brid.gy 目前对 .app 顶级域名有问题。

## 测试一切是否正常工作

一切设置好后，现在是时候构建和发布你的网站了。**记住**要使用你的主机设置环境变量 `WEBMENTION_API_KEY` 和 `WEBMENTION_URL`。

你可以通过 [webmentions.rocks](https://webmention.rocks/receive/1) 发送测试 webmention 来检查一切是否正常工作。使用你的域名登录，输入验证码，然后输入你想要测试的页面的 url。例如，要测试此页面，我会添加 `https://astro-cactus.chriswilliams.dev/posts/webmentions/`。要在你的网站上查看它，在本地重新构建或（重新）启动开发模式，你应该能在页面底部看到结果。

你也可以通过他们的 [api](https://github.com/aaronpk/webmention.io#api) 在浏览器中查看任何测试提及。

## 要添加的内容，要考虑的事项

- 目前，新的 webmentions 只在重新构建或重新启动开发模式时获取，这显然意味着如果你不经常更新你的网站，你不会获得很多新内容。添加一个 cron 作业来运行 `src/utils/webmentions.ts` 中的 `getAndCacheWebmentions()` 函数并用新内容填充你的博客应该是相当简单的。这很可能是我接下来要添加的 github action。

- 我看到一些提及有重复。不幸的是，由于它们有不同的 id，很难过滤掉它们。

- 我不太喜欢用于链接到评论/回复的小外部链接图标。由于它的大小，它在移动设备上不是特别好，我可能会在将来更改它。

## 致谢

非常感谢 [Kieran McGuire](https://github.com/chrismwilliams/astro-theme-cactus/issues/107#issue-1863931105) 与我分享这一点，以及有用的帖子。我以前从未听说过 webmentions，现在有了这个更新，希望其他人也能利用它们。此外，来自 [kld](https://kld.dev/adding-webmentions/) 和 [ryanmulligan.dev](https://ryanmulligan.dev/blog/) 的文章和示例在设置和集成方面真的很有帮助，如果你正在寻找更多信息，两者都是很好的资源！
