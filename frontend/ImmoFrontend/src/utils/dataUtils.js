export function sanitizePropertyData(data) {
    return data
        .filter(item => 
    // Filter out items without essential data
    item &&
        typeof item.Preis_cleaned === 'number' &&
        !isNaN(item.Preis_cleaned) &&
        item.Preis_cleaned > 0)
        .map(item => ({
        Preis_cleaned: item.Preis_cleaned,
        Preis_pro_qm: item.Preis_pro_qm || 0,
        Wohnfläche: item.Wohnfläche || 0,
        Zimmer: item.Zimmer || 0,
        Latitude: item.Latitude || 0,
        Longitude: item.Longitude || 0,
        created_date: item.created_date,
        closed_date: item.closed_date,
        Beschreibung: item.Beschreibung,
        Features: item.Features,
        Adresse: item.Adresse,
        Link: item.Link
    }));
}
export function getDataStatistics(data) {
    const prices = data.map(d => d.Preis_cleaned);
    const pricePerSqm = data.map(d => d.Preis_pro_qm);
    const livingSpaces = data.map(d => d.Wohnfläche);
    const rooms = data.map(d => d.Zimmer);
    return {
        price: {
            avg: prices.reduce((a, b) => a + b, 0) / prices.length,
            median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
            min: Math.min(...prices),
            max: Math.max(...prices)
        },
        pricePerSqm: {
            avg: pricePerSqm.reduce((a, b) => a + b, 0) / pricePerSqm.length,
            min: Math.min(...pricePerSqm),
            max: Math.max(...pricePerSqm)
        },
        livingSpace: {
            avg: livingSpaces.reduce((a, b) => a + b, 0) / livingSpaces.length,
            median: livingSpaces.sort((a, b) => a - b)[Math.floor(livingSpaces.length / 2)],
            min: Math.min(...livingSpaces),
            max: Math.max(...livingSpaces)
        },
        rooms: {
            avg: rooms.reduce((a, b) => a + b, 0) / rooms.length,
            distribution: rooms.reduce((acc, room) => {
                acc[room] = (acc[room] || 0) + 1;
                return acc;
            }, {})
        }
    };
}
