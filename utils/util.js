 const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  

  return [year, month, day].map(formatNumber).join('-') 
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatFilename = (currentDay) =>{
  return currentDay.year+formatNumber(currentDay.month)+formatNumber(currentDay.day)
}

const formatMinSec = n =>{
  let currentTime = parseInt(n);
  let min = parseInt(currentTime / 60);
  if(min < 10){
    min = "0" + min;
  }
  var sec = currentTime % 60;
  if (sec < 10) {
    sec = "0" + sec;
  };
  return min + ':' + sec;   /*  00:00  */
}

const getInitDuration = d =>{
  let min = parseInt(d.substr(0,2))
  let sec = parseInt(d.substr(3,2))
  return min*60 + sec;
}

const checkInterval = (startDate,curDate,interval) =>{
  let dif = (curDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  dif = dif % curBook.interval;
  if(dif != 0){
    return false;
  }
  return true;
}

const dateStringToJson = (date) =>{
  let n = date.split('-');
  return {
    year:parseInt(n[0]),
    month:parseInt(n[1]),
    day:parseInt(n[2]),
  }
}
const dateJsonToStringF = (date) =>{
  return date.year + '-' + formatNumber(date.month) +'-'+formatNumber(date.day)
}
const dateJsonToString = (date) =>{
  return date.year + '-' + date.month + '-' + date.day
}

const calInterval = (startDate, endDate, interval) => {
  let dif = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  let result = parseInt(dif / interval) + 1;
  return result;
}
const calEndDate = (startDate, total, interval) => {
  let ms = (startDate.getTime() + total*interval *24*60*60*1000) 
  let endDate = (new Date()).setTime(ms);
  return {
    year: endDate.getFullYear(),
    month: endDate.getMonth()+1,
    day: endDate.getDate(),
  } 
  
}
const formatDateTime = date =>{
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const hour = date.getHours();
  const min = date.getMinutes();


  return [year, month, day].map(formatNumber).join('-') + ' '+formatNumber(hour)+':'+formatNumber(min);
}
//-------------Common Business Logic-------------//

//从所有用户里面筛选出未签到的用户
const getUnsignedUsers = (data)=> {
  let allUsers = data.allUsers;
  let signedUsers = data.signedUsers;
  let unsignedUsers = [];
  allUsers.forEach(function (item) {
    let openId = item.openId;
    let matchUser = signedUsers.find(function (u) {
      
      return openId == u.openId
    })
    
    if (typeof (matchUser) == 'undefined') {
      unsignedUsers.push(item)
    }
  })
  
  return unsignedUsers;
}
const processText = (text) =>{
  let passages = text.split('\n');
  let output = {
    lines:[],
    times:[],
  };
  let times = [];
  let lineIndex = 0;
  for(let i=0;i<passages.length;i++){
    let p = passages[i];
    let lines = p.split(/\[\d{1,2}:\d{2}\.\d{1,2}\]/);
    let timesText = p.match(/\[\d{1,2}:\d{2}\.\d{1,2}\]/g);
  //  let times = [];
    
    if(timesText != null){

      if (lines.length > timesText.length){
        lines = lines.slice(lines.length - timesText.length);
      }
      timesText.forEach(function(item,index){
        let time = item.substr(1,item.length - 2)
        let ts = time.split(':');
        let duration = 0;
        if (ts.length === 3) {
          duration = parseInt(ts[0]) * 60 * 60 + parseInt(ts[1]) * 60 + parseFloat(ts[2]);
        } else if (ts.length === 2) {
          duration = parseInt(ts[0]) * 60 + parseFloat(ts[1]);
        }
        let timeGroup = [duration,i,index]
        times.push(timeGroup);
      })
    }else{
      times.push([0,i,0]);
    }
    let l = [];
    lines.forEach(function(s){
      let res = s.match(/\[author.*\]/);
      if(!res){
        l.push({
          text:[s],
          index:lineIndex++,
          });
      }else{
        let l1 = res[0].substr(8, res[0].length - 9);
        let l2 = s.substr(res[0].length);
        l.push({
          text:[l1,l2],
          index:lineIndex++,
          })
      }
    })
    output.lines.push(l);
  }
  output.times = times;
  return output;
} 

const processText1 = (text)=> {
  let lines = text.split('\n');
  let output = {
    lines: [],
    times: [],
  };
  for (let i = 0; i < lines.length; i++) {
    let result = lines[i].match(/\[\d{1,2}:\d{2}\.\d{1,2}\]/g);
    if (!result) {
      output.lines.push(lines[i]);
      output.times.push(0);
    } else {
      let time = result[0];
      let lineText = lines[i].substr(time.length);
      output.lines.push(lineText);
      time = time.substr(1, time.length - 2)
      let ts = time.split(':');
      let duration = 0;
      if (ts.length === 3) {
        duration = parseInt(ts[0]) * 60 * 60 + parseInt(ts[1]) * 60 + parseFloat(ts[2]);
      } else if (ts.length === 2) {
        duration = parseInt(ts[0]) * 60 + parseFloat(ts[1]);
      }
      output.times.push(duration);
    }
  }
  return output;
}
module.exports = {
  formatTime: formatTime,
  formatNumber:formatNumber,
  formatFilename:formatFilename,
  formatMinSec: formatMinSec,
  getInitDuration: getInitDuration,
  checkInterval: checkInterval,
  dateStringToJson: dateStringToJson,
  dateJsonToString: dateJsonToString,
  getUnsignedUsers: getUnsignedUsers,
  calInterval: calInterval,
  calEndDate: calEndDate,
  formatDateTime: formatDateTime,
  processText: processText,
}
