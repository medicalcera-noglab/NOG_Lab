import type { ServerFunctionClient } from 'payload'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import '@payloadcms/next/css'
import configPromise from '@payload-config'
import React from 'react'
import { headers } from 'next/headers'
import Script from 'next/script'
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') || undefined

  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
      htmlProps={{ suppressHydrationWarning: true }}
    >
      {/*
       * beforeInteractive — Next.js extracts this into <head> before any JS runs.
       * Shows a white loading screen immediately, so the user never sees a black void.
       * Switches to an error panel if JS throws or the form never appears.
       */}
      <Script
        id="admin-loading-overlay"
        strategy="beforeInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `(function(){
  var d=document.createElement('div');
  d.id='__nog_loader';
  d.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font-family:system-ui,sans-serif;';
  d.innerHTML='<div style="width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#0e6e6e;border-radius:50%;animation:__nog_spin 0.8s linear infinite"></div>'
    +'<p style="color:#6b7280;font-size:14px;margin:0;letter-spacing:.01em">Loading NOG Lab Admin…</p>'
    +'<style>@keyframes __nog_spin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(d);

  function remove(){var el=document.getElementById('__nog_loader');if(el)el.remove();}

  function showError(title,detail){
    var el=document.getElementById('__nog_loader');
    if(!el)return;
    var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
    el.style.background='#fff7ed';
    el.innerHTML='<div style="max-width:480px;width:90%;text-align:left">'
      +'<p style="color:#9a3412;font-weight:700;font-family:system-ui;font-size:16px;margin:0 0 6px">'+esc(title)+'</p>'
      +'<pre style="color:#7c2d12;font-size:12px;background:#fff;border:1px solid #fed7aa;padding:12px;border-radius:6px;white-space:pre-wrap;word-break:break-all;margin:0 0 14px;max-height:200px;overflow:auto">'+esc(detail)+'</pre>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +'<button onclick="location.reload()" style="padding:8px 18px;background:#0e6e6e;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-family:system-ui">Reload</button>'
      +'<button onclick="window.open(\'/api/health\',\'_blank\')" style="padding:8px 18px;background:transparent;color:#0e6e6e;border:1px solid #0e6e6e;border-radius:6px;cursor:pointer;font-size:14px;font-family:system-ui">Check DB health</button>'
      +'</div></div>';
  }

  // Remove overlay once the login form (or any admin view) appears in the DOM.
  var ob=new MutationObserver(function(){
    if(document.querySelector('input[name="email"],input[type="email"],.template-minimal__wrap,.render-root')){
      remove();ob.disconnect();
    }
  });
  ob.observe(document.body,{childList:true,subtree:true});

  // Catch JS errors before React mounts.
  window.addEventListener('error',function(e){
    showError('JavaScript error — admin could not load',e.message+(e.filename?'\\n'+e.filename+':'+e.lineno:'')+(e.error&&e.error.stack?'\\n\\n'+e.error.stack:''));
  });
  window.addEventListener('unhandledrejection',function(e){
    var msg=e.reason instanceof Error?e.reason.message+( e.reason.stack?'\\n\\n'+e.reason.stack:''):String(e.reason);
    showError('Unhandled promise rejection — admin could not load',msg);
  });

  // 20-second timeout — DB cold start or large bundle on slow connection.
  setTimeout(function(){
    var el=document.getElementById('__nog_loader');
    if(!el)return;
    el.style.background='#fff7ed';
    el.innerHTML='<div style="max-width:480px;width:90%;text-align:left">'
      +'<p style="color:#9a3412;font-weight:700;font-family:system-ui;font-size:16px;margin:0 0 6px">Admin is taking too long</p>'
      +'<p style="color:#7c2d12;font-size:13px;font-family:system-ui;margin:0 0 14px">The login form did not appear within 20 seconds. This is usually a database cold-start or slow network. Try reloading — it is often faster on the second attempt.</p>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +'<button onclick="location.reload()" style="padding:8px 18px;background:#0e6e6e;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-family:system-ui">Reload</button>'
      +'<button onclick="window.open(\'/api/health\',\'_blank\')" style="padding:8px 18px;background:transparent;color:#0e6e6e;border:1px solid #0e6e6e;border-radius:6px;cursor:pointer;font-size:14px;font-family:system-ui">Check DB health</button>'
      +'</div></div>';
  },20000);
})();`,
        }}
      />
      <IdleTimeout />
      {children}
    </RootLayout>
  )
}
