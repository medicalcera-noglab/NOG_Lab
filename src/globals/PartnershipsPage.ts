import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { revalidatePartnershipsPage } from '../hooks/revalidateCache'
import { makeGlobalAuditChangeHook } from '../hooks/auditLog'

export const PartnershipsPage: GlobalConfig = {
  slug: 'partnerships_page',
  label: 'Partnerships Page',
  admin: {
    hideAPIURL: true,
    group: 'Pages',
    description:
      'Content for /collaborations (Partnerships page) — hero, why partner with us, offerings, infrastructure, who we work with, example projects, partnership models, and CTA.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  versions: {
    drafts: true,
    max: 20,
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidatePartnershipsPage, makeGlobalAuditChangeHook('partnerships_page')],
  },
  fields: [
    // ── Hero Section ──
    {
      name: 'heroEyebrow',
      type: 'text',
      label: 'Hero Eyebrow Badge',
      defaultValue: 'Research Partnerships',
    },
    {
      name: 'heroTitle',
      type: 'text',
      label: 'Hero Main Title',
      defaultValue: 'Access Real-World Population Data from Pakistan',
    },
    {
      name: 'heroDescription',
      type: 'textarea',
      label: 'Hero Description Paragraph',
      defaultValue:
        'Partner with our established community research network to generate high-quality real-world evidence. NOG Lab provides industry, academic, and global health partners with access to diverse populations in Pakistan including rural, underserved communities enabling population-based cohort studies, clinical trials, nutrition research, microbiome investigations and implementation research in authentic community settings.',
    },

    // ── Why Partner With Us ──
    {
      name: 'whyPartnerTitle',
      type: 'text',
      label: 'Why Partner Title',
      defaultValue: 'Why Partner With Us?',
    },
    {
      name: 'whyPartnerSubtitle',
      type: 'textarea',
      label: 'Why Partner Subtitle',
      defaultValue:
        'Our multidisciplinary team combines expertise in nutrition, microbiome (oral and gut), public health and community-based implementation research to deliver high-quality evidence from real-world populations.',
    },
    {
      name: 'strengths',
      type: 'array',
      label: 'Key Strengths & Differentiators',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'desc',
          type: 'textarea',
          required: true,
        },
      ],
    },

    // ── What We Offer ──
    {
      name: 'whatWeOfferTitle',
      type: 'text',
      label: 'What We Offer Title',
      defaultValue: 'What We Offer?',
    },
    {
      name: 'whatWeOfferSubtitle',
      type: 'textarea',
      label: 'What We Offer Subtitle',
      defaultValue:
        'Comprehensive population-based platforms, clinical trial support, longitudinal cohorts, sample biobanking, and analytics.',
    },
    {
      name: 'offerings',
      type: 'array',
      label: 'Offerings & Capability Services',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },

    // ── Research Infrastructure ──
    {
      name: 'infrastructureTitle',
      type: 'text',
      label: 'Infrastructure Section Title',
      defaultValue: 'Our Research Infrastructure',
    },
    {
      name: 'infrastructureTagline',
      type: 'text',
      label: 'Infrastructure Tagline',
      defaultValue: 'From Community Research to Advanced Genomics',
    },
    {
      name: 'infrastructureOverview',
      type: 'textarea',
      label: 'Infrastructure Overview Paragraph',
      defaultValue:
        'NOG Lab brings together a unique research ecosystem that combines community-based field research, clinical study infrastructure, laboratory sciences, and advanced genomic technologies. This integrated platform enables us to conduct high-quality research from participant recruitment and data collection in remote communities through to molecular analysis and next-generation sequencing.',
    },
    {
      name: 'infrastructurePillars',
      type: 'array',
      label: 'Infrastructure Pillars / Facilities',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },

    // ── Who We Work With ──
    {
      name: 'whoWeWorkWithTitle',
      type: 'text',
      label: 'Who We Work With Title',
      defaultValue: 'Who We Work With',
    },
    {
      name: 'whoWeWorkWithSubtitle',
      type: 'textarea',
      label: 'Who We Work With Subtitle',
      defaultValue:
        'We welcome collaborative partnerships across industry, academia, global health organizations, and public health agencies.',
    },
    {
      name: 'sectors',
      type: 'array',
      label: 'Target Partner Sectors',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          label: 'Sector Capabilities / Target Audience Items',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },

    // ── Example Projects ──
    {
      name: 'projectsTitle',
      type: 'text',
      label: 'Example Projects Title',
      defaultValue: 'Example Collaboration Projects',
    },
    {
      name: 'projectsSubtitle',
      type: 'textarea',
      label: 'Example Projects Subtitle',
      defaultValue:
        'Demonstrated experience delivering high-quality evidence across nutrition, clinical interventions, and microbiome analytics.',
    },
    {
      name: 'exampleProjects',
      type: 'array',
      label: 'Example Project Items',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
      ],
    },

    // ── Partnership Models ──
    {
      name: 'modelsTitle',
      type: 'text',
      label: 'Partnership Models Title',
      defaultValue: 'Partnership Models',
    },
    {
      name: 'modelsSubtitle',
      type: 'textarea',
      label: 'Partnership Models Subtitle',
      defaultValue:
        'We offer collaborative frameworks designed to meet the strategic and operational goals of academic, industry, and international partners.',
    },
    {
      name: 'models',
      type: 'array',
      label: 'Engagement Models',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'desc',
          type: 'textarea',
          required: true,
        },
      ],
    },

    // ── Partner Institutions Section Headers ──
    {
      name: 'collaboratorsTitle',
      type: 'text',
      label: 'Collaborating Institutions Title',
      defaultValue: 'Partner Institutions',
    },
    {
      name: 'collaboratorsSubtitle',
      type: 'textarea',
      label: 'Collaborating Institutions Subtitle',
      defaultValue: 'driving interdisciplinary microbiome research at a global scale.',
    },

    // ── Call To Action & Enquiry ──
    {
      name: 'ctaTitle',
      type: 'text',
      label: 'CTA Section Title',
      defaultValue: "Let's Build Evidence Together",
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
      label: 'CTA Paragraph',
      defaultValue:
        'Whether you are developing a new nutritional intervention, validating diagnostic technologies, evaluating health products, or designing population-based studies, we welcome opportunities to collaborate. We work with academic institutions, industry partners, non-governmental organisations, and public health agencies to generate high-quality evidence that improves health outcomes in low- and middle-income countries.',
    },
    {
      name: 'ctaEmail',
      type: 'text',
      label: 'Contact Email Address',
      defaultValue: 'research@noglabkmu.org',
    },
  ],
}
