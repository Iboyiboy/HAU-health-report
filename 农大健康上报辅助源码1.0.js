/**********************************
 * Name:HAU health report help tool
 * Time:2021-02-09
 * Auther:MC
 **********************************/

auto.waitFor();
//auto.setMode("fast");
var height = device.height;
var width = device.width;
setScreenMetrics(width, height);
var GZH = "河南农业大学信息化办公室";
var path = "/storage/emulated/0/Android/上报.jpg";
var ReportTo = "17河农大电信一班（正经群）";//修改这里即修改像谁发1，请把此参数改为你要发1的人，用于自己检查自己是否已经上报，不建议去除此功能.
var intoGZHflag = false;//进入健康上报页面标志位，防止微信页面冲突。
var reportOverflag = false;//上报完成进行收尾flag
var sendflag = false;
var unknowPageCount = 0;
var appFlag = 0;

mainFunc();

function checkPage()
{
    var pageId = 0xFF;
    
    if(className("android.widget.TextView").text("微信").exists() & !className("android.widget.TextView").text("发现").exists()) 
    {
        pageId = 0x01;    //home键按下后第一屏
    }
    else if(text("微信").exists() & text("通讯录").exists() & text("发现").exists()) 
    {
        pageId = 0x02;
    }
    else if(sendflag == false &text("搜索指定内容").exists() & text("文章").exists() & text("公众号").exists())
    {
        pageId = 0x03;  //公众号搜索页
    }
    else if(sendflag == false & (text("最常使用").exists() || text("联系人").exists() || text("群聊").exists() || text("关注的公众号").exists()) & (desc("清除").exists())) 
    {
        pageId = 0x04;
    }
    else if (text("校园卡").exists() & desc("消息").exists() & desc("更多选项").exists()) 
    {
        pageId = 0x05;
    }
    else if ((intoGZHflag == true & reportOverflag == false & packageName("com.tencent.mm").desc("返回").exists() & !textContains("健康上报").exists() & !textContains("今日已经填报").exists()) || textContains("正在登录中").exists())
    {
        pageId = 0x06;//网络缓冲页面
    }
    else if(text("过渡余额").exists() & text("电子账户").exists() & text("健康上报").exists()) 
    {
        pageId = 0x07;
    }
    else if(text("操作提示").exists() & textContains("今日已经填报").exists())
    {
        pageId = 0x08;  //已经填报
    }
    else if((classNameContains("TextView").text("健康上报").exists()) & (text("体温").exists()) & (text("提交").exists()))
    {
        pageId = 0x09;
    }
    else if(textContains("微信不能确定你的位置").exists()||textContains("获取地理位置失败").exists()||textContains("没有获取到地址").exists()) 
    {
        pageId = 0x0A;
    }
    else if(textContains("上报健康状态成功").exists()) 
    {
        pageId = 0x0B;
    }
    else if(reportOverflag == false & packageName("com.tencent.mm").exists() & (!text("通讯录").exists() & !text("发现").exists()))
    {
        pageId = 0x0C;//当前处于微信app中，但是在未知页面。
    }
    else if(reportOverflag == true & sendflag == false & packageName("com.tencent.mm").exists() & desc("切换到按住说话").exists() & textContains(ReportTo).exists() & !text("发送").exists())
    {
        pageId = 0x0D;
    }
    else if(reportOverflag == true & sendflag == false & packageName("com.tencent.mm").exists() & text("发送").exists())
    {
        pageId = 0x0E;
    }
    else if(reportOverflag == true & sendflag == false & packageName("com.tencent.mm").exists() & text("发送").exists())
    {
        pageId = 0x0F;
    }
    else
    {
        pageId = 0xFE;
        
    }
    //toast(pageId.toString(16));
    return pageId;
}
function checkPageId(id)
{
    if (id != 0xFE)
    {
        unknowPageCount = 0;
    }
    if (reportOverflag == false)
    { 
        switch(id)
        {
            case 0xFE: unknowPage();break;
            case 0x01: intoWeiXin();break;
            case 0x02: initWX();break;
            case 0x03: putText(GZH);break;
            case 0x04: intoGZHorQN(GZH);break;
            case 0x05: intoXYK();break;
            case 0x06: netWait(9);break;
            case 0x07: selectJKSB();break;
            case 0x08: /*ScreenCopy();*/reportOverflag = true;checkPageId(checkPage());break;
            case 0x09: doReport();break;
            case 0x0B:click("确定");sleep(200);reportOverflag = true;checkPageId(checkPage());break;
            case 0x0A: location();break;
            case 0x0C: back();checkPageId(checkPage());break;
            default: Over();
        }
    }
    else
    {
        switch(id)
        {  
            case 0x04: changeText(); break;
            case 0x03: putText(ReportTo); break;
            case 0x02: home();Over();break;
            case 0x01: home();Over();break;
            case 0x0D: putText("1");checkPageId(checkPage());break;
            case 0x0E: text("发送").findOne(2000).click();sendflag = true;checkPageId(checkPage());break;
            default:back();sleep(100);checkPageId(checkPage());
        }
    }
}
function mainFunc()
{
  home();
  sleep(200);
  home();
  sleep(100);
  checkPageId(checkPage());
}
function putText(str)
{
    var et1 = classNameContains("EditText").findOnce();
    if(et1)
    {
        toast("输入中");
        et1.setText(str);
        sleep(1000);
        checkPageId(checkPage());
    }
    else
    {
        toast("未发现输入框");
        sleep(1000);
        back();
        checkPageId(checkPage());
    }

} 
function unknowPage()
{
    if(unknowPageCount<6)
    {
        unknowPageCount++;
        toast("检测到未知页面，停留第"+unknowPageCount+"秒");
        sleep(1000);
    }
    else if(unknowPageCount == 6)
    {
        
        toast("检测到未知页面，停留第"+unknowPageCount+"秒");
        back();
        sleep(1000);
        unknowPageCount++;
        checkPageId(checkPage());
    }
    else
    {
        
        toast("检测到未知页面，停留第"+unknowPageCount+"秒");
        unknowPageCount = 0;
        home();
        sleep(1000);
        checkPageId(checkPage());
    }
    checkPageId(checkPage());
}
/*
截屏程序，太耗时，已弃用，改为发1.
function ScreenCopy()
{
    threads.start(function ()
     {
        var beginBtn;
        if ((beginBtn = classNameContains("Button").textContains("立即开始").findOne(3000)) ||
         (beginBtn = classNameContains("Button").textContains("确定").findOne(3000))||
         (beginBtn = classNameContains("Button").textContains("是").findOne(3000)) )
        {
            beginBtn.click();
        }
    });
    if(!requestScreenCapture(false))
    {
        toast("截图失败");
        exit();
    }
    if ((!classNameContains("Button").textContains("立即开始").exists() &&
         (!classNameContains("Button").textContains("确定").exists())&&
         (!classNameContains("Button").textContains("是").exists())) ){
             sleep(2000);
        captureScreen(path);
        toast("截图成功");
        threads.shutDownAll();
    }
}
*/
function intoWeiXin()
{
    var button1 = desc("微信").findOnce();
    var button2 = text("微信").findOnce();
    if(button1 != null || button2 != null)
    {
        if(button1 != null)
        {
            var button = button1;
        }
        else if(button2 != null)
        {
            var button = button2;
        }
        else
        {
            toast("没有发现微信App");
            sleep(1000);
        }

        if((button.bounds().centerX()< 0) || (button.bounds().centerY()<0))
        {
            home();
        }
        else
        {
            click(button.bounds().centerX(),button.bounds().centerY());
            sleep(1000);
        }
       
    }
    else
    {
        toast("请把微信App放置到桌面第一页,按下音量+键停止程序");
    }
    appFlag++;
    //toast("寻找微信第"+appFlag+"次");
    if(appFlag >= 4 & appFlag<7)
    {
        home();
        
    }
    else if(appFlag >=7)
    {
        appFlag = 0;
        launch("com.tecent.mm");
        sleep(200);
    }
    else if(appFlag >=8)
    {
        sleep(500);
        appFlag = 0;
        toast("无法打开微信");
    }
    checkPageId(checkPage());
}
function initWX()
{
    var b = className("android.widget.TextView").text("通讯录").findOne(2000).bounds();
    click(b.centerX(),b.centerY());
    sleep(500);

    var c = desc("搜索").findOne(2000).bounds();
    click(c.centerX(),c.centerY());
    sleep(500);
    checkPageId(checkPage());
}
function intoGZHorQN(str)
{
    var button = className("android.widget.TextView").text(str).findOne().bounds();
    click(button.centerX(),button.centerY());
    sleep(1000);
    checkPageId(checkPage());
}
function intoXYK()
{
    var button = desc("消息").findOnce().bounds();
    click(width*0.5,button.centerY());
    intoGZHflag = true;
    checkPageId(checkPage());
}
function netWait(maxTime)
{
    var netWaitTime = 0;
    while(netWaitTime < maxTime)
    {
        if(!text("微信校园").exists() & !text("操作提示").exists() & !text("体温").exists())
        {
            netWaitTime++;
            toast("网络缓冲等待第"+netWaitTime+"秒");
            sleep(1000);
        }
        else
        {
            checkPageId(checkPage());
            break;
        }
        
    }
    netWaitTime = 0;
    back();
    sleep(1000);
    checkPageId(checkPage());
}
function selectJKSB()
{
    if(className("android.view.View").row(3).exists() && className("android.view.View").row(4).exists())
    {
        click("健康上报");
        sleep(150);
        checkPageId(checkPage());
    }
    else
    {
        checkPageId(checkPage());
    }
}
function doReport()
{
    toast("等待微信获取位置");
    sleep(2000);
    click("提交");
    sleep(100);
    checkPageId(checkPage());
}

function changeText()
{
    if(text(GZH).exists())
    {
        desc("清除").findOne(2000).click();
        sleep(200);
        checkPageId(checkPage());
    }
    else
    {
        intoGZHorQN(ReportTo);
    }
}

function location()
{
    if(textContains("微信不能确定你的位置").exists())
    {
        text("去设置").findOne(2000).click();
        checkPageId(checkPage());
    }
    else
    {
        text("确定").findOne(2000).click();
        checkPageId(checkPage());
    }
}
function Over()
  {
    toast("任务完成，准备退出 @Author:MC");
    home();
    engines.stopAllAndToast();
  }
