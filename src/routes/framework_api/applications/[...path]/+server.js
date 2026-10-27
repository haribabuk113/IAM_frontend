import { make_proxy } from '$lib/server/proxy.js';

// Browser -> backend proxy for your own applications (Easy Apply, external
// confirmations, today's free quota).
export const { GET, POST, PUT, PATCH, DELETE } = make_proxy('applications', [
    { pattern: /^$/, methods: ['GET', 'POST'] },
    { pattern: /^external$/, methods: ['POST'] },
    { pattern: /^quota$/, methods: ['GET'] }
]);
