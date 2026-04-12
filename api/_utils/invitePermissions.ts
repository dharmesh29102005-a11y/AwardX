const ALLOWED_ROLE_NAMES = new Set(['admin', 'program manager']);
const ALLOWED_PERMISSION_KEYS = new Set(['manage_teams', 'manage_programs']);

export async function canManageInvites(supabase: any, userId: string, organizationId: string) {
  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select('status, roles(name, permissions)')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error || !memberships || memberships.length === 0) {
    return false;
  }

  return memberships.some((membership: any) => {
    const roleName = String(membership.roles?.name || '').toLowerCase().trim();
    const rolePermissions = Array.isArray(membership.roles?.permissions)
      ? membership.roles.permissions.map((value: unknown) => String(value).toLowerCase().trim())
      : [];

    return ALLOWED_ROLE_NAMES.has(roleName) || rolePermissions.some((key: string) => ALLOWED_PERMISSION_KEYS.has(key));
  });
}
