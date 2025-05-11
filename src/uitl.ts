/**
 * 将开尔文色温转换为数值颜色代码
 * @param kelvin 色温值 (1000K-40000K)
 * @returns 数值颜色代码
 */
export function kelvinToHex(kelvin: number): number {
  // 将色温限制在有效范围内
  kelvin = Math.max(1000, Math.min(40000, kelvin));

  let temp = kelvin / 100;
  let red: number, green: number, blue: number;

  // 计算红色分量
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    red = Math.max(0, Math.min(255, red));
  }

  // 计算绿色分量
  if (temp <= 66) {
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
  }
  green = Math.max(0, Math.min(255, green));

  // 计算蓝色分量
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.max(0, Math.min(255, blue));
  }

  // 将RGB转换为数值
  const r = Math.round(red);
  const g = Math.round(green);
  const b = Math.round(blue);

  return (r << 16) | (g << 8) | b;
}

// 使用示例：
// console.log(kelvinToHex(1500));  // 输出暖色调颜色（偏红/橙）的数值
// console.log(kelvinToHex(6500));  // 输出近似日光色的数值
// console.log(kelvinToHex(12000)); // 输出冷色调颜色（偏蓝）的数值
