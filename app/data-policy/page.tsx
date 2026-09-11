export const metadata = { title: 'Data Retention & Deletion | BuildFlow HQ' }

export default function DataPolicy() {
  return <main style={{maxWidth:900,margin:'0 auto',padding:'48px 24px',fontFamily:'system-ui',lineHeight:1.65,color:'#172033'}}>
    <h1>BuildFlow HQ Data Retention & Deletion Policy</h1>
    <p><strong>Effective:</strong> September 10, 2026</p>
    <p>BuildFlow HQ follows data-minimization principles and retains information only for legitimate product, security, contractual, and legal purposes.</p>
    <h2>Active accounts</h2><p>Operational records are retained while an account is active when needed to provide requested features, maintain records, prevent abuse, and meet applicable obligations.</p>
    <h2>Financial integrations</h2><p>Financial data and integration tokens are retained only while needed for an authorized feature or other legitimate requirement. When a user disconnects an integration, BuildFlow HQ will revoke or disable provider access where supported and delete eligible stored integration data according to the deletion process, except information that must be retained for security, fraud prevention, dispute handling, or law.</p>
    <h2>Deletion requests</h2><p>Verified users may request deletion of eligible personal data. BuildFlow HQ will validate the requester, identify affected tenant records, delete or de-identify eligible information from active systems, and record completion of the request. Data in protected backups may remain until normal backup expiration and will not be restored for ordinary business use after a completed deletion request.</p>
    <h2>Account closure</h2><p>When an account is closed, eligible tenant data will be scheduled for deletion after any necessary transition, security, billing, contractual, or legal retention period.</p>
    <h2>Legal and security holds</h2><p>Information may be retained longer when reasonably necessary to satisfy law, resolve disputes, investigate fraud or security incidents, enforce agreements, or protect users and the service.</p>
    <h2>Review</h2><p>This policy is reviewed at least annually and when BuildFlow HQ materially changes its data practices or financial integrations.</p>
  </main>
}
