import { Suspense } from 'react';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface Props {
    params: {
        id: string;
    };
}

export default async function AnalysisPage({ params }: Props) {
    const { id } = params;

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AnalysisResults analysisId={id} />
        </Suspense>
    );
}
