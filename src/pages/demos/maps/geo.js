import { geoMercator } from "d3-geo";
// "d3-geo-projection": "^4.0.0",
import { getColor } from './utils'

/**
 * 获取GeoJson
 * 
 * @param {*} adcode 
 * @param {*} isFull 
 * @returns 
 * 
 * 阿里的地理数据工具：http://datav.aliyun.com/portal/school/atlas/area_selector#&lat=33.50475906922609&lng=104.32617187499999&zoom=4
 */
const queryGeojson = (adcode, isFull = true) => {
  return new Promise((resolve, reject) => {
    fetch(`https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${adcode + (isFull ? "_full" : "")}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        resolve(data);
      })
      .catch(async (err) => {
        if (isFull) {
          let res = await queryGeojson(adcode, false);
          resolve(res);
        } else {
          reject();
        }
      });
  });
};

/**
 * 经纬度转墨卡托投影
 * 这里使用的是d3geo,有一些Geojson不走经纬度的标准
 * 直接是墨卡托投影坐标，所以需要判断一下，在经纬度范围才对它进行墨卡托投影坐标转换
 */
let geoFun = geoMercator().scale(180);
const latlng2px = (pos) => {
  if (pos[0] >= -180 && pos[0] <= 180 && pos[1] >= -90 && pos[1] <= 90) {
    return geoFun(pos);
  }
  return pos;
};

/**
 * 获取区块基本信息
 * 遍历所有的坐标点，获取坐标范围，中心点，以及缩放值（该值用于下钻上卷的时候维持元素缩放比例）
 * 
 * @param {*} geojson 
 * @returns 
 * 
 */
const getGeoInfo = (geojson) => {
  let bounding = {
    minlat: Number.MAX_VALUE,
    minlng: Number.MAX_VALUE,
    maxlng: 0,
    maxlat: 0
  };
  let centerM = {
    lat: 0,
    lng: 0
  };
  let len = 0;

  geojson.features.forEach((a) => {
    if (a.geometry.type == 'MultiPolygon') {
      a.geometry.coordinates.forEach((b) => {
        b.forEach((c) => {
          c.forEach((item) => {
            let pos = latlng2px(item);

            if (Number.isNaN(pos[0]) || Number.isNaN(pos[1])) {
              console.log(item, pos);
              return;
            }
            centerM.lng += pos[0];
            centerM.lat += pos[1];
            if (pos[0] < bounding.minlng) {
              bounding.minlng = pos[0];
            }
            if (pos[0] > bounding.maxlng) {
              bounding.maxlng = pos[0];
            }
            if (pos[1] < bounding.minlat) {
              bounding.minlat = pos[1];
            }
            if (pos[1] > bounding.maxlat) {
              bounding.maxlat = pos[1];
            }

            len++;
          });
        });
      });
    } else {
      a.geometry.coordinates.forEach((c) => {
        c.forEach((item) => {
          let pos = latlng2px(item);

          if (Number.isNaN(pos[0]) || Number.isNaN(pos[1])) {
            console.log(item, pos);
            return;
          }
          centerM.lng += pos[0];
          centerM.lat += pos[1];
          if (pos[0] < bounding.minlng) {
            bounding.minlng = pos[0];
          }
          if (pos[0] > bounding.maxlng) {
            bounding.maxlng = pos[0];
          }
          if (pos[1] < bounding.minlat) {
            bounding.minlat = pos[1];
          }
          if (pos[1] > bounding.maxlat) {
            bounding.maxlat = pos[1];
          }

          len++;
        });
      });
    }
  });
  centerM.lat = centerM.lat / len;
  centerM.lng = centerM.lng / len;
  //元素缩放比例
  let scale = (bounding.maxlng - bounding.minlng) / 180;
  return { bounding, centerM, scale };
}


/***
 * 获取渐变色数组
 * @param {string} startColor 开始颜色
 * @param {string} endColor  结束颜色
 * @param {number} step 颜色数量
 */
const getGadientArray = (startColor, endColor, step) => {
  let { red: startR, green: startG, blue: startB } = getColor(startColor);
  let { red: endR, green: endG, blue: endB } = getColor(endColor);

  let sR = (endR - startR) / step; //总差值
  let sG = (endG - startG) / step;
  let sB = (endB - startB) / step;
  let colorArr = [];
  for (let i = 0; i < step; i++) {
    //计算每一步的hex值

    let c =
      'rgb(' +
      parseInt(sR * i + startR) +
      ',' +
      parseInt(sG * i + startG) +
      ',' +
      parseInt(sB * i + startB) +
      ')';
    // console.log('%c' + c, 'background:' + c);

    colorArr.push(c);
  }
  return colorArr;
}

export { queryGeojson, latlng2px, getGeoInfo, getGadientArray };
