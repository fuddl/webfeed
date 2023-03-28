import colorThief from '../../node_modules/colorthief/dist/color-thief.mjs'
import { rgb } from '../../node_modules/wcag-contrast/dist/index.m.js'
import { colord } from '../../node_modules/colord/index.mjs'

const thief = new colorThief()
const getTextColorsFromImage = (image, callback) => {
  
    image.addEventListener('load', async () => {
      let bgOptions = await thief.getPalette(image)
      bgOptions
        .sort((a, b) => {
          const aLightness = Math.abs(colord(`rgb(${a.join(',')})`).toHsl().l - 50)
          const bLightness = Math.abs(colord(`rgb(${b.join(',')})`).toHsl().l - 50)
          const aSatuation = colord(`rgb(${a.join(',')})`).toHsl().s
          const bSatuation = colord(`rgb(${b.join(',')})`).toHsl().s
          return aSatuation + aLightness < bSatuation + bLightness ? -1 : 1
        })

      bgOptions.splice(bgOptions.length / 2)

      const fgOptions = [[0,0,0], [255,255,255], ...bgOptions]
      const combinations = []
      if (bgOptions) {
        for (let color of bgOptions) {
          for (let fcolor of fgOptions) {
            const bonus = fcolor.join('') === '255255255' ? 2 : 0
            combinations.push({
              background: color,
              color: fcolor,
              contrast: rgb(fcolor, color) + bonus,
            })
          }
        }
        callback(combinations.sort((a, b) => a.contrast - b.contrast).reverse()[0])
      }
  })
}


export { getTextColorsFromImage };
