import { BetaAnalyticsDataClient } from '@google-analytics/data'

let analyticsClient: BetaAnalyticsDataClient | null = null

function getClient(): BetaAnalyticsDataClient | null {
  if (analyticsClient) return analyticsClient

  const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
  if (!credentials) return null

  try {
    const parsed = JSON.parse(credentials)
    analyticsClient = new BetaAnalyticsDataClient({ credentials: parsed })
    return analyticsClient
  } catch {
    return null
  }
}

function getPropertyId(): string | null {
  return process.env.GOOGLE_ANALYTICS_PROPERTY_ID || null
}

export interface GA4Metrics {
  visitors: {
    activeUsers: number
    newUsers: number
    sessions: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
  }
  trafficSources: { source: string; sessions: number }[]
  topPages: { path: string; views: number; users: number }[]
  devices: { device: string; sessions: number; percentage: number }[]
  demographics: { location: string; users: number }[]
}

export async function getGA4Metrics(days: number = 30): Promise<GA4Metrics | null> {
  const client = getClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) return null

  const property = `properties/${propertyId}`
  const startDate = `${days}daysAgo`
  const endDate = 'today'

  try {
    const [visitorReport, trafficReport, pagesReport, deviceReport, geoReport] =
      await Promise.all([
        // 1. Visitor metrics
        client.runReport({
          property,
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'newUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
        }),

        // 2. Traffic sources
        client.runReport({
          property,
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 10,
        }),

        // 3. Top pages
        client.runReport({
          property,
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'activeUsers' },
          ],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        }),

        // 4. Device breakdown
        client.runReport({
          property,
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        }),

        // 5. Demographics (country + city)
        client.runReport({
          property,
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'country' }, { name: 'city' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 10,
        }),
      ])

    // Parse visitor metrics
    const visitorRow = visitorReport[0]?.rows?.[0]?.metricValues || []
    const visitors = {
      activeUsers: parseInt(visitorRow[0]?.value || '0'),
      newUsers: parseInt(visitorRow[1]?.value || '0'),
      sessions: parseInt(visitorRow[2]?.value || '0'),
      pageViews: parseInt(visitorRow[3]?.value || '0'),
      bounceRate: parseFloat(parseFloat(visitorRow[4]?.value || '0').toFixed(1)),
      avgSessionDuration: parseFloat(parseFloat(visitorRow[5]?.value || '0').toFixed(0)),
    }

    // Parse traffic sources
    const trafficSources = (trafficReport[0]?.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    }))

    // Parse top pages
    const topPages = (pagesReport[0]?.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '/',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    }))

    // Parse devices
    const deviceRows = deviceReport[0]?.rows || []
    const totalDeviceSessions = deviceRows.reduce(
      (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'),
      0
    )
    const devices = deviceRows.map((row) => {
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')
      return {
        device: row.dimensionValues?.[0]?.value || 'Unknown',
        sessions,
        percentage: totalDeviceSessions > 0
          ? parseFloat(((sessions / totalDeviceSessions) * 100).toFixed(1))
          : 0,
      }
    })

    // Parse demographics
    const demographics = (geoReport[0]?.rows || []).map((row) => {
      const country = row.dimensionValues?.[0]?.value || 'Unknown'
      const city = row.dimensionValues?.[1]?.value || ''
      return {
        location: city && city !== '(not set)' ? `${city}, ${country}` : country,
        users: parseInt(row.metricValues?.[0]?.value || '0'),
      }
    })

    return { visitors, trafficSources, topPages, devices, demographics }
  } catch (err) {
    console.error('GA4 Data API error:', err)
    return null
  }
}
