const RECORDS_KEY = 'foodRecords'
const SUMMARIES_KEY = 'dailySummaries'

const mealOptions = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snack', label: '加餐' },
  { key: 'lateNight', label: '夜宵' },
  { key: 'other', label: '其他' },
]

const tagOptions = ['清淡', '辛辣', '甜', '咸', '油腻', '健康', '高蛋白', '低卡', '主食', '饮品', '甜品']

function pad(value) {
  return value < 10 ? `0${value}` : `${value}`
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getToday() {
  return formatDate(new Date())
}

function parseDate(dateValue) {
  const parts = dateValue.split('-').map(Number)
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function formatDisplayDate(dateValue) {
  const date = parseDate(dateValue)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function getWeekday(dateValue) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][parseDate(dateValue).getDay()]
}

function shiftDate(dateValue, offset) {
  const date = parseDate(dateValue)
  date.setDate(date.getDate() + offset)
  return formatDate(date)
}

function getMealLabel(mealType) {
  const option = mealOptions.find((item) => item.key === mealType)
  return option ? option.label : '其他'
}

function mealOrder(mealType) {
  return mealOptions.findIndex((item) => item.key === mealType)
}

function getRecords() {
  return wx.getStorageSync(RECORDS_KEY) || []
}

function getRecordsByDate(date) {
  return getRecords()
    .filter((record) => record.date === date)
    .sort((a, b) => mealOrder(a.mealType) - mealOrder(b.mealType) || b.createdAt.localeCompare(a.createdAt))
}

function getRecordById(id) {
  return getRecords().find((record) => record.id === id)
}

function saveRecord(record) {
  const records = getRecords()
  const index = records.findIndex((item) => item.id === record.id)
  const nextRecord = Object.assign({}, record, { updatedAt: new Date().toISOString() })

  if (index >= 0) {
    records.splice(index, 1, nextRecord)
  } else {
    records.unshift(nextRecord)
  }

  wx.setStorageSync(RECORDS_KEY, records)
}

function deleteRecord(id) {
  wx.setStorageSync(RECORDS_KEY, getRecords().filter((record) => record.id !== id))
}

function createEmptyRecord(date) {
  const now = new Date().toISOString()
  return {
    id: `food-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    foodName: '',
    date,
    mealType: 'lunch',
    rating: 4,
    comment: '',
    images: [],
    location: '',
    price: '',
    tags: [],
    aiComment: '',
    createdAt: now,
    updatedAt: now,
  }
}

function getAverageRating(records) {
  if (!records.length) return '0.0'
  return (records.reduce((sum, record) => sum + record.rating, 0) / records.length).toFixed(1)
}

function getStarText(rating) {
  return '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating)
}

function getSummaries() {
  return wx.getStorageSync(SUMMARIES_KEY) || []
}

function getSummaryByDate(date) {
  return getSummaries().find((summary) => summary.date === date)
}

function saveSummary(summary) {
  const summaries = getSummaries()
  const index = summaries.findIndex((item) => item.date === summary.date)
  if (index >= 0) summaries.splice(index, 1, summary)
  else summaries.unshift(summary)
  wx.setStorageSync(SUMMARIES_KEY, summaries)
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)))
}

function buildLocalSummary(date, records) {
  const averageRating = Number(getAverageRating(records))
  const tags = unique(records.reduce((result, record) => result.concat(record.tags), []))
  const foodNames = records.map((record) => record.foodName).join('、')
  const bestRecord = records.slice().sort((a, b) => b.rating - a.rating)[0]
  const now = new Date().toISOString()
  const summary = records.length
    ? `今天记录了 ${records.length} 样食物：${foodNames}。整体平均 ${averageRating} 分，${bestRecord.foodName} 是今天满意度最高的一项。`
    : '今天还没有食物记录，先从下一餐开始写下味道吧。'

  return {
    id: `summary-${date}`,
    date,
    summary,
    averageRating,
    recordCount: records.length,
    tags,
    suggestions: records.length
      ? [
        tags.length ? `今天的关键词是 ${tags.slice(0, 3).join('、')}。` : '可以给记录加上口味标签，之后更容易看到偏好变化。',
        averageRating >= 4 ? '今天整体满意度不错，可以收藏高分食物。' : '今天满意度一般，可以补充更具体的评价。',
        '明天可以记录一张照片和一句简短评价，让回顾更有画面感。',
      ]
      : ['添加一条食物记录后，就能生成更具体的每日总结。'],
    createdAt: now,
    updatedAt: now,
  }
}

module.exports = {
  mealOptions,
  tagOptions,
  getToday,
  formatDisplayDate,
  getWeekday,
  shiftDate,
  getMealLabel,
  getRecordsByDate,
  getRecordById,
  saveRecord,
  deleteRecord,
  createEmptyRecord,
  getAverageRating,
  getStarText,
  getSummaryByDate,
  saveSummary,
  buildLocalSummary,
}
