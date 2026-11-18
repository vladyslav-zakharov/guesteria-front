export type CheckoutView = 'loading' | 'error' | 'signIn' | 'flow';

// Once the page has seen a user, the flow stays mounted: a failed refetch of `me` (bad
// network on returning to the tab) or a session that ended must not throw away a prebook
// or book in flight, which could lead the guest to book twice. The flow's own requests
// answer 401 and open the auth sheet. The error and sign-in screens are only for the
// first account check.
export const getCheckoutView = ({
  hasKnownUser,
  isPending,
  isLoadingError,
}: {
  hasKnownUser: boolean;
  isPending: boolean;
  isLoadingError: boolean;
}): CheckoutView => {
  if (hasKnownUser) {
    return 'flow';
  }

  if (isPending) {
    return 'loading';
  }

  return isLoadingError ? 'error' : 'signIn';
};
