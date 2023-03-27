import { requreStylesheet } from './../style.mjs'

const idealAspectRatio = 3

function observeImage(image, callback) {
	let poll = setInterval(function () {
		if (typeof image?.naturalWidth == 'number' && image.naturalWidth > 0) {
			clearInterval(poll);
			callback(image)
		}
	}, 10);
}

const gallery = (vars) => {
	requreStylesheet('sidebar/components/gallery/gallery.css')
	const wrapper = document.createElement('div')
	wrapper.classList.add('gallery')



	const renderItems = (images) => {

		const rows = [{
			aspectRatio: 0,
			images: [],
		}]
		for (const i in images) {
			const lastrow = rows.length - 1
			if (rows[lastrow].images.length == 0 || images[i].aspectRatio && images[i].aspectRatio + rows[lastrow].aspectRatio < idealAspectRatio) {
				rows[lastrow].aspectRatio += images[i].aspectRatio
				rows[lastrow].images.push({
					index: i,
					aspectRatio: images[i].aspectRatio,
					width: images[i].naturalWidth,
					height: images[i].naturalHeight,
				})
			} else {
				rows.push({
					aspectRatio: images[i]?.aspectRatio ?? 0,
					images: [{
						index: i,
						aspectRatio: images[i].aspectRatio,
						width: images[i].naturalWidth,
						height: images[i].naturalHeight,
					}],
				})				
			}
		}

		const gap = parseInt(getComputedStyle(wrapper)['margin-top'])
		const wrapperWidth = wrapper.scrollWidth

		for (const i in rows) {
			//console.debug(rows[i].images)
			rows[i].leastHeight = rows[i].images.reduce((a, b) => {
				if (a == null) {
					return b.height
				} else {
					return Math.min(a, b.height)
				}
			}, null)
			for (ii in rows[i].images) {
				const vAspectRatio = rows[i].images[ii].height / rows[i].leastHeight
				rows[i].images[ii].height = rows[i].leastHeight
				rows[i].images[ii].width = rows[i].images[ii].width / vAspectRatio
			}
			rows[i].combinedWidth = rows[i].images.reduce((a, b) => a + b.width, 0)
			const desiredCombinedWidth = wrapperWidth -  (gap * (rows[i].images.length - 1))
			rows[i].rowRatio = desiredCombinedWidth /  rows[i].combinedWidth
			for (ii in rows[i].images) {
				rows[i].images[ii].height *= rows[i].rowRatio
				rows[i].images[ii].width *= rows[i].rowRatio
			}
		}

		wrapper.textContent = ''
		const output = new DocumentFragment
		for (const ii in rows) {
			const rowElement = document.createElement('div')
			output.appendChild(rowElement)
			for (const i of rows[ii].images) {
				const image = document.createElement('img')
				if (images[i.index]?.loaded == true) {
					image.setAttribute('loading', 'lazy')
				}
				image.setAttribute('src', images[i.index].url)
				if (images[i.index]?.aspectRatio) {
					image.style.aspectRatio = `1/${images[i.index].aspectRatio}`
				}
				if (i.height) {
					image.height = i.height
				}
				if (i.width) {
					image.width = i.width
				}
				rowElement.appendChild(image)
				if (!images[i.index]?.loaded) {
					observeImage(image, (element) => {
						images[i.index].loaded = true
						images[i.index].naturalWidth = element?.naturalWidth
						images[i.index].naturalHeight = element?.naturalHeight
						images[i.index].aspectRatio = images[i.index].naturalWidth / images[i.index].naturalHeight
						renderItems(images)
					})
				}

			}
		}
		wrapper.appendChild(output)
	}

	renderItems(vars.images)

	return wrapper
}

export { gallery }