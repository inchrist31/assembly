const WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const bgMusic = wx.getBackgroundAudioManager();
const recorderManager = wx.getRecorderManager();
const innerAudio = wx.createInnerAudioContext();
import { AudioFollow } from '../../db/AudioFollow.js';
const app=getApp()
const recordOptions = {
  duration: 60000,
  sampleRate: 12000,
  numberOfChannels: 1,
  encodeBitRate: 24000,
  format: 'mp3',
  frameSize: 50
}

function articleContent(article, target) {
  let that = target;
  let articleData = {};
  if (article.audio.path != "") {
    backgroundAudioListener(that)
    articleData.audioLength = util.formatMinSec(article.audio.duration);
    articleData.duration = article.audio.duration;
    articleData.isOpen = false; //播放开关
    articleData.starttime = '00:00'; //正在播放时
    articleData.isNT = false;
    articleData.audioFixedMode = true;
    articleData.audioFollowMode = true;
    articleData.recordingFlag = false;
    if (article.book.catalogue && article.book.catalogue.type === '3'){
      that.dbArticleFollow = new AudioFollow(article._id);
      articleData.recordPlayingFlag = false;
      innerAudioListener(that);
      recordManagerListener(that);
    }
  }
  if (article.video.path != ""){
    articleData.videoFixedTop = app.globalData.titleBarHeight + app.globalData.statusBarHeight;
    articleData.videoHeight = 225;
  }
  if (article.htmldoc != "") {
    WxParse.wxParse('wxParseData', 'html', article.htmldoc, that, 5);
  }
  articleData.article = article;
  if (article.book.catalogue && article.book.catalogue.type === '3'){
    articleData.currentLineIndex = -1;
    articleData.passages = util.processText(article.text)
  }
  that.setData({
    articleData: articleData
  })
  that.slider4changing = slider4changing;
  that.listenerButtonPlay = listenerButtonPlay;
  that.listenerButtonPause = listenerButtonPause;
  that.listenerButtonStop = listenerButtonStop;
  that.playNT = playNT;
  that.changeAudioShowMode = changeAudioShowMode;
  that.musicForward = musicForward;
  that.musicBackward = musicBackward;
  that.startRecord = startRecord;
  that.finishRecord = finishRecord;
  that.playRecord = playRecord;
  that.finishPlayRecord = finishPlayRecord;
  that.jumpToLine = jumpToLine;
}

function slider4changing(e) {
  let value = e.detail.value;
  bgMusic.seek(value);

}
function listenerButtonPlay() {
  let articleData = this.data.articleData;
  if (articleData.article.book.catalogue &&articleData.article.book.catalogue.type === '3') {
    if (!articleData.audioFollowMode) {
      if (articleData.recordingFlag || articleData.recordPlayingFlag) {
        return
      }
    }
  }
  articleData.isOpen = true;
  this.setData({
    articleData: articleData
  })
  if (!articleData.isNT) {
    this.playNT();
  } else {
    bgMusic.play()
  }
}

//暂停播放
function listenerButtonPause() {
  let that = this
  bgMusic.pause()
  /*
  let articleData = this.data.articleData;
  articleData.isOpen = false;
  that.setData({
    articleData: articleData,
  })*/
}

