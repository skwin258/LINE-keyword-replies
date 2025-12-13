// index.js
// 測試用 LINE 關鍵字 Bot（使用 Webhook）

const express = require('express');
const line = require('@line/bot-sdk');

// ✅ 保留你原本寫法：有環境變數就用環境變數，沒有就用你原本 Token（方便你現在直接跑）
// ⚠️ 上 GitHub 建議一定要改成只用環境變數，避免外流（下面流程我會教你在 Railway 設定）
const config = {
  channelAccessToken:
    process.env.LINE_CHANNEL_ACCESS_TOKEN ||
    'KDlE7SHqH1I9pSoQmKpOXEsMXHj/HGfmviGtdD8ILJeGKRuqgb1C9q+37zZh+rloRuY/rVaccT6URMNLjlqPWhCoIzKTCxdUbBeUEmT9rmrRtcAMrqA565pExnYVyu7nHAiYe+ajgnyIFbvEvk1fzQdB04t89/1O/w1cDnyilFU=',
  channelSecret:
    process.env.LINE_CHANNEL_SECRET || '02a29c9e521a04e802b4fbcd98b4da2a',
};

const client = new line.Client(config);
const app = express();

// Webhook 入口
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      // ✅ 印出 LINE 回傳的詳細錯誤（非常重要）
      console.error(
        'Error in webhook:',
        err?.originalError?.response?.data || err
      );
      res.status(500).end();
    });
});

// 處理每一個 event
async function handleEvent(event) {
  // 只處理文字訊息
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const text = (event.message.text || '').trim();

  // ✅ 1對1：抓暱稱 displayName
  let displayName = '朋友';
  try {
    const userId = event.source && event.source.userId;
    if (userId) {
      const profile = await client.getProfile(userId);
      displayName =
        profile && profile.displayName ? profile.displayName : '朋友';
    }
  } catch (e) {
    displayName = '朋友';
  }

  // ✅ 回覆（可能是單則 message，也可能是多則 messages 陣列）
  const replyMessage = getReplyByKeyword(text, displayName);

  if (!replyMessage) {
    return null; // ✅ 沒命中關鍵字：完全不回覆
  }

  return client.replyMessage(event.replyToken, replyMessage);
}

