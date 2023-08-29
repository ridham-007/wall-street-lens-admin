export const TabButton = ({ label, activeTab, onClick }: any) => (
    <button
        className={`py-2 font-semibold px-4 hover:bg-indigo-200 ${activeTab === label ? 'border-b-2 border-blue-500 text-blue-500 ' : 'text-black'
            }`}
        onClick={onClick}
    >
        {label}
    </button>
);