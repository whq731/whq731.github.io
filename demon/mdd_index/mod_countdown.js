/**
 * 倒计时模块 样式无关 
 * 兼容时分秒单子标签或者双子标签
 * @param config 配置信息
 * target 计时组件el
 * endTime 截至日期 秒
 * leftTime 剩余时间 秒
 * el_min 小时el 父级标签
 * el_min 分钟el 父级标签
 * el_sec 秒el 父级标签
 * speed 计时速度s
 *
 * @return countdoun Obj
 */
var Countdown = function(config){
                    this.target = $(config.target) || $("[data-widget='countdown']");
                    this.endTime = config.endTime || 0;
                    this.leftTime = config.leftTime || 0;
                    this.el_hour = config.el_hour || "[data-countdown-role='hour']";
                    this.el_min = config.el_min || "[data-countdown-role='min']";
                    this.el_sec = config.el_sec || "[data-countdown-role='sec']";
                    this.speed = config.speed || 1;
        }
Countdown.prototype.start = function(){
    var that = this;
    that.leftTime == 0 && (that.leftTime = that.endTime - Date.parse(new Date())/1000);
    that.leftTime > 0 &&
    window.setInterval(function(){
        that.leftTime -= that.speed;
        if(that.leftTime > 0){
            var leftH  = Math.floor(that.leftTime/(60*60)),
                leftM = Math.floor((that.leftTime-(60*60*leftH))/60),
                leftS = Math.floor((that.leftTime-(60*60*leftH)-(60*leftM)));
            leftH<=9 && (leftH="0"+leftH);
            leftH = leftH.toString();
            switch(that.target.find(that.el_hour).children().size()){
                case 1 :
                    that.target.find(that.el_hour).children().eq(0).html(leftH);
                    break;
                case 2 :
                    that.target.find(that.el_hour).children().eq(0).html(leftH[0]);
                    that.target.find(that.el_hour).children().eq(1).html(leftH[1]);
                    break;
            }
            leftM<=9 &&(leftM="0"+leftM);
            leftM = leftM.toString();
            switch(that.target.find(that.el_min).children().size()){
                case 1 :
                    that.target.find(that.el_min).children().eq(0).html(leftM);
                    break;
                case 2 :
                    that.target.find(that.el_min).children().eq(0).html(leftM[0]);
                    that.target.find(that.el_min).children().eq(1).html(leftM[1]);
                    break;
            }
            leftS<=9 && (leftS="0"+leftS);
            leftS = leftS.toString();
            switch(that.target.find(that.el_sec).children().size()){
                case 1 :
                    that.target.find(that.el_sec).children().eq(0).html(leftS);
                    break;
                case 2 :
                    that.target.find(that.el_sec).children().eq(0).html(leftS[0]);
                    that.target.find(that.el_sec).children().eq(1).html(leftS[1]);
                    break;
            }
        }
    },that.speed * 1000);
    }