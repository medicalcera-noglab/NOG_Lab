import type { ServerFunctionClient } from 'payload'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import '@payloadcms/next/css'
import configPromise from '@payload-config'
import React from 'react'
import { headers } from 'next/headers'
import { importMap } from './importMap.js'
import { IdleTimeout } from '@/components/admin/IdleTimeout'
import { DiagnosticCapture } from '@/components/admin/DiagnosticCapture'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

// Inline script that runs BEFORE React — catches errors even if hydration never starts.
// Must be a string to avoid React JSX parsing issues with </script> inside a template.
function buildEarlyScript(): string {
  return `(function(){
  var shown=false;
  function show(title,msg,type){
    if(shown||document.getElementById('__nog_e'))return;
    shown=true;
    var a=type==='error'?'#ff5555':'#ffaa00';
    var b=type==='error'?'#1a0000':'#1a1000';
    var d=document.createElement('div');
    d.id='__nog_e';
    d.setAttribute('style','position:fixed;inset:0;z-index:2147483647;background:'+b+';color:#e8e6e1;display:flex;flex-direction:column;align-items:center;padding:2rem;overflow:auto;font-family:ui-monospace,monospace;font-size:12px;line-height:1.6;');
    window.__nogClose=function(){var el=document.getElementById('__nog_e');if(el)el.remove();};
    window.__nogReload=function(){window.location.reload();};
    window.__nogHealth=function(){window.open('/api/health','_blank');};
    var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
    d.innerHTML='<div style="max-width:900px;width:100%;padding-top:0.5rem"><p style="font-size:1.2rem;font-weight:700;color:'+a+';margin:0 0 0.25rem;font-family:system-ui">NOG Lab Admin Diagnostic <span style="font-size:0.7rem;opacity:0.6">(early — before React)</span></p><p style="font-weight:600;color:'+a+';margin:0 0 0.5rem;font-family:system-ui;font-size:0.85rem">'+esc(title)+'</p><pre style="background:#0a0a0a;border:1px solid '+a+'44;border-radius:6px;padding:1rem;white-space:pre-wrap;word-break:break-all;color:#ffccaa;max-height:65vh;overflow:auto;margin:0 0 1rem;font-size:11px">'+esc(msg)+'</pre><div style="display:flex;gap:0.75rem;flex-wrap:wrap;font-family:system-ui"><button onclick="window.__nogClose()" style="padding:0.5rem 1rem;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px">Dismiss</button><button onclick="window.__nogReload()" style="padding:0.5rem 1rem;background:#0e6e6e;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px">Reload</button><button onclick="window.__nogHealth()" style="padding:0.5rem 1rem;background:#222;color:#ccc;border:1px solid #444;border-radius:4px;cursor:pointer;font-size:13px">Check DB</button></div></div>';
    document.body.appendChild(d);
  }

  window.onerror=function(msg,src,line,col,err){
    var text=String(msg)+'\nFile: '+String(src)+'\nLine '+String(line)+':'+String(col)+(err&&err.stack?'\n\nStack:\n'+err.stack:'');
    console.error('[NOG Admin EARLY] JS error:',text);
    show('JavaScript Error (caught before React)',text,'error');
    return false;
  };

  window.addEventListener('unhandledrejection',function(e){
    var r=e.reason;
    var msg=r instanceof Error?r.message+'\n\nStack:\n'+(r.stack||'unavailable'):String(r);
    console.error('[NOG Admin EARLY] Unhandled rejection:',msg);
    show('Unhandled Promise Rejection (caught before React)',msg,'error');
  });

  setTimeout(function(){
    var input=document.querySelector('input[name="email"],input[type="email"]');
    var cssLinks=Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(function(l){return l.href;}).join('\n');
    var failed=[];
    try{failed=performance.getEntriesByType('resource').filter(function(e){var s=e.responseStatus;return s>=400||s===0;}).map(function(e){return e.name+' (status:'+e.responseStatus+')';});}catch(e_){}
    var theme=document.documentElement.getAttribute('data-theme')||'not set';
    var bodyBg=window.getComputedStyle(document.body).backgroundColor;
    var bodyHtml=document.body.innerHTML.substring(0,4000);

    console.group('[NOG Admin EARLY] 5-second diagnostic (independent of React)');
    console.log('data-theme:',theme);
    console.log('body background:',bodyBg);
    console.log('Email input:',input?'FOUND':'NOT FOUND');
    console.log('Stylesheets:',cssLinks||'none');
    console.log('Failed resources:',failed.join('\n')||'none');
    console.log('body innerHTML (4000 chars):',bodyHtml);
    console.groupEnd();

    if(!input){
      show('Login form did not render (5s timeout)',[
        'Email input NOT in DOM after 5 seconds.',
        'React may have failed to start or hydrate.',
        '',
        'data-theme: '+theme,
        'body background: '+bodyBg,
        '',
        'Loaded stylesheets:',
        cssLinks||'(none)',
        '',
        'Failed resources:',
        failed.join('\n')||'(none)',
        '',
        'See DevTools → Console for the full 5-second diagnostic group.',
        'See DevTools → Network for any red failed requests.',
      ].join('\n'),'warning');
    }
  },5000);
})();`
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? ''
  const earlyScript = buildEarlyScript()

  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
      htmlProps={{ suppressHydrationWarning: true }}
    >
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: earlyScript }} />
      <DiagnosticCapture />
      <IdleTimeout />
      {children}
    </RootLayout>
  )
}
