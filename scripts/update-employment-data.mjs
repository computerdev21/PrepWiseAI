import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream, writeFileSync, createWriteStream } from 'node:fs';
import AdmZip from 'adm-zip';
import { pipeline } from 'node:stream/promises';
import { parse as parseCsv } from 'csv-parse';
import { Transform } from 'node:stream';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function extractZipBuffer(buffer) {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Find the first CSV file in the ZIP
    const csvEntry = zipEntries.find(entry => entry.entryName.endsWith('.csv'));
    if (!csvEntry) {
        throw new Error('No CSV file found in the ZIP archive');
    }

    // Get the CSV content as a buffer
    return csvEntry.getData();
}

async function fetchStatCanData(tableId) {
    const baseUrl = 'https://www150.statcan.gc.ca/t1/wds/rest';

    // Get download URL
    const response = await fetch(`${baseUrl}/getFullTableDownloadCSV/${tableId}/en`);
    const data = await response.json();

    if (data.status !== 'SUCCESS' || !data.object) {
        throw new Error('Failed to get download URL');
    }

    // Create temporary directory
    const tempDir = await mkdtemp(join(os.tmpdir(), 'statcan-'));
    const zipPath = join(tempDir, `${tableId}.zip`);
    const csvPath = join(tempDir, `${tableId}.csv`);

    try {
        // Download and save ZIP file
        const csvResponse = await fetch(data.object);
        if (!csvResponse.ok) throw new Error(`HTTP error! status: ${csvResponse.status}`);

        const fileStream = createWriteStream(zipPath);
        await pipeline(csvResponse.body, fileStream);

        // Extract CSV
        const zip = new AdmZip(zipPath);
        const csvEntry = zip.getEntries().find(entry => entry.entryName.endsWith('.csv'));
        if (!csvEntry) throw new Error('No CSV file found in the ZIP archive');

        zip.extractEntryTo(csvEntry, tempDir, false, true);
        const extractedPath = join(tempDir, csvEntry.entryName);

        // Process CSV in chunks
        const records = [];
        const parser = parseCsv({
            columns: true,
            skip_empty_lines: true,
            bom: true, // Handle BOM
            encoding: 'utf8',
            trim: true, // Trim whitespace
            skip_records_with_error: true // Skip problematic records
        });

        // Create a transform stream to filter records
        const filterStream = new Transform({
            objectMode: true,
            transform(record, encoding, callback) {
                if (record.GEO === 'Canada' || record.GEO === 'Ontario') {
                    records.push(record);
                }
                callback();
            }
        });

        // Process the CSV file using streams
        await pipeline(
            createReadStream(extractedPath, { encoding: 'utf8' }),
            parser,
            filterStream
        );

        // Cleanup
        await rm(tempDir, { recursive: true, force: true });

        return records;
    } catch (error) {
        // Cleanup on error
        await rm(tempDir, { recursive: true, force: true });
        throw error;
    }
}

async function processEmploymentData(employmentRecords, industryRecords) {
    try {
        // Get the most recent date
        const dates = [...new Set(employmentRecords.map(r => r.REF_DATE))].sort().reverse();
        const currentDate = dates[0];
        const lastMonthDate = dates[1];
        const lastYearDate = dates.find(d => {
            const current = new Date(currentDate);
            const date = new Date(d);
            return date.getMonth() === current.getMonth() && date.getFullYear() === current.getFullYear() - 1;
        });

        // Process employment trends
        const processRegionalData = (date, region) => {
            const getMetric = (characteristic) => {
                const record = employmentRecords.find(r =>
                    r.REF_DATE === date &&
                    r.GEO === region &&
                    r['Labour force characteristics'] === characteristic
                );
                return record ? parseFloat(record.VALUE) : 0;
            };

            const employmentRate = getMetric('Employment rate');
            const prevMonthRate = getMetric('Employment rate', lastMonthDate);

            return {
                employmentRate,
                unemploymentRate: getMetric('Unemployment rate'),
                totalEmployed: getMetric('Employment') * 1000, // Convert thousands to actual number
                monthlyChange: ((employmentRate - prevMonthRate) / prevMonthRate) * 100,
                participationRate: getMetric('Participation rate'),
                date
            };
        };

        // Process industry data
        const processIndustryData = (date) => {
            const industries = industryRecords
                .filter(r => r.REF_DATE === date && r.GEO === 'Canada')
                .map(record => {
                    const currentValue = parseFloat(record.VALUE);
                    const lastYearRecord = industryRecords.find(r =>
                        r.REF_DATE === lastYearDate &&
                        r.GEO === 'Canada' &&
                        r['North American Industry Classification System (NAICS)'] === record['North American Industry Classification System (NAICS)']
                    );
                    const yearOverYearChange = lastYearRecord ?
                        ((currentValue - parseFloat(lastYearRecord.VALUE)) / parseFloat(lastYearRecord.VALUE)) * 100 : 0;

                    return {
                        naicsCode: record.NAICS_CODE || record.VECTOR,
                        name: record['North American Industry Classification System (NAICS)'],
                        employees: currentValue * 1000,
                        yearOverYearChange,
                        monthOverMonthChange: 0, // Calculated if monthly data available
                        trend: yearOverYearChange > 2 ? 'growing' : yearOverYearChange < -2 ? 'declining' : 'stable'
                    };
                })
                .sort((a, b) => b.yearOverYearChange - a.yearOverYearChange);

            return industries;
        };

        // Build the complete dataset
        const historicalTrends = dates.slice(0, 24).map(date => processRegionalData(date, 'Canada'));
        const industries = processIndustryData(currentDate);

        return {
            trends: {
                currentMonth: processRegionalData(currentDate, 'Canada'),
                historicalTrends,
                regional: {
                    ontario: processRegionalData(currentDate, 'Ontario'),
                    canada: processRegionalData(currentDate, 'Canada')
                }
            },
            topIndustries: {
                date: currentDate,
                industries: industries.slice(0, 10) // Top 10 industries
            },
            regionalBreakdown: [
                {
                    region: 'Ontario',
                    ...processRegionalData(currentDate, 'Ontario'),
                    topIndustries: industries
                        .filter(i => i.trend === 'growing')
                        .slice(0, 5)
                },
                {
                    region: 'Canada',
                    ...processRegionalData(currentDate, 'Canada'),
                    topIndustries: industries
                        .filter(i => i.trend === 'growing')
                        .slice(0, 5)
                }
            ]
        };
    } catch (error) {
        console.error('Error processing data:', error);
        throw error;
    }
}

async function updateEmploymentData() {
    try {
        console.log('📊 Fetching Statistics Canada data...');

        const [employmentRecords, industryRecords] = await Promise.all([
            fetchStatCanData('14100287'),
            fetchStatCanData('14100023')
        ]);

        console.log('🔄 Processing data...');
        const data = await processEmploymentData(employmentRecords, industryRecords);

        // Generate TypeScript file content
        const fileContent = `// This file is auto-generated. Do not edit manually.
import { EmploymentTrends, TopIndustries, RegionalBreakdown } from '@/lib/types/statistics';

// Last updated: ${new Date().toISOString().split('T')[0]}
export const employmentData = ${JSON.stringify(data, null, 2)} as const;`;

        // Write to file
        const filePath = join(__dirname, '../src/data/employment-data.ts');
        await writeFile(filePath, fileContent, 'utf8');

        console.log('✅ Employment data updated successfully');
    } catch (error) {
        console.error('❌ Failed to update employment data:', error);
        process.exit(1);
    }
}

updateEmploymentData(); 