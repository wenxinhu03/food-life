const store = require('../../utils/food-store')

Page({
  data: {
    date: store.getToday(),
    displayDate: '',
    summary: null,
    isSaved: false,
  },
  onLoad(query) {
    this.loadSummary(query.date || store.getToday())
  },
  loadSummary(date) {
    const savedSummary = store.getSummaryByDate(date)
    this.setData({
      date,
      displayDate: store.formatDisplayDate(date),
      summary: savedSummary || store.buildLocalSummary(date, store.getRecordsByDate(date)),
      isSaved: Boolean(savedSummary),
    })
  },
  regenerate() {
    this.setData({
      summary: store.buildLocalSummary(this.data.date, store.getRecordsByDate(this.data.date)),
      isSaved: false,
    })
  },
  save() {
    if (!this.data.summary) return
    store.saveSummary(Object.assign({}, this.data.summary, { updatedAt: new Date().toISOString() }))
    this.setData({ isSaved: true })
    wx.showToast({ title: '已保存', icon: 'success' })
  },
})
