/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Populates Dr. Muhammad Shahzad's full academic profile in Payload.
 * Run: npm run seed:shahzad
 *
 * Requires the migration 20260628_000001_people_profile_fields to have run first.
 * Idempotent — updates the existing record by slug.
 */

import { getPayload } from 'payload'
import configPromise from '../payload.config'

function log(msg: string) {
  console.info(`[seed-shahzad] ${msg}`)
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Connected to Payload CMS')

  // Find Dr. Shahzad's record
  const existing = await payload.find({
    collection: 'people',
    where: { slug: { equals: 'muhammad-shahzad' } },
    limit: 1,
  })

  if (!existing.docs.length) {
    log('ERROR: Person "muhammad-shahzad" not found. Run npm run seed:nog first.')
    process.exit(1)
  }

  const id = existing.docs[0].id as number
  log(`Found person id=${id} — updating profile fields...`)

  const data: Record<string, unknown> = {
    academicTitle: 'Professor',
    institution:
      'Institute of Basic Medical Sciences, Khyber Medical University, Peshawar, Pakistan',
    scopus: 'https://www.scopus.com/authid/detail.uri?authorId=58733244100',
    education: [
      {
        degree: 'PhD (Oral Microbiology & Immunology)',
        institution: 'University of Glasgow',
        country: 'UK',
        startYear: '2010',
        endYear: '2015',
      },
      {
        degree: 'MHPE (Master of Health Professions Education)',
        institution: 'Khyber Medical University',
        country: 'Pakistan',
        startYear: '2021',
        endYear: '2023',
      },
      {
        degree: 'BDS (Bachelor of Dental Surgery)',
        institution: 'Khyber College of Dentistry',
        country: 'Pakistan',
        startYear: '2002',
        endYear: '2007',
      },
    ],
    experience: [
      {
        role: 'Professor',
        institution: 'Khyber Medical University',
        country: 'Pakistan',
        startYear: '2026',
        endYear: 'present',
      },
      {
        role: 'Associate Professor',
        institution: 'Zarqa University',
        country: 'Jordan',
        startYear: '2023',
        endYear: '2026',
      },
      {
        role: 'Associate Professor',
        institution: 'Khyber Medical University',
        country: 'Pakistan',
        startYear: '2021',
        endYear: '2023',
      },
      {
        role: 'Senior Visiting Research Fellow',
        institution: 'University of Reading',
        country: 'UK',
        startYear: '2021',
        endYear: '2023',
      },
      {
        role: 'Postdoctoral Research Fellow',
        institution: 'University of Reading',
        country: 'UK',
        startYear: '2019',
        endYear: '2020',
      },
      {
        role: 'Assistant Professor',
        institution: 'Khyber Medical University',
        country: 'Pakistan',
        startYear: '2015',
        endYear: '2021',
      },
    ],
    grants: [
      {
        title:
          'Association of Oral Microbiome with Oral Cancer and Immunological Markers in Patients Exposed to Smokeless Tobacco',
        funder: 'Higher Education Commission (HEC) Pakistan',
        year: '2025–2026',
      },
      {
        title:
          'Exploring the Role of the Oral and Gut Microbiome in Development of Childhood Malnutrition in Pakistan',
        funder: 'University of Reading / ORIC-KMU',
        year: '2023',
      },
      {
        title: 'Gut Microbiome Maturation in Malnutrition in Pakistani Children (CALICO)',
        funder: 'National Institutes of Health (NIH) Pakistan',
        year: '2022–2025',
      },
      {
        title:
          'Diet, Oral and Gut Microbiome in South Asian Populations in Scotland and in Pakistan',
        funder: 'Swiss National Science Foundation (SNSF)',
        year: '2020–2021',
      },
      {
        title:
          'Early-Life Nutritional Programming of Gut Microbiome Maturation and Immune Development in Pakistan',
        funder: 'Nestlé Foundation',
        year: '2019–2020',
      },
      {
        title:
          'Does Dietary Supplementation with omega-3 Modulate the Oral Microbiome in Patients with Type 2 Diabetes?',
        funder: 'Higher Education Commission (HEC) Pakistan',
        year: '2016–2019',
      },
    ],
  }

  await payload.update({ collection: 'people', id, data } as any)
  log('Successfully updated Dr. Shahzad profile.')
  log(`  academicTitle: Professor`)
  log(`  institution: ${data.institution}`)
  log(`  scopus: ${data.scopus}`)
  log(`  education entries: ${(data.education as unknown[]).length}`)
  log(`  experience entries: ${(data.experience as unknown[]).length}`)
  log(`  grant entries: ${(data.grants as unknown[]).length}`)

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
