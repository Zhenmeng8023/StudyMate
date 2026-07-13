type ShellNavItem = {
  key: string;
  label: string;
  icon: string;
  badge?: string;
};

type ShellNavGroup = {
  group: string;
  items: ShellNavItem[];
};

type ShellProfile = {
  displayName?: string | null;
  role?: string | null;
};

export function buildAdminWorkspaceShellProps(input: {
  activeDescription: string;
  activeGroup: string;
  activeTitle: string;
  activeView: string;
  countLabel: string;
  errorMessage: string;
  loading: boolean;
  navGroups: ShellNavGroup[];
  notice: string;
  profile: ShellProfile | null;
  profileInitial: string;
}) {
  return {
    activeDescription: input.activeDescription,
    activeGroup: input.activeGroup,
    activeTitle: input.activeTitle,
    activeView: input.activeView,
    countLabel: input.countLabel,
    errorMessage: input.errorMessage,
    loading: input.loading,
    navGroups: input.navGroups,
    notice: input.notice,
    profile: input.profile,
    profileInitial: input.profileInitial
  };
}
