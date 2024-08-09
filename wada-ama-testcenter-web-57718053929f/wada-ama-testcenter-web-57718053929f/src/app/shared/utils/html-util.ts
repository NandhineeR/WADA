export function isTotallyVisible(el: HTMLElement): boolean {
    const { top, bottom } = el.getBoundingClientRect();

    // Only completely visible elements
    return top >= 0 && bottom <= window.innerHeight;
}

export function scrollELementById(id: string): void {
    const topNotification = document.getElementById(id);
    if (topNotification && !isTotallyVisible(topNotification)) {
        topNotification.scrollIntoView();
    }
}
