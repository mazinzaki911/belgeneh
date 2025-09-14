import { SavedUnit, PortfolioProperty } from '../types';

// Helper to download a file with BOM for Excel compatibility with Arabic
const downloadFile = (content: string, fileName: string, contentType: string) => {
    const bom = '\uFEFF'; // Byte Order Mark
    const a = document.createElement("a");
    const file = new Blob([bom + content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
};

export const exportToJson = (data: { savedUnits: SavedUnit[], portfolioProperties: PortfolioProperty[] }) => {
    const dataToExport = {
        ...data,
        exportDate: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    downloadFile(jsonString, 'balegneeh_export.json', 'application/json;charset=utf-8;');
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

export const exportToCsv = (data: { savedUnits: SavedUnit[], portfolioProperties: PortfolioProperty[] }) => {
    if (data.savedUnits.length > 0) {
        const flattenedUnits = data.savedUnits.map(unit => ({
            id: unit.id,
            name: unit.name,
            status: unit.status,
            notes: unit.notes || '',
            dealDate: unit.dealDate || '',
            ...unit.data,
        }));
        const unitsCsv = convertToCsv(flattenedUnits);
        downloadFile(unitsCsv, 'balegneeh_units_export.csv', 'text/csv;charset=utf-8;');
    }
    
    if (data.portfolioProperties.length > 0) {
        setTimeout(() => {
            // Flatten tasks if they exist, otherwise it will just be [Object object]
            const flattenedPortfolio = data.portfolioProperties.map(prop => {
                const { tasks, ...rest } = prop;
                return {
                    ...rest,
                    tasks: tasks ? JSON.stringify(tasks) : ''
                };
            });
            const portfolioCsv = convertToCsv(flattenedPortfolio);
            downloadFile(portfolioCsv, 'balegneeh_portfolio_export.csv', 'text/csv;charset=utf-8;');
        }, 500); // Small delay to help prevent browser from blocking the second download
    }
};