# zDropdown

example:  [zzetao.github.io/zDropdown/example/](https://zzetao.github.io/zDropdown/example/)

## 特性

- [**轻量级**] 仅 1.8KB minified + gzip
- [**无依赖**] 纯 Javascript 编写
- [**多主题**] 支持皮肤扩展
- [**兼容性**] 兼容 IE8 +




支持Angular: [ng-dropdown](https://github.com/zzetao/ng-dropdown)



## 接口

**初始化：**

```
var myDropdown = new zDropdown({
  el: String | Node (select)
  skin: String
  change: Function
})
```

| name   | type                    | description         |
| ------ | ----------------------- | ------------------- |
| el     | String \| Node (select) | 元素的 ID 或者 select 节点 |
| skin   | String                  | 样式名, 多个用空格隔开        |
| change | Function                | 更改选择项后触发的函数         |



**实例化：**

```
myDropdown.destroy();   // 销毁实例
myDropdown.changeItem(index);   // 手动触发指定选择项
myDropdown.update();   // 从 select 更新新的数据
```



## 使用

```
<select name="items" id="selectID">
	<option value="a">github</option>
	<option value="b">google</option>
</select>

var myDropdown = new zDropdown({
  el: 'selectID',
  skin: 'my-skin',
  change: function (value, text, index) {  },
})
myDropdown.destroy();  // 销毁
myDropdown.changeItem(index); // option 索引值
```
