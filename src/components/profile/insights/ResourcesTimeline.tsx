import React from 'react';

// Sample data - Replace with real data from your API
const resources = [
    {
        id: 1,
        type: 'Workshop',
        title: 'Canadian Workplace Culture',
        date: '2025-07-15',
        time: '10:00 AM',
        location: 'Online',
        description: 'Learn about Canadian workplace norms and communication styles.',
    },
    {
        id: 2,
        type: 'Networking',
        title: 'Tech Meetup - GTA Innovation Hub',
        date: '2025-07-18',
        time: '6:00 PM',
        location: 'Toronto Downtown',
        description: 'Connect with local tech professionals and hiring managers.',
    },
    {
        id: 3,
        type: 'Course',
        title: 'Cloud Computing Certification',
        date: '2025-07-20',
        time: 'Self-paced',
        location: 'Online',
        description: 'AWS certification preparation course with hands-on labs.',
    },
    {
        id: 4,
        type: 'Job Fair',
        title: 'GTA Tech Career Expo',
        date: '2025-07-25',
        time: '11:00 AM',
        location: 'Mississauga Convention Centre',
        description: 'Meet with 50+ tech companies hiring in the GTA.',
    },
];

const getTypeColor = (type: string) => {
    const colors = {
        Workshop: 'bg-blue-100 text-blue-800',
        Networking: 'bg-purple-100 text-purple-800',
        Course: 'bg-green-100 text-green-800',
        'Job Fair': 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const ResourcesTimeline = () => {
    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {resources.map((resource, resourceIdx) => (
                    <li key={resource.id}>
                        <div className="relative pb-8">
                            {resourceIdx !== resources.length - 1 ? (
                                <span
                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span
                                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getTypeColor(resource.type)
                                            }`}
                                    >
                                        {resource.type[0]}
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {resource.title}
                                        </p>
                                        <p className="mt-0.5 text-sm text-gray-500">
                                            {resource.description}
                                        </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        <div>{resource.date}</div>
                                        <div>{resource.time}</div>
                                        <div className="text-xs">{resource.location}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ResourcesTimeline; 