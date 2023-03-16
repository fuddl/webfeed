const heading = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
const block = ['P', 'BLOCKQUOTE', 'FIGURE', ...heading]
const table = ['TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'COLGROUP', 'COL']
const inline = ['A', 'STRONG', 'EM', 'INS', 'DEL', 'SUP', 'SUB', 'CODE', 'PICTURE', 'SOURCE']
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
	}
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
	return output
}

export { makeRichText }