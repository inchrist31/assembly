const util = require('./util.js');
const getReadingSchedule =(groups,date)=>{
  let m_count = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let luna = false;
  let year = parseInt(date.getFullYear());
  if ((year % 4 == 0 && year % 100 != 0) || (year % 100 == 0 && year % 400 == 0)) {
    m_count[1] = 29;
    luna = true;
  }
  let month = date.getMonth();
  let result = [];

  for(let j = 0;j<groups.length;j++){
    let o = [];
    for (let i = 0; i < m_count[month]; i++) {
      let day = new Date(date.getFullYear() + '-' + (month + 1) + '-' + (i + 1) + ' 00:00:00')
      let articleIndex = -1;
      let planType = groups[j].planType;
      switch (planType) {
        case "0":
          articleIndex = getCurArticleId0(groups[j], day);
          break;
        case "1":
          articleIndex = getCurArticleId1(groups[j], day);
          break;
        case "2":
          articleIndex = getCurArticleId2(groups[j], day,luna);
          break;
      }
      o.push(articleIndex);
    }
    result.push(o);
  }
  return result;
}

const getCurArticleId0 = function (group, date) {
  let startDate = new Date(group.startDate.split('T')[0] + ' 00:00:00');
  let endDate = new Date(group.endDate);
  let interval = group.interval;

  if (date.getTime() < startDate.getTime()) {
    return -1;//未开始
  }else if(date.getTime() >= endDate.getTime() ){
    return -2;//已结束
  }
  let dif = parseInt((date.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  let articleIndex = parseInt(dif / interval);
  let remain = dif % interval;
  if(remain === 0){
    return articleIndex;
  }else{
    return -1;
  }
}

const getCurArticleId1 = function (group, date) {
  let startDate = new Date(group.startDate.split('T')[0] + ' 00:00:00');   let endDate = new Date(group.endDate);
  let interval = group.interval;

  if (date.getTime() < startDate.getTime()) {
    return -1;//未开始
  }else if(date.getTime() >= endDate.getTime()){
    return -2;//已结束
  }

  let dif = parseInt((date.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  let weeks = parseInt(dif / 7);
  let ano = weeks * interval;
  let remain = dif % 7;
  let rule = []
  switch (interval) {
    case 1:
      rule = [0, -1, -1, -1, -1, -1, -1];
      break;
    case 2:
      rule = [0, -1, -1, 1, -1, -1, -1];//interval = 2;
      break;
    case 3:
      rule = [0, -1, 1, -1, 2,-1, -1];//interval = 3;
      break;
    case 4:
      rule = [0, 1, 2, 3, -1, -1, -1];//inerval = 4;
      break;
    case 5:
      rule = [0, 1, 2, 3, 4, -1, -1];//interval = 5;
      break;
    case 6:
      rule = [0, 1, 2, 3, 4, 5, -1];//inteval = 6;
      break;
  }
  if (rule[remain] === -1){
    return -1;
  }
  ano = ano + rule[remain];
  
  return ano;
}

const getCurArticleId2 = function (group, date, luna) {
  let startDate = new Date(group.startDate.split('T')[0] + ' 00:00:00');
  let endDate = new Date(group.endDate);
  if (date.getTime() < startDate.getTime()) {
    return -1;
  }else if(date.getTime()>= endDate.getTime()){
    return -2;
  }
  let thisYear = new Date(date.getFullYear() + '-01-01 00:00:00');

  let dif = parseInt((date.getTime() - thisYear.getTime()) / (1000 * 3600 * 24));
  if(luna && (date.getMonth()>1|| date.getMonth() == 1 && date.getDate() ==  29)){
    dif = dif - 1;
  }
  return dif;
}

module.exports ={
  getReadingSchedule: getReadingSchedule
}