export function shellAccountModel(summary) {
  if (!summary) return { authenticated: false };
  return {
    authenticated: true,
    displayName: summary.user.displayName,
    avatarUrl: summary.user.avatarUrl,
    unreadNotifications: summary.counts.unreadNotifications,
  };
}
