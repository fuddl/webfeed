const heading = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
const lists = ['UL', 'OL', 'LI', 'DT', 'DD', 'DL']
const block = ['P', 'BLOCKQUOTE', 'FIGURE', 'FIGCAPTION', ...heading, ...lists]
const table = ['TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'COLGROUP', 'COL', 'CAPTION']
const inline = ['A', 'STRONG', 'EM', 'INS', 'DEL', 'SUP', 'SUB', 'CODE', 'PICTURE', 'SOURCE', 'CITE', 'Q', 'IFRAME']
const selfClosing = ['IMG', 'BR', 'HR']
const html = [...block, ...inline, ...selfClosing, ...table]

const attributes = {
	A: {
		href: (value) => {
			return !value.startsWith('javascript:') ? value : false
		}
	},
	TD: {
		colspan: () => true,
		rowspan: () => true,
	},
	TH: {
		colspan: () => true,
		rowspan: () => true,
	},
	IMG: {
		srcSet: () => true,
		src: () => true,
		alt: () => true,
	},
	SOURCE: {
		src: () => true,
		srcSet: () => true,
		type: () => true,
	},
	IFRAME: {
		src: () => true,
		height: () => true,
		width: () => true,
	},
}

const textFilter = [
	{
		test: /^(?:https?:\/\/)?(?:[\w]+\.)(?:\.?[\w]{2,})+[^\s]+$/,
		parentClass: 'url',
		replace: (input) => {
			console.debug(input)
			return input
				.replace(/^https?:\/\/(?:www\.)?/, '')
				.replace(/\/$/, '')
		}
	}
]

const cleanUpSteps = [
	// scale inline image
	(dom) => {
		const images = dom.querySelectorAll('img')
		for (const image of images) {
			const closestBlock = image.closest([...block, ...table, 'body'].join(', '))
			if (closestBlock) {
				const containsNonWhitespaceTextNodes = Array.from(closestBlock.childNodes).some(node => {
			    	return node.nodeType === Node.TEXT_NODE && !/^\s+$/.test(node.textContent);
			 	});
				if (containsNonWhitespaceTextNodes) {
					image.classList.add('inline-image')
				}
			}
		}
		return dom
	},
	// remove empty paragraphs
	(dom) => {
		const paragraphs = dom.querySelectorAll('p')
		for (const p of paragraphs) {
			const isEmtpy = /^\s+$/.test(p.innerText) && p.childNodes.length == 1
			if (isEmtpy) {
				p.parentNode.removeChild(p)
			}
		}
		return dom
	},
	// sanitise iframes
	(dom) => {
		const iframes = dom.querySelectorAll('iframe')
		for (const frame of iframes) {
			const dimensions = {
				height: frame.getAttribute('height'),
				width: frame.getAttribute('width'),
			}
			if (dimensions.height && dimensions.width) {
				dimensions.ratio = dimensions.height / dimensions.width
				frame.removeAttribute('height')
				frame.removeAttribute('width')
				frame.style.setProperty("--ratio", `1/${dimensions.ratio}`)
			}
			frame.setAttribute('loading', 'lazy')
			frame.setAttribute('hidden', 'hidden')
			const placeHolder = document.createElement('a')
			placeHolder.classList.add('iframe-placeholder')
			placeHolder.style.setProperty("--ratio", `1/${dimensions.ratio}`)
			placeHolder.setAttribute('href', frame.getAttribute('src'))
			frame.parentNode.insertBefore(placeHolder, frame)
			placeHolder.innerText = frame.getAttribute('src')
			placeHolder.addEventListener('click', (e) => {
				e.preventDefault()
				placeHolder.parentNode.removeChild(placeHolder)
				frame.removeAttribute('hidden')
			})

		}
		return dom
	},
	// shorten urls
	(dom) => {
		const links = dom.querySelectorAll('a')
		for (const a of links) {
			if (/^(?:https?:\/\/)?(?:[\w]+\.)(?:\.?[\w]{2,})+[^\s]+$/.test(a.innerText)) {
				a.innerText = a.innerText
					.replace(/^https?:\/\//, '')
					.replace(/^www\./, '')
					.replace(/\/$/, '')
				a.classList.add('url')
			}
		}
		return dom
	},
	// doubble <br> to p
	(dom) => {
		const multiBreaks = dom.querySelectorAll('br + br + br')
		for (const multiBreak of multiBreaks) {
			if (!multiBreak?.parentNode?.childNodes) {
				continue
			}
			let pastBrs = 0
			for (const sibling of multiBreak.parentNode.childNodes) {
				pastBrs = sibling?.nodeName === "BR" ?
					pastBrs + 1 :
					sibling?.nodeName === '#text' && sibling?.nodeValue?.match(/^\s+$/) ? 
						pastBrs :
						0
				if (pastBrs > 2) {
					sibling?.parentNode.removeChild(sibling)
				}
			}
		}

		return dom
	}
]

function cleanUpHtml(dom) {
	for (const step of cleanUpSteps) {
		dom = step(dom)
	}
	return dom
}

/*
	for (let filter of textFilter) {
		if (filter.test.test(content)) {
			content = filter.replace(content)
		}
	}
*/

const makeRichText = (text) => {
	let richText
	if (typeof text == 'string') {
		richText = new window.DOMParser().parseFromString(text, "text/html").body.childNodes
	} else {
		richText = text
	}

	const output = new DocumentFragment
	for (const node of richText) {
		if (node.nodeName === "#text") {
			//console.debug(node)
			output.appendChild(document.createTextNode(node.nodeValue))
			continue
		}
		if (!html.includes(node.nodeName)) {
			let fragment = new DocumentFragment
			fragment.appendChild(makeRichText(node.childNodes))
			output.appendChild(fragment)
			continue
		}
		if (html.includes(node.nodeName)) {
			const thing = document.createElement(node.nodeName)
			for (const attr of node.attributes) {
				const tester = attributes?.[node.nodeName]?.[attr.name]
				if (typeof tester === 'function' && tester(attr.nodeValue)) {
					thing.setAttribute(attr.name, attr.nodeValue)
				}
			}
			thing.appendChild(makeRichText(node.childNodes))
			output.appendChild(thing)
		}
	}
	return cleanUpHtml(output)
}

const nl2p = (plainText) => {
	const output = new DocumentFragment
	plainText
		.split("\n")
		.map((line) => {
			const newParagraph = document.createElement("p")
			newParagraph.innerText = line
			output.appendChild(newParagraph)
		})
	return output
}

export { makeRichText, nl2p }