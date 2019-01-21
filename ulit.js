const chalk = require("chalk");
const figlet = require("figlet");

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
  if (arguments.length === 1) {
    color = 'grey';
    bgColor = 'bgGreen';
    Styles = 'bold'
    msg = arguments[0]
  } else if (arguments.length === 3) {
    color = arguments[0];
    bgColor = arguments[1];
    Styles = 'bold'
    msg = arguments[2]
  }
  if (bgColor == '') {
    console.log(
      chalk[color][Styles]('\n', msg)
    );
  } else {
    console.log(
      chalk[color][bgColor][Styles]('\n', msg)
    );
  }
}


function printProgress (progress){
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(progress + '%');
}


module.exports = {
  figletLog,
  chalkLog,
  printProgress
}