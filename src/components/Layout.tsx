import React from 'react';

interface LayoutProps {
    topBar: React.ReactNode;
    toolbar: React.ReactNode;
    workspace: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ topBar, toolbar, workspace }) => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {topBar}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '1rem', padding: '1rem' }}>
                <div style={{ width: '300px', flexShrink: 0, overflowY: 'auto' }}>
                    {toolbar}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {workspace}
                </div>
            </div>
        </div>
    );
};
