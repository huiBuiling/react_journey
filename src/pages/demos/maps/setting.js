/**
 * 使用区块地图
 * 注意canvas文本精灵的大小要保持比例,并且要适配当前行政区范围，要对其进行元素缩放
 */
export default {
  //文本提示样式
  tooltip: {
    //字体颜色
    color: 'rgb(255,255,255)',
    //字体大小
    fontSize: 10,
    //
    formatter: '{name}:{value}',
    //背景颜色
    bg: 'rgba(30, 144 ,255,0.5)'
  },

  regionStyle: {
    //厚度
    depth: 5,
    //热力颜色
    colorList: ['rgb(241, 238, 246)', 'rgb(4, 90, 141)'],
    //默认颜色
    color: 'rgb(241, 238, 246)',
    //激活颜色
    emphasisColor: 'rgb(37, 52, 148)',
    //边框样式
    borderColor: 'rgb(255,255,255)',
    borderWidth: 1
  },
  //视角控制
  viewControl: {
    autoCamera: true,
    height: 10,
    width: 0.5,
    depth: 2,
    cameraPosX: 10,
    cameraPosY: 181,
    cameraPosZ: 116,
    autoRotate: false,
    rotateSpeed: 2000
  },
  //地址名称
  address: mapJson.name,
  //地址编码
  adcode: mapJson.adcode,
  //区块数据
  data: data.map((item) => ({
    name: item.name,
    code: item.code,
    value: parseInt(Math.random() * 180)
  })),
}


var map = new RegionMap();
map.initThree(document.getElementById('map'));
map.createChart(mapOption);

window.map = map;
