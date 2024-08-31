/** @type {import('next').NextConfig} */
const nextConfig = {
    matcher: [
        {
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        }
    ]
};

export default nextConfig;
