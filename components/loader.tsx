import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="animate-spin rounded-full border-t-4 border-blue-500 border-opacity-75 h-16 w-16"></div>
        </div>
    );
};

export default Loader;
