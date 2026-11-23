import { CodeFormat } from '../types/index.ts';

export const SAMPLES: Record<CodeFormat, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeGuard Demo App</title>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <style>
    :root {
      --cg-accent: #0284c7;
      --cg-surface: #ffffff;
      --cg-text: #0f172a;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 24px;
      background-color: #f1f5f9;
      color: var(--cg-text);
    }
    .portal-card {
      background: var(--cg-surface);
      border-radius: 12px;
      padding: 24px;
      max-width: calc(100% - 32px);
      width: 560px;
      margin: 0 auto;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }
    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      margin-top: 12px;
      box-sizing: border-box;
    }
    .btn-primary {
      margin-top: 14px;
      background-color: var(--cg-accent);
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    @media (max-width: 640px) {
      .portal-card {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="portal-card" id="user-portal">
    <h2>Secure Web Application Portal</h2>
    <p>Type a note below and click Run Action to verify inputs, CSS, and scripts remain 100% functional.</p>
    <input type="text" id="noteInput" class="search-input" placeholder="Type anything here to test input..." />
    <button class="btn-primary" id="runBtn" onclick="handlePortalAction()">Run Action</button>
    <div id="statusBox" style="margin-top:12px;font-size:13px;color:#0369a1;"></div>
  </div>

  <script>
    function handlePortalAction() {
      var input = document.getElementById('noteInput');
      var status = document.getElementById('statusBox');
      var msg = (input && input.value.trim()) ? input.value.trim() : 'Default Portal Check';
      if (status) {
        status.textContent = 'Verified: ' + msg + ' at ' + new Date().toLocaleTimeString();
      }
    }
  </script>

  <script type="module">
    const appState = {
      name: 'CodeGuardProtectedModule',
      initializedAt: Date.now()
    };
    window.__cgModuleReady = appState;
  </script>
</body>
</html>`,

  blogger: `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:version='2' class='v2' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta content='width=device-width, initial-scale=1' name='viewport'/>
  <title><data:blog.pageTitle/></title>

  <b:skin><![CDATA[
    body {
      background-color: #f8fafc;
      color: #0f172a;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .site-header {
      background: #0284c7;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .post-outer {
      background: #ffffff;
      margin: 16px auto;
      max-width: 720px;
      padding: 18px;
      border-radius: 8px;
    }
    .site-footer {
      text-align: center;
      padding: 16px;
      font-size: 13px;
      color: #64748b;
    }
  ]]></b:skin>

  <script type='text/javascript'>
  //<![CDATA[
    function initBloggerTheme() {
      var themeKey = 'BLOGGER_PRO_THEME_2026';
      window.__bloggerThemeActive = themeKey;
    }
    initBloggerTheme();
  //]]>
  </script>
</head>
<body>
  <header class='site-header'>
    <h2>My Blogger Portal</h2>
    <p>Protected static header content</p>
  </header>

  <div class='content-outer'>
    <b:section id='main' showaddelement='no'>
      <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog'>
        <b:includable id='main'>
          <b:loop values='data:posts' var='post'>
            <article class='post-outer' expr:id='data:post.id'>
              <h2 class='post-title'><data:post.title/></h2>
              <div class='post-body'><data:post.body/></div>
            </article>
          </b:loop>
        </b:includable>
      </b:widget>
    </b:section>
  </div>

  <footer class='site-footer'>
    <span>All rights reserved.</span>
  </footer>
</body>
</html>`
};
