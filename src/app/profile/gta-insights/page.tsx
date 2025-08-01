import GTAInsightsClient from './GTAInsightsClient';

export default function GTAInsightsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
            <div className="container mx-auto px-4 py-8">
                <GTAInsightsClient />
            </div>
        </div>
    );
} 