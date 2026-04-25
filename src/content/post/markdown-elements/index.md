---
title: "Markdown 元素示例文章"
description: "这篇文章用于测试和列出多种不同的 Markdown 元素"
publishDate: "2023-02-22"
updatedDate: "2024-01-22"
tags: ["测试", "markdown"]
pinned: true
---

## 这是一个二级标题

### 这是一个三级标题

#### 这是一个四级标题

##### 这是一个五级标题

###### 这是一个六级标题

## 水平分割线

---

---

---

## 强调

**这是粗体文本**

_这是斜体文本_

~~删除线~~

## 引号

"双引号" 和 '单引号'

## 引用块

> 引用块也可以嵌套...
>
> > ...通过在彼此旁边使用额外的大于号...

## 参考文献

一个包含可点击参考文献[^1]并链接到来源的示例。

第二个包含参考文献[^2]并链接到来源的示例。

[^1]: 第一个参考文献，带有返回内容的链接。

[^2]: 第二个参考文献，带有链接。

如果你查看 `src/content/post/markdown-elements/index.md` 中的这个示例，你会注意到参考文献和"脚注"标题是通过 [remark-rehype](https://github.com/remarkjs/remark-rehype#options) 插件添加到页面底部的。

## 列表

无序列表

- 通过以 `+`、`-` 或 `*` 开始一行来创建列表
- 子列表通过缩进 2 个空格来创建：
  - 标记字符更改强制开始新列表：
    - 自由旋转的松散装饰
    - 在价格中轻松处理黑色列表
    - 没有旋转的装饰价值
- 非常简单！

有序列表

1. 这是有序列表的第一项
2. 这是有序列表的第二项
3. 这是有序列表的第三项

4. 你可以使用顺序数字...
5. ...或者将所有数字保持为 `1.`

从偏移量开始编号：

57. 第一个项目
1. 第二个项目

## 代码

内联 `代码`

缩进代码

    // 一些注释
    代码第 1 行
    代码第 2 行
    代码第 3 行

代码块 "围栏"

```
示例文本...
```

语法高亮

```js
var foo = function (bar) {
	return bar++;
};

console.log(foo(5));
```

### 表达式代码示例

添加标题

```js title="file.js"
console.log("标题示例");
```

一个 bash 终端

```bash
echo "基本终端示例"
```

高亮代码行

```js title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
	console.log("此行被标记为已删除");
	// 此行和下一行被标记为已插入
	console.log("这是第二行插入的行");

	return "此行使用中性默认标记类型";
}
```

[Expressive Code](https://expressive-code.com/) 可以做比这里展示的更多事情，并包含大量[自定义选项](https://expressive-code.com/reference/configuration/)。

## 表格

| 选项 | 描述                                                                       |
| ------ | ------------------------------------------------------------------------- |
| data   | 数据文件的路径，用于提供将传递到模板中的数据。                             |
| engine | 用于处理模板的引擎。默认为 Handlebars。                                    |
| ext    | 用于目标文件的扩展名。                                                     |

### 表格对齐

| 项目         | 价格 | 库存数量 |
| ------------ | :---: | ---------: |
| 多汁苹果     | 1.99  |        739 |
| 香蕉         | 1.89  |          6 |

### 键盘元素

| 操作                 | 快捷键                                   |
| --------------------- | ------------------------------------------ |
| 垂直分割             | <kbd>Alt+Shift++</kbd>                     |
| 水平分割             | <kbd>Alt+Shift+-</kbd>                     |
| 自动分割             | <kbd>Alt+Shift+d</kbd>                     |
| 在分割之间切换       | <kbd>Alt</kbd> + 方向键                   |
| 调整分割大小         | <kbd>Alt+Shift</kbd> + 方向键             |
| 关闭分割             | <kbd>Ctrl+Shift+W</kbd>                    |
| 最大化面板           | <kbd>Ctrl+Shift+P</kbd> + 切换面板缩放     |

## 图片

同一文件夹中的图片：`src/content/post/markdown-elements/logo.png`

![Astro 主题 cactus logo](./logo.png)

## 链接

[来自 markdown-it 的内容](https://markdown-it.github.io/)