// 關鍵字對應邏輯
function getReplyByKeyword(text, displayName = '朋友') {
  switch (text) {
    // ================== 活動獎金（總入口） ==================
    case '申請活動獎金':
      return {
        type: 'text',
        text: `${displayName}您好\n\n請先提供您的「遊戲ID」及「真實姓名」以利查詢\n\n稍後將安排客服人員為您服務\n不便之處請多多見諒`,
      };

    // ✅ 活動獎金（子項目：由卡片按鈕點出來）
    case '活動獎金/介紹金':
      return {
        type: 'text',
        text: `${displayName}您好✅\n\n【介紹金】申請已收到\n請回覆：\n1）遊戲ID\n2）真實姓名\n\n我會盡快協助你完成申請`,
      };

    case '活動獎金/回歸金':
      return {
        type: 'text',
        text: `${displayName}您好✅\n\n【回歸金】申請已收到\n請回覆：\n1）遊戲ID\n2）真實姓名\n\n我會盡快協助你完成申請`,
      };

    case '活動獎金/百家連過金':
      return {
        type: 'text',
        text: `${displayName}您好✅\n\n【百家連過金】申請已收到\n請回覆：\n1）遊戲ID\n2）真實姓名\n\n我會盡快協助你完成申請`,
      };

    case '活動獎金/電子平轉金':
      return {
        type: 'text',
        text: `${displayName}您好✅\n\n【電子平轉金】申請已收到\n請回覆：\n1）遊戲ID\n2）真實姓名\n\n我會盡快協助你完成申請`,
      };

    case '活動獎金/電子爆分金':
      return {
        type: 'text',
        text: `${displayName}您好✅\n\n【電子爆分金】申請已收到\n請回覆：\n1）遊戲ID\n2）真實姓名\n\n我會盡快協助你完成申請`,
      };

    // ================== 代理 ==================
    case '我要成為代理':
      return {
        type: 'text',
        text: `${displayName}您好\n\n收到✅ 我已經看到你想加入代理了！\n\n我這邊先幫你登記，請你稍等一下～\n我會盡快回覆你，並把代理制度／申請方式一次說明清楚。`,
      };

    case '加入代理':
      return makeAgentIntroFlex();

    // ================== 折抵金 ==================
    case '折抵金使用規則':
      return makeDiscountDetailFlex();

    // ================== IG / Threads（直接跳連結，不送關鍵字） ==================
    case 'Instagram':
      return {
        type: 'template',
        altText: 'Instagram',
        template: {
          type: 'buttons',
          text: '點擊按鈕直接前往 Instagram',
          actions: [
            {
              type: 'uri',
              label: '前往 Instagram',
              uri: 'https://www.instagram.com/casino_2233/',
            },
          ],
        },
      };

    case 'Threads':
      return {
        type: 'template',
        altText: 'Threads',
        template: {
          type: 'buttons',
          text: '點擊按鈕直接前往 Threads',
          actions: [
            {
              type: 'uri',
              label: '前往 Threads',
              uri: 'https://www.threads.com/@casino_2233',
            },
          ],
        },
      };

    // ================== AI百家功能（你原本） ==================
    case '功能亮點':
      return buildFeatureHighlightsFlex();

    case '機器人權限說明':
    case '方案與權限':
      return {
        type: 'text',
        text: `🎫 會員權限說明
註冊完成後，你的帳號會先提供 1 天體驗權限，讓你先完整感受機器人的分析功能。

想把權限加長、甚至直接升到永久？方法很簡單：介紹好友註冊就能升級！

💰 推薦獎勵方案

介紹 1 位好友註冊：
✅ 送你 1000 現金＋再加 1 天權限

當月累積介紹滿 3 位好友註冊：
🔥 直接送 3000 現金＋永久權限`,
      };

    case '常見問題':
      return {
        type: 'text',
        text: `Q1：這是保證贏嗎？
A：不是。它是用「趨勢 + 風險管理」讓你少走冤枉路、提高穩定度。

Q2：新手可以用嗎？
A：可以，按鈕化流程 + 白話說明，新手照做就能上手。

Q3：連輸怎麼辦？
A：看到「高風險/亂跳」就先等，連輸時更要降低下注或暫停，別硬追。

Q4：要怎麼開始？
A：註冊完會員，就會贈送你1天權限喔。`,
      };

    case '運彩新手教學':
      return makeSportsBettingTutorialFlex();

    case '當月優惠':
      return makeBonusCardsCarouselFlex();

    case '申請帳號':
      return makeOpenAccountOfferFlex(displayName);

    // 使用教學（文字 + 影片）
    case '使用教學':
      return [
        {
          type: 'text',
          text: `1.選擇對應的系統。

2.選擇對應的桌別及房號。

3.照提示操作：機器人會告訴你

這把建議：莊 / 閒
推薦下注金額勝率
理由：趨勢、連段、風險點

下注提醒：該保守或該停手的時機

💡 小提醒：遇到連輸別硬追，照「觀望提示」先等兩把，命中率會更穩。`,
        },
        {
          type: 'video',
          originalContentUrl:
            'https://bc78999.com/wp-content/uploads/2025/12/11%E6%9C%887%E6%97%A5-2.mp4',
          previewImageUrl:
            'https://bc78999.com/wp-content/uploads/2025/12/photo_2025-12-13_16-50-50-169x300.jpg',
        },
      ];

    // AI機器人（文案 + 影片）
    case 'AI機器人':
      return [
        {
          type: 'text',
          text: `💥震撼登場💥
百家樂AI預測神器
「賭桌上 沒有運氣 只有數據」
📊AI即時分析牌路
📊提前預測莊閒走勢
⚡1秒出結果
⚡命中率高到讓人尖叫！

👉註冊會員即可免費使用`,
        },
        {
          type: 'video',
          originalContentUrl:
            'https://bc78999.com/wp-content/uploads/2025/12/11%E6%9C%887%E6%97%A5-2.mp4',
          previewImageUrl:
            'https://bc78999.com/wp-content/uploads/2025/12/photo_2025-12-13_16-50-50-169x300.jpg',
        },
      ];

    case 'AI百家機器人介紹':
      return makeAIBaccaratIntroFlex();

    case '娛樂城Q&A':
      return makeCasinoQAFlex();

    case '沒問題':
      return makeOpenAccountInfoFlex();

    // 客服（你已經用開版註冊資訊卡片按鈕跳連結了，這邊保留關鍵字備用）
    case '聯絡客服':
      return {
        type: 'template',
        altText: '聯絡客服',
        template: {
          type: 'buttons',
          text: '點擊按鈕直接聯絡客服',
          actions: [
            {
              type: 'uri',
              label: '聯絡客服',
              uri: 'https://line.me/ti/p/khyppSH9Yz',
            },
          ],
        },
      };

    default:
      return null;
  }
}

