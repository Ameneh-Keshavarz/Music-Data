import { getSongCounts, getMostPlayed } from './reportUtils.js';
import { getSong } from './data.js';

jest.mock('./data.js', () => ({
    getSong: jest.fn((songID) => {
        const songs = {
            "song-1": { id: "song-1", duration_seconds: 190 },
            "song-2": { id: "song-2", duration_seconds: 247 },
            "song-3": { id: "song-3", duration_seconds: 153 },
        };
        return songs[songID] || null;
    }),
}));

describe('getSongCounts', () => {
    test('should count the number of plays and total duration for each song', () => {
        const listenEvents = [
            { song_id: 'song-1' },
            { song_id: 'song-2' },
            { song_id: 'song-1' },
            { song_id: 'song-3' },
            { song_id: 'song-2' },
            { song_id: 'song-2' },
        ];

        const result = getSongCounts(listenEvents);

        expect(result).toEqual({
            'song-1': { count: 2, duration: 380 },
            'song-2': { count: 3, duration: 741 },
            'song-3': { count: 1, duration: 153 },
        });
    });

    test('should return an empty object if no listen events are provided', () => {
        const listenEvents = [];
        const result = getSongCounts(listenEvents);
        expect(result).toEqual({});
    });
});

describe('getMostPlayed', () => {
    test('should return the most played song by count', () => {
        const counts = {
            'song-1': { count: 2, duration: 380 },
            'song-2': { count: 3, duration: 741 },
            'song-3': { count: 1, duration: 153 },
        };

        const result = getMostPlayed(counts, 'count');
        expect(result).toBe('song-2');
    });

    test('should return the most played song by duration', () => {
        const counts = {
            'song-1': { count: 2, duration: 380 },
            'song-2': { count: 3, duration: 741 },
            'song-3': { count: 1, duration: 153 },
        };

        const result = getMostPlayed(counts, 'duration');
        expect(result).toBe('song-2');
    });

    test('should return null if the counts object is empty', () => {
        const counts = {};
        const result = getMostPlayed(counts, 'count');
        expect(result).toBeNull();
    });
});
