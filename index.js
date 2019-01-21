const inquirer = require("inquirer");
const { downLoadVideo } = require('./downloadVideo')
const { figletLog, chalkLog } = require('./ulit')

figletLog('Tencent video download');

const askQuestions = () => {
  const questions = [
    {
      name: "videoUrl",
      type: "input",
      message: "请输入视频的链接:",
      // filter: function (url) {} 过滤
    }
  ];
  return inquirer.prompt(questions);
};

const success = res => {
  if (!res.error) {
    chalkLog('blue', '', `标题：${res.ti} ;`)
    chalkLog('blue', '', `视频地址：${res.videoFilePath};`)
    chalkLog('green', '', '视频下载完成！');
  }
  run();
};

const run = async () => {

  // ask questions
  const answers = await askQuestions();
  const { videoUrl } = answers;

  // 取 vid
  const urlAry = videoUrl.split('?')[0].split('/');
  let vid = urlAry[urlAry.length - 1];
  vid = vid.split('.')[0];
  
  // download video
  const res = await downLoadVideo({ vid });

  // show success message
  success(res);
};

run();
// https://v.qq.com/x/cover/z7s2u1boqtr6ppy/n0828svequv.html