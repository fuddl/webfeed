const tabTypes = {}

browser.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

async function getFavIconUrl(tabId) {
  const MAX_POLL_COUNT = 10;
  let pollCount = 0;

  while (true) {
    const tab = await new Promise((resolve) => {
      chrome.tabs.get(tabId, resolve);
    });

    if (tab.favIconUrl || pollCount >= MAX_POLL_COUNT) {
      return tab.favIconUrl;
    }

    pollCount++;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

browser.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
  if (data.type == 'foundFeeds') {
    browser.pageAction.show(sender.tab.id)
    
    await browser.pageAction.setPopup({
        tabId: sender.tab.id,
        popup: browser.runtime.getURL('pages/popup.html') + `?${encodeURIComponent(JSON.stringify(data.feeds))}`,
    })      
    // browser.pageAction.onClicked.addListener(async () => {
    //   await browser.sidebarAction.toggle()
    // })
  }
  if (data.type == 'getFavicon') {
    sendResponse()
    const faviconUrl = await getFavIconUrl(sender.tab.id)
    await browser.tabs.sendMessage(sender.tab.id, {
        type: 'foundFavicon',
        payload: { url: faviconUrl },
    });
  }
})

function detectXml({
    responseHeaders,
    tabId,
    url: rawUrl
}) {
    if (!responseHeaders) {
        delete tabTypes[tabId];
        return {};
    }

    const contentHeader = responseHeaders.find(({
        name
    }) => name.toLowerCase() === 'content-type');
    const contentType = (contentHeader && contentHeader.value) || '';
    if (['application/atom+xml', 'application/rss+xml', 'application/xml', 'text/xml'].find(type => contentType.toLowerCase().includes(type))) {
        
        tabTypes[tabId] = 'XML';
        contentHeader.value = contentType.replace(/(?:text|application)\/(?:rss|atom)?\+?xml/, 'text/plain;charset=utf-8');
        return {
            responseHeaders
        };
    }

    const url = new URL(rawUrl);
    if (url.pathname.toLowerCase().endsWith('.xml')) {
        tabTypes[tabId] = contentType;
        if (contentHeader) {
            contentHeader.value = 'text/plain';
        } else {
            responseHeaders.push(CONTENT_TYPE_TEXT);
        }
        return {
            responseHeaders
        };
    }
    return {};
}

browser.webRequest.onHeadersReceived.addListener(
    detectXml, {
        urls: ['*://*/*'],
        types: ['main_frame']
    }, ['blocking', 'responseHeaders'],
);

chrome.runtime.onMessage.addListener((_message, sender, sendResponse) => {
    const {
        url,
        tab: {
            id: tabId
        }
    } = sender;
    const contentType = tabTypes[tabId];
    if (!contentType) {
        sendResponse(url.toLowerCase().endsWith('.xml') && 'XML');
        return;
    }

    delete tabTypes[tabId];
    sendResponse(contentType);
});

