import { usePage } from "@inertiajs/react";

type SharedProps = {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      role_id: number;
      role_name: string;
      role_label: string;
    } | null;
    permissions: Record<string, boolean>;
  };
};

export function useAuth() {
  const { auth } = usePage<SharedProps>().props;
  const user = auth?.user ?? null;
  const permissions = auth?.permissions ?? {};
  const roleName = user?.role_name ?? "warga";

  /**
   * Check if the current user has permission for a module + action.
   * Usage: can('warga', 'create')
   */
  function can(module: string, action: string): boolean {
    if (roleName === "super_admin") return true;
    return permissions[`${module}.${action}`] === true;
  }

  return {
    user,
    permissions,
    can,
    roleName,
    roleLabel: user?.role_label ?? "Warga",
    // Backward compat helpers
    role: roleName,
    isSuperAdmin: roleName === "super_admin",
    isPengurus: roleName === "pengurus",
    isWarga: roleName === "warga",
  };
}

// Backward compat: export useRole as alias
export const useRole = useAuth;
