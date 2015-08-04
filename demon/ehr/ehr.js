/*
使用方法: node ehr sessionId startDate endDate（起始查询日期 格式：年.月.日 如果不写则默认查询当前月份）
*/
if(!process.argv[2]){
    throw new Error('请提供ehr登陆后的sessionid,登陆后用chrome查看复制cookie里的JSESSIONID的值，并使用ehr xxxID ');
}
var cheerio = require("cheerio");
var request = require('request');
var request = request.defaults({jar: true})
var j = request.jar();

var cookie = request.cookie('JSESSIONID='+process.argv[2]);
var url = 'http://ehr.dangdang.com/kq/kqself/card/carddata.do?b_query=link';
j.setCookie(cookie, url);
var i=0;
var requests = [];
var formated = {};
var today = new Date();
var currentYear = today.getFullYear();
var currentMonth = today.getMonth();

var startDate = process.argv[3] || currentYear+'.'+ (currentMonth + 1) + '.01';
var endDate = process.argv[4] || currentYear+'.' + (currentMonth + 1) + '.' + new Date(currentYear, currentMonth, 0).getDate();
console.log('查询起始日期: ' + startDate + ' 终止日期: ' + endDate);
console.log('查询中...');
do {
requests.push({start_date:startDate, end_date:endDate, listpagination:'baseNetSignInForm',current:i, paginationDbAction:(i==0?'First':'Next')});
setTimeout(function(){
    var data = requests.shift();

request.post({url: url, jar: j, form: data}, function (error, response, body) {
  
  $ = cheerio.load(body);
  $('table > tr').each(function(i,e){
      if(i==0){
          return;
      }
    if($($(e).find('td')[3]).html()) {
        var day = trimStr($($(e).find('td')[3]).html());
    }
    if($($(e).find('td')[4]).html()) {
        var time = trimStr($($(e).find('td')[4]).html());
    }
    if(!day || !time) {
        return;
    }
      if(!formated[day]) {
          formated[day] = [];
      }
      var temp = new Date(day+' '+time);
      if(formated[day].indexOf(temp.getTime())==-1)
      {
          formated[day].push(temp.getTime());
      }
  });
    if(requests.length==0){
        var countDays = 0;
        var forgetCheckon = 0;
        var totalLength = 0;
        for(var key in formated){
            if(formated[key].length==1){
                totalLength += 9*60*60;
                forgetCheckon++;
            } else if (formated[key].length==2) {
                var abstime = Math.abs(formated[key][1] - formated[key][0]);
                totalLength += abstime/1000;
            } else {
                countDays--;
                console.log('Wrong data!!!!!');
            }
            countDays++;
        }
        console.log('结果：');
        console.log('总计查询到'+countDays+'天的记录，其中有'+forgetCheckon+'天只有一次打卡记录，只有一次记录的按9小时计算');
        console.log('平均工作时长：'+(totalLength/60/60/countDays)+'小时，未计入该月请假的天数');
    }
})
},i*1000);
i++;
if(i>10){
break;
}
}while(true);

function trimStr(str){return str.replace(/(^\s*)|(\s*$)/g,"");}
