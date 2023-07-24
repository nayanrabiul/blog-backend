const crud = [
    {
        name: 'Create',
        permission: 'create',
    },
    {
        name: 'Edit',
        permission: 'edit',
    },
    {
        name: 'Delete',
        permission: 'delete',
    },
    {
        name: 'Show',
        permission: 'show',
    },
];

const modules = [
    {
        name: 'Roles',
        permission: 'role',
        child: crud,
    },
    {
        name: 'Article Order',
        permission: 'order',
        child: crud,
    },
    {
        name: 'Attendance',
        permission: 'attendance',
        child: crud,
    },
    {
        name: 'Time Sheet',
        permission: 'time_sheet',
        child: crud,
    },
    {
        name: 'Leave',
        permission: 'leave',
        child: crud,
    },
    {
        name: 'HRM',
        permission: 'hrm',
        child: crud,
    },
    {
        name: 'Report',
        permission: 'report',
        child: crud,
    },
    {
        name: 'Settings',
        permission: 'setting',
    },
];

let permissions = modules?.map((m) => {
    if (m.child) {
        return {
            ...m,
            child: m.child?.map((c) => ({
                ...c,
                permission: `${m.permission}_${c.permission}`,
            })),
        };
    }
    return m;
});
export default permissions;
