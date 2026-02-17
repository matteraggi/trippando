
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

export default function Layout() {
    return (
        <div className="min-h-full bg-gray-50 flex flex-col flex-1">
            <Outlet />
            <BottomNavigation />
        </div>
    );
}
