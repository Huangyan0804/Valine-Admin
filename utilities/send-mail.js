'use strict';
const nodemailer = require('nodemailer');

let config = {
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
}

if (process.env.SMTP_SERVICE != null) {
    config.service = process.env.SMTP_SERVICE;
} else {
    config.host = process.env.SMTP_HOST;
    config.port = parseInt(process.env.SMTP_PORT);
    config.secure = process.env.SMTP_SECURE === "false" ? false : true;
}

const transporter = nodemailer.createTransport(config);

transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP邮箱配置异常：', error);
    }
    if (success) {
        console.log("SMTP邮箱配置正常！");
    }
});

exports.notice = (comment) => {
    let SITE_NAME = process.env.SITE_NAME;
    let NICK = comment.get('nick');
    let COMMENT = comment.get('comment');
    let POST_URL = process.env.SITE_URL + comment.get('url') + '#' + comment.get('objectId');
    let SITE_URL = process.env.SITE_URL;

    let _template = process.env.MAIL_TEMPLATE_ADMIN || '<div style="border-top:2px solid #12ADDB;box-shadow:0 1px 3px #AAAAAA;line-height:180%;padding:0 15px 12px;margin:50px auto;font-size:12px;"><h2 style="border-bottom:1px solid #DDD;font-size:14px;font-weight:normal;padding:13px 0 10px 8px;">        您在<a style="text-decoration:none;color: #12ADDB;" href="${SITE_URL}" target="_blank">${SITE_NAME}</a>上的文章有了新的评论</h2><p><strong>${NICK}</strong>回复说：</p><div style="background-color: #f5f5f5;padding: 10px 15px;margin:18px 0;word-wrap:break-word;">            ${COMMENT}</div><p>您可以点击<a style="text-decoration:none; color:#12addb" href="${POST_URL}" target="_blank">查看回复的完整內容</a><br></p></div></div>';
    let _subject = process.env.MAIL_SUBJECT_ADMIN || '${SITE_NAME}上有新评论了';
    let emailSubject = eval('`' + _subject + '`');
    let emailContent = eval('`' + _template + '`');

    let mailOptions = {
        from: '"' + process.env.SENDER_NAME + '" <' + process.env.SENDER_EMAIL + '>',
        to: process.env.BLOGGER_EMAIL || process.env.SENDER_EMAIL,
        subject: emailSubject,
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('博主通知邮件成功发送: %s', info.response);
        comment.set('isNotified', true);
        comment.save();
    });
}

exports.send = (currentComment, parentComment) => {
    let PARENT_NICK = parentComment.get('nick');
    let SITE_NAME = process.env.SITE_NAME;
    let NICK = currentComment.get('nick');
    let COMMENT = currentComment.get('comment');
    let PARENT_COMMENT = parentComment.get('comment');
    let POST_URL = process.env.SITE_URL + currentComment.get('url') + '#' + currentComment.get('objectId');
    let SITE_URL = process.env.SITE_URL;

    let _subject = process.env.MAIL_SUBJECT || '${PARENT_NICK}，您在『${SITE_NAME}』上的评论收到了回复';
    let _template = process.env.MAIL_TEMPLATE || '<div style="background: white;
    width: 100 %;
    max - width: 800px;
    margin: auto auto;
    border - radius: 5px;
    border:#1bc3fb 1px solid;
    overflow: hidden;
    -webkit - box - shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12);
    box - shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.18); ">
        < header style = "overflow: hidden;" >
            <center>
                <img style="width:100%;HEz-index: 666;"
                    src="https://cdn.jsdelivr.net/gh/HimitZH/CDN/images/HCODE.png">
      </center>
  </header>
            <div style="padding: 5px 20px;">
                <p style="position: relative;
      color: white;
      float: left;
      z-index: 999;
      background: #1bc3fb;
      padding: 5px 30px;
      margin: -25px auto 0 ;
      box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.30)">
                    Dear ${PARENT_NICK}
                </p>
                <br>
                    <center>
                        <h3>
                            来自 <span style="text-decoration: none;color: #FF779A; ">${NICK}</span> 的回复
          </h3>
                    </center>
                    <br>
                        &nbsp; &nbsp;
      <p>
                            您在 <a style="text-decoration: none;color: #1bc3fb " target="_blank" href="${POST_URL}"
                                rel="noopener">&nbsp;${SITE_NAME}</a>
          上曾发表的评论：
      </p>
                        <div
                            style="background: #fafafa repeating-linear-gradient(-45deg,#fff,#fff 1.125rem,transparent 1.125rem,transparent 2.25rem);box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);margin:20px 0px;padding:15px;border-radius:5px;font-size:14px;color:#555555;">
                            ${PARENT_COMMENT}</div>
      &nbsp; &nbsp;
      <p>
                            收到了来自 <span style="color: #FF779A;">${NICK}</span> 的回复：
      </p>
                        <div
                            style="background: #fafafa repeating-linear-gradient(-45deg,#fff,#fff 1.125rem,transparent 1.125rem,transparent 2.25rem);box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);margin:20px 0px;padding:15px;border-radius:5px;font-size:14px;color:#555555;">
                            ${COMMENT}</div>
                        <br>
                            <div style="text-align: center;">
                                <a style="text-transform: uppercase;
                    text-decoration: none;
                    font-size: 14px;
                    background: #FF779A;
                    color: #FFFFFF;
                    padding: 10px;
                    display: inline-block;
                    border-radius: 5px;
                    margin: 10px auto 0; " target="_blank" href="${POST_URL}" rel="noopener">Hcode｜传送门🚪</a>
                            </div>
                            <p style="font-size: 12px;text-align: center;color: #999;">
                                欢迎常来访问！<br>
                                    © 2020 <a style="text-decoration:none; color:#1bc3fb" href="${SITE_URL}" rel="noopener"
                                        target="_blank">
                                        ${SITE_NAME} </a>
      </p>
                                <p></p>
  </div>
</div>';
    let emailSubject = eval('`' + _subject + '`');
    let emailContent = eval('`' + _template + '`');

    let mailOptions = {
                            from: '"' + process.env.SENDER_NAME + '" <' + process.env.SENDER_EMAIL + '>', // sender address
        to: parentComment.get('mail'),
        subject: emailSubject,
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('AT通知邮件成功发送: %s', info.response);
        currentComment.set('isNotified', true);
        currentComment.save();
    });
};