// ================== Flex：AI 百家機器人介紹 ==================
function makeAIBaccaratIntroFlex() {
  const BG = '#FFF5CC';
  const BTN_BG = '#C8A36A';

  return {
    type: 'flex',
    altText: 'AI百家機器人介紹',
    contents: {
      type: 'bubble',
      size: 'mega',
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '0px',
        backgroundColor: BG,
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            paddingAll: '0px',
            backgroundColor: BG,
            contents: [
              {
                type: 'image',
                url: 'https://bc78999.com/wp-content/uploads/2025/12/%E6%A9%9F%E5%99%A8%E4%BA%BA%E4%BB%8B%E7%B4%B9.png',
                size: 'full',
                aspectRatio: '1:1',
                aspectMode: 'cover',
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            paddingAll: '14px',
            backgroundColor: BG,
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                spacing: '12px',
                contents: [
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: { type: 'message', label: '功能亮點', text: '功能亮點' },
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: { type: 'message', label: '使用教學', text: '使用教學' },
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: '10px',
                spacing: '12px',
                contents: [
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: {
                      type: 'message',
                      label: '權限說明',
                      text: '機器人權限說明',
                    },
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: { type: 'message', label: '常見問題', text: '常見問題' },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };
}

// ================== Flex：折抵金使用規則 ==================
function makeDiscountDetailFlex() {
  const BG = '#c7ddea';
  const BTN_BG = '#0A2A70';

  return {
    type: 'flex',
    altText: '折抵金使用詳情',
    contents: {
      type: 'bubble',
      size: 'mega',
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '0px',
        backgroundColor: BG,
        contents: [
          {
            type: 'image',
            url: 'https://bc78999.com/wp-content/uploads/2025/12/%E9%96%8B%E7%89%88%E8%B3%87%E8%A8%8A%E8%A9%B3%E6%83%85%E4%BB%8B%E7%B4%B9.jpg',
            size: 'full',
            aspectRatio: '2:3',
            aspectMode: 'cover',
            backgroundColor: BG,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        backgroundColor: BG,
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'md',
            color: BTN_BG,
            action: { type: 'message', label: '沒問題', text: '沒問題' },
          },
        ],
      },
    },
  };
}

// ================== Flex：加入代理文案 ==================
function makeAgentIntroFlex() {
  const BG = '#FFF5CC';
  const BTN_BG = '#C8A36A';

  const title = '🔍 博弈代理怎麼賺？其實很簡單';

  const bodyText = `代理收入主要分 3 種獎金：

① 支數獎金
只要成功開一位會員
👉 每支 1000 現金
👉 無上限，開越多賺越多

② 成數獎金
依你「當月介紹人數」決定分潤％數
1–6 人：1%
7–11 人：2%
12–16 人：3%
17–21 人：4%
22–26 人：5%
👉 直接從線下會員「當月咬度」計算

③ 達標獎金
只要線下會員達到以下其中一項：
全館洗碼（含體育）30 萬
或體育洗碼 10 萬
👉 每達標一人 = 2000

💰 實際範例（一看就懂）
假設這個月你：
介紹 30 位會員
線下當月咬度 50 萬
達標會員 15 人

計算如下👇
支數：30 × 1000 = 30,000
成數：50 萬 × 5% = 25,000
達標：15 × 2000 = 30,000

👉 當月總薪資 = 85,000`;

  return {
    type: 'flex',
    altText: '代理制度介紹',
    contents: {
      type: 'bubble',
      size: 'giga',
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: BG,
        paddingAll: '22px',
        paddingTop: '24px',
        paddingBottom: '16px',
        contents: [
          {
            type: 'text',
            text: title,
            wrap: true,
            color: '#111111',
            size: 'xl',
            weight: 'bold',
          },
          {
            type: 'text',
            text: bodyText,
            wrap: true,
            color: '#111111',
            size: 'md',
            lineSpacing: '8px',
            margin: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: BG,
        paddingAll: '18px',
        paddingTop: '6px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'md',
            color: BTN_BG,
            action: { type: 'message', label: '我想加入', text: '我要成為代理' },
          },
        ],
      },
    },
  };
}

// ================== Flex：開版註冊資訊 ==================
function makeOpenAccountInfoFlex() {
  const BG = '#c3ddea';
  const BTN_BG = '#F4C430';

  return {
    type: 'flex',
    altText: '開版註冊資訊',
    contents: {
      type: 'bubble',
      size: 'mega',
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '0px',
        backgroundColor: BG,
        contents: [
          {
            type: 'image',
            url: 'https://bc78999.com/wp-content/uploads/2025/12/photo_2025-12-13_17-39-56.jpg',
            size: 'full',
            aspectRatio: '2:3',
            aspectMode: 'cover',
            backgroundColor: BG,
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: BG,
            paddingAll: '18px',
            contents: [
              {
                type: 'button',
                style: 'primary',
                height: 'md',
                color: BTN_BG,
                action: {
                  type: 'uri',
                  label: '聯絡客服',
                  uri: 'https://line.me/ti/p/khyppSH9Yz',
                },
              },
            ],
          },
        ],
      },
    },
  };
}

// ================== Flex：申請帳號長文 ==================
function makeOpenAccountOfferFlex(displayName = '朋友') {
  const BG = '#FFFFFF';
  const TEXT = '#111111';

  const BTN_PRIMARY_BG = '#0A2A70';
  const BTN_SECONDARY_BG = '#EDEFF5';

  const msg = `${displayName}您好💞

我這邊開版送30000折抵金 加入會員後 
我會將你加入會員群 
會員群每天都會分享賽事 
加入是不需付任何費用的❗

贈送的30000折抵金只要未使用完
可以一直做使用 直到用完為止
贏了一樣可以做提領
不需要像一般現金版一樣
需要洗碼量達標才能做提領

---------------------------------------

🏀信用娛樂城的規則🏀
【免先儲值】【玩多少算多少】
成為會員後帳號裡就會有最低額度5000元
可以進行下注 配合不錯可調整額度
先玩後付 一周對帳一次✔️

每週一跟您核對您的總輸贏
【贏】可以提領您贏的金額
【輸】可以使用折抵金折抵

⭕折抵金使用方式⭕
您這禮拜是輸的,送的折抵金可以做折抵
>贏的情況下可提領贏額 與折抵金無關<
只要開版成為會員就送30000折抵金
折抵金在結帳時可使用`;

  return {
    type: 'flex',
    altText: '開版送30000折抵金',
    contents: {
      type: 'bubble',
      size: 'giga',
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: BG,
        paddingAll: '22px',
        paddingTop: '26px',
        paddingBottom: '18px',
        contents: [
          {
            type: 'text',
            text: msg,
            size: 'md',
            color: TEXT,
            wrap: true,
            lineSpacing: '8px',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: BG,
        paddingAll: '22px',
        paddingTop: '6px',
        spacing: '12px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'md',
            color: BTN_PRIMARY_BG,
            action: { type: 'message', label: '沒問題', text: '沒問題' },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'md',
            color: BTN_SECONDARY_BG,
            action: { type: 'message', label: '折抵金使用規則', text: '折抵金使用規則' },
          },
          { type: 'box', layout: 'vertical', height: '8px', contents: [] },
        ],
      },
    },
  };
}

// ================== Flex：活動獎金 Carousel ==================
function makeBonusCardsCarouselFlex() {
  const BG = '#FFFFFF';
  const BTN_BG = '#0A2A70';

  const cards = [
    {
      img: 'https://bc78999.com/wp-content/uploads/2025/12/%E4%BB%8B%E7%B4%B9.jpg',
      keyword: '活動獎金/介紹金',
      label: '申請活動獎金',
    },
    {
      img: 'https://bc78999.com/wp-content/uploads/2025/12/%E5%9B%9E%E6%AD%B8.jpg',
      keyword: '活動獎金/回歸金',
      label: '申請活動獎金',
    },
    {
      img: 'https://bc78999.com/wp-content/uploads/2025/12/%E7%99%BE%E5%AE%B6%E9%80%A3%E9%81%8E.jpg',
      keyword: '活動獎金/百家連過金',
      label: '申請活動獎金',
    },
    {
      img: 'https://bc78999.com/wp-content/uploads/2025/12/%E9%9B%BB%E5%AD%90%E5%B9%B3%E8%BD%89.jpg',
      keyword: '活動獎金/電子平轉金',
      label: '申請活動獎金',
    },
    {
      img: 'https://bc78999.com/wp-content/uploads/2025/12/%E9%9B%BB%E5%AD%90%E7%88%86%E5%88%86.jpg',
      keyword: '活動獎金/電子爆分金',
      label: '申請活動獎金',
    },
  ];

  return {
    type: 'flex',
    altText: '活動獎金',
    contents: {
      type: 'carousel',
      contents: cards.map((c) => ({
        type: 'bubble',
        size: 'mega',
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '0px',
          backgroundColor: BG,
          contents: [
            {
              type: 'image',
              url: c.img,
              size: 'full',
              aspectRatio: '1:1',
              aspectMode: 'cover',
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '14px',
          backgroundColor: BG,
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'md',
              color: BTN_BG,
              action: {
                type: 'message',
                label: c.label,
                text: c.keyword,
              },
            },
          ],
        },
      })),
    },
  };
}

