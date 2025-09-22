# upto-color-picker

基于 webComponent 的颜色选择器





## 使用

### 样式

组件宽高会跟随父容器

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
    <upto-color-picker></upto-color-picker>
</div>
```

### javascript

```js

<script type="module" src="./dist/index.mjs"></script>

<div>
    <upto-color-picker onchange="change(event)" onload="load()"></upto-color-picker>
</div>

<script>
    function load(){
        console.log('挂在完成')
    }

    function change(e){
        console.log(e.detail)  //{color:'',rgb_color:'',opacity:''}
    }
</script>

```

### vue

```js

> npm i upto-color-picker

// main.js
import "upto-color-picker"



// page.vue
<div>
   <upto-color-picker @change="change"></upto-color-picker>
</div>

 function change(e){
    console.log(e.detail)
 }

```

### react

```js

> npm i upto-color-picker

// main.ts
import "upto-color-picker"



// page.tsx

export default function App() {
  return (
    <div>
      <upto-color-picker></upto-color-picker>
    </div>
  );
}

 function change(e){
    console.log(e.detail)
 }

```
