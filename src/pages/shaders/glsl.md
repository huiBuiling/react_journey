# glsl

## Vertex Shader

### 变量

- 浮点数：float a = 1.0;
- 整数：int foo = 123;
- 布尔值：bool foo = true;
- Vector 2：

  - 用于存储 2 个坐标 x 和 y 属性的值
  - vec2 foo = vec2(1.0, 2.0);
  - 空 vec2 会导致错误：vec2 foo = vec2();
  - 更改这些属性 vec2

    ```
     vec2 foo = vec2(0.0  );
     foo.x = 1.0;
     foo.y = 2.0;

     OR

     vec2 foo = vec2(1.0, 2.0);
     foo *= 2.0;
    ```

- Vector 3：同 Vector 2，增加了 z 属性，适用于 3D 坐标
  ```
    vec3 foo = vec3(0.0);
    vec3 bar = vec3(1.0, 2.0, 3.0);
    bar.z = 4.0;
  ```
  - vec3 也可以部分地从 a 创建 vec2
  ```
    vec2 foo = vec2(1.0, 2.0);
    vec3 bar = vec3(foo, 3.0);
  ```
  - 取一部分 vec3 来生成 vec2
  ```
    vec3 foo = vec3(1.0, 2.0, 3.0);
    vec2 bar = foo.xy;
  ```
- Vector 4
  ```
   vec4 foo = vec4(1.0, 2.0, 3.0, 4.0);
   vec4 bar = vec4(foo.zw, vec2(5.0, 6.0));
  ```

### 功能

1. 函数必须以返回值的类型开头

```
float loremIpsum(){
  float a = 1.0;
  float b = 2.0;

  return a + b;
}
```

2. 函数不返回任何内容，将类型设置为 void

```
void justDoingStuff(){
  float a = 1.0;
  float b = 2.0;
}
```

3. 指定参数，但我们还必须提供它们的类型

```
float add(float a, float b){
  return a + b;
}
```

### 主功能

```
void main(){}
```

### gl 位置

- gl_Position 变量已经存在,包含顶点在屏幕上的位置

```
void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  gl_Position.x += 0.5;
  gl_Position.y += 0.5;
}
```

- 检索顶点 position

```
attribute vec3 position;
```

- vec3 为 vec4

```
gl_Position = /* ... */ vec4(position, 1.0);
```

## Matrices uniforms

- uniform 获取对应属性
- mat4 作为变量，则该变量类型必须是 vec4

- modelMatrix：将进行网格相关的变换，如缩放、旋转、移动等操作变换都将作用于 position。
- viewMatrix：将进行相机相关的变换，如我们向左移动相机，顶点应该在右边、如果我们朝着网格方向移动相机，顶点会变大等。
- projectionMatrix：会将我们的坐标转化为裁切空间坐标。

```
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
```

## Fragment Shader

- 精度 Precision
  指令- 决定浮点数的精度：
  `precision mediump float;`
  - highp：会影响性能，在有些机器上可能无法运行；
  - mediump：常用的类型；
  - lowp：可能会由于精度问题产生错误。
    注意：RawShaderMaterial 原始着色器材质才需要设置精度，在着色器材质 ShaderMaterial 中会自动处理。
