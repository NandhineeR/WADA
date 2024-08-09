import { animate, animateChild, query, style, transition } from '@angular/animations';

const OUT = style({
    opacity: 0,
    width: '100%',
    height: 0,
    overflow: 'hidden',
});

const OUT_SIMPLE = style({
    opacity: 0,
    overflow: 'hidden',
});

const ANIMATION_TIME = '500ms';

export const DELAYED_FADE_IN = transition(':enter', [OUT, animate(ANIMATION_TIME, OUT), animate(ANIMATION_TIME)]);

export const FADE_IN = transition(':enter', [OUT, animate(ANIMATION_TIME)]);

export const FADE_IN_SIMPLE = transition(':enter', [OUT_SIMPLE, animate(ANIMATION_TIME)]);

export const FADE_OUT = transition(':leave', [animate(ANIMATION_TIME, OUT)]);

export const ANIMATE_CHILD_OUT = transition(':leave', [query('@fadeInOut', animateChild())]);

export const FADE_IN_FADE_OUT = [
    transition(':enter', [
        // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 })),
    ]),
    transition(':leave', [
        // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 })),
    ]),
];
