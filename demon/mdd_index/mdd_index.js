(function ($) {
    var mdd_index = {
        init :function(){
            //引导屏初始化
            this.landingInit();
            // 秒杀模块初始化
            this.seckillInit();
            // 搜索模块初始化
            this.suggestInit();
            // UA检测
            this.browserDetectiveInit();
            // 下载APP
            this.appDownloadInit();
            // 图片懒加载初始化 和推荐商品懒加载
            this.lazyLoadInit();
        },
        isInViewport :function ($ele) {
            if (!$ele || $ele.nodeType !== 1) {
                return false;
            }
            var bcr = $ele.getBoundingClientRect();
            if (bcr.bottom < 0) {
                return false;
            }
            return bcr.top < Math.max(window.innerHeight, document.documentElement.clientHeight);
        },
        images: function (imgobj){
            var img = new Image();
            var imgsrc=imgobj.attr('imgsrc');
            img.onload = function () {
                if(img.complete == true){
                    imgobj.attr('src', imgsrc);
                    imgobj.removeClass('lazy');
                    imgobj.removeAttr('imgsrc');
                }
            }   ;
            img.src = imgsrc;
        },
        browserDetectiveInit : function(){
            this.browser={
                    versions:function(){
                        var u = navigator.userAgent, app = navigator.appVersion;
                        return {
                            trident: u.indexOf('Trident') > -1, //IE
                            presto: u.indexOf('Presto') > -1, //opera
                            webKit: u.indexOf('AppleWebKit') > -1, //webkit
                            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //
                            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //
                            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios
                            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android
                            iPhone: u.indexOf('iPhone') > -1 , //iPhone
                            iPad: u.indexOf('iPad') > -1, //iPad
                            webApp: u.indexOf('Safari') == -1, //Safari
                            uc: !!u.match(/UCBrowser/) //ios
                        };
                    }(),
                    language:(navigator.browserLanguage || navigator.language).toLowerCase()
                }
        },
        landingInit :function(){
            $('.landing').on('touchmove', function(e) {
                    if ($(e.target).parents('#landing').length>0) {
                        e.preventDefault();
                    }
                }, false);
        },
        appDownloadInit :function(){
            var that = this;
            // 引导屏下载
            $('.landing .top span').on('click',function(){
                that.appDownload(window.landingUrlConfig);
            });
            $('.landing-app-download').on('click',function(){
                that.appDownload(window.landingAppUrlConfig);
            });
            $('#closeLanding').on('click',function(){
                $('.landing').hide();
                that.tempClose('landing');
            });
            // 首页内下载
            $('.app-download').on('click',function(){
                that.appDownload(window.appUrlConfig);
            });
            $('.close-app-download').on('click', function(){
                $(this).parent().hide();
                that.tempClose($(this).parent().data("pos"));

            });

        },
        openApp : function(url, jumpToDownload){
        // 记录起始时间
        var last = Date.now();
        // 创建一个iframe
        var ifr = document.createElement('IFRAME');
        ifr.src = url;
        // 飘出屏幕外
        ifr.style.position = 'absolute';
        ifr.style.left = '-1000px';
        ifr.style.top = '-1000px';
        ifr.style.width = '1px';
        ifr.style.height = '1px';
        // 设置一个4秒的动画用于检查客户端是否被调起
        ifr.style.webkitTransition = 'all 2s';
        document.body.appendChild(ifr);
        setTimeout(function(){
            // 监听动画完成时间
            ifr.addEventListener('webkitTransitionEnd', function(){
                document.body.removeChild(ifr);
                if(Date.now() - last < 3000){
                    // 如果动画执行时间在预设范围内，就认为没有调起客户端
                    if(typeof jumpToDownload === 'function'){
                        jumpToDownload();
                    }
                } else {
                    // 动画执行超过预设范围，认为调起成功
                    return;
                }
            }, false);
            // 启动动画
            ifr.style.left = '-10px';
        }, 0);
    },
    appDownload :function(appUrlConfig){
            var that = this;
            this.openApp('dangdang://',function(){
                if(that.browser.versions.android){
                    location.href = appUrlConfig.android;
                }else if(that.browser.versions.ios){
                    location.href = appUrlConfig.ios;
                }
            });
        },
        slideInit:function(iscrollInstance){
            var that = this;
            iscrollInstance.on('scrollStart', function(){
                window.clearInterval(iscrollInstance.timer);
                iscrollInstance.timer = setInterval(function(){
                    iscrollInstance.directionX = 1;
                    that.slidePic(iscrollInstance);
                },5000);
            });
            iscrollInstance.on('scrollEnd', function(){
                that.slidePic(this);
            });
            that.slideRun(iscrollInstance);
        },
        slidePic:function(iscrollInstance){
            if(iscrollInstance.directionX !=0){
                iscrollInstance.pageNum += iscrollInstance.directionX;
            if(iscrollInstance.pageNum >= iscrollInstance.pageSize){ 
                iscrollInstance.pageNum = 0; 
            }else if(iscrollInstance.pageNum < 0){
                iscrollInstance.pageNum = iscrollInstance.pageSize - 1;
            }
            iscrollInstance.scrollToElement($(iscrollInstance.scroller).find('li').eq(iscrollInstance.pageNum)[0],300);
            $(iscrollInstance.wrapper).find('.on').removeClass('on');
            $(iscrollInstance.wrapper).find('.dot').eq(iscrollInstance.pageNum).addClass('on');
            iscrollInstance.directionX=0;
            }

        },
        slideRun :function(iscrollInstance){
            var that = this;
            iscrollInstance.timer = setInterval(function(){
                    iscrollInstance.directionX = 1;
                    that.slidePic(iscrollInstance);
                },5000);
        },
        topSliderInit : function(){
            var that = this;
            if ($('.J_top_slider').length>0) {
                var topSlider = new IScroll('.J_top_slider', {scrollX: true,scrollY: false,snap: false, momentum: false, click: false,eventPassthrough: true,preventDefault: true});
                topSlider.pageNum = 0;
                topSlider.pageSize = $('.J_top_slider li').length;
                that.slideInit(topSlider);
;            };
        },
        bannerSliderInit : function(){
            var that = this;
            $(".J_banner_slider").each(function(){
                var targetId = $(this)[0].id;
                var bannerSlider = new IScroll('#'+targetId, {scrollX: true,scrollY: false,snap: false, momentum: false, click: false,eventPassthrough: true,preventDefault: true});
                bannerSlider.pageNum = 0;
                bannerSlider.pageSize = $(this).find('li').length;
                that.slideInit(bannerSlider);
            })
        },
        suggestInit : function(){
            this.suggest = new Suggest({
                ajaxUrl : 'h5ajax.php',
                defaultVal : "尾品汇",
                formEl : "#index_search_form",
                wrapEl : ".search_list"
            });
        },
        seckillInit : function(){
            this.seckill = new Countdown({
                    target:"[data-widget='countdown']",
                    endTime:$("[data-widget='countdown']").data("end-time"),
                    leftTime:$("[data-widget='countdown']").data("left-time"),
                    el_hour: "[data-countdown-role='hour']",
                    el_min: "[data-countdown-role='min']",
                    el_sec: "[data-countdown-role='sec']",
                    speed: 1
            }).start();
        },
        lazyLoadInit : function(){
            window.rec_last_page = 0;
            var that = this;
            // 首次加载视口内的图片
            $('.lazy').each(function(){
                if(that.isInViewport(this)){
                    that.images($(this));
                }
            });
            window.onscroll = function(){
                $('.lazy').each(function(){
                    that.images($(this));
                });
                // 推荐商品懒加载
                if($('.rec-prds').length ==0 && $('.rec-prds-wrapper').data('lazyLoad') != true && $(window).scrollTop() + window.innerHeight > $('.rec-prds-wrapper').offset().top - 150){
                    $('.rec-prds-wrapper').data('lazyLoad',true);
                    that.recPrdsInit();
                }
            }
        },
        recPrdsInit :function(){
            this.recPrdsWrapperTpl =
                '<h2 class="title">推荐商品</h2><div class="rec-prds"><ul></ul></div>';
            this.recPrdsTpl = 
                ['<li data-page-nubmer="<%= pageNum %>" >',
                '<a href="<%= callback_url %>">',
                '<img class="lazy" src="'+ window.proxyAssets +'/coreimages/bg_pic.png" imgsrc="<%= image_url %>" alt="">',
                '<div class="rec-prds-detail">',
                '<p class="rec-prds-name"><%= name%></p>',
                '<p class="price">',
                '    <span class="rob">',
                '        <span class="sign">&yen;</span>',
                '        <span class="num"><%=price%></span>',
                '        <span class="tail"></span>',
                '    </span>',
                '</p>',
                '</div>',
                '</a>',
                '</li>'].join('\n');
            var that = this;
            var rem = $('html').css("font-size").replace('px',"");
            window.rec_prds = {
                pageSize:4,
                currentPageNum:1,
                maxPageNum:1,
                liWidth : 5.25 * rem,
                pageWidth: 4 * 5.25 * rem
            }
            // pagesize 为4 首屏加载两页
            this.loadRecPrds(1, window.rec_prds.pageSize);
            setTimeout(function(){
                that.loadRecPrds(2, window.rec_prds.pageSize);
            },300)
        },
        recPrdsScroller : function(){
            var that = this;
            window.rec_prds_scroller = new IScroll('.rec-prds', {scrollX: true,scrollY: false,snap: false, momentum: false,deceleration: 0.01, click: false,eventPassthrough: true,preventDefault:true,useTransition:false,disableMouse: true, disablePointer: true});
            rec_prds_scroller.on('scrollEnd', function(){
                // 向左滑停止时 加载下一页
                rec_prds.currentPage = Math.ceil(this.x / -rec_prds.pageWidth) + 1;
                //console.log('currentPage:'+ rec_prds.currentPage);
                // 第一次向右滑时 x随maxScrollX 同时递增 判断距离当前页未还有一个图片的宽度时 加载下一页
                //if(this.x < this.maxScrollX + rec_prds.liWidth){
                //    // rec_prds.currentPageNum++;
                //    // rec_prds.maxPageNum++;
                //    that.moreRecPrds(rec_prds.currentPage, rec_prds.pageSize);
                //}
                // 向右滑判断是否有已销毁 有则加载
                if(this.x > this.startX ){
                    // 判断不存在前一页时 强制加载
                    if(rec_prds.currentPage != 1 && $('[data-page-nubmer="'+(rec_prds.currentPage - 1) + '"]').length == 0){
                        that.loadRecPrds(rec_prds.currentPage -1 , rec_prds.pageSize, 'insert');
                    }
                    // 前一页为销毁页面 则加载
                    if($('.rec-prds li[data-page-nubmer="' + (rec_prds.currentPage - 1) + '"]').data('destroyed') == true){
                        that.loadRecPrds(rec_prds.currentPage - 1, rec_prds.pageSize, 'destroyed');
                    }
                } else {
                    // 左滑加载下一页
                    if($('[data-page-nubmer="'+(rec_prds.currentPage + 1) + '"]').length == 0){
                        that.moreRecPrds(rec_prds.currentPage + 1, rec_prds.pageSize);
                    }
                    // 防止左滑速度过快 scrollEnd惯性移动 前一页未加载 判断不存在前一页时 强制加载
                    if(rec_prds.currentPage != 1 && $('[data-page-nubmer="'+(rec_prds.currentPage - 1) + '"]').length == 0){
                        that.loadRecPrds(rec_prds.currentPage - 1, rec_prds.pageSize,  'insert');
                    }
                    // 销毁移除屏幕的商品
                    $('[data-page-nubmer="'+(rec_prds.currentPage - 3) + '"]').html("").data("destroyed",true);
                    // 有时可能因为左滑速度太快停止时 导致中间可能出现空白 需要检测下当前页下一页是否未加载
                    if($('.rec-prds li[data-page-nubmer="' + rec_prds.currentPage + '"]').data('destroyed') == true){
                        that.loadRecPrds(rec_prds.currentPage, rec_prds.pageSize,  'destroyed');
                    }
                }
            });
        },
        loadRecPrds :function(pageNum,pageSize,pre){
            var that = this;
            var tempHtml = "";
            $.ajax({
                type: 'POST',
                url: "h5ajax.php",
                data: {
                    action: 'ad_cpc',
                    page: pageNum,
                    pagesize: pageSize,
                    lastpage: window.rec_last_page
                },
                dataType: "json",
                success: function (data) {
                    if(data.errorCode == 0){
                        // 更新last_page
                        window.rec_last_page = data.lastpage || window.rec_last_page;
                        // 初次有数据时加载栏目外边框
                        if($('.rec-prds').length == 0 && data.products.length > 0 ){
                            $('.rec-prds-wrapper').html(that.recPrdsWrapperTpl)
                        }
                        // 当推荐商品小于pageSize时
                        if(pageNum > 1 && data.products.length < pageSize){
                            return;
                        }
                        _.each(data.products,function(value, key, list){
                            value.pageNum = pageNum;
                            tempHtml += _.template(that.recPrdsTpl)(value);
                        });
                        // 从前还是从末尾插入
                        if(pre){
                            // 判断是加载销毁页 还是插入丢失页
                            if(pre ==  'destroyed'){
                                var target = $(".rec-prds ul").find("[data-page-nubmer='" + pageNum + "']");
                                target.not(target.eq(0)).remove();
                                target = $(".rec-prds ul").find("[data-page-nubmer='" + pageNum + "']");
                                target.replaceWith(tempHtml);
                            }else if(pre ==  'insert'){
                                // 在后页前插入当前丢失页
                                var target = $(".rec-prds ul").find("[data-page-nubmer='" + (pageNum + 1) + "']");
                                $(tempHtml).insertBefore(target.eq(0));
                            }
                        } else{
                            $(".rec-prds ul").append(tempHtml);
                            // 首次加载完毕时 生成滑动区域
                            if( $(".rec-prds ul li").length == pageSize){
                                that.recPrdsScroller();
                            }
                        }
                        $(".lazy").each(function(){
                            that.images($(this));
                        });
                    }
                },
                error: function (xhr, errorType, error) {
                    console.log(error);
                }
            });
        },
        moreRecPrds :function(nextPage,pageSize){
                this.loadRecPrds(nextPage, pageSize);
                $(".rec-prds ul").width($(".rec-prds ul").width() + rec_prds.pageWidth);
                //window.rec_prds_scroller.maxScrollX -= rec_prds.pageWidth;
                setTimeout(function(){
                    window.rec_prds_scroller.refresh();
                },200)
        },
        tempClose :function(name) {
            // 当天零点过期
            var date = new Date();
            date.setDate( date.getDate()+1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            str = "MDD_temp_close_"+ name +"=1; expires=" + date.toGMTString();
            // console.log(str);
            document.cookie = str;
        }
    }
    $(document).ready(function(){
        var docEl = document.documentElement,
            clientWidth = docEl.clientWidth;
        if (!clientWidth) return;
        docEl.style.fontSize = 20 * (clientWidth / 320) + 'px';
        FastClick.attach(document.body);
        mdd_index.init();
    })
    window.onload = function(){
        // onlaod图片完全时 
        // 顶部轮播初始化
        mdd_index.topSliderInit();;
        // banner轮播初始化
        mdd_index.bannerSliderInit();
    }
})(Zepto)
