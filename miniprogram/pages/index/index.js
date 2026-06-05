const store = require('../../utils/food-store')

Page({
  data: {
    selectedDate: store.getToday(),
    displayDate: '',
    weekday: '',
    records: [],
    mealGroups: [],
    recordCount: 0,
    averageRating: '0.0',
    savedSummary: '',
    searchKeyword: '',
    searchResults: [],
  },
  onLoad() {
    this.loadDate(this.data.selectedDate)
  },
  onShow() {
    this.loadDate(this.data.selectedDate)
  },
  loadDate(date) {
    const records = store.getRecordsByDate(date).map((record) => Object.assign({}, record, {
      mealLabel: store.getMealLabel(record.mealType),
      starText: store.getStarText(record.rating),
      coverText: record.foodName.slice(0, 1) || '食',
    }))
    const mealGroups = store.mealOptions
      .map((meal) => ({
        key: meal.key,
        label: meal.label,
        records: records.filter((record) => record.mealType === meal.key),
      }))
      .filter((group) => group.records.length > 0)
    const summary = store.getSummaryByDate(date)

    this.setData({
      selectedDate: date,
      displayDate: store.formatDisplayDate(date),
      weekday: store.getWeekday(date),
      records,
      mealGroups,
      recordCount: records.length,
      averageRating: store.getAverageRating(records),
      savedSummary: summary ? summary.summary : '',
    })
  },
  onDateChange(event) {
    this.loadDate(String(event.detail.value))
  },
  goPrevDate() {
    this.loadDate(store.shiftDate(this.data.selectedDate, -1))
  },
  goNextDate() {
    this.loadDate(store.shiftDate(this.data.selectedDate, 1))
  },
  goToday() {
    this.loadDate(store.getToday())
  },
  openAdd() {
    wx.navigateTo({ url: `/pages/record-edit/record-edit?date=${this.data.selectedDate}` })
  },
  openDetail(event) {
    wx.navigateTo({ url: `/pages/record-detail/record-detail?id=${event.currentTarget.dataset.id}` })
  },
  openSummary() {
    wx.navigateTo({ url: `/pages/ai-summary/ai-summary?date=${this.data.selectedDate}` })
  },
  onSearchInput(event) {
    const keyword = String(event.detail.value || '').trim()
    if (!keyword) {
      this.setData({
        searchKeyword: '',
        searchResults: [],
      })
      return
    }

    const lowerKeyword = keyword.toLowerCase()
    const searchResults = store.getRecords()
      .filter((record) => record.foodName.toLowerCase().includes(lowerKeyword))
      .map((record) => Object.assign({}, record, {
        mealLabel: store.getMealLabel(record.mealType),
        starText: store.getStarText(record.rating),
        dateLabel: store.formatDisplayDate(record.date),
      }))
      .slice(0, 12)

    this.setData({
      searchKeyword: keyword,
      searchResults,
    })
  },
  clearSearch() {
    this.setData({
      searchKeyword: '',
      searchResults: [],
    })
  },
  openSearchResult(event) {
    wx.navigateTo({ url: `/pages/record-detail/record-detail?id=${event.currentTarget.dataset.id}` })
  },
  quickSummary() {
    const summary = store.buildLocalSummary(this.data.selectedDate, this.data.records)
    store.saveSummary(summary)
    this.setData({ savedSummary: summary.summary })
    wx.showToast({ title: '已生成总结', icon: 'success' })
  },
})
