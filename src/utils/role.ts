export const normalizeRoleName = (roleName?: string | null) => {
  if (!roleName) return roleName;
  return roleName.replace(/^ROLE_/, '');
};

/** Map API role (ROLE_USER / USER / …) to UI role used by AdminRoute / Header. */
export function mapApiRoleToUi(roleName: string | null | undefined): 'CUSTOMER' | 'ADMIN' {
  const n = normalizeRoleName(roleName) ?? '';
  if (n === 'ADMIN') return 'ADMIN';
  return 'CUSTOMER';
}
