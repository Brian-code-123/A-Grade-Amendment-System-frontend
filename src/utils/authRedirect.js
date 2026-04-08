export function getPostLoginRoute(user) {
  const role = user?.role

  if (role === 'admin') {
    return '/admin'
  }

  if (role === 'Head' || role === 'Programme Director') {
    return '/pd-approvals'
  }

  return '/amendments'
}
