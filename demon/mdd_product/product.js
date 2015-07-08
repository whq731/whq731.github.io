/**
 * Created by weihanqing on 15/6/1.
 */
(function ($) {
    window.mdd_product = {
        init :function(){
            this.sid = window.sid;//php注入sid 需要在所有的ajax和跳转链接上加上
            this.pid = window.prd_info.product_info_new.product_id;//主品ID
            this.shopId = window.prd_info.product_info_new.shop_id;//店铺ID
            this.templateId = window.prd_info.product_info_new.template_id;
            this.limit_num = $('#limit_num').val() || 9999;//最大限购数
            this.limit_min_num = $('#limit_min_num').val() || 1;//最小购买数
            this.cookie_auto_callback = window.getStorage("MDD_auto_callback");//是否需要登录成功后自动执行
            this.cookie_settle_account = window.getStorage("MDD_settle_account"); //标识是否是点击立即购买后，登录跳转回单品页
            this.cookie_item_id = window.getStorage('MDD_temp_item_id'); //历史商品ID
            this.cookie_gift_id = window.getStorage('MDD_temp_gift_id'); //历史赠品ID
            this.cookie_buy_number = window.getStorage('MDD_buy_number'); //历史购买数量
            this.cookie_area_str = window.getStorage('MDD_area_str'); //曾经选择过的配送地址
            this.cookie_area_id = window.getStorage('MDD_area_id'); //曾经选择过的配送地址id
            this.tempSelectList = [];//城市选择缓存列表
            this.pluginInit($); // zepto扩展
            this.eventInit(); // 事件相关
        },
        pluginInit : function($){
            var that = this;
            $.mdd_getJSON = function(url, data, callback){
                // baseurl预留
                var baseUrl = "";
                var basePara = {sid: that.sid};
                // 封装请求 加上sid参数
                data = $.extend(data, basePara);
                var ajaxRequest = $.ajax({
                    url: baseUrl + url,
                    type: "get",
                    data: data,
                    dataType: "json"
                });
                ajaxRequest.done(callback).fail(function(){
                    //发生意外错误时 关闭loading
                    $(".loading").css('display','block');
                });
                return ajaxRequest;
            }
            $.fn.slideDown = function (duration, fun) {
                var that = this,
                    f = typeof fun === "function" ? fun : function(){};
                var position = this.css('position');

                this.css({
                    position: 'absolute',
                    visibility: 'hidden'
                });
                var height = this.height();
                this.css({
                    position: position,
                    visibility: 'visible',
                    overflow: 'hidden',
                    height: 0
                });
                this.animate({
                    height: height + "px"
                }, duration, f);
                setTimeout(function(){
                    that.css("height", "auto");
                }, duration);
            };
            $.fn.slideUp = function (duration, fun) {
                var that = this,
                    f = typeof fun === "function" ? fun : function(){};
                var height = this.height();
                this.css("height", height + "px");
                this.animate({
                    height: 0
                }, duration, f);
                setTimeout(function(){
                    that.css("visibility", "hidden");
                    that.css("height", "auto");
                }, duration);
            };
        },
        eventInit :function(){
            // 自动收藏和自动购买
            this.autoCallbackInit();
            // header菜单
            this.headerInit();
            // 收藏
            this.favInit();
            // 购买数量
            this.buyNumInit();
            // 颜色尺码
            this.colorSizeInit();
            // 换购品
            this.promoGiftInit();
            // 运费查询
            this.queryShippingFeeInit();
            // 懒加载项 包含广告
            this.lazyLoadInit();
            // 关注店铺
            this.collectShopInit();
            // 到货提醒
            this.addRemindInit();
            // 加入购物车
            this.addToCartInit();
            // 立即购买
            this.directBuyInit();
            // 购物车数量查询
            this.queryCartNumInit();

        },
        autoCallbackInit : function(){
            var that = this;
            // 如果曾经未登录状态下点过立即购买 但是现在未登录 证明是从登陆页面取消回来的，则需要重置cookie数据
            this.cookie_settle_account == 1 && this.checkLogin(null,function(){
                window.setStorage("MDD_settle_account", 0);
                window.setStorage('MDD_temp_item_id', 0);
                window.setStorage('MDD_temp_gift_id', 0);
                window.setStorage('MDD_buy_number', 0);
            })
            if(this.cookie_auto_callback == 1 && this._GET().callback_action){
                // 判断是否从登录成功跳回 触发自动执行的动作
                switch (this._GET().callback_action){
                    case 'add_wishlist' :
                        this.addWishList(this.pid,function(){
                            // 收藏状态与到货提醒状态联动
                            if($('.J_add_remind').length){
                                $('.J_add_remind').html('已设置到货提醒').removeClass('J_add_remind').addClass('J_remove_remind');
                            }
                            // 成功后重置自动执行标识
                            that.cookie_auto_callback = 0;
                            window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                            pop.popup({type:"pop", text: '加入收藏成功'});
                        },function(){
                            // 失败重置自动执行标识
                            that.cookie_auto_callback = 0;
                            window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                        });
                        break;
                    case 'get_shop_collect':
                        // 判断当前关注店铺状态 已关注则取消 反之亦然
                        var opertion = $('#collect_shop').html().trim() == '已关注'? 0 : 1;
                        this.collectShop(this.shopId, opertion, function(){
                            // 成功后重置自动执行标识
                            that.cookie_auto_callback = 0;
                            window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                        },function(){
                            // 失败重置自动执行标识
                            that.cookie_auto_callback = 0;
                            window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                        });
                        break;
                    case 'one_click_buying' :
                        // 自动立即购买 判断是否曾经点击过立即购买并调至登录
                        if(this.cookie_settle_account == 1){
                            // 判断是否登录 登录则立即购买 并重置cookie内的购买参数
                            this.directBuy(function(){
                                // 失败重置自动执行标识
                                that.cookie_auto_callback = 0;
                                window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                            });
                        }
                        break;
                }
            }

        },
        checkLogin : function(trueCallback, falseCallback){
            $.mdd_getJSON('h5ajax.php',{action : 'is_login'},function(result){
                if(result){
                    $.isFunction(trueCallback) && trueCallback();
                } else {
                    $.isFunction(falseCallback) && falseCallback();
                }
            });
        },
        _GET : function(){
            var url = window.document.location.href.toString();
            var u = url.split("?");
            if(typeof(u[1]) == "string"){
                if(u[1].indexOf('#') != -1) {
                    u = u[1].split("#");
                    u = u[0].split("&");
                } else {
                    u = u[1].split("&");
                }
                var get = {};
                for(var i in u){
                    var j = u[i].split("=");
                    get[j[0]] = j[1];
                }
                return get;
            } else {
                return {};
            }
        },
        headerInit : function(){
            $(".header .menu").click(function(e){
                if($(this).hasClass("active")){
                    $(this).removeClass("active");
                    $(".t-nav").removeClass("active");
                }else{
                    $(this).addClass("active");
                    $(".t-nav").addClass("active");
                }
                e.preventDefault();
            });
        },
        favInit : function(){
            var that = this;
            $('.fav').on('click', function(){
                $(".loading").css('display','block');
                $(this).hasClass('on') ? that.deleteWishList(that.pid,function(){
                    // 收藏状态与到货提醒状态联动
                    if($('.J_remove_remind').length){
                        $('.J_remove_remind').html('到货提醒').removeClass('J_remove_remind').addClass('J_add_remind');
                    }
                }) : that.addWishList(that.pid,function(){
                    // 收藏状态与到货提醒状态联动
                    if($('.J_add_remind').length){
                        $('.J_add_remind').html('已设置到货提醒').removeClass('J_add_remind').addClass('J_remove_remind');
                    }
                    pop.popup({type:"pop", text: '加入收藏成功'});
                },function(){
                    pop.popup({type:"pop", text: '已加入加入收藏'});
                });
            })
        },
        addWishList : function(pid,completeCallback, failCallback){
            var  that = this;
            $.mdd_getJSON('h5ajax.php',{action : 'add_wishlist', pid : pid},function(result){
                if(result.errorCode == 0){
                    $(".loading").css('display','none');
                    $('.fav').addClass('on');
                    $.isFunction(completeCallback) && completeCallback();
                } else if(result.errorCode == 96) {
                    // 未登录跳转登录
                    $(".loading").css('display','none');
                    that.cookie_auto_callback = 1;
                    window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                    window.location.href = result.login_url;
                } else {
                    $(".loading").css('display','none');
                    $.isFunction(failCallback) && failCallback();
                    pop.popup({type:"pop", text: result.errorMsg});
                }
            });
        },
        deleteWishList : function(pid,completeCallback, failCallback){
            $.mdd_getJSON('h5ajax.php',{action : 'delete_wishlist', pid : pid},function(result){
                if(result.errorCode == 0){
                    $(".loading").css('display','none');
                    $('.fav').removeClass('on');
                    $.isFunction(completeCallback) && completeCallback();
                } else {
                    $(".loading").css('display','none');
                    $.isFunction(failCallback) && failCallback();
                    pop.popup({type:"pop", text: result.errorMsg});
                }
            });
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
            };
            img.src = imgsrc;
        },
        iScrollClick :function(){
            // iscroll滑动列表 click参数兼容性判断
            if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) return false;
            if (/Chrome/i.test(navigator.userAgent)) return (/Android/i.test(navigator.userAgent));
            if (/Silk/i.test(navigator.userAgent)) return false;
            if (/Android/i.test(navigator.userAgent)) {
                var s=navigator.userAgent.substr(navigator.userAgent.indexOf('Android')+8,3);
                return parseFloat(s[0]+s[3]) < 44 ? false : true
            }
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
                $(iscrollInstance.wrapper).find('.dot li').eq(iscrollInstance.pageNum).addClass('on');
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
        productSliderInit : function(){
            var that = this;
            // ios8 safari 关闭Transition 否则会引起跳转单品详情页回退 导航菜单动画不执行bug
            if($.os.ios){
                this.topSlider = new IScroll('#slider', {useTransition:false,scrollX: true,scrollY: false,snap: false, momentum: false, click: false,eventPassthrough: true,preventDefault: true});
            } else {
                this.topSlider = new IScroll('#slider', {scrollX: true,scrollY: false,snap: false, momentum: false, click: false,eventPassthrough: true,preventDefault: true})
            }
            this.topSlider.pageNum = 0;
            this.topSlider.pageSize = $('.top-slider li').length;
            this.slideInit(this.topSlider);
            // 绑定最后一张图片滑动进详情
            this.sliderPullToJump($('.top-slider li').last());
            // 查看大图模式
            $('#slider li').on('click', function(){
                $("#bigpic").toggleClass('bigpic');
                $("#cell").toggleClass('cell');
            })
        },
        sliderPullToJump : function(target){
            var that = this;
            target.on('touchstart', function(e){
                // 非大图模式下 最有一张开始触摸滑动时 保存x,y坐标
                !$("#bigpic").hasClass('bigpic') && (that.pullStartX = e.touches[0].pageX) && (that.pullStartY = e.touches[0].pageY);
            });
            target.on('touchmove',function(e){
                if(!$("#bigpic").hasClass('bigpic') && e.touches[0].pageX < that.pullStartX){
                    // 左滑时 并且水平滑动大于上下滑动的距离时 进详情页
                    if(Math.abs(e.touches[0].pageX - that.pullStartX) > Math.abs(e.touches[0].pageY - that.pullStartY)){
                        !$('#slider').hasClass('tip') && $('#slider').addClass('tip') &&  window.clearInterval(that.topSlider.timer);
                    }
                }
            });
            target.on('touchend', function(e){
                // 延迟跳转 让提示图片显示出来
                setTimeout(function(){
                    if($('#slider').hasClass('tip')){
                        $('#slider').removeClass('tip');
                        location.href = $('#detail_link').attr('href')
                        return;
                    }
                },0)
            })
        },
        buyNumInit : function(){
            var that = this;
            // 如果存在最小限购数量 则讲选择数量变为最小起购数量
            this.limit_min_num > 1 && $("#buy_num").val(this.limit_min_num);
            $(".number_con .plus").on('click', function(){
                $("#buy_num").val(parseInt($("#buy_num").val())+1);
                if (parseInt($("#buy_num").val()) > 1) {
                    $(".minus").addClass('on');
                }
                // 当前数量大于等于限购量 设为限购量
                if (that.limit_num !=0 && parseInt($("#buy_num").val()) >= that.limit_num) {
                    $("#buy_num").val(that.limit_num);
                    $(this).removeClass('on');
                }
            });
            // 数量减号 购买数量需要大于等于最小起购数 等于最小起购数时按钮置灰
            $(".number_con .minus").on('click', function(){
                if (parseInt($("#buy_num").val()) > that.limit_min_num) {
                    $("#buy_num").val(parseInt($("#buy_num").val())-1);
                }
                if (parseInt($("#buy_num").val()) <= that.limit_min_num) {
                    $(this).removeClass('on');
                }
                if (parseInt($("#buy_num").val()) < that.limit_num) {
                    $(".plus").addClass('on');
                }
            });
            // 输入为空时 设为最小购买数量 大于最小购买数量时 取消置灰
            $("#buy_num").blur(function(){
                if(that.limit_min_num==''){
                    that.limit_min_num = 1;
                }
                if($.trim($("#buy_num").val()) == '' || isNaN($("#buy_num").val())) {
                    $("#buy_num").val(that.limit_min_num);
                }else if (parseInt($("#buy_num").val()) <= that.limit_min_num) {
                    $("#buy_num").val(that.limit_min_num);
                    $(".minus").removeClass('on');
                    if( $("#buy_num").val() < that.limit_num){
                        $(".plus").removeClass('on');
                    }
                }else{
                    $(".minus").addClass('on');
                }
                // 小于最大购买数时 加号可点击 大于最大购买数量时 设为最大数量 并加号置灰
                if( $("#buy_num").val() < that.limit_num){
                    $(".plus").addClass('on');
                } else if (this.limit_num !=0 && parseInt($("#buy_num").val()) >= that.limit_num) {
                    $("#buy_num").val(that.limit_num);
                    $(".plus").removeClass('on');
                    $(".minus").addClass('on');
                }
            });
        },
        colorSizeInit : function(){
            var that = this;
            var hasColor = $('#color_options li').length;
            var hasSize = $('#size_options li').length;
            var color_size_data = window.prd_info.product_attr;
            // 如果只有一个可选项 帮用户勾选
            if(hasColor == 1){
                $('#color_options > li').addClass('on')
                var selected_color = $('#color_options li').html();
            }
            if(hasSize == 1){
                $('#size_options > li').addClass('on')
                var selected_size = $('#size_options li').html();
            }
            // 只有一个子品时 自动勾选后 还要获取item_id
            if((hasColor == 1 && hasSize == 1) || (hasColor == 1 && hasSize == 0) || (hasColor == 0 && hasSize == 1)){
                this.cookie_item_id = color_size_data.product[0].itemid;
            }
            // 可能存在只有一个色 或者码 的情况 先运行一次展示分色分码提示语逻辑
            this.tipsToggle();
            //颜色标签点击事件
            if($('#color_options > li').length > 1){
                $("#color_options > li").on('click',function(){
                    $(".thumbnail .color").html($(this).html()).hide();
                    //去除其他颜色标签的选中样式
                    $(this).addClass('on').siblings().removeClass("on");
                    //某颜色下有哪些尺码可以组成有库存的商品
                    selected_color = $(this).html();
                    var color_size_index = color_size_data.attr1_array[selected_color];
                    //如果有尺码属性
                    if ($('#size_options > li').length) {
                        $("#size_options > li").each(function(){
                            //先将所有尺码标签样式恢复正常
                            $(this).removeClass('stockout');
                            //将无库存的商品尺码置为灰色
                            if ($.inArray( $(this).html(),color_size_index) < 0) {
                                //如果之前被选中该尺码，但与选中的颜色匹配后商品无货，则取消选中
                                if($(this).hasClass('on')){
                                    $(this).removeClass('on');
                                    $(".thumbnail .select").show();
                                    $(".thumbnail .split").hide();
                                    $(".thumbnail .size").html($('#size_name').html()).show();
                                }
                                // 标记为无货
                                $(this).addClass('stockout');
                            }
                        })
                        //如果同时选中颜色和尺码确定一个单品之后，页面中所有价格都显示该单品的相关价格
                        if($("#size_options .on").length > 0){
                            selected_item = _.findWhere(color_size_data.product,{color:selected_color, size: selected_size});
                            //主价格变动
                            $("#main_price").html(selected_item[selected_item.show_price_name]);
                            //选择区域的价格变动
                            $("#color_size_price").html(selected_item[selected_item.show_price_name]);
                            //选中的单品ID
                            that.cookie_item_id = selected_item.itemid;
                            //选中的图片显示
                            $(".thumbnail img").attr('src', selected_item.image);
                        } else {
                            //如果只选中颜色，没有选中尺码
                            //页面上的所有价格都显示产品的区间价格
                            $(".J_change_price").each(function(){
                                $(this).html($(this).data("price-range"));
                            })
                            //选中的单品ID置0
                            that.cookie_item_id = 0;
                        }
                    } else {
                        //只有一个分色分码属性
                        //选中的单品ID
                        selected_item = _.findWhere(color_size_data.product,{color:selected_color});
                        that.cookie_item_id = selected_item.itemid;
                        //主价格变动
                        $("#main_price").html(selected_item[selected_item.show_price_name]);
                        //选择区域的价格变动
                        $("#color_size_price").html(selected_item[selected_item.show_price_name]);
                        $(".thumbnail img").attr('src', selected_item.image);
                        if ($("#area_select_hidden").attr('area_id') > 0) { //说明用户已经选择了配送地区 TODO
                            subProductStockQuery($("#area_select_hidden").attr('area_id'), $("#hide_itemid").val());
                        }
                    }
                    that.tipsToggle();
                })
            }
            //尺码标签点击事件
            if($('#size_options > li').length > 1){
                $("#size_options > li").on('click',function(){
                    $(".thumbnail .size").html($(this).html()).hide();
                    //去除其他颜色标签的选中样式
                    $(this).addClass('on').siblings().removeClass("on");
                    //某颜色下有哪些尺码可以组成有库存的商品
                    selected_size = $(this).html();
                    var color_size_index = color_size_data.attr2_array[selected_size];
                    //如果有颜色属性
                    if ($('#color_options > li').length) {
                        $("#color_options > li").each(function(){
                            //先将所有颜色标签样式恢复正常
                            $(this).removeClass('stockout');
                            //将无库存的商品颜色置为灰色
                            if ($.inArray( $(this).html(),color_size_index) < 0) {
                                //如果之前被选中该颜色，但与选中的尺码匹配后商品无货，则取消选中
                                if($(this).hasClass('on')){
                                    $(this).removeClass('on');
                                }
                                // 标记为无货
                                $(this).addClass('stockout');
                            }
                        })
                        //如果同时选中颜色和尺码确定一个单品之后，页面中所有价格都显示该单品的相关价格
                        if($("#color_options .on").length > 0){
                            selected_item = _.findWhere(color_size_data.product,{color:selected_color, size: selected_size});
                            //主价格变动
                            $("#main_price").html(selected_item[selected_item.show_price_name]);
                            //选择区域的价格变动
                            $("#color_size_price").html(selected_item[selected_item.show_price_name]);
                            //选中的单品ID
                            that.cookie_item_id = selected_item.itemid;
                            //选中的图片显示
                            $(".thumbnail img").attr('src', selected_item.image);
                            //如果用户已经选择了配送地区，根据配送地区来查询被选中子品库存和预售状况 TODO
                            if ($("#area_select_hidden").attr('area_id') > 0) { //说明用户已经选择了配送地区
                                subProductStockQuery($("#area_select_hidden").attr('area_id'), $("#hide_itemid").val());
                            }
                        } else {
                            //如果只选中尺码，没有选中颜色
                            //页面上的所有价格都显示产品的区间价格
                            $(".J_change_price").each(function(){
                                $(this).html($(this).data("price-range"));
                            });
                            //选中的单品ID置0
                            that.cookie_item_id = 0;
                        }
                    } else {
                        //只有一个分色分码属性
                        //选中的单品ID
                        selected_item = _.findWhere(color_size_data.product,{color:selected_color});
                        that.cookie_item_id = selected_item.itemid;
                        //选择区域的价格变动
                        $("#color_size_price").html(selected_item[selected_item.show_price_name]);
                        $(".thumbnail img").attr('src', selected_item.image);
                        if ($("#area_select_hidden").attr('area_id') > 0) { //说明用户已经选择了配送地区 TODO
                            subProductStockQuery($("#area_select_hidden").attr('area_id'), $("#hide_itemid").val());
                        }
                    }
                    that.tipsToggle();
                })

            }
            // 展开收起动画
            this.optionToggleSlideInit();

        },
        tipsToggle : function(){
            var select = $('.thumbnail .select');
            var color = $('.thumbnail .color');
            var split = $('.thumbnail .split');
            var size = $('.thumbnail .size');
            var select_color = $('#color_options .on');
            var select_size = $('#size_options .on');
            var hasColor = $('#color_options li').length;
            var hasSize = $('#size_options li').length;
            var color_name = $('#color_name');
            var size_name = $('#size_name');
            var color_title = $('.option .title .color');
            var size_title = $('.option .title .size');
            // 颜色尺码都有时
            if(hasColor && hasSize){
                // 颜色尺码都选中了 提示栏显示'颜色/尺码'
                if(select_color.length && select_size.length){
                    select.hide();
                    color.html(select_color.html()).show();
                    split.show();
                    size.html(select_size.html()).show();
                    // title栏显示选择的颜色尺码
                    color_title.html(select_color.html());
                    size_title.html(select_size.html());

                } else {
                    // 只有一个选中
                    select.show();
                    split.hide();
                    // 颜色选中 尺码未选中
                    if(select_color.length){
                        color.hide();
                        size.html(size_name.html());
                    }
                    // 尺码选中 颜色未选中
                    if(select_size.length){
                        size.hide();
                        color.html(color_name.html());
                    }
                }
            } else if(hasColor){
                // 只有颜色时 选中时
                if(select_color.length){
                    select.hide();
                    color.html(select_color.html()).show();
                    color_title.html(select_color.html());
                    split.hide();

                } else {
                    select.show();
                    color.html(color_name.html());
                }
            } else if(hasSize) {
                // 只有尺码时 选中时
                if (select_size.length) {
                    select.hide();
                    size.html(select_size.html()).show();
                    size_title.html(select_color.html());
                    split.hide();
                } else {
                    select.show();
                    size.html(size_name.html());
                }
            }
        },
        optionToggleSlideInit : function(){
            var colorSizeTitle = $('.option .title');
            colorSizeTitle.on('click',function(){
                if(colorSizeTitle.find('.arrow_d').hasClass('up')){
                    colorSizeTitle.find('.arrow_d').removeClass('up');
                    $('.option_detail').slideUp(150, function(){
                        $(this).hide();
                    });
                } else {
                    colorSizeTitle.find('.arrow_d').addClass('up');
                    $('.option_detail').slideDown(150, function(){
                        $(this).css('display','block');
                    });
                }
            });

        },
        promoGiftInit : function(){
            var promoType = $('.barter').data('promo-type');
            switch(promoType)
            {   // 送赠品 多选一 默认勾选第一个赠品 可反选
                case 3 :
                    $('.barter_product li').on('click', function(){
                        var selected =  $(this);
                        selected.siblings().removeClass('selected');
                        selected.toggleClass('selected');
                        if(selected.hasClass('selected')){
                            $('#selected_gift_name').html(selected.data('gift-name'));
                        } else {
                            $('#selected_gift_name').html('');
                        }
                        selected = null;
                    });
                    $('.barter_product li').eq(0).addClass('selected');
                    $('#selected_gift_name').html($('.barter_product li').eq(0).data('gift-name'));
                    break;
                // 换购 只能选择一个 默认不勾选
                case 28:
                    $('.barter_product li').on('click', function(){
                        var selected =  $(this);
                        selected.siblings().removeClass('selected');
                        selected.toggleClass('selected');
                        if(selected.hasClass('selected')){
                            $('#selected_gift_name').html(selected.data('gift-name'));
                        } else {
                            $('#selected_gift_name').html('');
                        }
                        selected = null;
                    });
                    break;
                // 买一赠送多 全部勾选 不能取消
                case 30:
                    $('.barter_product li').addClass('selected');
                    break;
            }

        },
        closeRegionSelect : function(){
            // 关闭清空缓存列表 和html列表内容
            $('.mask').hide();
            $('.select_box').slideUp(300);
            this.tempSelectList.length = 0;
            $('.select_box .content').html('');
        },
        queryShippingFeeInit : function(){
            var that = this;
            $('.mask').on('touchmove',function(e){
                e.preventDefault();
            });
            $('.select_box .title').on('touchmove',function(e){
                e.preventDefault();
            });
            // 点遮罩层关闭
            $('.mask').click(function(){
                that.closeRegionSelect();
            });
            // 后退按钮
            $('.select_box .back').click(function(){
                that.backRegionSelect();
            });
            // 关闭按钮
            $('.select_box .close').click(function(){
                that.closeRegionSelect();
            });
           this.regionScroller = new IScroll('#regionScroller',{scrollY: true, click: this.iScrollClick()});
            $("#ship_detail").click(function(){
                $('.mask').show();
                $('.select_box').slideDown(300);
                that.getRegionId('country');
            });
            // 选择地区去取下一级地址
            $('.select_box .content').on('click','dd',function(){
                that.getRegionId($(this).data('region-type'), $(this).data('parent-id'), $(this).html());
            });
            // 除电子书和不支持购买品以外 如果存在用户的历史配送地址 则查询一次
            if(window.prd_info.product_info_new.is_support_mobile_buying && !window.prd_info.product_info_new.is_ebook && this.cookie_area_id){
                this.getRegionId('district',this.cookie_area_id )
            }

        },
        getRegionId : function(reginonType, parentId, regionName){
            var that = this;
            var nextRegion = '';
            var lastRegion = '';
            this.regionTpl =
                ['<% _.each(city_list,function(item){ %>',
                 '<dd data-region-type="<%= city_list.reginonType%>" data-parent-id="<%= item.id%>"><%= item.name%></dd>',
                 '<% }) %>'].join('\n');
            // area_str是后台返回的地址信息 如果cookie里有历史选择过的地址信息时 在下面的请求逻辑中会优先使用并查询
            this.shippingFeeTpl =
                ['<%if(stock_info == "无货"){%>',
                '   <% if(area_str){%>',
                '       <%= area_str.split(",").join(">")%><span style="color:#fe435d;">&nbsp;无货</span>',
                '   <% } %>',
                '<%} else {%>',
                '   <% if(area_str){%>',
                '       <%= area_str.split(",").join(">")%></br>',
                '   <% } %>',
                '   <% if(arriver_info){%>',
                '       <%= arriver_info[0].shipword%></br>',
                '   <% } %>',
                '   <% if(shipping_fee){%>',
                '       <%= shipping_fee%></br>',
                '   <% } %>',
                '<% } %>'].join('\n');
            // 初次进入国家默认是用9000 取省信息 其他时取下一级信息 如需加五级地址时在此处扩展
            switch (reginonType){
                case 'country':
                    parentId = 9000;
                    nextRegion = 'province';
                    $('.select_box .back').hide();
                    break;
                case 'province':
                    nextRegion = 'city';
                    that.provinceName = regionName;
                    break;
                case 'city':
                    nextRegion = 'district';
                    that.cityName = regionName;
                    break;
                case 'district':
                    nextRegion = null;
                    that.districtName = regionName;
                    break;
            }
            // 如果有下一级地区则查询 否则去查询运费
            if(nextRegion){
                $.mdd_getJSON('h5ajax.php', {action : 'get_add', parent_id : parentId},function(result){
                    if(result.city_list || result.errorCode == 0){
                        result.city_list.reginonType = nextRegion;
                        var html = _.template(that.regionTpl, result);
                        // 缓存当前列表 并显示回退按钮
                        if($('.select_box .content').html()){
                            that.tempSelectList.push($('.select_box .content').html());
                            $('.select_box .back').show();
                        }
                        $('.select_box .content').html(html);
                        // 列表从头显示
                        setTimeout(function(){
                            that.regionScroller.refresh();
                            that.regionScroller.scrollTo(0, 0);
                        },100)

                    } else if(result.errorCode == 101){
                        // 此处有待优化 现在mapi调用主站接口 主站没有返回任何特殊标识 标记为最后一级地址 只好通过泛用 error code 101 来判断
                        // 保存用户选择的地区信息
                        that.cookie_area_str =  '';
                        that.provinceName && (that.cookie_area_str += that.provinceName + ',')
                        that.cityName && (that.cookie_area_str += that.cityName)
                        // 此处适配二级地址 所以需要把三级地址重置
                        that.districtName = '';
                        // 保存用户的配送地址id
                        that.cookie_area_id = parentId;
                        window.setStorage('MDD_area_str', that.cookie_area_str);
                        window.setStorage('MDD_area_id', that.cookie_area_id);
                        $(".loading").css('display', 'block');
                        that.queryShippingFee(parentId, function(){
                            // 成功后关闭Loading 收起列表 清空缓存list 清空列表html内容
                            $(".loading").css('display', 'none');
                            that.closeRegionSelect();
                        },function(){
                            that.closeRegionSelect();
                            $(".loading").css('display', 'none');
                        })
                    } else {
                        pop.popup({type:"pop", text: result.errorMsg});
                        that.closeRegionSelect();
                    }
                });
            } else {
                if(regionName){
                    // 保存用户选择的地区信息
                    this.cookie_area_str =  '';
                    this.provinceName && (this.cookie_area_str += this.provinceName + ',')
                    this.cityName && (this.cookie_area_str += this.cityName)
                    this.districtName && (this.cookie_area_str += ',' + this.districtName)
                    // 保存用户的配送地址id
                    this.cookie_area_id = parentId;
                    window.setStorage('MDD_area_str', that.cookie_area_str);
                    window.setStorage('MDD_area_id', that.cookie_area_id);
                    $(".loading").css('display', 'block');
                }
                this.queryShippingFee(parentId, function(){
                    // 成功后关闭Loading 收起列表 清空缓存list 清空列表html内容
                    $(".loading").css('display', 'none');
                    that.closeRegionSelect();
                },function(){
                    that.closeRegionSelect();
                    $(".loading").css('display', 'none');
                })
            }
        },
        backRegionSelect : function(){
            var that = this;
            if(this.tempSelectList.length > 0){
                var html = this.tempSelectList.pop();
                $('.select_box .content').html(html);
                setTimeout(function(){
                    that.regionScroller.refresh();
                    that.regionScroller.scrollTo(0, 0);
                },100)
               this.tempSelectList.length == 0 &&  $('.select_box .back').hide();
            }
        },
        buyStatusChange : function(result){
            // 根据状态替换底部按钮
            var inStockTpl = '<button class="add">加入购物车</button><button class="buy J_buy">立即购买</button>';
            var outStockTpl = '<button class="buy big J_add_remind">到货提醒</button>';
            var alreadyRemindTpl = '<button class="buy big J_remove_remind">已设置到货提醒</button>';
            var preSaleTpl = '<button class="add">预订</button><button class="buy J_buy">立即预订</button>';
            var status = '';
            switch(result.stock_info){
                case '有货' :
                    status = inStockTpl;
                    break;
                case '无货' :
                    // 如果已加入收藏夹 则显示已设置到货提醒 prd_info.product_info_new.in_wishlist == '1' 这个判断不准
                    if($('.fav').hasClass('on')){
                        status = alreadyRemindTpl;
                    } else {
                        status = outStockTpl;
                    }
                    break;
                case '预订' :
                    status = preSaleTpl;
                    break;
            }
            // 只有支持购买的品才可以切换购买按钮
            (window.prd_info.product_info_new.is_support_mobile_buying ==1 ) && status && $('.shopping_cart .btn_con').html(status);
        },
        queryShippingFee : function(area_id, completeCallback, failCallback){
            var that = this;
            $.mdd_getJSON('h5ajax.php',{action : 'get_send_time', area_id : area_id, shop_id : that.shopId,
                template_id : that.templateId, pid : that.pid },function(result){
                if(result.errorCode == 0) {
                    // 根据查询到的状态改变 下方购买按钮状态
                    that.buyStatusChange(result);
                    // 如果有历史选择信息 优先使用
                    if(that.cookie_area_str){
                        result.area_str = that.cookie_area_str;
                    }
                    var html = _.template(that.shippingFeeTpl, result);
                    $('#ship_detail dd').html(html);
                    $.isFunction(completeCallback) && completeCallback();
                } else {
                    pop.popup({type:"pop", text: result.errorMsg});
                    $.isFunction(failCallback) && failCallback();
                }
            });
        },
        guessInit : function(){
            var that = this;
            this.guessListTpl =
                ['<% if(products.length){%>',
                 '<section class="guess">',
                 '<div class="title_con"><span class="title">猜你喜欢</span><div class="line"></div></div>',
                 '<ul>',
                 '<% _.each(products,function(item){ %>',
                 '<li>',
                 '<% if(item.ad_id){%>',
                 '<a href="<%= item.callback_url %>'+"&sid="+ sid +'">',
                 '<% } else {%>',
                 '<a href="<%= item.product_id %>.html?sid='+ sid +'">',
                 '<% }%>',
                 '<aside><img class="lazy" src="coreimages/bg_pic.png" imgsrc="<%= item.image_url %>" ></aside>',
                 '<span><%= item.name%></span>',
                 '<em>￥<%= item.price%></em>',
                 '</a>',
                 '</li>',
                 '<% }) %>',
                 '</ul>',
                 '</section>',
                '<% }%>'].join('\n');
            $.mdd_getJSON('h5ajax.php',{action : 'get_product_alsobuy_and_adlist', pid : that.pid, img_size : 'b'},function(result){
                if(result.errorCode == 0){
                    if(result.products && result.products.length){
                        var html = _.template(that.guessListTpl, result);
                        $('.J_guess').html(html);
                    }
                }
            });
        },
        bookAdInit : function(){
            var that = this;
            this.alsoBuyTpl =
                ['<section class="alsobuy">',
                    '<a href="pro_see_and_see.php?pid=<%= products.pid%>" class="arrow_con">',
                    '<div class="arrow">',
                    '<h4>买过本商品的还买了</h4>',
                    '<em>更多</em>',
                    '</div>',
                    '</a>',
                    '<ul>',
                    '<% _.each(products.reco_list,function(item){ %>',
                    '<li>',
                    '<a href="<%= item.product_id %>.html?sid='+ sid +'">',
                    '<img class="lazy" src="coreimages/bg_pic.png" imgsrc="<%= item.image_url %>" >',
                    '<span><%= item.name%></span>',
                    '<em>￥<%= item.price%></em>',
                    '</a>',
                    '</li>',
                 '<% }) %>',
                '</ul>',
                '</section>'].join('\n');
            this.hotTpl =
                ['<section class="hot">',
                 '<h4>热卖商品</h4>',
                 '<ul>',
                 '<% _.each(products.ad_list,function(item){ %>',
                 '<li>',
                 '<a href="<%= item.callback_url %>'+"&sid="+sid+'">',
                 '<img class="lazy" src="coreimages/bg_pic.png" imgsrc="<%= item.image_url %>" >',
                 '<span><%= item.name%></span>',
                 '<em>￥<%= item.price%></em>',
                 '</a>',
                 '</li>',
                 '<% }) %>',
                 '</ul>',
                 '</section>'].join('\n');
            // img_size:b 请求大图
            $.mdd_getJSON('h5ajax.php',{action : 'get_book_see_and_see', pid : that.pid, img_size : 'b'},function(result){
                if(result.errorCode == 0){
                    if(result.products && result.products.reco_list && result.products.reco_list.length){
                        result.products.pid = that.pid;
                        var alsoBuy = _.template(that.alsoBuyTpl, result);
                        $('.J_alsobuy').html(alsoBuy);
                    }
                    if(result.products && result.products.ad_list && result.products.ad_list.length){
                        var hot = _.template(that.hotTpl, result);
                        $('.J_alsobuy').after(hot);
                    }
                }
            });
        },
        lazyLoadInit : function(){
            var that = this;
            this.guessLazyload = false;
            this.alsoBuyLazyload = false;
            // 首次加载视口内的图片
            $('.lazy').each(function(){
                that.images($(this));
            });
            window.onscroll = function(){
                // 返回顶部动态显示
                //mdd_index.goTop();
                $('.lazy').each(function(){
                    that.images($(this));
                });
                // 推荐商品懒加载
                if($('.J_guess').length && !this.guessLazyload && $(window).scrollTop() + window.innerHeight > $('.J_guess').offset().top - 150){
                    this.guessLazyload = true;
                    that.guessInit();
                }
                // 图书广告懒加载
                if($('.J_alsobuy').length && !this.alsoBuyLazyload && $(window).scrollTop() + window.innerHeight > $('.J_alsobuy').offset().top - 150){
                    this.alsoBuyLazyload = true;
                    that.bookAdInit();
                }
            }
        },
        collectShopInit : function(){
            var that = this;
            $('#collect_shop').on('click',function(){
                if($(this).html().indexOf( '已关注') < 0){
                    $(".loading").css('display','block');
                    that.collectShop(that.shopId, 1);
                } else {
                    $(".loading").css('display','block');
                    that.collectShop(that.shopId, 0);
                }
            });
        },
        collectShop : function(shopId, operation, completeCallback, failCallback){
            var that = this;
            // operation  1关注 0取消
            $.mdd_getJSON('h5ajax.php',{action : 'get_shop_collect',pid : that.pid, shop_id : shopId, operation : operation},function(result){
                if(result.errorCode == 0){
                    $(".loading").css('display','none');
                    if(operation){
                        $('#collect_shop').html('已关注');
                        pop.popup({type:"pop", text:"关注成功"});
                    } else {
                        $('#collect_shop').html('关注店铺');
                        pop.popup({type:"pop", text:"取消关注成功"});
                    }
                    $.isFunction(completeCallback) && completeCallback();
                } else if(result.errorCode == 96){
                    $(".loading").css('display','none');
                    that.cookie_auto_callback = 1;
                    window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                    window.location.href = result.login_url;
                } else {
                    $(".loading").css('display','none');
                    pop.popup({type:"pop", text: result.errorMessage});
                    $.isFunction(failCallback) && failCallback();
                }
            });
        },
        getBuyPid : function(){
            //返回 拼接pid和购买数量后的串
            var wholePid = this.pid + '.' + this.cookie_buy_number;
            return wholePid;
        },
        directBuyInit : function(){
            var that = this;
            $('.shopping_cart').on('click', '.J_buy', function(){
                that.buyCheck();
            })
        },
        scrollToOption : function(){
            window.scrollTo(0,$('.option').offset().top - 100 );
            if(!$('.option .arrow_d').hasClass('up')){
                $('.option .arrow_d').addClass('up');
                $('.option_detail').slideDown(150, function(){
                    $(this).css('display','block');
                });
            }
        },
        colorSizeCheck :function(){
            // 分色分码check
            var color_size_name = '请选择' + $('#color_name').html() + '/' + $('#size_name').html();
            var color_name = '请选择' + $('#color_name').html();
            var size_name =  '请选择' + $('#size_name').html();
            var select_color = $('#color_options .on').length;
            var select_size = $('#size_options .on').length;
            var hasColor = $('#color_options li').length;
            var hasSize = $('#size_options li').length;
            if(hasColor && hasSize){
                // 有颜色和尺码 有一个没选时
                if(!(select_color && select_size)){
                    // 提示未选项名称 都未选择时 提示请选择颜色/尺码
                    if(!select_color && !select_size){
                        pop.popup({type:"pop", text: color_size_name});
                    } else{
                        !select_color && pop.popup({type:"pop", text: color_name});
                        !select_size && pop.popup({type:"pop", text: size_name});
                    }
                    this.scrollToOption();
                    return false;
                }
            } else if(hasColor && !hasSize){
                if(!select_color){
                    pop.popup({type:"pop", text: color_name});
                    this.scrollToOption();
                    return false;
                }
            } else if(!hasColor && hasSize){
                if(!select_size){
                    pop.popup({type:"pop", text: size_name});
                    this.scrollToOption();
                    return false;
                }
            }
            return true;
        },
        buyCheck : function(){
            // 购买数量check
            this.colorSizeCheck() && this.directBuy();
            // 配送地址check TODO ?

        },
        getGiftId : function() {
            var giftId = 0;
            var selectedGift = $('.barter .selected');
            if (selectedGift.length > 0) {
                // 只选中一个品时(换购或者买一赠一时) 只传giftId 选择多个时(买一赠多时) 不传
                if (selectedGift.length == 1) {
                    giftId = selectedGift.data('gift-id');
                }
            }
            // 注意此处cookie_gift_id 有可能返回'0' 在做判断是否存在时要注意
            return giftId || this.cookie_gift_id;
        },
        directBuy : function(completeCallback, failCallback){
            var that = this;
            // 如果是自动立即购买 则使用历史的cookie_buy_number 否则使用页面的内的数量
            if(this.cookie_settle_account != 1){
                this.cookie_buy_number = $('#buy_num').val();
            }
            this.cookie_gift_id = this.getGiftId();
            // 如果有子品则使用item_id
            var pid = this.pid;
            this.cookie_item_id > 0 && (pid =this.cookie_item_id)
            // 如果存在多个赠品时 不需要传gitf_id的参数
            if(this.cookie_gift_id !=0){
                var requestDate = {action : 'one_click_buying', pid : pid , gift_id: this.cookie_gift_id, count: this.cookie_buy_number}
            } else {
                var requestDate = {action : 'one_click_buying', pid : pid , count: this.cookie_buy_number}
            }

            $.mdd_getJSON('h5ajax.php', requestDate, function(result){
                if(result.errorCode == 0){
                    $.isFunction(completeCallback) && completeCallback();
                    // 考虑到从结算可能回退到单品 单一分色分码 点击加入购物车或者立即购买 此时页面可能是不刷新的 所以需要保留本地变量
                    // reset buy history
                    window.setStorage("MDD_settle_account", 0);
                    window.setStorage('MDD_temp_item_id', 0);
                    window.setStorage('MDD_temp_gift_id', 0);
                    window.setStorage('MDD_buy_number', 0);
                    $('#product_form').submit();
                } else if(result.errorCode == 96 ){
                    // 持久化历史记录选择记录
                    that.cookie_settle_account = 1;
                    window.setStorage("MDD_settle_account", that.cookie_settle_account); //标识是否是点击立即购买后，登录跳转回单品页
                    window.setStorage('MDD_temp_item_id', that.cookie_item_id); //历史商品ID
                    window.setStorage('MDD_temp_gift_id', that.cookie_gift_id); //历史赠品ID
                    window.setStorage('MDD_buy_number', that.cookie_buy_number); //历史购买数量
                    that.cookie_auto_callback = 1;
                    window.setStorage("MDD_auto_callback", that.cookie_auto_callback);
                    window.location.href = result.login_url;
                } else {
                    $.isFunction(failCallback) && failCallback();
                    pop.popup({type:"pop", text: result.errorMsg});
                }
            });
        },
        addRemindInit : function(){
            var that = this;
            $('.shopping_cart').on('click','.J_add_remind', function(){
                $(".loading").css('display','block');
                    that.addWishList(that.pid,function(){
                        $('.J_add_remind').html('已设置到货提醒').removeClass('J_add_remind').addClass('J_remove_remind');
                        pop.popup({type:"pop", text: '商品到货后，您会收到消息提醒'});
                    });
            });
            $('.shopping_cart').on('click','.J_remove_remind', function(){
                $(".loading").css('display','block');
                that.deleteWishList(that.pid,function(){
                    $('.J_remove_remind').html('到货提醒').removeClass('J_remove_remind').addClass('J_add_remind');
                });
            });

        },
        addToCartInit : function(){
            var that = this;
            $('.shopping_cart').on('click','.add', function(){
                that.addToCart(function(){
                    pop.popup({type:"pop", text: '加入购物车成功'});
                });
            })
        },
        addToCart : function(completeCallback, failCallback){
            // 加购物车之前做分色分码选择校验
            if(!this.colorSizeCheck()){
                return;
            }
            var that = this;
            this.cookie_buy_number = $('#buy_num').val();
            this.cookie_gift_id = this.getGiftId();
            var product_ids = '';
            // 如果存在item_id则使用 否则使用pid
            if(this.cookie_item_id != 0){
                product_ids = this.cookie_item_id + '.' + this.cookie_buy_number
            } else {
                product_ids = this.pid + '.' + this.cookie_buy_number
            }
            // 如果存在一个赠品 或一个换购品时 只传giftId 不要数量
            if(this.cookie_gift_id != 0){
                product_ids += '-' + this.cookie_gift_id;
            }
            $.mdd_getJSON('h5ajax.php',{action : 'cart_append_products',product_ids: product_ids},function(result){
                if(result.errorCode == 0){
                    // 成功后更新购物车数量
                    that.queryCartNumInit();
                    $.isFunction(completeCallback) && completeCallback();
                } else {
                    pop.popup({type:"pop", text:result.errorMsg});
                    $.isFunction(failCallback) && failCallback();
                }
            });
        },
        queryCartNumInit : function(){
            if($('.shopping_cart .cart').length){
                $.mdd_getJSON('h5ajax.php',{action : 'cart_product_total'},function(result){
                    if(result.errorCode == 0){
                        if(result.product_total > 0){
                            // 购物车数量大于99 显示99+
                            result.product_total > 99 && (result.product_total = '99+');
                            $('.shopping_cart .cart i').html(result.product_total).show();
                        }
                    }
                });
            }
        }
    }
    $(document).ready(function(){
        FastClick.attach(document.body);
        mdd_product.init();
        window.onload = function(){
            // onlaod图片完全时
            // 顶部轮播初始化
            mdd_product.productSliderInit();
        }
    })
})(Zepto);
