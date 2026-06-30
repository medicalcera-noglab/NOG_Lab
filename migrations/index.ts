import * as migration_20260618_201421 from './20260618_201421'
import * as migration_20260618_201422_postgis_geography from './20260618_201422_postgis_geography'
import * as migration_20260619_000000_users_totp_fields from './20260619_000000_users_totp_fields'
import * as migration_20260619_103316 from './20260619_103316'
import * as migration_20260619_120000_applicant_files from './20260619_120000_applicant_files'
import * as migration_20260619_120001_media_image_sizes from './20260619_120001_media_image_sizes'
import * as migration_20260619_200000_site_settings_role_labels from './20260619_200000_site_settings_role_labels'
import * as migration_20260619_210000_projects_related_publications from './20260619_210000_projects_related_publications'
import * as migration_20260619_300000_search_fts from './20260619_300000_search_fts'
import * as migration_20260619_400000_add_localization from './20260619_400000_add_localization'
import * as migration_20260620_000000_legal_pages from './20260620_000000_legal_pages'
import * as migration_20260620_000001_site_settings_logo_dark from './20260620_000001_site_settings_logo_dark'
import * as migration_20260620_000002_navigation from './20260620_000002_navigation'
import * as migration_20260620_000003_hero_media from './20260620_000003_hero_media'
import * as migration_20260620_000004_page_seo from './20260620_000004_page_seo'
import * as migration_20260620_000005_is_demo from './20260620_000005_is_demo'
import * as migration_20260621_000000_media_source_fields from './20260621_000000_media_source_fields'
import * as migration_20260621_000001_research_theme_image from './20260621_000001_research_theme_image'
import * as migration_20260621_000002_versioned_snapshot_col from './20260621_000002_versioned_snapshot_col'
import * as migration_20260621_000003_locked_docs_applicant_files from './20260621_000003_locked_docs_applicant_files'
import * as migration_20260621_000004_versioned_published_locale from './20260621_000004_versioned_published_locale'
import * as migration_20260621_000005_navigation_varchar_id from './20260621_000005_navigation_varchar_id'
import * as migration_20260621_100000_drop_localization from './20260621_100000_drop_localization'
import * as migration_20260622_000001_nav_join_us from './20260622_000001_nav_join_us'
import * as migration_20260623_170421 from './20260623_170421'
import * as migration_20260627_000001_site_settings_hero_subline from './20260627_000001_site_settings_hero_subline'
import * as migration_20260628_000001_people_profile_fields from './20260628_000001_people_profile_fields'
import * as migration_20260628_000002_inquiries_file_fields from './20260628_000002_inquiries_file_fields'
import * as migration_20260628_000003_inquiries_file_urls from './20260628_000003_inquiries_file_urls'
import * as migration_20260628_000004_inquiries_reply_text from './20260628_000004_inquiries_reply_text'
import * as migration_20260628_000005_site_settings_founding_year from './20260628_000005_site_settings_founding_year'
import * as migration_20260630_000001_site_settings_hero_motto from './20260630_000001_site_settings_hero_motto'

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
  {
    up: migration_20260619_400000_add_localization.up,
    down: migration_20260619_400000_add_localization.down,
    name: '20260619_400000_add_localization',
  },
  {
    up: migration_20260620_000000_legal_pages.up,
    down: migration_20260620_000000_legal_pages.down,
    name: '20260620_000000_legal_pages',
  },
  {
    up: migration_20260620_000001_site_settings_logo_dark.up,
    down: migration_20260620_000001_site_settings_logo_dark.down,
    name: '20260620_000001_site_settings_logo_dark',
  },
  {
    up: migration_20260620_000002_navigation.up,
    down: migration_20260620_000002_navigation.down,
    name: '20260620_000002_navigation',
  },
  {
    up: migration_20260620_000003_hero_media.up,
    down: migration_20260620_000003_hero_media.down,
    name: '20260620_000003_hero_media',
  },
  {
    up: migration_20260620_000004_page_seo.up,
    down: migration_20260620_000004_page_seo.down,
    name: '20260620_000004_page_seo',
  },
  {
    up: migration_20260620_000005_is_demo.up,
    down: migration_20260620_000005_is_demo.down,
    name: '20260620_000005_is_demo',
  },
  {
    up: migration_20260621_000000_media_source_fields.up,
    down: migration_20260621_000000_media_source_fields.down,
    name: '20260621_000000_media_source_fields',
  },
  {
    up: migration_20260621_000001_research_theme_image.up,
    down: migration_20260621_000001_research_theme_image.down,
    name: '20260621_000001_research_theme_image',
  },
  {
    up: migration_20260621_000002_versioned_snapshot_col.up,
    down: migration_20260621_000002_versioned_snapshot_col.down,
    name: '20260621_000002_versioned_snapshot_col',
  },
  {
    up: migration_20260621_000003_locked_docs_applicant_files.up,
    down: migration_20260621_000003_locked_docs_applicant_files.down,
    name: '20260621_000003_locked_docs_applicant_files',
  },
  {
    up: migration_20260621_000004_versioned_published_locale.up,
    down: migration_20260621_000004_versioned_published_locale.down,
    name: '20260621_000004_versioned_published_locale',
  },
  {
    up: migration_20260621_000005_navigation_varchar_id.up,
    down: migration_20260621_000005_navigation_varchar_id.down,
    name: '20260621_000005_navigation_varchar_id',
  },
  {
    up: migration_20260621_100000_drop_localization.up,
    down: migration_20260621_100000_drop_localization.down,
    name: '20260621_100000_drop_localization',
  },
  {
    up: migration_20260622_000001_nav_join_us.up,
    down: migration_20260622_000001_nav_join_us.down,
    name: '20260622_000001_nav_join_us',
  },
  {
    up: migration_20260623_170421.up,
    down: migration_20260623_170421.down,
    name: '20260623_170421',
  },
  {
    up: migration_20260627_000001_site_settings_hero_subline.up,
    down: migration_20260627_000001_site_settings_hero_subline.down,
    name: '20260627_000001_site_settings_hero_subline',
  },
  {
    up: migration_20260628_000001_people_profile_fields.up,
    down: migration_20260628_000001_people_profile_fields.down,
    name: '20260628_000001_people_profile_fields',
  },
  {
    up: migration_20260628_000002_inquiries_file_fields.up,
    down: migration_20260628_000002_inquiries_file_fields.down,
    name: '20260628_000002_inquiries_file_fields',
  },
  {
    up: migration_20260628_000003_inquiries_file_urls.up,
    down: migration_20260628_000003_inquiries_file_urls.down,
    name: '20260628_000003_inquiries_file_urls',
  },
  {
    up: migration_20260628_000004_inquiries_reply_text.up,
    down: migration_20260628_000004_inquiries_reply_text.down,
    name: '20260628_000004_inquiries_reply_text',
  },
  {
    up: migration_20260628_000005_site_settings_founding_year.up,
    down: migration_20260628_000005_site_settings_founding_year.down,
    name: '20260628_000005_site_settings_founding_year',
  },
  {
    up: migration_20260630_000001_site_settings_hero_motto.up,
    down: migration_20260630_000001_site_settings_hero_motto.down,
    name: '20260630_000001_site_settings_hero_motto',
  },
]
