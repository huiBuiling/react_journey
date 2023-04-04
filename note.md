err:

1. A component is changing an uncontrolled input to be controlled. This is likely caused by the value

```
input给了默认值，初次渲染时默认值为undefined

<input ... checked={modelObj?.castShadow || false} />
```
