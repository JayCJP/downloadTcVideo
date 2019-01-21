const chalk = require("chalk");
const figlet = require("figlet");
const request = require('request-promise');

/**
 * 
 * @param {String} font 字体的类型 （Standard|Ghost）
 * @param {String} msg 提示信息
 * @description https://www.npmjs.com/package/figlet
 */
const figletLog = function (font = 'Standard', msg = '') {
  if (arguments.length === 1) {
    font = 'Standard'
    msg = arguments[0]
  }
  console.log(
    chalk.green(
      figlet.textSync(msg, {
        font,
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
}

/**
 * 
 * @param {String} color 
 * @param {String} bgColor 
 * @param {String} Styles 
 * @description 美化 log https://www.npmjs.com/package/chalk
 */
const chalkLog = function (color = 'black', bgColor = '', Styles = 'bold', msg = '') {
  const argLen = arguments.length;
  let clog = '';
  switch (argLen) {
    case 2:
      color = arguments[0];
      Styles = 'bold';
      clog = chalk[color][Styles]('\n', arguments[1]);
      break;
    case 3:
      color = arguments[0];
      bgColor = arguments[1];
      Styles = 'bold';
      clog = chalk[color][bgColor][Styles]('\n', arguments[2]);
      break;
    default:
      clog = chalk[color][bgColor][Styles]('\n', msg);
      break;
  }
  console.log(clog)
}

/**
 * 
 * @param {Number} progress 
 * @description 单行 输出 下载进度
 */
function printProgress(progress) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  // 美化进度
  const processStr = new Array(50).fill('▷');
  const str = processStr.map((el, i) => i < (progress / 2) ? '▶' : el).join('')

  process.stdout.write(`${str}   ${progress}%`);
}

/**
 * 
 * @param {String} url 
 * @param {Object} params 
 */
function formatUrl(url, params) {
  let pAry = []
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const el = params[key];
      pAry.push(`${key}=${el}`)
    }
  }
  const paramsStr = pAry.join('&')

  return url.includes('?') ? `${url}&${paramsStr}` : `${url}?${paramsStr}`
}

/**
 * 
 * @param {String} url 
 * @param {Object} params 
 * @param {Object} headers 
 * @description request.get
 */
const get = (url, params = {}, headers = {}) => {
  url = formatUrl(url, params)
  return request.get(url, headers)
}

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36';

// 时间 return 01:24:05
const formatTimeless = t => {
  const h = parseInt(Math.floor((t / 1000 / 60 / 60) % 60))
  const m = parseInt(Math.floor((t / 1000 / 60) % 60))
  const s = parseInt(Math.floor((t / 1000) % 60))
  return `${h}:${m}:${s}`
}
module.exports = {
  figletLog,
  chalkLog,
  printProgress,
  get,
  userAgent,
  formatTimeless
}