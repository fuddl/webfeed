import { header } from './components/header/header.mjs'

const generateHeader = (channel) => {
	return header({
		title: channel.querySelector('title')?.textContent,
		subtitle: channel.querySelector('description, subtitle')?.textContent,
		image: {
			url: channel.querySelector('image url')?.textContent,
		}
	})
}


export { generateHeader };
