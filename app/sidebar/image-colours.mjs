import colorThief from '../../node_modules/colorthief/dist/color-thief.mjs'
import { rgb } from '../../node_modules/wcag-contrast/dist/index.m.js'

const thief = new colorThief()
const getTextColorsFromImage = (image, callback) => {
  
    image.addEventListener('load', async () => {
      const bgOptions = await thief.getPalette(image)
      const fgOptions = [[0,0,0], [255,255,255]]
      if (bgOptions) {
        let bestContrast = null
        for (let color of bgOptions) {
          for (let fcolor of fgOptions) {
            if (bestContrast) {
              bestContrast = {
                background: color,
                color: fcolor,
              }
            } else {
              if (rgb(fcolor, color) > bestContrast) {
                bestContrast = {
                  background: color,
                  color: fcolor,
                }
              }
            }
          }
        }
        callback(bestContrast)
    }
  })
}


export { getTextColorsFromImage };
