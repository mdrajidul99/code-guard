export const SAMPLES = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Application Portal</title>
  <!-- Main application stylesheet -->
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 24px;
      background-color: #f8fafc;
      color: #0f172a;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background-color: #e0f2fe;
      color: #0369a1;
    }
    .btn-action {
      background-color: #0284c7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    .btn-action:hover {
      background-color: #0369a1;
    }
  </style>
</head>
<body>
  <div class="card" id="user-portal">
    <span class="badge">Production Verified</span>
    <h2>Secure Client Dashboard</h2>
    <p>Welcome to the client portal. This interface contains sensitive markup and embedded logic.</p>
    
    <div class="action-row">
      <button class="btn-action" id="trigger-sync" onclick="handleSync()">Sync Node Status</button>
    </div>
  </div>

  <!-- Client-side telemetry and event hooks -->
  <script>
    function handleSync() {
      const timestamp = new Date().toISOString();
      console.log('Synchronizing node status at: ' + timestamp);
      const portal = document.getElementById('user-portal');
      if (portal) {
        portal.style.borderColor = '#0284c7';
      }
    }
  </script>
</body>
</html>`,

  javascript: `/**
 * License: Proprietary Client Logic
 * Author: MRS Engineers BD
 */
function initializeSecurityMatrix(secretToken, accessLevel) {
  // Validate token credentials
  const systemPrefix = "SYS_AUTH_NODE_";
  const verifiedStatus = "AUTHORIZED_SESSION";
  let attemptCounter = 0;
  
  if (!secretToken || accessLevel < 2) {
    console.warn("Invalid access level or credential provided.");
    return false;
  }

  function computeHashSignature(inputKey) {
    let hash = 5381;
    for (let i = 0; i < inputKey.length; i++) {
      hash = ((hash << 5) + hash) + inputKey.charCodeAt(i);
    }
    return Math.abs(hash).toString(16);
  }

  const generatedSignature = computeHashSignature(secretToken);
  const fullSessionId = systemPrefix + generatedSignature;

  console.log("Session verified:", verifiedStatus, "Session ID:", fullSessionId);
  return {
    status: verifiedStatus,
    sessionId: fullSessionId,
    verifiedAt: Date.now()
  };
}

// Execute initial handshake
const authResult = initializeSecurityMatrix("AlphaSecToken_9921", 3);
`,

  css: `/* Modern Corporate Theme Stylesheet */
:root {
  --primary-accent: #0284c7;
  --primary-dark: #0f172a;
  --neutral-surface: #ffffff;
  --border-subtle: #e2e8f0;
  --font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Global Reset and Foundation */
* {
  box-sizing: border-box;
  margin: 0px;
  padding: 0px;
}

body {
  font-family: var(--font-stack);
  background-color: var(--primary-dark);
  color: #f1f5f9;
  line-height: 1.6;
}

.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
}

.navigation-bar .brand-logo {
  font-size: 20px;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: -0.025em;
}

@media (max-width: 768px) {
  .navigation-bar {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
  }
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(56, 189, 248, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
  }
}
`,

  blogger: `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:version='2' class='v2' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta content='width=device-width, initial-scale=1' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  
  <b:skin><![CDATA[
    /* Custom Blogger Skin Styles */
    body {
      background-color: #ffffff;
      color: #333333;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .header-outer {
      background: #0284c7;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .post-outer {
      padding: 15px;
      border-bottom: 1px solid #eeeeee;
    }
  ]]></b:skin>
</head>
<body>
  <div class='header-outer'>
    <b:section id='header' maxwidgets='1' showaddelement='no'>
      <b:widget id='Header1' locked='true' title='My Custom Blog' type='Header'>
        <b:includable id='main'>
          <div class='titlewrapper'>
            <h1 class='title'>
              <data:title/>
            </h1>
          </div>
        </b:includable>
      </b:widget>
    </b:section>
  </div>

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
</body>
</html>`
};
