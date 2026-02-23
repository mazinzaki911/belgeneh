import { SavedUnit, PortfolioProperty } from '../types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Platform-aware file download
const downloadFile = async (content: string, fileName: string, contentType: string) => {
    const bom = '\uFEFF'; // Byte Order Mark for Excel Arabic compatibility

    if (Capacitor.isNativePlatform()) {
        // Mobile: write to filesystem then share
        const base64 = btoa(unescape(encodeURIComponent(bom + content)));
        const result = await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Cache,
        });
        await Share.share({
            title: fileName,
            url: result.uri,
        });
    } else {
        // Web: standard download via anchor click
        const a = document.createElement("a");
        const file = new Blob([bom + content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
};

export const exportToJson = async (data: { savedUnits: SavedUnit[], portfolioProperties: PortfolioProperty[] }) => {
    const dataToExport = {
        ...data,
        exportDate: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    await downloadFile(jsonString, 'balegneeh_export.json', 'application/json;charset=utf-8;');
};

const convertToCsv = (data: any[]): string => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const rows = data.map(row =>
        headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'object') {
                value = JSON.stringify(value).replace(/"/g, '""');
            }
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        }).join(',')
    );
    return [headerRow, ...rows].join('\n');
};

export const exportToCsv = async (data: { savedUnits: SavedUnit[], portfolioProperties: PortfolioProperty[] }) => {
    const allRows: any[] = [];

    if (data.savedUnits.length > 0) {
        const flattenedUnits = data.savedUnits.map(unit => ({
            id: unit.id,
            name: unit.name,
            status: unit.status,
            notes: unit.notes || '',
            dealDate: unit.dealDate || '',
            ...unit.data,
        }));
        allRows.push(...flattenedUnits);
    }

    if (allRows.length > 0) {
        const unitsCsv = convertToCsv(allRows);
        await downloadFile(unitsCsv, 'balegneeh_units_export.csv', 'text/csv;charset=utf-8;');
    }

    if (data.portfolioProperties.length > 0) {
        const flattenedPortfolio = data.portfolioProperties.map(prop => {
            const { tasks, documents, ...rest } = prop;
            return {
                ...rest,
                tasks: tasks ? JSON.stringify(tasks) : '',
            };
        });
        const portfolioCsv = convertToCsv(flattenedPortfolio);
        await downloadFile(portfolioCsv, 'balegneeh_portfolio_export.csv', 'text/csv;charset=utf-8;');
    }
};
