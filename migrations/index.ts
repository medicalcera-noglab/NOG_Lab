import * as migration_20240101000000_enable_postgis from './20240101000000_enable_postgis'
import * as migration_20260618_201421 from './20260618_201421'
import * as migration_20260618_201422_postgis_geography from './20260618_201422_postgis_geography'

export const migrations = [
  {
    up: migration_20240101000000_enable_postgis.up,
    down: migration_20240101000000_enable_postgis.down,
    name: '20240101000000_enable_postgis',
  },
  {
    up: migration_20260618_201421.up,
    down: migration_20260618_201421.down,
    name: '20260618_201421',
  },
  {
    up: migration_20260618_201422_postgis_geography.up,
    down: migration_20260618_201422_postgis_geography.down,
    name: '20260618_201422_postgis_geography',
  },
]
