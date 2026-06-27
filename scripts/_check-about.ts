import { getPayload } from 'payload'
import config from '../payload.config'
async function main() {
  const payload = await getPayload({ config })
  const about = await payload.findGlobal({ slug: 'about', depth: 0 })
  console.log('mission:', about.mission ? 'HAS DATA' : 'EMPTY')
  console.log('directorMessage:', about.directorMessage ? 'HAS DATA' : 'EMPTY')
  console.log('kmuAffiliation:', about.kmuAffiliation ? 'HAS DATA' : 'EMPTY')
  console.log(
    'facilities:',
    Array.isArray(about.facilities) ? about.facilities.length + ' items' : 'NONE',
  )
  console.log('directorPortrait:', about.directorPortrait ?? 'NONE')
  process.exit(0)
}
main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
