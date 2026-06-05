const store = require('../../utils/food-store')

Page({
  data: {
    isEdit: false,
    record: store.createEmptyRecord(store.getToday()),
    selectedMealLabel: '午餐',
    mealOptions: store.mealOptions,
    ratingOptions: [],
    selectableTags: [],
  },
  onLoad(query) {
    const id = query.id || ''
    const date = query.date || store.getToday()
    const existing = id ? store.getRecordById(id) : null
    const record = existing || store.createEmptyRecord(date)
    this.setData({ isEdit: Boolean(existing), record })
    this.refreshControls(record)
  },
  refreshControls(record) {
    this.setData({
      selectedMealLabel: store.getMealLabel(record.mealType),
      ratingOptions: [1, 2, 3, 4, 5].map((value) => ({ value, active: value <= record.rating })),
      selectableTags: store.tagOptions.map((label) => ({ label, active: record.tags.includes(label) })),
    })
  },
  onFoodNameInput(event) {
    this.setData({ 'record.foodName': event.detail.value })
  },
  onDateChange(event) {
    this.setData({ 'record.date': String(event.detail.value) })
  },
  selectMeal(event) {
    const record = Object.assign({}, this.data.record, { mealType: event.currentTarget.dataset.meal })
    this.setData({ record })
    this.refreshControls(record)
  },
  selectRating(event) {
    const record = Object.assign({}, this.data.record, { rating: Number(event.currentTarget.dataset.rating) })
    this.setData({ record })
    this.refreshControls(record)
  },
  toggleTag(event) {
    const tag = event.currentTarget.dataset.tag
    const tags = this.data.record.tags.includes(tag)
      ? this.data.record.tags.filter((item) => item !== tag)
      : this.data.record.tags.concat(tag)
    const record = Object.assign({}, this.data.record, { tags })
    this.setData({ record })
    this.refreshControls(record)
  },
  onCommentInput(event) {
    this.setData({ 'record.comment': event.detail.value })
  },
  onLocationInput(event) {
    this.setData({ 'record.location': event.detail.value })
  },
  onPriceInput(event) {
    this.setData({ 'record.price': event.detail.value })
  },
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const firstFile = result.tempFiles[0]
        if (firstFile) this.setData({ 'record.images': [firstFile.tempFilePath] })
      },
    })
  },
  generateComment() {
    const record = this.data.record
    if (!record.foodName.trim()) {
      wx.showToast({ title: '先写食物名称', icon: 'none' })
      return
    }
    const tagText = record.tags.length ? `，关键词是${record.tags.join('、')}` : ''
    const mealLabel = store.getMealLabel(record.mealType)
    const comment = `这次${mealLabel}吃了${record.foodName}，整体给 ${record.rating} 分${tagText}。味道体验值得记录，下次可以根据今天的感受再决定是否复吃。`
    this.setData({ 'record.comment': comment, 'record.aiComment': comment })
  },
  save() {
    const record = Object.assign({}, this.data.record, {
      foodName: this.data.record.foodName.trim(),
      comment: this.data.record.comment.trim(),
      location: this.data.record.location.trim(),
      price: this.data.record.price.trim(),
    })
    if (!record.foodName) {
      wx.showToast({ title: '请填写食物名称', icon: 'none' })
      return
    }
    store.saveRecord(record)
    wx.showToast({ title: '记录好了', icon: 'success' })
    wx.navigateBack()
  },
})
