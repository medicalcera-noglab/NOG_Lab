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
      {/*
       * SSR BANNER — server-rendered HTML, needs ZERO JavaScript to appear.
       * If you see this banner on screen, the server is rendering the layout.
       * The inline script immediately changes the text when JS executes.
       */}
      <div
        id="__nog_ssr_banner"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2147483647,
          background: '#b45309',
          color: '#fff',
          padding: '6px 14px',
          fontFamily: 'ui-monospace,SFMono-Regular,monospace',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        <span>NOG Admin: Server-side render ✓</span>
        <span id="__nog_js_status" style={{ opacity: 0.75 }}>
          JavaScript: not yet running…
        </span>
      </div>
      {/* This script runs the instant the browser parses it — before React */}
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `(function(){
  var s=document.getElementById('__nog_js_status');
  if(s){s.textContent='JavaScript: ✓ running';s.style.color='#86efac';s.style.opacity='1';}
  console.log('[NOG Admin] JS executing (early script, before React)');
  setTimeout(function(){
    var input=document.querySelector('input[name="email"],input[type="email"]');
    var b=document.getElementById('__nog_ssr_banner');
    var ss=document.getElementById('__nog_js_status');
    var cssLinks=Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(function(l){return l.href;}).join('\\n');
    var failed=[];try{failed=performance.getEntriesByType('resource').filter(function(e){return e.responseStatus>=400||e.responseStatus===0;}).map(function(e){return e.name+' (status:'+e.responseStatus+')'});}catch(x){}
    console.group('[NOG Admin] 10-second diagnostic');
    console.log('JS running: YES');
    console.log('Login form (email input):',input?'FOUND':'NOT FOUND');
    console.log('CSS files:',cssLinks||'none');
    console.log('Failed resources:',failed.join('\\n')||'none');
    console.log('data-theme:',document.documentElement.getAttribute('data-theme'));
    console.log('body bg:',getComputedStyle(document.body).backgroundColor);
    console.log('body innerHTML:',document.body.innerHTML.substring(0,5000));
    console.groupEnd();
    if(input){if(b)b.style.display='none';}
    else{
      if(b){b.style.background='#991b1b';b.style.padding='8px 14px';}
      if(ss){ss.style.color='#fca5a5';ss.style.opacity='1';ss.textContent='Login form NOT in DOM — check Console & Network tabs';}
    }
  },10000);
})();`,
        }}
      />
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: earlyScript }} />
      <DiagnosticCapture />
      <IdleTimeout />
      {children}
    </RootLayout>
  )
}
