import type { ServerFunctionClient } from 'payload'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import '@payloadcms/next/css'
import configPromise from '@payload-config'
import React from 'react'
import { importMap } from './importMap.js'
import { IdleTimeout } from '@/components/admin/IdleTimeout'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      <IdleTimeout />
      {children}
    </RootLayout>
  )
}
