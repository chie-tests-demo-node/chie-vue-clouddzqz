/**
 * 获取DPI
 * @returns {Array}
 */
function conversionGetDPI() {
  // var arrDPI = new Array();
  // const screen = window.screen as any;
  // if (screen.deviceXDPI) {
  //   arrDPI[0] = screen.deviceXDPI;
  //   arrDPI[1] = screen.deviceYDPI;
  // } else {
  //   let tmpNode = document.createElement("div") as any;
  //   tmpNode.style.cssText =
  //     "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
  //   document.body.appendChild(tmpNode);
  //   arrDPI[0] = parseInt(tmpNode.offsetWidth);
  //   arrDPI[1] = parseInt(tmpNode.offsetHeight);
  //   tmpNode.parentNode.removeChild(tmpNode);
  // }
  // return arrDPI;

  // pdf固定为72 dpi
  return [72];
}
/**
 * px转换为mm
 * @param value
 * @returns {number}
 */
export function pxConversionMm(value: number) {
  const inch = value / conversionGetDPI()[0];
  const c_value = inch * 25.4;
  //      console.log(c_value);
  return c_value;
}
/**
 * mm转换为px
 * @param value
 * @returns {number}
 */
export function mmConversionPx(value: number) {
  const inch = value / 25.4;
  const c_value = inch * conversionGetDPI()[0];
  //      console.log(c_value);
  return c_value;
}
