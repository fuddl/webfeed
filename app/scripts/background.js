const tabTypes = {}

browser.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

browser.runtime.onMessage.addListener(async (data, sender) => {
  if (data.type == 'foundFeeds') {
    browser.pageAction.show(sender.tab.id)
    
    await browser.sidebarAction.setPanel({
        tabId: sender.tab.id,
        panel: browser.runtime.getURL('sidebar/feeds.html') + `?${JSON.stringify(data.feeds)}`,
    })      
    browser.pageAction.onClicked.addListener(async () => {
      await browser.sidebarAction.toggle()
    })
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
    if (['text/xml', 'application/xml;charset=utf-8'].find(type => contentType.toLowerCase().includes(type))) {
        tabTypes[tabId] = 'XML';
        contentHeader.value = contentType.replace(/(?:text|application)\/xml/, 'text/plain;charset=utf-8');
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