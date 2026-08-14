import{B as e,F as t,H as n,L as r,R as i,V as a,ct as o,st as s,ut as c,z as l}from"./index-B0xzrPZo.js";var u=`
          :root { color-scheme: only light; }
          html, body { background: #ffffff; }
          @page { size: letter; margin: 0.6in 0.5in; }
          @media print {
            body {
              margin: 0;
              /* Keep condition chips / severity colours — browsers drop
                 backgrounds when printing unless told otherwise. */
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Repeat column headers when a table runs past a page break. */
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            /* Never split a row, an image, or a photo from its caption. */
            tr, img, figure, .photo, .photo-card, .card, .fact, .deficiency {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            /* Keep a heading with the content it introduces. */
            h1, h2, h3, h4, caption, legend, .system-head {
              break-after: avoid;
              page-break-after: avoid;
            }
            p, li { orphans: 3; widows: 3; }
            /* Printed links should read as text, not blue underlines. */
            a { color: inherit; text-decoration: none; }
            .no-print { display: none !important; }
          }`,d=`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='210'><text x='8' y='150' transform='rotate(-30 180 105)' fill='rgba(200,28,28,0.13)' font-family='Arial, Helvetica, sans-serif' font-size='27' font-weight='700'>SAMPLE - NOT FOR SUBMISSION</text></svg>`;function f(e){return e?`<style>.wm-overlay{position:fixed;inset:0;pointer-events:none;z-index:9999;background-image:url("data:image/svg+xml,${encodeURIComponent(d)}");background-repeat:repeat;}.wm-footer{position:fixed;left:0;right:0;bottom:0;z-index:10000;pointer-events:none;background:rgba(255,255,255,.92);color:#b91c1c;text-align:center;font:600 10.5px/1.5 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.04em;padding:5px 8px;border-top:1px solid #eab8b8;}@media print{.wm-overlay,.wm-footer{position:fixed;}body{padding-bottom:34px;}}</style><div class="wm-overlay" aria-hidden="true"></div><div class="wm-footer">PREVIEW - not for submission. Subscribe at inspection.rent to download the clean, submission-ready report.</div>`:``}function p(e,n,r,i=!1){let a=e.findings.map(e=>`
        <section>
          <h3>${v(e.title)}</h3>
          <p><strong>Severity:</strong> ${v(e.severity)}</p>
          <p>${v(e.narrative)}</p>
          <p><strong>Recommendation:</strong> ${v(e.recommendation)}</p>
        </section>
      `).join(``),l=e.photos.map(e=>`
        <figure>
          <img src="${v(e.url)}" alt="${v(e.label)}" />
          <figcaption>${v(e.label)} - ${v(e.location)}${e.analysis?` - Scan: ${v(e.analysis.detectedIssue)}`:``}</figcaption>
        </figure>
      `).join(``),d=e.photos.filter(e=>e.slotId?.startsWith(`defect`)).map(t=>{let n=(e.photoRecommendations??{})[t.id]?.trim();return`
        <figure>
          ${t.url?`<img src="${v(t.url)}" alt="${v(t.label)}" />`:``}
          <figcaption>
            <strong>${v(t.label)}</strong>${t.location?` — ${v(t.location)}`:``}<br />
            ${n?v(n):`<em>No recommendation entered.</em>`}
          </figcaption>
        </figure>
      `}).join(``),p=d?`
        <section>
          <h2>Defect Recommendations</h2>
          ${d}
        </section>
      `:``,m=e.photos.filter(e=>e.analysis).map(e=>`
        <section>
          <h3>${v(e.analysis?.detectedIssue??`Image scan result`)}</h3>
          <p><strong>Photo:</strong> ${v(e.label)} - ${v(e.location)}</p>
          <p><strong>Severity:</strong> ${v(e.analysis?.severity??`review`)}</p>
          <p><strong>Confidence:</strong> ${Math.round((e.analysis?.confidence??0)*100)}%</p>
          <p>${v(e.analysis?.summary??``)}</p>
          <p><strong>Recommendation:</strong> ${v(e.analysis?.recommendation??``)}</p>
        </section>
      `).join(``),h=e.researchPacket?.sources.map(e=>`
        <tr>
          <td>${v(e.title)}</td>
          <td>${v(e.status.replace(/_/g,` `))}</td>
          <td><a href="${y(e.url)}" rel="noopener noreferrer">${v(e.url)}</a></td>
          <td>${v(e.detail)}</td>
        </tr>
      `).join(``),g=[[`Client`,s(e.request)],[`Insured`,e.request.insuredName],[`Phone`,e.request.phone],[`Email`,e.request.email],[`Inspection type`,c(e.request.inspectionType)],[`Price`,e.request.price],...e.clientPayment||e.request.paymentStatus!==`unpaid`?[[`Payment`,e.request.paymentStatus.replace(`_`,` `)]]:[],[`Appointment`,e.request.appointmentStart]].map(([e,t])=>`<tr><td>${v(e)}</td><td>${v(t||`Not populated`)}</td></tr>`).join(``),b=e.permitCandidates.filter(e=>e.status===`selected`).map(e=>`
        <tr>
          <td>${v(e.type)}</td>
          <td>${v(e.permitNumber||`No permit number`)}</td>
          <td>${v(e.issuedDate||`Unknown`)}</td>
          <td>${v(e.finalDate||`Unknown`)}</td>
          <td>${v(e.notes)}</td>
        </tr>
      `).join(``),x=Object.entries(e.officialFields).filter(([n,r])=>t(n,e.request.inspectionType,!!(r??``).trim())).map(([e,t])=>`
        <tr>
          <td>${v(e.replace(/([A-Z])/g,` $1`))}</td>
          <td>${v(t||`Blank`)}</td>
        </tr>
      `).join(``),S=[[`Property`,`${e.property.address}, ${e.property.city}, ${e.property.state} ${e.property.postalCode}`],[`Owner`,e.property.ownerName||`Not populated`],[`County / parcel`,`${e.property.county||`Not populated`} / ${e.property.parcelId||`Not populated`}`],[`Legal description`,e.property.legalDescription||`Not populated`],[`Flood zone`,`${e.property.floodZone||`Not populated`}${e.property.sfha?` — SFHA ${e.property.sfha}`:``}`],[`Inspection date`,e.inspectionDate||`Not set`],[`Inspector`,`${e.inspector.name} — ${e.inspector.license}`],[`Company`,`${e.inspector.company||`Not set`} — ${e.inspector.email||`No email`}`],[`State pack`,`${n.name} ${n.version}`],[`Scope`,e.scope||`Not set`],[`Signoff`,e.signedAt?`${e.signatureName||e.inspector.name} at ${o(e.signedAt)}`:`Pending inspector finalization`]].map(([e,t])=>`<div class="fact"><dt>${v(e)}</dt><dd>${v(t)}</dd></div>`).join(``);return`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Inspection Report - ${v(e.property.address)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" />
        <style>
          :root { color-scheme: light; }
          body {
            font-family: "Public Sans", -apple-system, "Segoe UI", "Helvetica Neue", sans-serif;
            color: #0f2438; margin: 40px auto; max-width: 880px; padding: 0 24px; line-height: 1.5; font-size: 13px;
          }
          h1 { font-family: "Archivo", "Public Sans", sans-serif; font-size: 26px; letter-spacing: -0.015em; margin: 0 0 4px; }
          h2 {
            font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace; font-size: 12px; font-weight: 600;
            letter-spacing: 0.08em; text-transform: uppercase; color: #143c61;
            border-bottom: 2px solid #0f2438; padding-bottom: 6px; margin: 0 0 12px;
          }
          h3 { font-size: 14px; margin: 0 0 6px; }
          header { border-top: 6px solid #0b1d31; border-bottom: 1px solid #d5dde6; padding: 18px 0; margin-bottom: 22px; }
          .letterhead { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 14px; }
          .letterhead .brand-line { font-family: "IBM Plex Mono", monospace; font-size: 11px; color: #52657b; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }
          section { border-bottom: 1px solid #d5dde6; padding: 0 0 18px; margin: 0 0 18px; }
          dl.header-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin: 0; }
          .fact { display: grid; grid-template-columns: 150px 1fr; gap: 10px; padding: 4px 0; border-bottom: 1px dotted #e4eaf1; }
          .fact dt { font-family: "IBM Plex Mono", monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #52657b; }
          .fact dd { margin: 0; font-size: 12.5px; }
          figure { display: inline-block; width: 45%; margin: 0 16px 20px 0; vertical-align: top; border: 1px solid #d5dde6; border-radius: 4px; padding: 4px; }
          img { width: 100%; border-radius: 2px; display: block; }
          figcaption { font-size: 11px; color: #52657b; margin-top: 6px; padding: 0 2px 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { font-family: "IBM Plex Mono", monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #52657b; background: #f7f9fc; }
          th, td { border: 1px solid #d5dde6; padding: 7px 8px; text-align: left; vertical-align: top; }
          td { font-variant-numeric: tabular-nums; }
          a { color: #1d5b93; }
          ul { margin: 0; padding-left: 18px; }
          .status {
            display: inline-block; padding: 7px 12px; border-radius: 3px; margin-top: 12px;
            font-family: "IBM Plex Mono", monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
            color: ${r.ready?`#177342`:`#9a5b00`};
            background: ${r.ready?`#e1f2e8`:`#fcefd3`};
            border: 1px solid ${r.ready?`#9cc7ae`:`#e3c27e`};
          }
