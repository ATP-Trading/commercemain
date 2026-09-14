/** Appstle owns and updates this subscription status; customer tags alone are not proof. */
export function getActiveAtpSubscription(value: string | null | undefined) {
  if (!value) return null;
  try {
    const subscriptions: unknown = JSON.parse(value);
    if (!Array.isArray(subscriptions)) return null;
    return subscriptions.find((subscription) =>
      subscription && typeof subscription === 'object' &&
      subscription.status === 'active' &&
      (typeof subscription.id === 'number' || typeof subscription.id === 'string') &&
      Array.isArray(subscription.variantIds) &&
      subscription.variantIds.some((id: unknown) => String(id) === '46301020094702')
    ) ?? null;
  } catch {
    return null;
  }
}
