/**
 * 输入框搜索模块 change by weihanqing
 * @param operator 搜索输入框可以为search类型，
 * @param ajaxUrl 发送请求的地址
 * @param wrapEl 结果列表样式
 * @param formEl 表单元素id
 * @param defaultVal 搜索默认值
 * @param hasFocus 是否注册onfocus事件
 * @return
 */
var Suggest = function(options){
    that = this;
    that.opt = options||{};
    that.operator = that.opt.operator || ".keyword";
    that.ajaxUrl = that.opt.ajaxUrl || "h5ajax.php";
    that.wrapEl = that.opt.wrapEl || ".suggest";
    that.formEl = that.opt.formEl || "#search_form";
    that.defaultVal=that.opt.defaultVal || "";
    that.initInput()
};
Suggest.prototype={
    initInput:function(){
       var aa=document.getElementById('keyword'); 
        aa.autocomplete="off",aa.addEventListener("input",function(){
            var b=aa.value.replace(/(^\s+)|(\s+$)/g,"");
            that.ajax(b)
        })
    },
    ajax:function(a){
        var b = a;
        if(b.replace(/(^\s*)|(\s*$)/g, "") == "") 
        {
            that.getElemByClassName('.search_list')[0].innerHTML="";
            that.getElemByClassName('.search_list')[0].style.display='none';
            return;
        }
        var sid=document.getElementsByName('sid')[0].value;
        myurl= that.ajaxUrl+"?key="+a+"&action=suggest&sid=" + sid+ "&fun_type=2&callback=that.updateList";
        that.invokeServer(myurl);
    },
    updateList:function(a){
        var b=[];
        that.getElemByClassName('.search_list')[0].innerHTML="";
        that.getElemByClassName('.search_list')[0].style.display='block';

        if(0==a.errorCode){
            a=a.word;
            for(var c=0;c<a.length;c++)b.push("<li><a><span class='value'>"+a[c].key+"</span><span class='num'>约"+a[c].count+"个结果</span></a></li>");
            var ul = "<ul>"+b.join("")+"</ul>"+"<div class='clear_search'>[关闭]</div>";
            that.getElemByClassName('.search_list')[0].innerHTML=ul;
            that.effect()
        }else{
            that.getElemByClassName('.search_list')[0].innerHTML="";
            that.getElemByClassName('.search_list')[0].style.display='none';
        }
    },
    effect:function(){
        var search_list=that.getElemByClassName('.search_list')[0].firstChild.children;
        for(i=0;i<search_list['length'];i++){
            (function(){
                var p = i
                search_list[i].onclick = function() {
                    var search_content=search_list[p].firstChild.children[0].innerHTML;   
                    that.changeVal(search_content);
                }
            })();
        }
        var clear_search=that.getElemByClassName('.clear_search')[0];  
        clear_search.onclick = function() {
            that.getElemByClassName('.search_list')[0].innerHTML="";
            that.getElemByClassName('.search_list')[0].style.display='none';
        }
    },
    changeVal:function(a){
        document.getElementById('keyword').value=a;
        that.getElemByClassName('.search_list')[0].innerHTML="";
        that.getElemByClassName('.search_list')[0].style.display='none';
        document.getElementById('index_search_form').submit();
    },
    invokeServer:function(url){
        var scriptOld=document.getElementById('temp_script');
        if(scriptOld!=null && document.all)
        {
            scriptOld.src = url;
            return;
        }
        var head=document.documentElement.firstChild,script=document.createElement('script');
        script.id='temp_script';
        script.type = 'text/javascript';
        script.src = url;
        if(scriptOld!=null)
            head.replaceChild(script,scriptOld);
        else
            head.appendChild(script);
    },
    getElemByClassName:function(em){
        var cls = (em).match(/\.\S*/);
        var chd = (em).match(/\s\S[\S]*/ig);
        var len = chd ? chd.length : 0;
        var clsEm = null;
        if (cls.length > 0) {
            clsEm = document.querySelectorAll(cls[0]);
        }
        if (clsEm && clsEm.length > 0) {
            if (chd && len > 0) {
                return clsEm[0].getElementsByTagName(chd[0].replace(/^\s+/, "").replace(/\s+$/, ""));
            }
            else {
                return clsEm;
            }
        }
    }
};