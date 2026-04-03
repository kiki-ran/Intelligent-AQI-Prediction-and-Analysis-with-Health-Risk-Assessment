// Utility helpers shared across components

export function getAqiColor(aqi) {
  if (aqi <= 50)  return '#00e400'
  if (aqi <= 100) return '#92d400'
  if (aqi <= 150) return '#ffff00'
  if (aqi <= 200) return '#ff7e00'
  if (aqi <= 300) return '#ff0000'
  return '#7e0023'
}

export function getAqiCategory(aqi) {
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Satisfactory'
  if (aqi <= 150) return 'Moderate'
  if (aqi <= 200) return 'Poor'
  if (aqi <= 300) return 'Very Poor'
  return 'Severe'
}

export function getAqiTextColor(aqi) {
  return aqi > 100 ? '#fff' : '#000'
}

export function formatNum(n, decimals = 1) {
  if (n == null || isNaN(n)) return '–'
  return Number(n).toFixed(decimals)
}
