export const NAV_THEME = {
    light: {
        background: 'hsl(107 42% 100%)', // background
        border: 'hsl(107 4% 90%;)', // border
        card: 'hsl(107 62% 0%)', // card
        notification: 'hsl(0 84.2% 60.2%)', // destructive
        primary: 'hsl(107 98% 15%)', // primary
        text: 'hsl(240 10% 3.9%)', // foreground
    },
    dark: {
        background: 'hsl(107 51% 1%)', // background
        border: 'hsl(107 4% 12%)', // border
        card: 'hsl(107 51% 2%)', // card
        notification: 'hsl(0 72% 51%)', // destructive
        primary: 'hsl(107 98% 15%)', // primary
        text: 'hsl(0 0% 98%)', // foreground
    },
};

export const FONTS = {
    primary: 'IBMPlexSans',
    medium: 'IBMPlexSans-Medium',
    semiBold: 'IBMPlexSans-SemiBold',
    bold: 'IBMPlexSans-Bold',
} as const;