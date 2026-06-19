import * as migration_20260618_201421 from './20260618_201421'
import * as migration_20260618_201422_postgis_geography from './20260618_201422_postgis_geography'
import * as migration_20260619_000000_users_totp_fields from './20260619_000000_users_totp_fields'
import * as migration_20260619_103316 from './20260619_103316'
import * as migration_20260619_120000_applicant_files from './20260619_120000_applicant_files'
import * as migration_20260619_120001_media_image_sizes from './20260619_120001_media_image_sizes'
import * as migration_20260619_200000_site_settings_role_labels from './20260619_200000_site_settings_role_labels'
import * as migration_20260619_210000_projects_related_publications from './20260619_210000_projects_related_publications'
import * as migration_20260619_300000_search_fts from './20260619_300000_search_fts'

export const migrations = [
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
  {
    up: migration_20260619_000000_users_totp_fields.up,
    down: migration_20260619_000000_users_totp_fields.down,
    name: '20260619_000000_users_totp_fields',
  },
  {
    up: migration_20260619_103316.up,
    down: migration_20260619_103316.down,
    name: '20260619_103316',
  },
  {
    up: migration_20260619_120000_applicant_files.up,
    down: migration_20260619_120000_applicant_files.down,
    name: '20260619_120000_applicant_files',
  },
  {
    up: migration_20260619_120001_media_image_sizes.up,
    down: migration_20260619_120001_media_image_sizes.down,
    name: '20260619_120001_media_image_sizes',
  },
  {
    up: migration_20260619_200000_site_settings_role_labels.up,
    down: migration_20260619_200000_site_settings_role_labels.down,
    name: '20260619_200000_site_settings_role_labels',
  },
  {
    up: migration_20260619_210000_projects_related_publications.up,
    down: migration_20260619_210000_projects_related_publications.down,
    name: '20260619_210000_projects_related_publications',
  },
  {
    up: migration_20260619_300000_search_fts.up,
    down: migration_20260619_300000_search_fts.down,
    name: '20260619_300000_search_fts',
  },
]
