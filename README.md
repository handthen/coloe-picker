# upto-color-picker

基于 webComponent 的颜色选择器组件

--------

## 使用


|    属性   |  类型     |      描述     |
| :-------: | :-------: |   :-------:   |
| color    | string |  初始颜色值(仅支持16进制/RGB)  |
| onchange   | (e)=>void  |   色值变化触发 |
| connected    | (e)=>void| 组件挂载完成触发|
| disconnected    | (e)=>void| 组件卸载完成触发|


> connected/disconnected 在vue/react环境下，由于webComponent的挂载事件会优先与框架的挂载事件触发，建议直接使用对应框架的事件，

--------

### 样式

组件宽度会跟随父容器

```js

<style>
    .wrapper{
        width:300px;
    }
     {/* 或者 */}
    .picker::part(upto-picker) {
        // 可通过该方式适当修改样式，非必要不推荐
     }
</style>
// 宽度跟随容器 wrapper
<div class="wrapper">
    <upto-color-picker>
         {/* right-inner 插槽 */}
        <div slot="right-inner"></div>
    </upto-color-picker>
</div>
```
--------
### javascript

```js

<script type="module" src="./dist/index.mjs"></script>

<div>
    <upto-color-picker id="colorPicker" color='#f5f5f5'></upto-color-picker>
</div>

<script>

    colorPicker.addEventListener('connected',connected)
    colorPicker.addEventListener('disconnected',disconnected)
    colorPicker.addEventListener('change',disconnected)

    function connected(){
        console.log('connected')
        colorPicker.color="#f6f6f6"
    }
    function disconnected(e){
        console.log('disconnected')
    }
    function change(){
       console.log(e.detail)  //{color:'',rgb_color:'',opacity:''}
    }
</script>

```
--------
### vue

```js

> npm i upto-color-picker

// main.js
import "upto-color-picker"



// page.vue
<div>
   <upto-color-picker color='#f5f5f5' @change="change"></upto-color-picker>
</div>

 function change(e){
    console.log(e.detail)
 }

```
--------
### react

```js

> npm i upto-color-picker

// main.ts
import "upto-color-picker"

// page.tsx

import { useState } from "react"

export default function App() {
  const [color,setColor] = useState()

  function change(e){
    console.log(e.nativeEvent.detail)
  }
  return (
    <div>
      <upto-color-picker color={color} onChange={change}></upto-color-picker>
    </div>
  );
}

```
