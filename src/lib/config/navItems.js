const navConfig = {
    superAdmin: [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: '/svg/dashboard.svg'
        },
        {
            label: 'User Management',
            path: '/users',
            icon: '/icons/users.png'
        },
        {
            label: 'Settings',
            path: '/settings',
            icon: '/icons/settings.png'
        }
    ],
    admin: [
        {
            label: 'Dashboard',
            path: '/dashboard/',
            icon: '/svg/dashboard.svg'
        },
        {
            label: 'Create Events',
            path: '/create-event',
            icon: '/svg/create-event.svg'
        }
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
