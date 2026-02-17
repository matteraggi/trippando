export default function NotFound() {
    return (
        <div className="min-h-full bg-gray-50 flex flex-col">
            <div className="bg-white shadow-sm border-b px-4 py-3">
                <h1 className="text-xl font-semibold text-center text-gray-800">Not Found</h1>
            </div>
            <div className="p-4">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-gray-600">The page you requested does not exist.</p>
                </div>
            </div>
        </div>
    );
}
