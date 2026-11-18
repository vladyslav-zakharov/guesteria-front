// The element to hand focus back to once a sheet opened from it closes. Safari does not
// focus a button on click, so a caller that has the clicked element passes it instead.
export const getFocusedElement = (): HTMLElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const { activeElement } = document;

  return activeElement instanceof HTMLElement && activeElement !== document.body
    ? activeElement
    : null;
};

// The opener may have left the page (a sheet opened from another sheet), and focusing a
// detached element would drop focus on <body>, so the sheet's default is kept then.
export const restoreFocus = ({
  event,
  target,
}: {
  event: Event;
  target: HTMLElement | null;
}) => {
  if (target?.isConnected) {
    event.preventDefault();
    target.focus();
  }
};
