// A page asks only a visitor who arrived signed out to sign in. A session that ends on
// the page is handled where it ends: a sign-out from the Account sheet leaves for the
// home page with the sheet closed, and a 401 opens the sheet from the request that hit it.
export const shouldPromptSignIn = ({
  isSignedOut,
  hasBeenSignedIn,
}: {
  isSignedOut: boolean;
  hasBeenSignedIn: boolean;
}) => isSignedOut && !hasBeenSignedIn;
