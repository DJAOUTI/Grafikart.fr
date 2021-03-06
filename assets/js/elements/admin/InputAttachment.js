/**
 * @property {number|null} timer
 * @property {choices} Choices
 * @property {string} endpoint
 */
import Alert from '../Alert'
import SpinningDots from '@grafikart/spinning-dots-element'
import FileManager from '@el/filemanager'

export default class InputAttachment extends HTMLInputElement {

  connectedCallback () {
    const preview = this.dataset.image
    this.insertAdjacentHTML('afterend', `
<div class="input-attachment">
<div class="input-attachment__preview" style="background-image:url(${preview})"></div>
</div>
`)
    this.style.display = 'none'
    this.container = this.parentElement.querySelector('.input-attachment')
    this.container.addEventListener('dragenter', this.onDragEnter.bind(this))
    this.container.addEventListener('dragleave', this.ondragleave.bind(this))
    this.container.addEventListener('dragover', this.onDragOver)
    this.container.addEventListener('drop', this.onDrop.bind(this))
    this.container.addEventListener('click', this.onClick.bind(this))
    this.preview = this.container.querySelector('.input-attachment__preview')
  }

  disconnectedCallback () {

  }

  onDragEnter (e) {
    e.preventDefault()
    this.container.classList.add('is-hovered')
  }

  ondragleave (e) {
    e.preventDefault()
    this.container.classList.remove('is-hovered')
  }

  onDragOver (e) {
    e.preventDefault()
  }

  async onDrop (e) {
    e.preventDefault()
    this.container.classList.add('is-hovered')
    const loader = new SpinningDots()
    loader.classList.add('input-attachment__loader')
    this.container.appendChild(loader)
    const files = e.dataTransfer.files
    if (files.length === 0) return false
    const data = new FormData()
    data.append('file', files[0])
    let url = '/admin/attachment'
    if (this.attachmentId !== '') {
      url = `${url}/${this.attachmentId}`
    }
    const response = await fetch(url, {
      method: 'POST',
      body: data
    })
    const responseData = await response.json()
    if (response.ok) {
      this.setAttachment(responseData)
    } else {
      const alert = new Alert({message: responseData.error})
      document.querySelector('.dashboard').appendChild(alert)
    }
    this.container.removeChild(loader)
    this.container.classList.remove('is-hovered')
  }

  onClick (e) {
    // TODO : Prévoir une modale
    e.preventDefault()
    const div = document.createElement('div')
    const fm = new FileManager()
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    fm.style.width = '300px'
    fm.style.height = '300px'
    div.appendChild(fm)
    fm.addEventListener('file', e => {
      this.setAttachment(e.detail)
      document.body.removeChild(div)
    })
    document.body.appendChild(div)
  }

  setAttachment (attachment) {
    this.preview.style.backgroundImage = `url(${attachment.url})`
    this.value = attachment.id
    let changeEvent = document.createEvent("HTMLEvents");
    changeEvent.initEvent("change", false, true);
    this.dispatchEvent(changeEvent)
    this.dispatchEvent(new CustomEvent('attachment', {detail: attachment}))
  }

  /**
   * @return {string}
   */
  get attachmentId () {
    return this.value
  }

}


global.customElements.define('input-attachment', InputAttachment, {extends: 'input'})
