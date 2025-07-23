const navConfig = {
    'super-admin': [
        {
            label: 'Dashboard',
            path: '/super-admin/dashboard',
            icon: '/svg/dashboard.svg'
        },
        {
            label: 'User Management',
            path: '/super-admin/users',
            icon: '/icons/users.png'
        },
        {
            label: 'Plan Management',
            path: '/super-admin/plans',
            icon: '/svg/plans.svg'
        },
        {
            label: 'Promocodes',
            path: '/super-admin/promocodes',
            icon: '/svg/promocodes.svg'
        },
        {
            label: 'System Analytics',
            path: '/super-admin/analytics',
            icon: '/svg/analytics.svg'
        }
    ],
    admin: [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: '/svg/dashboard.svg'
        },
        {
            label: 'Create Events',
            path: '/create-event',
            icon: '/svg/create-event.svg'
        },
        {
            label: 'My Plans',
            path: '/plans/selection',
            icon: '/svg/dashboard.svg'
        },
        {
            label: 'Event Promocodes',
            path: '/event-promocodes',
            icon: '/svg/setting.svg'
        },
        {
            label: 'Payment History',
            path: '/reports',
            icon: '/svg/create-event.svg'
        },
        {
            label: 'Profile',
            path: '/profile',
            icon: '/svg/bulk-add.svg'
        },
    ],
    user: [
        {
            label: 'Home',
            path: '/',
            icon: '/icons/home.png'
        },
        {
            label: 'Profile',
            path: '/profile',
            icon: '/icons/profile.png'
        }
    ]
};

export default navConfig;