// ================== Flex：運彩新手教學 ==================
function makeSportsBettingTutorialFlex() {
  const BG = '#FFF5CC';
  const BTN_BG = '#C8A36A';

  return {
    type: 'flex',
    altText: '運彩新手教學',
    contents: {
      type: 'bubble',
      size: 'mega',
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '0px',
        backgroundColor: BG,
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            paddingAll: '0px',
            backgroundColor: BG,
            contents: [
              {
                type: 'image',
                url: 'https://bc78999.com/wp-content/uploads/2025/12/%E9%81%8B%E5%BD%A9%E6%95%99%E5%AD%B8.png',
                size: 'full',
                aspectRatio: '1:1',
                aspectMode: 'cover',
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            paddingAll: '14px',
            backgroundColor: BG,
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                spacing: '12px',
                contents: [
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: {
                      type: 'uri',
                      label: '讓分教學',
                      uri: 'https://bc78999.com/%e9%81%8b%e5%bd%a9%e8%ae%93%e5%88%86/',
                    },
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: {
                      type: 'uri',
                      label: '大小教學',
                      uri: 'https://bc78999.com/%e5%a4%a7%e5%b0%8f%e5%88%86-2/',
                    },
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: '10px',
                spacing: '12px',
                contents: [
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: {
                      type: 'uri',
                      label: '單雙玩法',
                      uri: 'https://bc78999.com/%e5%85%a8%e5%a0%b4%e5%96%ae%e9%9b%99/',
                    },
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: {
                      type: 'uri',
                      label: '走地玩法',
                      uri: 'https://bc78999.com/%e8%b5%b0%e5%9c%b0/',
                    },
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: '10px',
                spacing: '12px',
                contents: [
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: {
                      type: 'uri',
                      label: '中洞玩法',
                      uri: 'https://bc78999.com/%e4%b8%ad%e5%88%86%e6%b4%9e/',
                    },
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'sm',
                    color: BTN_BG,
                    action: {
                      type: 'uri',
                      label: '串關玩法',
                      uri: 'https://bc78999.com/%e9%81%8b%e5%bd%a9%e4%b8%b2%e9%97%9c/',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };
}

// ================== Flex：娛樂城 Q&A（標題 XL） ==================
function makeCasinoQAFlex() {
  const BG = '#FFF5CC';
  const TEXT = '#111111';
  const BTN_PRIMARY_BG = '#C8A36A';

  const title = '【娛樂城Q&A】';

  const msg = `Q：什麼是娛樂城？
A：
娛樂城是指一種線上運營的虛擬博弈平台，玩家無需前往實體賭場，只需透過電腦、手機或平板裝置，就能輕鬆參與各類博弈遊戲。

主要提供以下幾種遊戲類型： 
・電子遊戲機：包含老虎機（Slot）、電子撲克等，操作簡單、玩法多變。
・真人娛樂場：即時高清直播與真實荷官互動，如百家樂、輪盤、二十一點等。 
・體育博彩：足球、籃球、棒球等多項運動投注，邊看比賽邊下注更刺激。 
・彩票遊戲：賓果（Bingo）、Keno 等即時開獎玩法，簡單有趣。

Q：現金版與信用版有什麼差別？
A：
🔹 現金版：先儲值才能玩；有獲利可申請提領，但常見需綁多倍流水，且頻繁進出款可能遇銀行風控；市面亦有黑版不出金風險需慎選。 
🔹 信用版：依信用與財力提供額度，免先儲值即可遊戲；每週一統一結算輸贏，降低頻繁進出款問題，較能避免銀行風控，更穩定安全。
（例：我司基本最低開分 5,000 分） 

Q：我們平台提供哪些福利？ 
A： 
🎁 折抵金制度：成功開分成為會員後，贈送 30,000 元折抵金，可於每週一結帳時直接折抵輸贏金額。 
✅ 無需額外申請
✅ 結帳自動折抵
✅ 每位新會員限領一次

Q：為什麼我們平台需要審核？ 
A：
平台採用「信用制度」，為保障會員與平台雙方權益，需確認申請者具備一定信用與財力條件，才能開立遊戲額度，建立安全穩定環境。 

Q：申請審核需要提供哪些資料？ 
A：
📄 身分證明文件 
📱 社群帳號（LINE/FB/IG等） 
💼 財力證明（公司行號/職位名片/工作證等） 
📌 他站遊玩紀錄或帳戶介面截圖（擇一即可） 

Q：可以提升每週額度嗎？ 
A：
可申請提升，需在信任建立後提供相關證明
（如勞健保繳納記錄、資產/有價物品證明等）。 
✅ 會員資料嚴格保密不外洩。 

Q：若想提早結帳，可以提前歸還額度嗎？ 
A：
可以。提前結算並回補額度，有助提升信用分數，未來更有機會獲得更高額度與福利資格。`;

  return {
    type: 'flex',
    altText: '娛樂城Q&A',
    contents: {
      type: 'bubble',
      size: 'giga',
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: BG,
        paddingAll: '22px',
        paddingTop: '26px',
        paddingBottom: '18px',
        contents: [
          {
            type: 'text',
            text: title,
            size: 'xl',
            weight: 'bold',
            color: TEXT,
            wrap: true,
          },
          {
            type: 'text',
            text: msg,
            size: 'md',
            color: TEXT,
            wrap: true,
            lineSpacing: '8px',
            margin: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: BG,
        paddingAll: '22px',
        paddingTop: '6px',
        spacing: '12px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'md',
            color: BTN_PRIMARY_BG,
            action: { type: 'message', label: '申請帳號', text: '申請帳號' },
          },
          { type: 'box', layout: 'vertical', height: '8px', contents: [] },
        ],
      },
    },
  };
}

// ================== 功能亮點 Flex（你原本） ==================
function buildFeatureHighlightsFlex() {
  return {
    type: 'flex',
    altText: '功能亮點',
    contents: {
      type: 'bubble',
      size: 'giga',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '18px',
        backgroundColor: '#FFF5C8',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: '#FDEEA9',
            paddingAll: '6px',
            cornerRadius: '16px',
            contents: [
              {
                type: 'text',
                text: 'AI 百家系統',
                size: 'xs',
                color: '#6B473B',
                weight: 'bold',
              },
            ],
          },
          {
            type: 'text',
            text: '功能亮點',
            size: 'xl',
            weight: 'bold',
            color: '#6B473B',
            wrap: true,
          },
          {
            type: 'text',
            text: '即時給方向｜結果用數據驗證',
            size: 'sm',
            color: '#6B7280',
            wrap: true,
          },
          { type: 'separator', color: '#E6DDB8' },
          {
            type: 'text',
            wrap: true,
            size: 'sm',
            contents: [
              { type: 'span', text: '✅ ', color: '#111111' },
              { type: 'span', text: '即時報牌', color: '#6B473B', weight: 'bold' },
              {
                type: 'span',
                text: '：輸入珠盤路，秒回「莊/閒/和」建議，清楚告訴你現在該怎麼走。',
                color: '#111111',
              },
            ],
          },
          {
            type: 'text',
            wrap: true,
            size: 'sm',
            contents: [
              { type: 'span', text: '📈 ', color: '#111111' },
              { type: 'span', text: '機率＋風險提示', color: '#6B473B', weight: 'bold' },
              {
                type: 'span',
                text: '：把局勢分級（可出手/觀望/高風險），遇到波動變大會提醒你先等，降低追單風險。',
                color: '#111111',
              },
            ],
          },
          {
            type: 'text',
            wrap: true,
            size: 'sm',
            contents: [
              { type: 'span', text: '🧾 ', color: '#111111' },
              { type: 'span', text: '報表', color: '#6B473B', weight: 'bold' },
              {
                type: 'span',
                text: '：當局＋本日戰績自動彙總（總下注/輸贏/柱碼），用數據回頭驗證成績，越用越穩。',
                color: '#111111',
              },
            ],
          },
          { type: 'separator', color: '#E6DDB8' },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            backgroundColor: '#FDEEA9',
            paddingAll: '12px',
            cornerRadius: '14px',
            contents: [
              {
                type: 'text',
                text: '系統提醒',
                size: 'xs',
                color: '#6B473B',
                weight: 'bold',
              },
              {
                type: 'text',
                text: '重點不是“猜”，而是讓每一次出手都有條件、每一次停手都有理由。',
                size: 'sm',
                color: '#111111',
                wrap: true,
              },
            ],
          },
        ],
      },
    },
  };
}

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE bot webhook listening on port ${port}`);
});
