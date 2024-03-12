
const axios = require('axios')
const qs = require('./utils/qs')
const sendEmail = require('./utils/email') //需要邮件通知请配置CODE和EMAIL，自己发给自己，并且下面注释打开
const data = qs.data
const signdata = qs.signdata
const headers = qs.headers
const loginApi = qs.loginApi
let count = 0

// 签到并提交每日体温报告
login().then((data) => {
  console.log(data)
  sign(data)
 // studentReportInfo(token)
})

//登录
function login() {
  return new Promise((resolve, reject) => {
    axios.post(loginApi, data, { headers }).then((res) => {
      console.log(res)
      if (res && res.data && res.data.data) {
        resolve(res.data.data)
      } else {
        reject()
      }
    })
  })
}

//签到提交
function sign(data) {
  const signApi = qs.signApi(data)
  axios.post(signApi, signdata, { headers }).then((res) => {
    if (res && res.data) {
      console.log(res.data)
      if (res.data.code!=20000 && res.data.code==99999 && count <3){
        count++
        sign(data)
      }else if (res.data.code ==20000 ){
        console.log(res.data.code + ',' + res.data.message)
        wechatSend('习讯云签到提交', res.data.message)
      }else {
          wechatSend('习讯云签到失败', res.data.message)
      }
   
    }
  }).catch((error)=>{
     console.log(error)
    // wechatSend('习讯云签到提交失败', JSON.stringify(error))
    //   wechatSend('习讯云签到提交失败', '签到失败')
  })
}


//推送微信通知
function wechatSend(type, msg) {
  const params = {
    token: qs.token,
    title: type,
    content: msg
  }
  axios.get('http://www.pushplus.plus/send', { params }).then((res) => {
    console.log(res)
    if (res && res.data && res.data.code === 200) {
      console.log(type + ',发送微信推送成功')
    }
  })
}