${u}
        </style>
      </head>
      <body>
        ${f(i)}
        <header>
          <div class="letterhead">
            <div>
              <h1>Home Inspection Report</h1>
              <div class="brand-line">${v(e.inspector.company||`Inspector Gadgets`)}${e.inspector.license?` · ${v(e.inspector.license)}`:``}</div>
            </div>
            ${_(e.inspector.logoDataUrl)?`<img src="${_(e.inspector.logoDataUrl)}" alt="" width="72" style="max-height:72px;object-fit:contain;" />`:`<svg viewBox="0 0 44 44" width="52" height="52" fill="none" aria-hidden="true">
              <path d="M4 4h27l9 9v27H4z" stroke="#0b1d31" stroke-width="2.5" stroke-linejoin="round" />
              <path d="M12 22 22 12l10 10" stroke="#0b1d31" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 24.5 20.5 29 31 18" stroke="#f5a300" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 34h18" stroke="#0b1d31" stroke-width="2" stroke-linecap="round" opacity="0.55" />
            </svg>`}
          </div>
          <dl class="header-facts">${S}</dl>
          <p class="status">${r.ready?`Ready for inspector final export`:`Inspector review required before final export`}</p>
        </header>
        <section>
          <h2>Booking Intake</h2>
          <table><tbody>${g}</tbody></table>
        </section>
        <section>
          <h2>Findings</h2>
          ${a||`<p>No approved findings yet.</p>`}
        </section>
        ${p}
        <section>
          <h2>Photo Evidence</h2>
          ${l}
        </section>
        <section>
          <h2>Image Scan Evidence</h2>
          ${m||`<p>No completed image scans yet.</p>`}
        </section>
        <section>
          <h2>Public Records Research</h2>
          <p>Status: ${v(e.researchPacket?.status||`Not run`)}</p>
          <p>Matched address: ${v(e.researchPacket?.normalizedAddress||`Not populated`)}</p>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Status</th>
                <th>Link</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              ${h||`<tr><td colspan="4">No public-record research has been run.</td></tr>`}
            </tbody>
          </table>
        </section>
        <section>
          <h2>Selected Permits</h2>
          <table>
            <thead><tr><th>Type</th><th>Permit #</th><th>Issued</th><th>Final</th><th>Notes</th></tr></thead>
            <tbody>${b||`<tr><td colspan="5">No permits selected yet.</td></tr>`}</tbody>
          </table>
        </section>
        <section>
          <h2>Official Form Fields</h2>
          <table><tbody>${x}</tbody></table>
        </section>
        <section>
          <h2>Compliance Notes</h2>
          <ul>${n.disclaimers.map(e=>`<li>${v(e)}</li>`).join(``)}</ul>
        </section>
        <section>
          <h2>Audit Trail</h2>
          <p>Inspection ID: ${v(e.id)}</p>
          <p>Signed at: ${v(e.signedAt?o(e.signedAt):`Pending`)}</p>
          <p>Exported at: ${v(e.exportedAt?o(e.exportedAt):`Pending`)}</p>
        </section>
      </body>
    </html>
  `}function m(e,t=!1){let n=e.permitCandidates.map(e=>`
        <tr>
          <td>${v(e.type)}</td>
          <td>${v(e.permitNumber||`—`)}</td>
          <td>${v(e.applicationDate||`—`)}</td>
          <td>${v(e.scopeOfWork||e.title||`—`)}</td>
          <td>${v(e.issuedDate||`—`)}</td>
          <td>${v(e.finalDate||`—`)}</td>
          <td>${v(e.contractor||`—`)}</td>
          <td>${e.status===`selected`?`Selected`:`On file`}</td>
          <td>${e.sourceUrl?`<a href="${y(e.sourceUrl)}" rel="noopener noreferrer">source</a>`:`—`}</td>
        </tr>
      `).join(``),r=[[`Property`,`${e.property.address}, ${e.property.city}, ${e.property.state} ${e.property.postalCode}`],[`Owner`,e.property.ownerName||`Not populated`],[`Parcel / tax acct`,`${e.property.parcelId||`—`} / ${e.property.taxAccount||`—`}`],[`Inspector`,`${e.inspector.name} — ${e.inspector.license}`],[`Prepared`,o(new Date().toISOString())]].map(([e,t])=>`<div class="fact"><dt>${v(e)}</dt><dd>${v(t)}</dd></div>`).join(``);return`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Permit History (file copy) - ${v(e.property.address)}</title>
        <style>
          :root { color-scheme: light; }
          body { font-family: -apple-system, "Segoe UI", "Helvetica Neue", sans-serif; color: #0f2438; margin: 40px auto; max-width: 960px; padding: 0 24px; line-height: 1.5; font-size: 13px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          header { border-top: 6px solid #0b1d31; border-bottom: 1px solid #d5dde6; padding: 16px 0; margin-bottom: 20px; }
          .brand-line { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: #52657b; letter-spacing: 0.08em; text-transform: uppercase; margin: 4px 0 12px; }
          .file-note { display: inline-block; padding: 6px 12px; border-radius: 3px; font-family: ui-monospace, Menlo, monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #9a5b00; background: #fcefd3; border: 1px solid #e3c27e; }
          dl.header-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin: 12px 0 0; }
          .fact { display: grid; grid-template-columns: 150px 1fr; gap: 10px; padding: 4px 0; border-bottom: 1px dotted #e4eaf1; }
          .fact dt { font-family: ui-monospace, Menlo, monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #52657b; }
          .fact dd { margin: 0; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          th { font-family: ui-monospace, Menlo, monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #52657b; background: #f7f9fc; }
          th, td { border: 1px solid #d5dde6; padding: 7px 8px; text-align: left; vertical-align: top; }
          a { color: #1d5b93; }
${u}
        </style>
      </head>
      <body>
        ${f(t)}
        <header>
          <h1>Permit History</h1>
          <div class="brand-line">${v(e.inspector.company||`Inspector Gadgets`)}${e.inspector.license?` · ${v(e.inspector.license)}`:``}</div>
          <span class="file-note">Inspector file copy — not part of the client report</span>
          <dl class="header-facts">${r}</dl>
        </header>
        <table>
          <thead>
            <tr><th>Type</th><th>Permit #</th><th>Application date</th><th>Scope of work</th><th>Issued</th><th>Final</th><th>Contractor</th><th>Status</th><th>Source</th></tr>
          </thead>
          <tbody>${n||`<tr><td colspan="9">No permits on file.</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `}var h={satisfactory:`cond-ok`,marginal:`cond-marginal`,deficient:`cond-deficient`,not_present:`cond-na`,not_inspected:`cond-ni`};function g(t,s=!1){let d=t.request,p=t.property,m=[[`Client`,d.clientName],[`Phone`,d.phone],[`Email`,d.email],[`Property`,[p.address,p.city,p.state,p.postalCode].filter(Boolean).join(`, `)],[`Owner of record`,p.ownerName||``],[`Year built`,p.yearBuilt||``],[`Approx. area`,p.squareFeet?`${p.squareFeet} sq ft`:``],[`Occupancy`,p.occupancy||``],[`Inspection date`,t.inspectionDate||(d.appointmentStart?d.appointmentStart.slice(0,10):``)],[`Inspection type`,c(d.inspectionType)]].map(([e,t])=>`<div class="fact"><dt>${v(e)}</dt><dd>${v(t||`Not provided`)}</dd></div>`).join(``),g=n(t),y=g.length?g.map(e=>`
        <tr>
          <td>${v(e.systemLabel)}</td>
          <td>${v(e.componentLabel)}</td>
          <td><span class="cond ${h[e.condition]}">${v(r[e.condition])}</span></td>
          <td>${v(e.comment||`See system section.`)}</td>
        </tr>`).join(``):`<tr><td colspan="4">No deficiencies noted at the time of inspection.</td></tr>`,b=e.map(e=>{let n=e.components.map(e=>{let n=a(t,e.id);return`
          <tr>
            <td>${v(e.label)}</td>
            <td><span class="cond ${h[n.condition]}">${v(r[n.condition])}</span></td>
            <td>${n.comment?v(n.comment):`<span class='muted'>—</span>`}</td>
          </tr>`}).join(``);return`
      <section class="system">
        <h2>${v(e.label)} <span class="rule">${v(e.rule)}</span></h2>
        <p class="scope">${v(e.scope)}</p>
        <table>
          <thead><tr><th style="width:38%">Component</th><th style="width:22%">Condition</th><th>Comments</th></tr></thead>
          <tbody>${n}</tbody>
        </table>
      </section>`}).join(``),x=t.photos.filter(e=>e.url||e.thumbnailUrl).map(e=>`
        <figure>
          <img src="${v(e.thumbnailUrl||e.url)}" alt="${v(e.label)}" loading="lazy" />
          <figcaption>${v(e.label)}${e.location?` — ${v(e.location)}`:``}</figcaption>
        </figure>`).join(``),S=i.map(e=>`<li>${v(e)}</li>`).join(``);return`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Full Home Inspection Report — ${v(p.address)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" />
        <style>
          :root { color-scheme: light; }
          body { font-family: "Public Sans", -apple-system, "Segoe UI", sans-serif; color: #0f2438; margin: 40px auto; max-width: 900px; padding: 0 24px; line-height: 1.5; font-size: 13px; }
          h1 { font-family: "Archivo", sans-serif; font-size: 26px; letter-spacing: -0.015em; margin: 0 0 4px; }
          h2 { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #143c61; border-bottom: 2px solid #0f2438; padding-bottom: 6px; margin: 0 0 8px; display: flex; justify-content: space-between; align-items: baseline; }
          h2 .rule { font-size: 10px; color: #7a8794; letter-spacing: 0.04em; }
          header { border-top: 6px solid #0b1d31; border-bottom: 1px solid #d5dde6; padding: 18px 0; margin-bottom: 22px; }
          .letterhead { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 14px; }
          .brand-line { font-family: "IBM Plex Mono", monospace; font-size: 11px; color: #52657b; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }
          section { margin: 0 0 20px; }
          section.system { break-inside: avoid; }
          dl.header-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin: 0; }
          .fact { display: grid; grid-template-columns: 130px 1fr; gap: 10px; padding: 4px 0; border-bottom: 1px dotted #e4eaf1; }
          .fact dt { font-family: "IBM Plex Mono", monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #52657b; }
          .fact dd { margin: 0; font-size: 12.5px; }
          .scope { font-size: 12px; color: #3d4d5e; margin: 0 0 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { font-family: "IBM Plex Mono", monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #52657b; background: #f7f9fc; }
          th, td { border: 1px solid #d5dde6; padding: 7px 9px; text-align: left; vertical-align: top; }
          .muted { color: #9aa7b4; }
          .cond { display: inline-block; padding: 2px 8px; border-radius: 3px; font-family: "IBM Plex Mono", monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap; }
          .cond-ok { color: #177342; background: #e1f2e8; border: 1px solid #9cc7ae; }
          .cond-marginal { color: #9a5b00; background: #fcefd3; border: 1px solid #e3c27e; }
          .cond-deficient { color: #a3222b; background: #fbe3e4; border: 1px solid #e0a0a4; }
          .cond-na { color: #52657b; background: #eef2f6; border: 1px solid #cdd7e0; }
          .cond-ni { color: #7a8794; background: #f5f7f9; border: 1px solid #dde3e9; }
          ul.limits { margin: 0; padding-left: 18px; font-size: 12px; color: #3d4d5e; }
          ul.limits li { margin-bottom: 3px; }
          figure { display: inline-block; width: 30%; margin: 0 10px 14px 0; vertical-align: top; border: 1px solid #d5dde6; border-radius: 4px; padding: 4px; }
          figure img { width: 100%; border-radius: 2px; display: block; }
          figcaption { font-size: 10.5px; color: #52657b; margin-top: 5px; }
          .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 14px; }
          .sig .line { border-top: 1px solid #0f2438; padding-top: 5px; font-size: 11px; color: #52657b; min-height: 46px; display: flex; align-items: flex-end; }
          .sig img { max-height: 40px; margin-bottom: 4px; display: block; }
          .note { font-size: 11px; color: #52657b; background: #f7f9fc; border: 1px solid #dde3e9; border-radius: 4px; padding: 10px 12px; }
${u}
        </style>
      </head>
      <body>
        ${f(s)}
        <header>
          <div class="letterhead">
            <div>
              <h1>Full Home Inspection Report</h1>
              <div class="brand-line">${v(t.inspector.company||`Inspector Gadgets`)}${t.inspector.license?` · ${v(t.inspector.license)}`:``}</div>
            </div>
            ${_(t.inspector.logoDataUrl)?`<img src="${_(t.inspector.logoDataUrl)}" alt="" width="72" style="max-height:72px;object-fit:contain;" />`:``}
          </div>
          <dl class="header-facts">${m}</dl>
        </header>

        <section>
          <h2>Scope of Inspection</h2>
          <p class="scope">${v(l)}</p>
        </section>

        <section>
          <h2>Standards &amp; Limitations</h2>
          <p class="scope">In accordance with the Florida Standards of Practice (Rule 61-30, F.A.C.), this inspection is <strong>not</strong> required to:</p>
          <ul class="limits">${S}</ul>
        </section>

        <section>
          <h2>Summary of Deficiencies</h2>
          <table>
            <thead><tr><th>System</th><th>Component</th><th>Condition</th><th>Comment</th></tr></thead>
            <tbody>${y}</tbody>
          </table>
        </section>

        ${b}

        <section>
          <h2>Photo Evidence</h2>
          ${x||`<p class='muted'>No photos attached.</p>`}
        </section>

        <section>
          <h2>Inspector Certification</h2>
          <p class="note">This inspection and report were prepared for the named client and reflect the condition of the readily accessible, visually observed systems and components at the date and time of inspection. It is not a warranty or guarantee of any kind.</p>
          <div class="sig">
            <div>
              ${_(t.signatureDataUrl)?`<img src="${_(t.signatureDataUrl)}" alt="Inspector signature" />`:``}
              <div class="line">Inspector — ${v(t.inspector.name||``)}${t.inspector.license?` (${v(t.inspector.license)})`:``}</div>
            </div>
            <div>
              <div class="line">Date — ${v(t.signedAt?o(t.signedAt):t.inspectionDate||``)}</div>
            </div>
          </div>
        </section>
      </body>
    </html>
  `}function _(e){let t=String(e??``);return/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(t)?t:``}function v(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function y(e){let t=e.trim(),n=t.replace(/[\u0000-\u0020]+/g,``).toLowerCase();return/^(javascript|data|vbscript):/.test(n)?`#`:v(t)}export{g as buildFullHomeReportHtml,m as buildPermitHistoryHtml,p as buildPrintableReportHtml,f as watermarkOverlay};