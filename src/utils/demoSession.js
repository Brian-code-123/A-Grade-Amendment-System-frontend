// Sample accounts for the demo sign-in buttons. Loaded on demand and only when
// demo mode is enabled (see src/config/demo.js).
const demoSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

const DEMO_USERS = {
  pd: {
    email: 'martin.choy@hkbu.edu.hk',
    name: 'Dr. Martin Choy',
    role: 'Programme Director',
    signature: demoSignature
  },
  head: {
    email: 'head.dept@hkbu.edu.hk',
    name: 'Prof. David Wong',
    role: 'Head',
    signature: demoSignature
  }
}

export function startDemoSession(kind, auth, router) {
  const user = DEMO_USERS[kind]
  if (!user) return
  auth.setAuth('demo_token_' + kind + '_' + Date.now(), user)
  router.replace(auth.resolveLandingRoute(user))
}
