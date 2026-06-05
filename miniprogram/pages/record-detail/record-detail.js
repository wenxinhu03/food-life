const store = require('../../utils/food-store')

Page({
  data: {
    id: '',
    record: null,
  },
  onLoad(query) {
    this.setData({ id: query.id || '' })
    this.loadRecord(query.id || '')
  },
  onShow() {
    if (this.data.id) this.loadRecord(this.data.id)
  },
  loadRecord(id) {
    const record = store.getRecordById(id)
    if (!record) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }
    this.setData({
      record: Object.assign({}, record, {
        mealLabel: store.getMealLabel(record.mealType),
        starText: store.getStarText(record.rating),
        coverText: record.foodName.slice(0, 1) || '食',
      }),
    })
  },
  editRecord() {
    wx.navigateTo({ url: `/pages/record-edit/record-edit?id=${this.data.id}` })
  },
  previewImage() {
    const record = this.data.record || {}
    const images = record.originalImages && record.originalImages.length ? record.originalImages : record.images || []
    if (!images.length) return
    wx.previewImage({
      current: images[0],
      urls: images,
    })
  },
  deleteRecord() {
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条食物记录吗？',
      confirmText: '删除',
      confirmColor: '#FF6B57',
      success: (result) => {
        if (!result.confirm) return
        store.deleteRecord(this.data.id)
        wx.showToast({ title: '已删除', icon: 'success' })
        wx.navigateBack()
      },
    })
  },
})
