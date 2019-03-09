import '../css/_styles.scss'

import Icon from '../img/icon.png'

import {
  API_URL
} from './utils'

const IconImg = document.createElement('img')
IconImg.src = Icon
document.getElementById('container').appendChild(IconImg)

console.log(API_URL)