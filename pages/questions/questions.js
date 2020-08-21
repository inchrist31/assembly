const request = require('../../utils/requestRC.js');
const upload = require('../../utils/uploadFile.js');
const utils = require('../../utils/util.js');
const app = getApp();
const recorderManager = wx.getRecorderManager();
const innerAudio = wx.createInnerAudioContext();
const recordOptions = {
  duration: 600000,
  sampleRate: 8000,
  numberOfChannels: 1,
  encodeBitRate: 16000,
  format: 'mp3',
  frameSize: 50
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageName:'question',
    currentTab: "question",
    useKeyboardFlag:true,
    showInputBox:false,
    inputBoxHeight:'350rpx',
    submitTruthAnswerFunc:'submitTruthAnswer',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = app.globalData.userInfo;
    let curGroup = app.globalData.curGroup;
    
    if(userInfo.openId === curGroup.manager){
      this.setData({
        isMgr:true,
      })
    }
    let articleId = options.articleId;
    this.setData({
      articleId:articleId,
      userInfo:userInfo
    })
    this.getTruthQuestion(articleId);

    
    let that = this;
    let intervalObject = null;
    recorderManager.onStart(() => {
      that.setData({
        recordSec:1,
        startRecordFlag: !this.data.startRecordFlag,
      })
      intervalObject = setInterval(function(){
        let s = that.data.recordSec;
        that.setData({
          recordSec:s + 1
        })
      },1000)
    })
    recorderManager.onPause(() => {
      
    })
    recorderManager.onStop((res) => {
      let tempRecord = {
        audioUrl:res.tempFilePath,
        duration:Math.round(res.duration / 1000)
      }
      this.setData({
        startRecordFlag: !this.data.startRecordFlag,
        tempRecord:tempRecord,
        inputBoxHeight:'220rpx',
        tempRecordPlay:false,
        recordSec:0,
      })
      clearInterval(intervalObject)
    })
    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
    })

    innerAudio.onPlay(()=>{
      that.setData({
        tempRecordPlay:true
      })
    })
    innerAudio.onStop(()=>{
      that.setData({
        tempRecordPlay:false
      })
    })
    innerAudio.onEnded((res)=>{
      that.setData({
        tempRecordPlay: false
      })
    })
  },
  handleTabChange: function ({ detail }){
    
    this.setData({
      currentTab: detail.key
    })
    if(detail.key==='saint'){
      this.getSaintQuestion()
    }else{

    }
  },
  getSaintQuestion:function(){
    let that = this;
    let input = {
      func:"QUESTION05",
      openId:app.globalData.userInfo.openId,
      curGroup:app.globalData.curGroup,
      articleId:that.data.articleId
    }
    request.request("/question",input).then(function(data){
      let questions = data.data;
      let showAskButton = true;
      questions.forEach(function(item){
        if(item.user._id === app.globalData.userInfo.openId){
          showAskButton = false;
        }
        item.timestamp = utils.formatDateTime(new Date(item.timestamp))
      })
      that.setData({
        questionlist:questions,
        showAskButton: showAskButton
      })
    })
  },
  //切换语音和键盘输入
  switchInputType: function (event) {
    if (this.data.startRecordFlag){
      return;
    }
    this.setData({
      useKeyboardFlag: !this.data.useKeyboardFlag,
      inputBoxHeight: !this.data.useKeyboardFlag?'350rpx':'120rpx',
      startRecordFlag:false,
      tempRecord:null
    })
  },
  bindRecord:function(){
    let startRecordFlag = this.data.startRecordFlag;
   
    if(!startRecordFlag){
      this.recordStart()
    }else{
      this.recordEnd()
    }
  //  this.setData({
  //    startRecordFlag: !this.data.startRecordFlag
  //  })
  },
 //开始录音
    recordStart: function () {
      let that = this;
      this.setData({
          recodingClass: 'recoding'
      });
      recorderManager.start(recordOptions)
    },

    //结束录音
    recordEnd: function () {
        this.setData({
            recodingClass: ''
        });
        recorderManager.stop()
    },

    //提交录音 
    submitVoiceComment: function (audio) {
      
    },
    deleteTempRecord:function(){
      this.setData({
        tempRecord:null,
        inputBoxHeight: '120rpx'
      })
    },
  playAudio: function (event) {     
    let url = event.currentTarget.dataset.url;
    if(url != this.data.currentUrl){
      innerAudio.src = url;
      innerAudio.play();
      this.setData({
        currentUrl:url
      })
    }else{
      if (!this.data.tempRecordPlay) {
        innerAudio.play();
      } else {
        innerAudio.stop()
      }
    }
  },
  deleteTruthAnswer:function(e){

    let answerId = e.currentTarget.dataset.answerid;
    let questionId = e.currentTarget.dataset.questionid;
    let that = this;
    wx.showModal({
      title: '删除回答',
      content: '您确定要将本条回答删除?',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          let input = {
            func: "QUESTION06",
            questionId: questionId,
            answerId: answerId
          }
          request.request('/question', input).then(function (data) {
            let answers = data.data;
            let showAnswerBtn = true;
            answers.forEach(function (item) {
              let date = new Date(item.time)
              item.time = utils.formatDateTime(date);
              if (item.user._id === app.globalData.userInfo.openId) {
                showAnswerBtn = false;
              }
            })
            that.setData({
              answerlist: answers,
              showAnswerBtn : showAnswerBtn
            })
          })
        } else {


        }
      }
    });
   
  },
  editQuestion:function(){
    let that = this;
    wx.navigateTo({
      url: './input/input?type=0&articleId=' + that.data.articleId + '&questionId=' + that.data.truthQuestion._id,
    })
  },
  
  submitTruthQuestion:function(){
    let that = this;
    let curGroup = app.globalData.curGroup;
    let input = {
      func:'QUESTION01',
      curGroup:curGroup,
      question:that.data.inputText,
      articleId:that.data.articleId,
      questionId:that.data.truthQuestion._id,
      openId:app.globalData.userInfo.openId,
    }
    request.request('/question',input).then(function(data){
      if(data.data._id){
        that.setData({
          truthQuestion:data.data
        })
      }else{
        let truthQuestion = that.data.truthQuestion;
        truthQuestion.question = that.data.inputText;
        that.setData({
          truthQuestion:truthQuestion
        })
      }
      that.setData({
        showInput: false,
        showButton: true,
      })
    })
  },
  bindCommentInput:function(e){
    this.setData({
      inputText:e.detail.value,
      inputTextLength:e.detail.value.length
    })
  },
  
  getTruthQuestion:function(articleId){
    let that = this;
    let input = {
      func:"QUESTION02",
      articleId:articleId,
      curGroup:app.globalData.curGroup,
    }
    request.request('/question',input).then(function(data){
      let answers = data.data.answers ? data.data.answers:[];
      let showAnswerBtn = true;
      answers.forEach(function(item){
        let date = new Date(item.time)
        item.time = utils.formatDateTime(date);
        if(item.user._id === app.globalData.userInfo.openId){
          showAnswerBtn = false;
        }
      })
      that.setData({
        truthQuestion:data.data,
        answerlist:data.data.answers,
        showAnswerBtn:showAnswerBtn,
      })
    })
  },
  answerQuestion:function(){
    this.setData({
      showInputBox:true,
      useKeyboardFlag:true,
      tempRecord:null,
      startRecordFlag:false,
      inputBoxHeight: '350rpx',
    })
    
  },
  submitTruthAnswer:function(){
    let that = this;
    that.setData({
      submitTruthAnswerFunc:''
    })
    let question = that.data.truthQuestion;
    if (that.data.useKeyboardFlag){
      this.submitTruthAnswerText(question);
    }else{
      this.submitTruthAnswerAudio(question);
    }
    this.setData({
      showAnswerBtn:false
    })
    
  },
  submitTruthAnswerText:function(question){
    let that = this;
    let input = {
      func: "QUESTION03",
      questionId: question._id,
      groupId: app.globalData.curGroup._id,
      bookId: app.globalData.curGroup.book._id,
      answer: that.data.inputText,
      openId: app.globalData.userInfo.openId,
    }
    request.request('/question', input).then(function (data) {
      let answers = data.data.answers;
      answers.forEach(function (item) {
        let date = new Date(item.time)
        item.time = utils.formatDateTime(date);
      })
      that.setData({
        showInputBox: false,
        answerlist: answers,
        submitTruthAnswerFunc:'submitTruthAnswer'
      })
    })
  },
  submitTruthAnswerAudio:function(question){
    let that = this;
    let filePath = that.data.tempRecord.audioUrl;
    let inputData={
      func: "QUESTION03",
      questionId: question._id,
      groupId:app.globalData.curGroup._id,
      bookId:app.globalData.curGroup.book._id,
      openId: app.globalData.userInfo.openId,
      duration:that.data.tempRecord.duration
    }
    upload.upload('/question',filePath,inputData).then(function(data){
      let answers = data.data.answers;
      answers.forEach(function (item) {
        let date = new Date(item.time)
        item.time = utils.formatDateTime(date);
      })
      that.setData({
        showInputBox: false,
        answerlist: answers,
        submitTruthAnswerFunc:'submitTruthAnswer'
      })
    })
  },
  askQuestion:function(){
    let that = this;
    wx.navigateTo({
      url: './input/input?type=2&articleId=' + that.data.articleId + '&questionId=' + that.data.truthQuestion._id,
    })
  },
  replySaintQuestion:function(e){
    let questionId = e.currentTarget.dataset.questionid;
    let that = this;
    wx.navigateTo({
      url: './input/input?type=3&articleId=' + that.data.articleId + '&questionId=' + questionId,
    })
  },
  deleteSaintQuestion:function(e){
    let questionId = e.currentTarget.dataset.questionid;
    let that = this;
    wx.showModal({
      title: '删除圣徒提问',
      content: '您确定要将这个问题删除?',
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          let input = {
            func: "QUESTION08",
            questionId: questionId,
            curGroup:app.globalData.curGroup,
            articleId: that.data.articleId
          }
          request.request('/question', input).then(function (data) {
            let questions = data.data;
            let showAskButton = true;
            questions.forEach(function (item) {
              if (item.user._id === app.globalData.userInfo.openId) {
                showAskButton = false;
              }
              item.timestamp = utils.formatDateTime(new Date(item.timestamp))
            })
            that.setData({
              questionlist: questions,
              showAskButton: showAskButton
            })
          })
        } 
      }
    });
  }
})