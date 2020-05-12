
/**esa設定**/
const esa_access_token = "YOUR_ESA_ACCESS_TOKEN";
const esa_post_tag = [];//option
const team_name ="YOUR_ESA_TEAM_NAME";

/**slack設定**/
const slack_token = "YOUR_SLACK_APP_API_TOKEN";
const slack_channel = "YOUR_ESA_RESOPNSE_CHANNEL";

/**
	doPost
	slack側でesaスタンプの後、GASでリクエスト受取
**/
function doPost(e){
  let params = JSON.parse(e.postData.getDataAsString());
  let channel = params.event.item.channel;
  let ts = params.event.item.ts;
  let reaction = params.event.reaction;

  if(reaction == "esa"){
    let postMessage = getSlackMessage(channel,ts);
    let esaRes = esaPost(postMessage);
    let msg = unescape(esaRes.name) + "\n" + esaRes.url;
    postSlackMessage(msg);
  }

  return ContentService.createTextOutput(params.challenge);
}

/**
	esaPost
	esaに投稿する
**/
function esaPost(postMessage) {
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

  const post_url = "https://api.esa.io/v1/teams/"+ team_name +"/posts";

  // POSTリクエスト
  const response = UrlFetchApp.fetch(post_url, options);
  return JSON.parse(response);
}

/**
	getSlackMessage
	slackに投稿されたテキストを取得
**/
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
    return res.messages[0].text;
}

/**
	postSlackMessage
	slackに投稿完了を通知
**/
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
  
  UrlFetchApp.fetch(url, params);
}