function listenerButtonStop() {
  let that = this
  bgMusic.stop()
}
function playNT() {
  let that = this
  let articleData = that.data.articleData;
  
  //bug ios 播放时必须加title 不然会报错导致音乐不播  
  bgMusic.title = that.data.articleData.article.title;
  bgMusic.epname = "Called Assembly"

  let src = that.data.articleData.article.audio.path;
  bgMusic.src = src;

  articleData.isNT = true;
  
  that.setData({
    articleData: articleData,
  })
}
function backgroundAudioListener(target) {
  let that = target;
  
  bgMusic.onTimeUpdate(() => {
    
    let articleData = that.data.articleData;

    //bgMusic.duration总时长  bgMusic.currentTime当前进度
    let currentTime = parseInt(bgMusic.currentTime);

    let starttime = util.formatMinSec(bgMusic.currentTime);

    let duration = parseInt(bgMusic.duration);

    articleData.starttime = starttime;
    articleData.currentTime = currentTime;
    //实时更新音频时长
    articleData.audioLength = util.formatMinSec(duration);
    articleData.duration = duration;

    if (articleData.article.book.catalogue &&articleData.article.book.catalogue.type === '3') {
      let currentTime = bgMusic.currentTime;
      let passages = articleData.passages;
      let currentLineIndex = articleData.currentLineIndex;
      //for (let i = currentLineIndex + 1; i < passages.times.length; i++) {
      for (let i = 0; i < passages.times.length; i++) {
        if (currentTime < passages.times[i][0]) {
          currentLineIndex = i - 1;
          break;
        }
        currentLineIndex = i;
      }
      
      if (currentLineIndex != articleData.currentLineIndex) {
        if ( !articleData.audioFollowMode){
          bgMusic.pause();
        }
        let currentTG = passages.times[currentLineIndex];
        articleData.currentIdP = '' + currentTG[1] + currentTG[2];
        if (articleData.audioFollowMode ||articleData.jumpFlag) {
          articleData.jumpFlag = false;
          articleData.currentId = articleData.currentIdP;
        }
        articleData.currentLineIndex = currentLineIndex;
        articleData.currentLineP = true;
        
      }
    }
    that.setData({
      articleData: articleData
    })
  })
  bgMusic.onPlay(() => {
    let articleData = that.data.articleData;
    articleData.isOpen = true;
    if (articleData.currentLineP) {
      articleData.currentLineP = false;
      articleData.currentId = articleData.currentIdP;
    }
    that.setData({
      articleData: articleData
    })
  })
  bgMusic.onPause(() => {
    let articleData = that.data.articleData;
    articleData.isOpen = false;
    that.setData({
      articleData: articleData
    })
  })
  bgMusic.onStop(() => {
    let articleData = that.data.articleData;
    articleData.isOpen = false;
    articleData.isNT = false;
    that.setData({
      articleData: articleData
    })
  })
  //播放结束
  bgMusic.onEnded(() => {
    let articleData = that.data.articleData;
    articleData.isOpen = false;
    articleData.isNT = false;
    articleData.currentLineIndex = 0;
    articleData.currentId = "00";
    that.setData({
      articleData: articleData
    })
  })
}
function unload() {
  listenerButtonStop()
}
function changeAudioShowMode(){
  let articleData = this.data.articleData;
  if (articleData.article.book.catalogue &&articleData.article.book.catalogue.type === '3'){
    articleData.audioFollowMode = !articleData.audioFollowMode;
  }else{
    articleData.audioFixedMode = !articleData.audioFixedMode;
  }
  this.setData({
    articleData: articleData
  })
}
function musicForward(){
  let currentTime = parseInt(bgMusic.currentTime);
  let seekTime = currentTime + 10;
  bgMusic.seek(seekTime);
}
function musicBackward(){
  let currentTime = parseInt(bgMusic.currentTime);
  let seekTime = currentTime - 10;
  if(seekTime < 0 ){
    seekTime = 0;
  }
  bgMusic.seek(seekTime);
}
function recordManagerListener(target){
  let that = target;
  recorderManager.onStart(() => {
    let articleData = that.data.articleData;
    articleData.recordingFlag = !articleData.recordingFlag;
    that.setData({
      articleData: articleData
    })
  })
  recorderManager.onPause(() => {

  })
  recorderManager.onStop((res) => {
    let articleData = that.data.articleData;
    articleData.recordingFlag = !articleData.recordingFlag;
    that.setData({
      articleData: articleData
    })
    let data = {
      currentLineIndex: articleData.currentLineIndex,
      currentUrl: res.tempFilePath
    }
    that.dbArticleFollow.addOneLine(data);
  })
  recorderManager.onFrameRecorded((res) => {
    const { frameBuffer } = res
  })
}
function startRecord(){
  let that = this;
  if (that.data.articleData.isOpen || that.data.articleData.recordPlayingFlag){
    return
  }
  recorderManager.start(recordOptions)
}
function finishRecord(){
  recorderManager.stop();
}
function playRecord(){
  let that = this;
  let articleData = that.data.articleData;
  if (articleData.isOpen || articleData.recordingFlag) {
    return
  }
  let currentLine = that.dbArticleFollow.getCurrentLine(articleData.currentLineIndex);
  if(!currentLine){
    return
  }
  innerAudio.src = currentLine.currentUrl;
  innerAudio.play();
  
}
function innerAudioListener(target){
  let that = target;
  innerAudio.onPlay(() => {
    let articleData = that.data.articleData;
    articleData.recordPlayingFlag = !articleData.recordPlayingFlag;
    that.setData({
      articleData: articleData
    })

  })
  innerAudio.onStop(() => {
    let articleData = that.data.articleData;
    articleData.recordPlayingFlag = !articleData.recordPlayingFlag;
    that.setData({
      articleData: articleData
    })
  })
  innerAudio.onEnded((res) => {
    let articleData = that.data.articleData;
    articleData.recordPlayingFlag = !articleData.recordPlayingFlag;
    that.setData({
      articleData: articleData
    })
  })
}
function finishPlayRecord() {
  
  innerAudio.stop();
  
}
function jumpToLine(opt){
  let that = this;
  let lineIndex = opt.target.dataset.lineindex;
  let articleData = that.data.articleData;
  if (!articleData.audioFollowMode){
    if (articleData.recordingFlag || articleData.isOpen) {
      return
    }
  }
  let times = articleData.passages.times;
  articleData.jumpFlag = true
  that.setData({
    articleData:articleData
  })
  bgMusic.seek(times[lineIndex][0]);
}
module.exports = {
  articleContent: articleContent,
  unload: unload,
}