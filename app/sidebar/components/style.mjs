const requreStylesheet = (path) => {
	const absolute = browser.runtime.getURL(path)
	let exists = false
	for (const sheet of document.styleSheets) {
		if (sheet.href == absolute) {
			exists = true
		}
	}
	
	if (!exists) {
		let link = document.createElement('link')
		link.setAttribute('rel', "stylesheet")
		link.setAttribute('href', absolute)
		document.head.appendChild(link)
	}
}

export { requreStylesheet }