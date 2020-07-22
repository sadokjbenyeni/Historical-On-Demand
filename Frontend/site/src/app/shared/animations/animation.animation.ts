import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from "@angular/animations";

export const translateAnimation: AnimationTriggerMetadata[] = [
    // trigger(
    //     'slideView',
    //     [
    //         state('true', style({ transform: 'translateY(100%)', opacity: 0 })),
    //         state('false', style({ transform: 'translateY(0)', opacity: 1 })),
    //         transition('0 => 1', animate('600ms', style({ transform: 'translateY(0)', 'opacity': 1 }))),
    //         transition('1 => 1', animate('600ms', style({ transform: 'translateY(100%)', 'opacity': 0 }))),
    //     ]),

    trigger('slideInOutContact', [
        transition(':enter', [
            style({ transform: 'translateY(69%)', opacity: 0 }),
            animate('300ms ease-in', style({ transform: 'translateY(0%)', 'opacity': 1 }))
        ]),

        transition(':leave', [
            style({ transform: 'translateY(0%)', opacity: 1 }),
            animate('0ms ease-in', style({ transform: 'translateY(69%)', 'opacity': 0 }))
        ])
    ]),


    trigger('slideInOutBilling', [
        transition(':enter', [
            style({ transform: 'translateY(69%)', opacity: 0 }),
            animate('300ms ease-in', style({ transform: 'translateY(0%)', 'opacity': 1 }))
        ]),

        transition(':leave', [
            style({ transform: 'translateY(0%)', opacity: 1 }),
            animate('0ms ease-in', style({ transform: 'translateY(69%)', 'opacity': 0 }))
        ])
    ]),


    trigger('slideInOutLogin', [
        transition(':enter', [
            style({ transform: 'translateY(280%)', opacity: 0 }),
            animate('250ms ease-in', style({ transform: 'translateY(0%)', 'opacity': 1 }))
        ]),

        transition(':leave', [
            style({ transform: 'translateY(0%)', opacity: 1 }),
            animate('0ms ease-in', style({ transform: 'translateY(280%)', 'opacity': 0 }))
        ])
    ])
]
