# url

- https://docs.pmnd.rs/react-three-fiber/getting-started/examples

# npm 包

```
three
@types/three
@react-three/fiber
@react-three/drei

leva
```

- leva

# @react-three/fiber

- Canvas 大小调节

```
  继承父节点大小

  #root,
  body,
  html {
    width: 100%;
    height: 100%;
  }

  .canvas_con {
    width: 100%;
    height: 100%;
    /* background: lightcoral; */
  }
```

# err

1. TypeError: Class constructor TextGeometry cannot be invoked without 'new'
   `<TextGeometry args={[text, config]} />`

   - 解决
     `extend({ TextGeometry });`,
     `<textGeometry args={[text, config]} />`

2. ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17

```

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);


// 被注释的是之前ReactDOM.render的代码
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')

```

```

```

3.
