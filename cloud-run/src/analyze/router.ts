import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { auth } from './../lib/firebase-admin';
import { AnalysisService } from '../services/analysis.service';
import { ApiError } from '../utils/api-error';
import { ProfileAnalyzer } from './helpers/profile-analyzer';
import { TechnicalSkillsAnalyzer } from './helpers/technical-skills-analyzer';
import { AhaMomentsAnalyzer } from './helpers/aha-moments-analyzer';
import { RoadmapAnalyzer } from './helpers/roadmap-analyzer';

interface AuthRequest extends Request {
    userId: string;
}

const router = Router();

// Middleware to verify authentication
const verifyAuth: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new ApiError('Unauthorized', 401);
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        (req as AuthRequest).userId = decodedToken.uid;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    }
};

// Get all analyses for user
const getAnalyses: RequestHandler = async (req, res) => {
    try {
        const analyses = await AnalysisService.listByUser((req as AuthRequest).userId);
        res.json({ success: true, data: analyses });
    } catch (error) {
        console.error('Error fetching analyses:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analyses' });
    }
};

// Create new analysis
const createAnalysis: RequestHandler = async (req, res) => {
    try {
        const { resumeId, analysisId = null, retry = false } = req.body;
        if (!resumeId) {
            throw new ApiError('Resume ID is required', 400);
        }

        const analysis = await AnalysisService.create({
            userId: (req as AuthRequest).userId,
            resumeId,
            analysisId,
            retry
        });

        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error('Error creating analysis:', error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Failed to create analysis' });
        }
    }
};

// Get analysis by ID
const getAnalysisById: RequestHandler = async (req, res) => {
    try {
        const analysis = await AnalysisService.getById(req.params.id);
        if (!analysis) {
            throw new ApiError('Analysis not found', 404);
        }

        const isOwner = await AnalysisService.verifyOwnership(req.params.id, (req as AuthRequest).userId);
        if (!isOwner) {
            throw new ApiError('Forbidden', 403);
        }

        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error('Error fetching analysis:', error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Failed to fetch analysis' });
        }
    }
};

// Profile analysis endpoint
router.post('/profile', verifyAuth, async (req, res) => {
    try {
        const analyzer = new ProfileAnalyzer();
        const result = await analyzer.analyze(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Profile analysis error:', error);
        res.status(500).json({ success: false, error: 'Analysis failed' });
    }
});

// Technical skills analysis endpoint
router.post('/technical', verifyAuth, async (req, res) => {
    try {
        const analyzer = new TechnicalSkillsAnalyzer();
        const result = await analyzer.analyze(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Technical analysis error:', error);
        res.status(500).json({ success: false, error: 'Analysis failed' });
    }
});

// Aha moments analysis endpoint
router.post('/aha', verifyAuth, async (req, res) => {
    try {
        const analyzer = new AhaMomentsAnalyzer();
        const result = await analyzer.analyze(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Aha analysis error:', error);
        res.status(500).json({ success: false, error: 'Analysis failed' });
    }
});

// Roadmap generation endpoint
router.post('/roadmap/generate', verifyAuth, async (req, res) => {
    try {
        const analyzer = new RoadmapAnalyzer();
        const result = await analyzer.analyze(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Roadmap generation error:', error);
        res.status(500).json({ success: false, error: 'Roadmap generation failed' });
    }
});

router.get('/', verifyAuth, getAnalyses);
router.post('/', verifyAuth, createAnalysis);
router.get('/:id', verifyAuth, getAnalysisById);

export default router; 