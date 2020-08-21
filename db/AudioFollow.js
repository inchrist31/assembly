
class AudioFollow {
  constructor(articleId) {
    this.storageKeyName = 'articleAudioFollow';
    this.articleId = articleId;
  }

  //获取指定id号的文章数据
  getArticleById() {
    let articles = this.getAllArticleData();
    let len = articles.length;
    let res = null;
    for (let i = 0; i < len; i++) {
      if (articles[i].articleId == this.articleId) {
        res = {
          index:i,
          data:articles[i]
        }
        break;
      }
    }
    if(!res){
      let article = {
        articleId:this.articleId,
        followAudio:[]
      }
      articles.push(article)
      this.execSetStorageSync(articles)
      res={
        index:articles.length - 1,
        data: articles[articles.length - 1]
      }
    }
    return res;
  }


  /*得到全部文章信息*/
  getAllArticleData() {
    var res = wx.getStorageSync(this.storageKeyName);
    if (!res) {
      this.execSetStorageSync([])
      return [];
    }
    return res;
  }

  /*初始化缓存数据*/
  execSetStorageSync(data) {
    wx.setStorageSync(this.storageKeyName, data);
  }

  
  getCurrentLine(index){
    let article = this.getArticleById(this.articleId);
    let i=0;
    for(i=0;i<article.data.followAudio.length;i++){
      if(article.data.followAudio[i].currentLineIndex === index){
        break;
      }
    }
    if (i === article.data.followAudio.length){
      return null
    }
    return article.data.followAudio[i];
  }
  //增加一行语音
  addOneLine(data){//data:{currentLineIndex,currentUrl}
    let article = this.getArticleById(this.articleId);
    let allArticles = this.getAllArticleData();
    let i =0;
    for(i=0; i<article.data.followAudio.length;i++){
      if(article.data.followAudio[i].currentLineIndex == data.currentLineIndex){
        article.data.followAudio[i] = data;
        break;
      }
    }
    if(i==article.data.followAudio.length){
      article.data.followAudio.push(data)
    }
    article.data.followAudio.sort(function(a,b){
      return a.currentLineIndex - b.currentLineIndex
    })
    article.data.currentLine = data;
    allArticles[article.index] = article.data;
    this.execSetStorageSync(allArticles);
    return allArticles;
  }

};

export { AudioFollow }