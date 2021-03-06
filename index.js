const inquirer = require("inquirer");
const { downLoadVideo } = require('./downloadVideo')
const { figletLog, chalkLog } = require('./ulit')

figletLog('Tencent video download');
chalkLog('red', '本程序只作为学习交流，禁止任何商业用途！')

// inquirer 输出填空
const askQuestions = () => {
  const questions = [
    {
      name:"videoUrl",
      type:"input",
      message: "请输入视频的链接:",
      validate (input) {
        input = input.toString();
        const done = this.async();
        if (!input.includes('http') || input == '') {
          done('请输入一个视频链接!');
        } else if (!input.includes('v.qq.com')) {
          done('目前仅支持腾讯视频!');
        } else {
          done(null, true);
        }
      }
    }
  ];
  return inquirer.prompt(questions);
};

// 下载完成提示
const success = res => {
  if (!res.error) {
    chalkLog('blue', `视频标题：${res.ti} ;`);
    chalkLog('blue', `视频地址：${res.videoFilePath};`);
    chalkLog('green', '视频下载完成！');
    console.log('\n');
  }
  // 再次输出填空
  run();
};

// 
const run = async () => {

  // ask questions
  const answers = await askQuestions();
  // 获取用户输入
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

// https://v.qq.com/x/cover/z7s2u1boqtr6ppy/n0828svequv.html

// ffmpeg -ss 00:00:15 -t 00:00:05 -i input.mp4 -vcodec copy -acodec copy output.mp4
// -ss 表示开始切割的时间，-t 表示要切多少。上面就是从开始，切5秒钟出来。

// ffmpeg  -ss 00:00:00 -i ./filename.mp4 -f image2 -r 60 -q:v 2 ./ouput.png
// 截取封面

run();
