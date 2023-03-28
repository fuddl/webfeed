import { header } from './components/header/header.mjs'

const generateHeader = (channel) => {
	return header({
		title: channel.querySelector(':scope > title')?.textContent,
		subtitle: channel.querySelector(':scope > description, :scope > subtitle')?.textContent,
		image: {
			url: channel.querySelector(':scope > image > url, :scope > icon')?.textContent,
		}
	})
}


export { generateHeader };
