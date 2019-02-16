const fs = require('fs');
const path = require('path');
const { chalkLog, requestGet, printProgress, userAgent, formatTimeless } = require('./ulit')

// 等待完成写入文件
const awaitWS = ws => new Promise((resolve, reject) => {
  ws.on('finish', () => {
    ws.close();
    resolve();
  });
  ws.on('error', () => {
    reject();
  });
});
// 获取高清视频下载信息
const load480P = async (vid, fmt, vt, vURL) => {
  // 请求高清视频
  const vurl480p = `http://vv.video.qq.com/getkey`;
  // console.log(vurl480p)
  // 获取高清视频key
  const vjson480p = await requestGet(vurl480p, {
    format: fmt,
    otype: 'json',
    ran: Math.random(),
    filename: `${vid}.mp4`,
    platform: '101001',
    charge: 0,
    vt,
    vid
  });
  const jsonString480p = vjson480p.replace(/QZOutputJson=|;/g, '');
  // console.log(jsonString480p)
  const vinfo480p = JSON.parse(jsonString480p);
  // console.log(vinfo480p)
  // 高清视频链接
  const URL480p = `${vURL}${vinfo480p.filename}`;
  const params = {
    vkey: vinfo480p.key,
    level: vinfo480p.level,
    br: vinfo480p.br
  };
  return { URL480p, params };
};
// 获取视频信息
const loadVideo = async id => {
  chalkLog('grey', '获取视频信息');
  const vid = id;
  let vjson = '';
  // 获取视频信息
  try {
    vjson = await requestGet(`http://vv.video.qq.com/getinfo`, {
      vids: vid,
      platform: '101001',
      charge: 0,
      otype: 'json', // XML
      defn: 'shd'
    });
  } catch (error) {
    chalkLog('white', 'bgRed', '获取视频信息失败！');
    return { error: 1 };
  }
  // QZOutputJson= {} ;
  const jsonString = vjson.replace(/QZOutputJson=|;/g, '');
  // console.log(jsonString)
  const vinfo = JSON.parse(jsonString);
  // console.log(vinfo)
  if (!vinfo.fl) {
    chalkLog('white', 'bgRed', `下载失败！错误信息：${vinfo.msg}`);
    return { error: 1 };
  }
  let fmt, vt, ti, has480p;
  try {
    if (vinfo.fl.cnt <= 1) {
      fmt = vinfo.fl.fi[0].id;
      has480p = false;
    } else {
      fmt = vinfo.fl.fi[1].id;
      has480p = true;
    }
    vt = vinfo.vl.vi[0].ul.ui[0].vt;
    ti = vinfo.vl.vi[0].ti; // title
  } catch (error) {
    chalkLog('white', 'bgRed', '视频信息不存在！');
    return { error: 1 };
  }
  //  标清视频 URL
  let urlNormal = '';
  // 高清视频
  let videoUrl = '';
  let videoParams = '';
  // 区分高清、标清视频下载
  if (!has480p) {
    urlNormal = `${vinfo['vl']['vi'][0]['ul']['ui'][0]['url']}${vinfo['vl']['vi'][0]['fn']}`;
    const vkeyNormal = { vkey: `${vinfo['vl']['vi'][0]['fvkey']}` };
    videoUrl = urlNormal;
    videoParams = vkeyNormal;
    chalkLog('grey', '当前为标清视频！');
  } else {
    // 视频基础链接
    const vURL = vinfo.vl.vi[0].ul.ui[0].url;
    // console.log(`vURL: ${vURL};fmt:${fmt};vt:${vt}`)
    const info480P = await load480P(vid, fmt, vt, vURL);
    videoUrl = info480P.URL480p;
    videoParams = info480P.params;
    chalkLog('grey', '当前为高清视频！');
  }
  // 下载视频 以 title 作为文件名
  const videoFilePath = path.resolve(__dirname, `./videos/${ti}.MP4`);
  chalkLog('grey', '开始下载视频！');
  const { error } = await download(videoUrl, videoParams, videoFilePath);
  if (!error) {
    return {
      error: 0,
      ti,
      videoFilePath
    }
  }
};
// 下载视频
const download = async (videoUrl, videoParams, videoFilePath) => {
  try {
    let fileInfo = {
      size: 0, // 0.00M
      totalSize: 0, // 总大小
      downloaded: 0, // 已下载,
      percent: '0%', // 0.00%
    }
    const st = Date.now()
    const ws = fs.createWriteStream(videoFilePath);
    const dlV = requestGet(videoUrl, videoParams, {
      origin: 'https://v.qq.com',
      referer: `https://v.qq.com`,
      'user-agent': userAgent
    })
    dlV.pipe(ws)
    // 获取文件大小
    dlV.on('response', res => {
      const contentLength = res.headers['content-length']
      fileInfo.size = `${(contentLength / (1024 * 1024)).toFixed(2)}M`;
      fileInfo.totalSize = contentLength
      chalkLog('green', `视频大小：${fileInfo.size}`);
    })
    // 监听进度
    dlV.on('data', data => {
      fileInfo.downloaded += data.length;
      fileInfo.percent = Number(fileInfo.downloaded / fileInfo.totalSize * 100).toFixed(0);
      // 打印进度
      printProgress(fileInfo.percent)
    })
    // 监听下载完成
    dlV.on('end', () => {
      const et = Date.now();
      const t = formatTimeless(et - st);
      chalkLog('green', `下载完成，用时：${t}`);
      chalkLog('green', `正在将视频写入文件……`);
    })
    // 等待写入文件
    await awaitWS(ws);
    return { error: 0 };
  } catch (error) {
    console.log(error)
    chalkLog('white', 'bgRed', '视频下载失败,无权限访问!');
    return { error: 1 };
  }
}

// 下载
const downLoadVideo = async (data) => {
  // 下载结果
  if (data.vid) {
    const info = await loadVideo(data.vid);
    return info
  } else {
    chalkLog('下载信息不完整！！');
  }
};

// downLoadVideo({vid:'g074756w16r'})

exports.downLoadVideo = downLoadVideo;
