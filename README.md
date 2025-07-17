# x-line.js
用JavaScript实现的可点对点连线的功能，可一对多，可多对一，可多对多，具体可在`demo.html`中体验和了解。

### 使用说明

> 1. 本js依赖于layui的jquery、layer，并且没有写成layui组件库，也没有兼容requirejs的模块化，有兴趣优化的码友可以fork上来；
> 2. 导入本js后，将xLine函数暴露到window中，使用`window.xLine(<Array>data, <Function>callback)`进行初始化，callback接收一个参数：<Array>data，与输入参数一致；
> 3. `data`结构如下示例：

```json
[
  {"s": "start-1", "e": "end-1"},
  {"s": "start-1", "e": "end-2"},
  {"s": "start-1", "e": "end-3"},
  {"s": "start-1", "e": "end-4"},
  {"s": "start-2", "e": "end-4"},
  {"s": "start-3", "e": "end-4"},
]
```

> 4. 连线起点元素必须带有`.x-line-start`，连线重点元素必须带有`.x-line-end`；
> 5. 连线元素都必须有唯一的`data-id`属性；
> 6. 单选元素必须带有`.x-line-one`。
