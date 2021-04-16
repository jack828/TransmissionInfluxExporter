#!/usr/bin/env node

/* eslint-disable no-console */
import os from 'os'
import Transmission from 'transmission'
import Influx from 'influx'

const {
  TRANSMISSION_HOST = 'localhost',
  TRANSMISSION_PORT = 9091,
  TRANSMISSION_USERNAME,
  TRANSMISSION_PASSWORD,
  TRANSMISSION_USE_SSL,
  TRANSMISSION_URL,

  DATABASE_NAME = 'transmission',
  INFLUXDB_HOST = 'localhost',
  INFLUXDB_PORT = 8086,
  INFLUXDB_USERNAME,
  INFLUXDB_PASSWORD
} = process.env

const transmission = new Transmission({
  host: TRANSMISSION_HOST,
  port: TRANSMISSION_PORT,
  username: TRANSMISSION_USERNAME,
  password: TRANSMISSION_PASSWORD,
  ssl: !!TRANSMISSION_USE_SSL,
  url: TRANSMISSION_URL
})

const influx = new Influx.InfluxDB({
  database: DATABASE_NAME,
  host: INFLUXDB_HOST,
  port: INFLUXDB_PORT,
  username: INFLUXDB_USERNAME,
  password: INFLUXDB_PASSWORD
})

const tags = { hostname: os.hostname() }

const collectStats = async () => {
  const databases = await influx.getDatabaseNames()
  if (!databases.includes(DATABASE_NAME)) {
    console.log(`Creating database "${DATABASE_NAME}"`)
    await influx.createDatabase(DATABASE_NAME)
  }
  console.log('Collecting session stats')

  transmission.sessionStats(async (error, stats) => {
    if (error) throw error
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
    console.log('Session stats collected')

    console.log('Collecting torrent stats')
    transmission.get(async (error, r) => {
      if (error) throw error
      const { torrents } = r
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
      console.log('Torrent stats collected')
    })
  })
}

collectStats()
