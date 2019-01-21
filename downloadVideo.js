const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { chalkLog, printProgress } = require('./ulit')

// 等待写入流
const awaitWS = ws =>
  new Promise((resolve, reject) => {
    ws.on('finish', () => {
      ws.close();
      resolve();
    });
    ws.on('error', () => {
      reject();
    });
  });
// 下载高清视频
const load480P = async (vid, fmt, vt, vURL) => {
  // 请求高清视频
  const vurl480p = `http://vv.video.qq.com/getkey`;
  // console.log(vurl480p)
  // 获取高清视频key
  const vjson480p = await axios.get(vurl480p, {
    params: {
      format: fmt,
      otype: 'json',
      ran: Math.random(),
      filename: `${vid}.mp4`,
      platform: '101001',
      charge: 0,
      vt,
      vid
    }
  });
  const jsonString480p = vjson480p.data.replace(/QZOutputJson=|;/g, '');
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
// 获取视频信息并下载
const loadVideo = async id => {
  chalkLog('grey','','获取视频信息');
  const vid = id;
  let vjson = '';
  try {
    vjson = await axios.get(`http://vv.video.qq.com/getinfo`, {
      params: {
        vids: vid,
        platform: '101001',
        charge: 0,
        otype: 'json', // XML
        defn: 'shd'
      }
    });
  } catch (error) {
    chalkLog('white','bgRed','获取视频信息失败！');
    return { error: 1 };
  }
  // QZOutputJson= {} ;
  const jsonString = vjson.data.replace(/QZOutputJson=|;/g, '');
  // console.log(jsonString)
  const vinfo = JSON.parse(jsonString);
  // console.log(vinfo)
  if (!vinfo.fl) {
    chalkLog('white','bgRed',`下载失败！错误信息：${vinfo.msg}`);
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
    chalkLog('white','bgRed','视频信息不存在！');
    return { error: 1 };
  }
  let urlNormal = '';
  let getVideoUrl = '';
  let getVideoParams = '';
  if (!has480p) {
    //  标清视频 URL
    urlNormal = `${vinfo['vl']['vi'][0]['ul']['ui'][0]['url']}${vinfo['vl']['vi'][0]['fn']}`;
    const vkeyNormal = { vkey: `${vinfo['vl']['vi'][0]['fvkey']}` };
    getVideoUrl = urlNormal;
    getVideoParams = vkeyNormal;
    chalkLog('grey','','当前为标清视频！');
  } else {
    // 视频基础链接
    const vURL = vinfo.vl.vi[0].ul.ui[0].url;
    // console.log(`vURL: ${vURL};fmt:${fmt};vt:${vt}`)
    const info480P = await load480P(vid, fmt, vt, vURL);
    getVideoUrl = info480P.URL480p;
    getVideoParams = info480P.params;
    console.log(getVideoUrl, getVideoParams)
    return
    chalkLog('grey','','当前为高清视频！');
  }
  // 下载视频
  const videoFilePath = path.resolve(__dirname, `./videos/${ti}.MP4`);
  chalkLog('grey','','开始下载视频！');
  try {
    let resvideo = await axios({
      method: 'get',
      url: getVideoUrl,
      params: getVideoParams,
      responseType: 'stream',
      headers: {
        origin: 'https://v.qq.com',
        referer: `https://v.qq.com`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
      },
      transformResponse (data) {
        let size = data.headers[ 'content-length' ];
        size = (size / (1024 * 1024)).toFixed(2);
        chalkLog('green','', `视频大小：${size}M!`);
        return data;
      }
      // onDownloadProgress 仅支持在浏览器环境
    });
    const rs = resvideo.data;
    const ws = fs.createWriteStream(videoFilePath);
    rs.pipe(ws);
    await awaitWS(ws);
    return { error: 0, vid, ti, videoFilePath };
  } catch (error) {
    chalkLog('white','bgRed','视频下载失败,无权限访问!');
    return { error: 1 };
  }
};
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
