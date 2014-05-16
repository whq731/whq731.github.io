$(document).ready(function(){

  // 滚动区域边界处 拉动触发的预设阀值
  var threshold =30;
  // 新内容计数器
  var generatedCount = 0;
  // scroll滚动事件只在iscroll-probe.js版本中存在
   myScroll = new IScroll(".wrapper", {
    probeType: 1,
    scrollX: false,
    scrollY: true,
    mouseWheel: true,
    click: true
  });
  
  myScroll.on('scroll', function() {
    var $wrapper = $(this.wrapper);
    var $pullDown = $wrapper.find('.pulldown');
    var $pullUp = $wrapper.find('.pullup');
    // 下拉距离 大于预设值
    if (this.y > threshold) {
      $pullDown.addClass('flip').find('.label').html('松开刷新...');
    } else {
      $pullDown.removeClass('flip').find('.label').html('下拉刷新...');
    }
  });
  myScroll.on('scrollEnd', function() {
    var $wrapper = $(this.wrapper);
    var $pullDown = $wrapper.find('.pulldown');
    var $pullUp = $wrapper.find('.pullup');
    // 判断是否处于松手执行xx操作的状态
    if ($pullDown.hasClass('flip')) {
      $wrapper.addClass('pulldownrefresh');
      this.refresh();
      $pullDown.removeClass('flip').addClass('loading').find('.label').html('Loading...');
      // 下拉刷新的动作
      pullDownAction($wrapper);
    }
    // 判断如果到底 则直接加载
    if(this.y == this.maxScrollY){
      $pullUp.removeClass('flip').addClass('loading').find('.label').html('Loading...');
      // 上拉加载更多的动作
      pullUpAction($wrapper);
    }
  });
  
  function pullDownAction($wrapper) {
    var $pullDown = $wrapper.find('.pulldown');
    setTimeout(function() {
      $wrapper.removeClass('pulldownrefresh');
      $pullDown.removeClass('flip loading').find('.label').html('下拉刷新...');
      myScroll.refresh();
    }, 1000);
  }
  
  function pullUpAction($wrapper) {
    var $pullUp = $wrapper.find('.pullup');
    setTimeout(function() {
    var el = $(".wrapper ul")[0];

    for (i=0; i<3; i++) {
      li = document.createElement('li');
      li.innerText = '新加载内容' + (++generatedCount);
      el.appendChild(li);
    }
      myScroll.refresh();
    }, 1000);
  }
  
  
  



});
