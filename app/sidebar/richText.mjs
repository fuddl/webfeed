import emojiRegex from '../../node_modules/emoji-regex/index.mjs'

const heading = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
const lists = ['UL', 'OL', 'LI', 'DT', 'DD', 'DL']
const block = ['P', 'BLOCKQUOTE', 'FIGURE', 'FIGCAPTION', ...heading, ...lists]
const table = ['TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'COLGROUP', 'COL', 'CAPTION']
const inline = ['A', 'STRONG', 'EM', 'INS', 'DEL', 'SUP', 'SUB', 'CODE', 'PICTURE', 'SOURCE', 'CITE', 'Q', 'IFRAME', 'I']
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
		srcset: () => true,
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
	// replace emoji images by emoji
	(dom) => {
		const images = dom.querySelectorAll('img[alt]')
		const emojiOnlyExpression = new RegExp(/^/.source + emojiRegex().source + /$/.source)
		for (const image of images) {
			if (image.getAttribute('alt').match(emojiOnlyExpression)) {
				let textRepresentation = document.createTextNode(image.getAttribute('alt'))
				image.parentNode.replaceChild(textRepresentation, image)
			}	
		}
		return dom
	},
	// scale inline image
	(dom) => {
		const images = dom.querySelectorAll('img')
		for (const image of images) {
			const parentElement = image.parentNode;
			const isInPicture = parentElement instanceof HTMLPictureElement || parentElement instanceof DocumentFragment
		 	const previousSiblingIsInline = image?.previousElementSibling?.nodeName ? inline.includes(image.previousElementSibling.nodeName) : false
		 	const nextSiblingIsInline = image?.nextElementSibling?.nodeName ? inline.includes(image.nextElementSibling.nodeName) : false
			const previousSiblingIsNonWhitespace = image?.previousSibling?.nodeType == 3 ? !/^\s+$/.test(image.previousSibling.textContent) : false
			const nextSiblingIsNonWhitespace = image?.nextSibling?.nodeType == 3 ? !/^\s+$/.test(image.nextSibling.textContent) : false

			if (!isInPicture && (previousSiblingIsNonWhitespace || previousSiblingIsInline || nextSiblingIsInline || nextSiblingIsNonWhitespace)) {
				image.classList.add('inline-image')
				image.parentNode.insertBefore(document.createTextNode(' '), image)
				image.parentNode.insertBefore(document.createTextNode(' '), image.nextSibling)
			}
		}
		return dom
	},
	// remove empty paragraphs (and other things that shouldn't be empty)
	(dom) => {
		const paragraphs = dom.querySelectorAll('p, ul, ol, dl')
		for (const p of paragraphs) {
			const isEmtpy = /^(\s+)?$/.test(p.innerText) && p.children.length == 0
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
	},
	// transform dumb tables
	(dom) => {
		const tables = dom.querySelectorAll('table')
		for (const table of tables) {
			if (
				table.querySelectorAll('tr').length === 1 &&
				table.querySelectorAll('td').length === 2 &&
				table.querySelectorAll('th').length === 0
			) {
				const cols = document.createElement('div')
				const cells = table.querySelectorAll('td')
				cols.classList.add('cols')
				for (const cell of cells) {
					const column = document.createElement('div')
					for (const node of cell.children) {
						column.appendChild(node)
					}
					cols.appendChild(column)
				}
				table.parentNode.replaceChild(cols, table)
			} else if (
				table.querySelectorAll('tr').length === table.querySelectorAll('tr > td, tr > th').length
			) {
				const cells = table.querySelectorAll('td, th')
				const rows = new DocumentFragment 
				for (const cell of cells) {
					const paragraph = document.createElement('p')
					for (const node of cell.children) {
						paragraph.appendChild(node)
					}
					rows.appendChild(paragraph)
				}
				table.parentNode.replaceChild(rows, table)
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