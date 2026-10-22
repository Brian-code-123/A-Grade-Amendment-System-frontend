// Demo sign-in is for development and demonstrations only.
// Production builds hide it unless VITE_ENABLE_DEMO=true is set at build time.
export const demoEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === 'true'
