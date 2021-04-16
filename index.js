/* eslint-disable no-console */
import os from 'os'
import yargs from 'yargs'
import Transmission from 'transmission'
import Influx from 'influx'

const dbName = 'transmission'

const transmission = new Transmission({ host: 'transmission.local' })
const influx = new Influx.InfluxDB({
  host: 'grafana.local',
  database: dbName
})

const tags = { hostname: os.hostname() }

const collectStats = async () => {
  const databases = await influx.getDatabaseNames()
  if (!databases.includes(dbName)) {
    await influx.createDatabase(dbName)
  }
  console.log(await influx.getDatabaseNames())

  transmission.sessionStats(async (error, stats) => {
    if (error) throw error
    console.log(stats)
    const formatStats = ({
      uploadedBytes,
      downloadedBytes,
      filesAdded,
      secondsActive,
      sessionCount
    }) => ({
      uploadedBytes,
      downloadedBytes,
      filesAdded,
      secondsActive,
      sessionCount
    })
    const {
      activeTorrentCount,
      pausedTorrentCount,
      torrentCount,
      downloadSpeed,
      uploadSpeed,
      'current-stats': currentStats,
      'cumulative-stats': cumulativeStats
    } = stats
    await influx.writePoints([
      {
        measurement: 'stats_session',
        fields: {
          uploadSpeed,
          downloadSpeed,
          torrentCount,
          activeTorrentCount,
          pausedTorrentCount
        },
        tags
      },
      {
        measurement: 'stats_current',
        fields: formatStats(currentStats),
        tags
      },
      {
        measurement: 'stats_cumulative',
        fields: formatStats(cumulativeStats),
        tags
      }
    ])
    console.log('done stats')

    transmission.get(async (error, r) => {
      if (error) throw error
      const { torrents } = r
      console.dir(torrents[0], { depth: 1, colors: true })
      // return
      // eslint-disable-next-line
      await influx.writeMeasurement(
        'torrent',
        torrents.map(
          ({
            name,
            hashString,
            status,
            addedDate,
            files,
            isFinished,
            percentDone,
            uploadRatio,
            uploadedEver,
            rateDownload,
            rateUpload
          }) => ({
            fields: {
              status,
              addedDate,
              finished: isFinished,
              files: files.length,
              percentDone,
              ratio: uploadRatio,
              uploadedEver,
              downloadSpeed: rateDownload,
              uploadSpeed: rateUpload
            },
            tags: { ...tags, name, hash: hashString }
          })
        )
      )
      console.log('done torrents')
      // console.dir(r, { depth: null, colors: true })
    })
  })
}

collectStats()
