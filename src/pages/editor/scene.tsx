import { FC, useCallback } from "react";
import { escapeHTML, getMaterialName, getObjectType } from "./utils/scene";

// 移动

import "./style.scss";

/**
  类型 Type
  识别码 UUID
  名称 Name
  位置 Position
  旋转 Rotation
  缩放 Scale
  阴影 Shadow
  可见性 Visible
  视锥体裁剪 Frustum Cull
  渲染次序 Render Order

  属性 Attributes
  界限 Bounds
  计算顶点法线 COMPUTE VERTEX NORMALS
  居中 CENTER
  显示顶点法线 SHOW VERTEX NORMALS

 */

/**
 * 汇总
 */
const Editor: FC<{ modelData: any; uuid: string; transformControlsOBJ: (_data: any) => void }> = ({
  modelData,
  uuid,
  transformControlsOBJ,
}) => {
  // const [uuid, setUuid] = useState<string>(""); // 模型数据

  // useEffect(() => {
  //   init();
  // }, []);

  // const init = () => {};

  // 渲染模型结构
  const treeItem = useCallback(
    (item: any) => {
      let itemGroupItem = [];
      // 把所有节点放在一个数组里面
      if (item?.length > 0) {
        item.forEach((element: any) => {
          if (!element?.uuid) return;
          console.log("element", element.uuid);
          itemGroupItem.push(
            <ul
              key={element.uuid}
              onClick={(e) => {
                e.stopPropagation();
                objectSelected(element);
              }}
            >
              {/* 第一个层级 */}
              <li className={element.uuid == uuid ? "active" : ""}>
                <span className={`type ${getObjectType(element)}`}></span>
                {element.name}
                {element?.isMesh ? (
                  <span className="type_u">
                    <span className="type Geometry"></span> {escapeHTML(element.geometry.name)}
                    <span className="type Material"></span> {escapeHTML(getMaterialName(element.material))}
                  </span>
                ) : null}
              </li>

              {/* 调用tree方法 */}
              {treeItem(element.children)}
            </ul>
          );
        });
      } else {
        if (!item?.uuid) return;
        console.log("item", item.uuid);
        itemGroupItem.push(
          <ul
            key={item.uuid}
            onClick={(e) => {
              e.stopPropagation();
              objectSelected(item);
            }}
          >
            {/* 第一个层级 */}
            <li className={item.uuid == uuid ? "active" : ""}>
              <span className={`type ${getObjectType(item)}`}></span>
              {item.name}
              {item?.isMesh ? (
                <span className="type_u">
                  <span className="type Geometry"></span> ${escapeHTML(item.geometry.name)}
                  <span className="type Material"></span> ${escapeHTML(getMaterialName(item.material))}
                </span>
              ) : null}
            </li>

            {/* 调用tree方法 */}
            {treeItem(item.children)}
          </ul>
        );
      }

      return itemGroupItem;
    },
    [uuid]
  );

  // transformControls 切换
  const objectSelected = (item: any) => {
    console.log("objectSelected", item);

    transformControlsOBJ(item);
    // setUuid(item.uuid);
  };

  // console.log("objCtrols", modelData);
  return <div className="dir_con">{modelData && treeItem(modelData)}</div>;
};
export default Editor;
