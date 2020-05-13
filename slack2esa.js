
/**esa設定**/
const esa_access_token = "YOUR_ESA_ACCESS_TOKEN";
const esa_post_tag = [];//option
const team_name ="YOUR_ESA_TEAM_NAME";

/**slack設定**/
const slack_token = "YOUR_SLACK_APP_API_TOKEN";
const slack_channel = "YOUR_ESA_RESOPNSE_CHANNEL";

function doPost(e){
  let params = JSON.parse(e.postData.getDataAsString());
  let channel = params.event.item.channel;
  let ts = params.event.item.ts;
  let reaction = params.event.reaction;
  
  if(reaction == "esa"){
    let slackMessageData = getSlackMessage(channel,ts);
    let postMessage = slackMessageData.messages[0].text;
    let threadUrl = getThreadUrl(channel,ts);
    let userName = getSlackUserInfo(slackMessageData.messages[0].user).user.real_name;
    postMessage += "\n 投稿URL:" + threadUrl +"\n 投稿者:" + userName;  
    let esaRes = esaPost(postMessage);
    let msg = unescape(esaRes.name) + "\n" + esaRes.url + "\n 投稿URL" + threadUrl;
    postSlackMessage(msg);
  }

  return ContentService.createTextOutput(params.challenge);
}
function esaPost(postMessage) {
  // アクセス先
  const headers = {
      'Authorization': 'Bearer ' + esa_access_token,
  };
    
  // POSTデータ
  let payload = {
    name: 'slack/' + postMessage.substr(0,5),
    body_md : postMessage,
    tags : esa_post_tag,
    wip : true
  }
  // POSTオプション
  let options = {
    method : "POST",
    headers: headers,
    muteHttpExceptions: true,
    contentType: 'application/json; charset=utf-8',
    payload : JSON.stringify(payload) || {}
  }
  // アクセス先
  const post_url = "https://api.esa.io/v1/teams/"+ team_name +"/posts";
  // POSTリクエスト
  const response = UrlFetchApp.fetch(post_url, options);
  return JSON.parse(response);
}

function getSlackMessage(channel,ts){
  const baseUrl = 'https://slack.com/api/conversations.replies';
  const baseParameters = [
    'token=' + slack_token,
    'channel=' + channel,
    'ts=' + ts,
];
    let parameters = baseParameters.concat().join('&');
    let res =  UrlFetchApp.fetch(baseUrl + '?' + parameters, {
        method: 'GET',
        headers: { "Content-Type": 'application/json' }
    });
    res = JSON.parse(res);
    return res;
}

function postSlackMessage(message){
  const url = "https://slack.com/api/chat.postMessage";
  
  let payload = {
    "token" : slack_token,
    "channel" : slack_channel,
    "text" : message
  };
  
  let params = {
    "method" : "post",
    "payload" : payload
  };
  
  // Slackに投稿する
  UrlFetchApp.fetch(url, params);    
}
function getThreadUrl(channel,ts){
  let domain = getSlackTeamInfo().team.domain;
  let baseUrl = "https://" + domain + ".slack.com/archives/";
  let url_ts = "p" + ts.replace(".", "");
  let url = baseUrl + channel + "/" + url_ts;
  return url;
}
function getSlackTeamInfo(){
  const baseUrl = 'https://slack.com/api/team.info';
  const parameters = [
    'token=' + slack_token,
];
    let res =  UrlFetchApp.fetch(baseUrl + '?' + parameters, {
        method: 'GET',
        headers: { "Content-Type": 'application/json' }
    });
    res = JSON.parse(res);
    return res;
}
function getSlackUserInfo(user){
  const baseUrl = 'https://slack.com/api/users.info';
  const baseParameters = [
    'token=' + slack_token,
    'user=' + user
];
    let parameters = baseParameters.concat().join('&');
    let res =  UrlFetchApp.fetch(baseUrl + '?' + parameters, {
        method: 'GET',
        headers: { "Content-Type": 'application/json' }
    });
    res = JSON.parse(res);
    return res;
}