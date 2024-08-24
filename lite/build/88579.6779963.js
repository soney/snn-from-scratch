"use strict";(self.webpackChunk_JUPYTERLAB_CORE_OUTPUT=self.webpackChunk_JUPYTERLAB_CORE_OUTPUT||[]).push([[88579,3694],{88579:(e,t,o)=>{o.r(t),o.d(t,{default:()=>v});var a=o(86691),n=o(82092),r=o(22857),i=o(26862),c=o(26591),s=o(30268),l=o(98036),d=o(30489),p=o(22083),m=o(11684),u=o(33625),g=o(63485),h=o(30653),f=o(52850),b=o.n(f);const y=new RegExp("/(lab|tree|notebooks|edit|consoles)\\/?");var w;!function(e){e.about="application:about",e.docmanagerDownload="docmanager:download",e.filebrowserDownload="filebrowser:download",e.copyShareableLink="filebrowser:share-main"}(w||(w={}));const _="jupyterlite",v=[{id:"@jupyterlite/application-extension:about",autoStart:!0,requires:[d.ITranslator],optional:[n.ICommandPalette,s.IMainMenu],activate:(e,t,o,a)=>{const{commands:r}=e,i=t.load(_),c=i.__("Help");r.addCommand(w.about,{label:i.__("About %1",e.name),execute:()=>{const t=i.__("Version %1",e.version),o=b().createElement("span",{className:"jp-About-version-info"},b().createElement("span",{className:"jp-About-version"},t)),a=b().createElement("span",{className:"jp-About-header"},b().createElement("div",{className:"jp-About-header-info"},b().createElement(m.liteWordmark.react,{height:"auto",width:"196px"}),o)),r=b().createElement("span",{className:"jp-About-externalLinks"},b().createElement("a",{href:"https://github.com/jupyterlite/jupyterlite/graphs/contributors",target:"_blank",rel:"noopener noreferrer",className:"jp-Button-flat"},i.__("CONTRIBUTOR LIST")),b().createElement("a",{href:"https://github.com/jupyterlite/jupyterlite",target:"_blank",rel:"noopener noreferrer",className:"jp-Button-flat"},i.__("JUPYTERLITE ON GITHUB"))),c=b().createElement("span",{className:"jp-About-copyright"},i.__("© 2021-2022 JupyterLite Contributors")),s=b().createElement("div",{className:"jp-About-body"},r,c);return(0,n.showDialog)({title:a,body:s,buttons:[n.Dialog.createButton({label:i.__("Dismiss"),className:"jp-About-button jp-mod-reject jp-mod-styled"})]})}}),o&&o.addItem({command:w.about,category:c}),a&&a.helpMenu.addGroup([{command:w.about}],0)}},{id:"@jupyterlite/application-extension:download",autoStart:!0,requires:[d.ITranslator,i.IDocumentManager],optional:[n.ICommandPalette,c.IFileBrowserFactory],activate:(e,t,o,a,r)=>{const i=t.load(_),{commands:c,serviceManager:s,shell:l}=e,{contents:d}=s,m=()=>{const{currentWidget:e}=l;return!(!e||!o.contextForWidget(e))},u=async(e,t)=>{var o,a,n;const r=await d.get(e,{content:!0}),i=document.createElement("a");if("notebook"===r.type||"json"===r.format){const e=null!==(o=r.mimetype)&&void 0!==o?o:"text/json",t=JSON.stringify(r.content,null,2);i.href=`data:${e};charset=utf-8,${encodeURIComponent(t)}`}else{if("file"!==r.type)throw new Error(`Content whose type is "${r.type}" cannot be downloaded`);if("base64"===r.format){const e=null!==(a=r.mimetype)&&void 0!==a?a:"application/octet-stream";i.href=`data:${e};base64,${r.content}`}else{const e=null!==(n=r.mimetype)&&void 0!==n?n:"text/plain";i.href=`data:${e};charset=utf-8,${encodeURIComponent(r.content)}`}}i.download=t,document.body.appendChild(i),i.click(),document.body.removeChild(i)};c.addCommand(w.docmanagerDownload,{label:i.__("Download"),caption:i.__("Download the file to your computer"),isEnabled:m,execute:async()=>{const e=l.currentWidget;if(!m()||!e)return;const t=o.contextForWidget(e);if(!t)return(0,n.showDialog)({title:i.__("Cannot Download"),body:i.__("No context found for current widget!"),buttons:[n.Dialog.okButton({label:i.__("OK")})]});await t.save(),await u(t.path,t.path)}});const g=i.__("File Operations");if(a&&a.addItem({command:w.docmanagerDownload,category:g}),r){const{tracker:e}=r;c.addCommand(w.filebrowserDownload,{execute:async()=>{const t=e.currentWidget;t&&Array.from(t.selectedItems()).forEach((async e=>{"directory"!==e.type&&await u(e.path,e.name)}))},icon:p.downloadIcon.bindprops({stylesheet:"menuItem"}),label:i.__("Download")})}}},{id:"@jupyterlite/application-extension:logo",optional:[a.ILabShell],autoStart:!0,activate:(e,t)=>{if(!t)return;const o=new g.Widget;m.liteIcon.element({container:o.node,elementPosition:"center",margin:"2px 2px 2px 8px",height:"auto",width:"16px"}),o.id="jp-MainLogo",t.add(o,"top",{rank:0})}},{id:"@jupyterlite/application-extension:notify-commands",autoStart:!0,optional:[a.ILabShell],activate:(e,t)=>{t&&t.layoutModified.connect((()=>{e.commands.notifyCommandChanged()}))}},{id:"@jupyterlite/application-extension:opener",autoStart:!0,requires:[a.IRouter,i.IDocumentManager],optional:[a.ILabShell,l.ISettingRegistry],activate:(e,t,o,a,n)=>{const{commands:i,docRegistry:c}=e,s="router:tree";i.addCommand(s,{execute:s=>{var l;const d=s,{request:p,search:m}=d;if(null!==(l=p.match(y))&&void 0!==l&&!l)return;const u=new URLSearchParams(m),g=u.getAll("path");if(0===g.length)return;const h=g.map((e=>decodeURIComponent(e)));e.started.then((async()=>{var e;const s=r.PageConfig.getOption("notebookPage"),[l]=h;if("tree"===s){let e="/edit";"Notebook"===c.defaultWidgetFactory(l).name&&(e="/notebooks");const t=r.PageConfig.getBaseUrl(),o=new URL(r.URLExt.join(t,e,"index.html"));return o.searchParams.append("path",l),void(window.location.href=o.toString())}if("consoles"!==s)if("notebooks"===s||"edit"===s){let t=c.defaultWidgetFactory(l).name;if(n){const e=(await n.load("@jupyterlab/docmanager-extension:plugin")).get("defaultViewers").composite;c.getFileTypesForPath(l).forEach((o=>{void 0!==e[o.name]&&c.getWidgetFactory(e[o.name])&&(t=e[o.name])}))}const a=null!==(e=u.get("factory"))&&void 0!==e?e:t;o.open(l,a,void 0,{ref:"_noref"})}else{h.forEach((e=>o.open(e)));const e=new URL(r.URLExt.join(r.PageConfig.getBaseUrl(),p));e.searchParams.delete("path");const{pathname:n,search:c}=e;if(t.navigate(`${n}${c}`,{skipRouting:!0}),a){const e=()=>{i.execute("docmanager:show-in-file-browser"),a.currentChanged.disconnect(e)};a.currentChanged.connect(e)}}else i.execute("console:create",{path:l})}))}}),t.register({command:s,pattern:y})}},{id:"@jupyterlite/application-extension:session-context-patch",autoStart:!0,requires:[i.IDocumentManager,i.IDocumentWidgetOpener],activate:(e,t,o)=>{const a=e.serviceManager.contents;o.opened.connect(((e,o)=>{var n;const r=t.contextForWidget(o);if(""===a.driveName(null!==(n=null==r?void 0:r.path)&&void 0!==n?n:""))return;const i=o.context.sessionContext;i._name=null==r?void 0:r.path,i._path=null==r?void 0:r.path}))}},{id:"@jupyterlite/application-extension:share-file",requires:[c.IFileBrowserFactory,d.ITranslator],autoStart:!0,activate:(e,t,o)=>{const a=o.load(_),{commands:i,docRegistry:c}=e,{tracker:s}=t,l=(0,h.jS)("--room","").trim(),d="true"===r.PageConfig.getOption("collaborative")&&l;i.addCommand(w.copyShareableLink,{execute:()=>{const e=s.currentWidget;if(!e)return;const t=r.PageConfig.getBaseUrl();let o=r.PageConfig.getOption("appUrl");const a=Array.from((0,u.filter)(e.selectedItems(),(e=>"directory"!==e.type)));if(!a.length)return;if("/tree"===o){const[e]=a;o="Notebook"===c.defaultWidgetFactory(e.path).name?"/notebooks":"/edit"}const i=new URL(r.URLExt.join(t,o,"index.html"));a.forEach((e=>{i.searchParams.append("path",e.path)})),d&&i.searchParams.append("room",l),n.Clipboard.copyToSystem(i.href)},isVisible:()=>!!s.currentWidget&&Array.from(s.currentWidget.selectedItems()).length>=1,icon:p.linkIcon.bindprops({stylesheet:"menuItem"}),label:a.__("Copy Shareable Link")})}}]}}]);
//# sourceMappingURL=88579.6779963.js.map