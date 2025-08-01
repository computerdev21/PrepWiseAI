import { Suspense } from 'react';
import JobList from '@/components/jobs/JobList';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface Props {
    params: {
        id: string;
    };
}

export default async function JobsPage({ params }: Props) {
    const { id } = params;

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <JobList analysisId={id} />
        </Suspense>
    );
}
