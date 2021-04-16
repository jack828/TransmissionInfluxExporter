# TransmissionInfluxExporter

InfluxDB exporter for Transmission stats

This is designed to be run as a cronjob with environment variables.

## Installation

Requires Node@^14

```bash
$ yarn global add transmission-influx-exporter
$ npm install -g transmission-influx-exporter
```

## Configuration

All done through environment e.g. `TRANSMISSION_HOST=transmission.local transmission-influx-exporter`

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_NAME` | `transmission` | Name of database to use, if it does not exist it will be created. |
| `TRANSMISSION_HOST` | `localhost` | Transmission host |
| `TRANSMISSION_PORT` | `9091` | Transmission port |
| `TRANSMISSION_USERNAME` | `<not set>` | Transmission username |
| `TRANSMISSION_PASSWORD` | `<not set>` | Transmission password |
| `TRANSMISSION_USE_SSL` | `<not set>` | Use SSL for Transmission. Set to any value to enable. |
| `TRANSMISSION_URL` | `/transmission/rpc` | RPC endpoint for Transmission. |
| `INFLUXDB_HOST` | `localhost` | InfluxDB host |
| `INFLUXDB_PORT` | `8086` | InfluxDB port |
| `INFLUXDB_USERNAME` | `<not set>` | InfluxDB username |
| `INFLUXDB_PASSWORD` | `<not set>` | InfluxDB password |

## Data Collected

### Session Stats

Global stats

| Stat | Field | Description |
|------|-------|-------------|
| Active Torrent Count | activeTorrentCount | The total number of active torrents |
| Paused Torrent Count | pausedTorrentCount | The total number of paused torrents |
| Torrent Count | torrentCount | The total number of torrents |
| Download Speed | downloadSpeed | Current download speed in bytes |
| Upload Speed | uploadSpeed | Current upload speed in bytes |

"Current" stats (since last time transmission started) and "Cumulative" stats (all time)

| Stat | Field | Description |
|------|-------|-------------|
| Uploaded Bytes | uploadedBytes | The number of uploaded bytes |
| Downloaded Bytes | downloadedBytes | The number of downloaded bytes |
| Files Added | filesAdded | The number of files added |
| Seconds Active | secondsActive | The number of seconds transmission has been active for |
| Session Count | sessionCount | Count of the times transmission started |

### Torrent Stats

Torrents come with extra tags.

| Stat | Tag | Description |
|------|-----|-------------|
| Name | name | Name of the torrent |
| Hash String | hash | The torrent's hash |


| Stat | Field | Description |
|------|-------|-------------|
| Status | status | Status of a torrent |
| Added Date | addedDate | The unixtime time a torrent was added |
| Finished | finished | Indicates if a torrent is finished |
| Files | files | The number of files in a torrent |
| Percent Done | percentDone | The percent of a torrent being done (0 - 1.0) |
| Upload Ratio | ratio | The upload ratio of a torrent |
| Uploaded Ever | uploadedEver | Amount of data ever uploaded for the torrent in bytes |
| Download Speed | downloadSpeed | Current download rate of a torrent in bytes |
| Upload Speed | uploadSpeed | Current upload rate of a torrent in bytes |

## Credits

By Jack Burgess

Heavily influenced by [metalmatze/transmission-exporter](https://github.com/metalmatze/transmission-exporter), if you want an exporter for Prometheus (written in Go) then **_Go_** and check the project out!

## License

GNUGPLv3
