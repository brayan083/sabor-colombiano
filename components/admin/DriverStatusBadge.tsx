import React from 'react';

interface DriverStatusBadgeProps {
    status: 'available' | 'busy' | 'offline';
    size?: 'sm' | 'md' | 'lg';
}

const DriverStatusBadge: React.FC<DriverStatusBadgeProps> = ({ status, size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    const statusConfig = {
        available: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: '🟢',
            label: 'Disponible'
        },
        busy: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            icon: '🟡',
            label: 'Ocupado'
        },
        offline: {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            icon: '⚫',
            label: 'Desconectado'
        }
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}>
            <span className="text-xs">{config.icon}</span>
            {config.label}
        </span>
    );
};

export default DriverStatusBadge;
